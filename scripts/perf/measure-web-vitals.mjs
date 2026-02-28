#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CHROME_BIN =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const DEFAULT_PORT = 9222;
const LOAD_SETTLE_MS = 2500;
const CDP_TIMEOUT_MS = 30000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv) {
  const args = { out: "reports/perf/metrics.json", urls: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--out") {
      args.out = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith("--")) {
      throw new Error(`Unknown option: ${token}`);
    }
    args.urls.push(token);
  }
  if (args.urls.length === 0) {
    throw new Error(
      "Usage: node scripts/perf/measure-web-vitals.mjs [--out reports/perf/file.json] <url> [url...]"
    );
  }
  return args;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
    this.waiters = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const onOpen = () => {
        this.ws.removeEventListener("error", onErr);
        resolve();
      };
      const onErr = (err) => {
        this.ws.removeEventListener("open", onOpen);
        reject(err);
      };
      this.ws.addEventListener("open", onOpen);
      this.ws.addEventListener("error", onErr);
    });

    this.ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id) {
        const pending = this.pending.get(msg.id);
        if (!pending) return;
        this.pending.delete(msg.id);
        if (msg.error) {
          pending.reject(new Error(msg.error.message || "CDP error"));
          return;
        }
        pending.resolve(msg.result);
        return;
      }

      const listeners = this.eventListeners.get(msg.method) || [];
      for (const listener of listeners) {
        listener(msg.params || {});
      }

      const waiters = this.waiters.get(msg.method);
      if (waiters && waiters.length > 0) {
        const next = waiters.shift();
        next.resolve(msg.params || {});
      }
    });
  }

  send(method, params = {}) {
    const id = this.id;
    this.id += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  on(method, callback) {
    const listeners = this.eventListeners.get(method) || [];
    listeners.push(callback);
    this.eventListeners.set(method, listeners);
  }

  waitFor(method, timeoutMs = CDP_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${method}`));
      }, timeoutMs);

      const waiters = this.waiters.get(method) || [];
      waiters.push({
        resolve: (params) => {
          clearTimeout(timeout);
          resolve(params);
        },
      });
      this.waiters.set(method, waiters);
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {
      // no-op
    }
  }
}

function launchChrome(port) {
  return spawn(
    CHROME_BIN,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-sync",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-default-apps",
      "--disable-renderer-backgrounding",
      "--metrics-recording-only",
      "--mute-audio",
      `--remote-debugging-port=${port}`,
      "about:blank",
    ],
    {
      stdio: "ignore",
    }
  );
}

async function waitForDebugger(port, maxAttempts = 40) {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const data = await fetchJson(endpoint);
      if (data.webSocketDebuggerUrl) return data;
    } catch {
      // wait and retry
    }
    await sleep(250);
  }
  throw new Error("Chrome debugger endpoint did not become ready");
}

function buildObserverScript() {
  return `(() => {
    const state = {
      fcp: 0,
      lcp: 0,
      lcpSize: 0,
      lcpSelector: null,
      lcpText: null,
      cls: 0,
      longTasks: [],
    };

    function selector(el) {
      if (!el || !el.tagName) return null;
      const parts = [];
      let node = el;
      let depth = 0;
      while (node && node.nodeType === 1 && depth < 5) {
        let part = node.tagName.toLowerCase();
        if (node.id) {
          part += '#' + node.id;
          parts.unshift(part);
          break;
        }

        const classList = Array.from(node.classList || []).slice(0, 2);
        if (classList.length) {
          part += '.' + classList.join('.');
        }

        parts.unshift(part);
        node = node.parentElement;
        depth += 1;
      }
      return parts.join(' > ');
    }

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            state.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });
    } catch {}

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          state.lcp = entry.startTime;
          state.lcpSize = entry.size || 0;
          state.lcpSelector = selector(entry.element || null);
          if (entry.element && typeof entry.element.textContent === 'string') {
            state.lcpText = entry.element.textContent.trim().slice(0, 120);
          }
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            state.cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          state.longTasks.push({
            start: entry.startTime,
            duration: entry.duration,
          });
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}

    window.__perfState = state;
  })();`;
}

function mergeRanges(ranges) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const [start, end] = sorted[i];
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

function sumRanges(ranges) {
  return ranges.reduce((sum, [start, end]) => sum + Math.max(0, end - start), 0);
}

function safeUrl(resourceUrl) {
  try {
    return new URL(resourceUrl);
  } catch {
    return null;
  }
}

function toKB(bytes) {
  return Number((bytes / 1024).toFixed(1));
}

async function getTarget(port) {
  const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!pageTarget) {
    throw new Error("No debuggable page target found in Chrome");
  }
  return pageTarget;
}

async function measureUrl(url, port) {
  const target = await getTarget(port);
  const client = new CDPClient(target.webSocketDebuggerUrl);
  const scriptMeta = new Map();

  await client.connect();

  client.on("Debugger.scriptParsed", (params) => {
    const { scriptId, url: scriptUrl, length } = params;
    scriptMeta.set(scriptId, {
      url: scriptUrl || "",
      length: typeof length === "number" ? length : null,
    });
  });

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable", {
    maxResourceBufferSize: 1024 * 1024 * 20,
    maxTotalBufferSize: 1024 * 1024 * 40,
  });
  await client.send("Performance.enable");
  await client.send("Debugger.enable");
  await client.send("Profiler.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  await client.send("Network.setBypassServiceWorker", { bypass: true });

  await client.send("Emulation.setUserAgentOverride", {
    userAgent:
      "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    platform: "Android",
    acceptLanguage: "en-US,en",
  });

  await client.send("Emulation.setDeviceMetricsOverride", {
    mobile: true,
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    screenOrientation: {
      type: "portraitPrimary",
      angle: 0,
    },
  });

  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    connectionType: "cellular3g",
  });

  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: buildObserverScript(),
  });

  await client.send("Profiler.startPreciseCoverage", {
    callCount: false,
    detailed: true,
  });

  const loadEvent = client.waitFor("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loadEvent;
  await sleep(LOAD_SETTLE_MS);

  const coverageResult = await client.send("Profiler.takePreciseCoverage");
  await client.send("Profiler.stopPreciseCoverage");

  const runtimeEval = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const perfState = window.__perfState || null;
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize || 0,
        encodedBodySize: entry.encodedBodySize || 0,
        duration: entry.duration,
        startTime: entry.startTime,
        renderBlockingStatus: entry.renderBlockingStatus || null,
      }));

      return {
        perfState,
        nav: nav ? {
          responseEnd: nav.responseEnd,
          domContentLoaded: nav.domContentLoadedEventEnd,
          load: nav.loadEventEnd,
        } : null,
        resources,
      };
    })()`,
    returnByValue: true,
  });

  const pageData = runtimeEval?.result?.value || {};
  const perfState = pageData.perfState || {
    fcp: 0,
    lcp: 0,
    lcpSize: 0,
    lcpSelector: null,
    lcpText: null,
    cls: 0,
    longTasks: [],
  };

  const pageOrigin = new URL(url).origin;

  const resources = Array.isArray(pageData.resources) ? pageData.resources : [];
  const jsResources = resources.filter((r) => r.initiatorType === "script" || r.name.includes(".js"));
  const cssResources = resources.filter((r) => r.initiatorType === "link" || r.name.includes(".css"));

  const totalJsTransfer = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const firstPartyJsTransfer = jsResources.reduce((sum, r) => {
    const parsed = safeUrl(r.name);
    if (!parsed) return sum;
    if (parsed.origin === pageOrigin) return sum + (r.transferSize || 0);
    return sum;
  }, 0);

  const renderBlockingCss = cssResources.filter((r) => r.renderBlockingStatus === "blocking");

  const coverageScripts = Array.isArray(coverageResult?.result)
    ? coverageResult.result
    : [];

  let totalCoveredScriptBytes = 0;
  let usedScriptBytes = 0;
  let firstPartyCoveredScriptBytes = 0;
  let firstPartyUsedScriptBytes = 0;

  for (const script of coverageScripts) {
    const meta = scriptMeta.get(script.scriptId);
    if (!meta || !meta.url || meta.url === "") {
      continue;
    }

    let totalLength = meta.length;
    if (typeof totalLength !== "number") {
      try {
        const source = await client.send("Debugger.getScriptSource", {
          scriptId: script.scriptId,
        });
        totalLength = (source.scriptSource || "").length;
      } catch {
        totalLength = 0;
      }
    }

    const usedRanges = [];
    for (const fn of script.functions || []) {
      for (const range of fn.ranges || []) {
        if (range.count > 0) {
          usedRanges.push([range.startOffset, range.endOffset]);
        }
      }
    }

    const merged = mergeRanges(usedRanges);
    const used = sumRanges(merged);

    totalCoveredScriptBytes += totalLength;
    usedScriptBytes += used;

    const parsed = safeUrl(meta.url);
    if (parsed && parsed.origin === pageOrigin) {
      firstPartyCoveredScriptBytes += totalLength;
      firstPartyUsedScriptBytes += used;
    }
  }

  const longTasks = Array.isArray(perfState.longTasks) ? perfState.longTasks : [];
  const fcp = perfState.fcp || 0;
  const tbt = longTasks.reduce((sum, task) => {
    if (task.start < fcp) return sum;
    return sum + Math.max(0, (task.duration || 0) - 50);
  }, 0);

  const summary = {
    url,
    fcpMs: Number((perfState.fcp || 0).toFixed(0)),
    lcpMs: Number((perfState.lcp || 0).toFixed(0)),
    cls: Number((perfState.cls || 0).toFixed(3)),
    tbtMs: Number(tbt.toFixed(0)),
    lcpSelector: perfState.lcpSelector || null,
    lcpText: perfState.lcpText || null,
    lcpSize: perfState.lcpSize || 0,
    totalJsTransferKB: toKB(totalJsTransfer),
    firstPartyJsTransferKB: toKB(firstPartyJsTransfer),
    coveredScriptKB: toKB(totalCoveredScriptBytes),
    usedScriptKB: toKB(usedScriptBytes),
    unusedScriptKB: toKB(Math.max(0, totalCoveredScriptBytes - usedScriptBytes)),
    firstPartyCoveredScriptKB: toKB(firstPartyCoveredScriptBytes),
    firstPartyUnusedScriptKB: toKB(
      Math.max(0, firstPartyCoveredScriptBytes - firstPartyUsedScriptBytes)
    ),
    renderBlockingCss: renderBlockingCss.map((r) => ({
      name: r.name,
      transferKB: toKB(r.transferSize || 0),
      durationMs: Number((r.duration || 0).toFixed(0)),
      startMs: Number((r.startTime || 0).toFixed(0)),
    })),
    navTimings: pageData.nav || null,
  };

  client.close();

  return summary;
}

function printSummary(result) {
  const lines = [
    `URL: ${result.url}`,
    `  FCP: ${result.fcpMs} ms | LCP: ${result.lcpMs} ms | TBT: ${result.tbtMs} ms | CLS: ${result.cls}`,
    `  LCP Element: ${result.lcpSelector || "(none)"}`,
    `  JS Transfer: ${result.totalJsTransferKB} KiB (first-party ${result.firstPartyJsTransferKB} KiB)`,
    `  JS Coverage: ${result.coveredScriptKB} KiB covered | ${result.unusedScriptKB} KiB unused (${result.firstPartyUnusedScriptKB} KiB first-party)`,
  ];

  if (result.renderBlockingCss.length > 0) {
    lines.push("  Render-blocking CSS:");
    for (const css of result.renderBlockingCss) {
      lines.push(
        `    - ${css.name} (${css.transferKB} KiB, ${css.durationMs} ms, starts at ${css.startMs} ms)`
      );
    }
  } else {
    lines.push("  Render-blocking CSS: none detected");
  }

  console.log(lines.join("\n"));
}

async function main() {
  const { out, urls } = parseArgs(process.argv.slice(2));

  const chrome = launchChrome(DEFAULT_PORT);

  let failed = false;
  const startedAt = Date.now();

  try {
    await waitForDebugger(DEFAULT_PORT);
    const measurements = [];

    for (const url of urls) {
      const summary = await measureUrl(url, DEFAULT_PORT);
      measurements.push(summary);
      printSummary(summary);
    }

    const report = {
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      chromeBin: CHROME_BIN,
      measurements,
    };

    const outDir = path.dirname(out);
    await mkdir(outDir, { recursive: true });
    await writeFile(out, JSON.stringify(report, null, 2), "utf8");
    console.log(`\nSaved report to ${out}`);
  } catch (err) {
    failed = true;
    console.error(err instanceof Error ? err.message : err);
  } finally {
    chrome.kill("SIGKILL");
  }

  if (failed) {
    process.exit(1);
  }
}

await main();
