import { spawnSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { fileBytes, median, parseArgs, parseCsv, sha256, writeCsv, writeJson } from "./lib.mjs";

const RAW_HEADERS = "benchmark_version,git_commit,lockfile_sha256,executed_at_utc,runner_os,runner_cpu,runner_memory_gb,browser,browser_version,browser_mode,tool_route,source_id,source_page,license,input_path,input_sha256,input_mime,input_format,input_width,input_height,input_frames,input_duration_ms,input_bytes,case_id,quality_setting,output_selector,gif_compression,gif_max_colors,gif_frame_reduction,gif_scale_pct,run_number,processing_ms_tool,processing_ms_wall,output_path,output_sha256,output_mime,output_format,output_width,output_height,output_frames,output_duration_ms,output_bytes,byte_delta,size_change_pct,compression_ratio,ssim,psnr_db,dimension_changed,decode_status,visual_review_status,warning,notes".split(",");
const args = parseArgs(process.argv.slice(2));
const releaseRoot = path.resolve(process.cwd(), String(args.release ?? ""));
if (!args.release) throw new Error("Pass the prepared release directory with --release");
const baseUrl = String(args["base-url"] ?? "http://127.0.0.1:3101").replace(/\/$/, "");
const runCount = Number(args.runs ?? 5);
const warmupCount = Number(args.warmups ?? 1);
const caseLimit = args["case-limit"] ? Number(args["case-limit"]) : Infinity;
if (!Number.isInteger(runCount) || runCount < 1) throw new Error("--runs must be a positive integer");

const manifestPath = path.join(releaseRoot, "manifest/run-manifest.json");
const caseRows = parseCsv(await readFile(path.join(releaseRoot, "manifest/case-manifest.csv"), "utf8")).slice(0, caseLimit);
const corpusRows = parseCsv(await readFile(path.join(releaseRoot, "manifest/corpus-manifest.csv"), "utf8"));
const corpusById = new Map(corpusRows.map((row) => [row.source_id, row]));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.status !== "PREPARED_NOT_RUN") {
  throw new Error(`Release ${manifest.benchmark_version} is immutable and has status ${manifest.status}; prepare a new version before another run.`);
}
if (manifest.dirty_state && !args["allow-dirty-pilot"]) {
  throw new Error("This release was prepared from a dirty tracked worktree and is pilot-only. Pass --allow-dirty-pilot to exercise the harness without creating publishable evidence.");
}
const rawRows = [];
const browser = await chromium.launch({ headless: true });
const verificationContext = await browser.newContext();
const verificationPage = await verificationContext.newPage();
await verificationPage.goto(`${baseUrl}/compress/image`, { waitUntil: "domcontentloaded", timeout: 120_000 });
const servedBuildCommit = await verificationPage.locator('meta[name="clevr-build-commit"]').getAttribute("content");
await verificationContext.close();
if (servedBuildCommit !== manifest.git_commit && !args["allow-unverified-build-pilot"]) {
  await browser.close();
  throw new Error(`Served build commit ${servedBuildCommit || "missing"} does not match frozen commit ${manifest.git_commit}. Rebuild with CLEVR_BUILD_COMMIT=${manifest.git_commit}, or use --allow-unverified-build-pilot for non-publishable harness work.`);
}
manifest.status = "RUNNING_NOT_PUBLICATION_READY";
manifest.started_at_utc = new Date().toISOString();
manifest.serving_url = baseUrl;
manifest.browser = { name: "Chromium", version: browser.version(), mode: "headless" };
manifest.served_build_commit = servedBuildCommit;
manifest.served_build_verified = servedBuildCommit === manifest.git_commit;
manifest.requested_case_count = caseRows.length;
manifest.requested_runs_per_case = runCount;
manifest.requested_warmups_per_case = warmupCount;
await writeJson(manifestPath, manifest);

function mimeFor(format) {
  return `image/${format === "jpg" ? "jpeg" : format}`;
}

async function inspectImage(filePath) {
  const metadata = await sharp(filePath, { animated: true }).metadata();
  const delays = metadata.delay ?? [];
  return {
    format: metadata.format === "jpg" ? "jpeg" : metadata.format,
    mime: mimeFor(metadata.format),
    width: metadata.width ?? "",
    height: metadata.pageHeight ?? metadata.height ?? "",
    frames: metadata.pages ?? 1,
    durationMs: delays.length ? delays.reduce((sum, delay) => sum + delay, 0) : "",
    loop: metadata.loop ?? "",
  };
}

function metric(fileA, fileB, filter, pattern) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-i", fileA, "-i", fileB, "-lavfi", filter, "-f", "null", "-"], { encoding: "utf8" });
  const diagnostic = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const match = diagnostic.match(pattern);
  return match ? Number(match[1]) : "";
}

async function setSlider(page, testId, value, minimum) {
  const slider = page.getByTestId(testId).filter({ visible: true }).first();
  await slider.focus();
  await slider.press("Home");
  for (let step = minimum; step < value; step += 1) await slider.press("ArrowRight");
}

async function saveDownload(page, locator, destination) {
  const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
  await locator.click();
  const download = await downloadPromise;
  await download.saveAs(destination);
}

async function executeCase(testCase, destination) {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}${testCase.tool_route}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  if (testCase.tool_route === "/compress/image") {
    await setSlider(page, "benchmark-image-quality", Number(testCase.quality_setting), 1);
    await page.getByTestId(`benchmark-image-format-${testCase.output_selector}`).filter({ visible: true }).first().click();
  } else {
    await setSlider(page, "benchmark-gif-compression", Number(testCase.gif_compression), 0);
    await page.getByTestId(`benchmark-gif-colors-${testCase.gif_max_colors}`).filter({ visible: true }).first().click();
    await page.getByTestId(`benchmark-gif-frame-${testCase.gif_frame_reduction}`).filter({ visible: true }).first().click();
    await page.getByTestId(`benchmark-gif-scale-${testCase.gif_scale_pct}`).filter({ visible: true }).first().click();
  }
  const wallStarted = performance.now();
  await page.getByTestId("benchmark-file-input").first().setInputFiles(path.join(releaseRoot, testCase.input_path));
  let download;
  let toolMs;
  if (testCase.tool_route === "/compress/image") {
    download = page.getByTestId("benchmark-image-download").filter({ visible: true }).first();
    await download.waitFor({ state: "visible", timeout: 120_000 });
    toolMs = Number(await page.getByTestId("benchmark-image-processing-ms").filter({ visible: true }).first().getAttribute("data-processing-ms"));
  } else {
    await page.getByTestId("benchmark-gif-analysis").first().waitFor({ state: "attached", timeout: 120_000 });
    await page.waitForFunction(() => document.querySelector('[data-testid="benchmark-gif-analysis"]')?.getAttribute("data-state") === "ready", undefined, { timeout: 120_000 });
    await page.getByTestId("benchmark-gif-compress").filter({ visible: true }).first().click();
    download = page.getByTestId("benchmark-gif-download").filter({ visible: true }).first();
    await download.waitFor({ state: "visible", timeout: 120_000 });
    toolMs = Number(await page.getByTestId("benchmark-gif-processing-ms").filter({ visible: true }).first().getAttribute("data-processing-ms"));
  }
  const wallMs = Math.round(performance.now() - wallStarted);
  await saveDownload(page, download, destination);
  await context.close();
  return { toolMs, wallMs, errors };
}

try {
  for (const testCase of caseRows) {
    const inputPath = path.join(releaseRoot, testCase.input_path);
    const input = await inspectImage(inputPath);
    const inputBytes = await fileBytes(inputPath);
    const source = corpusById.get(testCase.source_id);
    for (let attempt = 0; attempt < warmupCount + runCount; attempt += 1) {
      const isWarmup = attempt < warmupCount;
      const runNumber = isWarmup ? `warmup-${attempt + 1}` : attempt - warmupCount + 1;
      const outputDir = path.join(releaseRoot, "outputs", isWarmup ? "warmup" : "recorded", testCase.case_key);
      await mkdir(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `${runNumber}.${testCase.output_selector === "original" ? testCase.input_format : testCase.output_selector}`);
      const baseRow = {
        benchmark_version: manifest.benchmark_version,
        git_commit: manifest.git_commit,
        lockfile_sha256: manifest.package_lock_sha256,
        executed_at_utc: new Date().toISOString(),
        runner_os: `${os.type()} ${os.release()} ${os.arch()}`,
        runner_cpu: os.cpus()[0]?.model ?? "unknown",
        runner_memory_gb: Number((os.totalmem() / 1024 ** 3).toFixed(2)),
        browser: "Chromium",
        browser_version: browser.version(),
        browser_mode: "headless",
        tool_route: testCase.tool_route,
        source_id: testCase.source_id,
        source_page: source?.source_page ?? "",
        license: source?.license ?? "",
        input_path: testCase.input_path,
        input_sha256: testCase.input_sha256,
        input_mime: input.mime,
        input_format: testCase.input_format,
        input_width: input.width,
        input_height: input.height,
        input_frames: input.frames,
        input_duration_ms: input.durationMs,
        input_bytes: inputBytes,
        case_id: testCase.case_id,
        quality_setting: testCase.quality_setting,
        output_selector: testCase.output_selector,
        gif_compression: testCase.gif_compression,
        gif_max_colors: testCase.gif_max_colors,
        gif_frame_reduction: testCase.gif_frame_reduction,
        gif_scale_pct: testCase.gif_scale_pct,
        run_number: runNumber,
      };
      try {
        const observation = await executeCase(testCase, outputPath);
        const output = await inspectImage(outputPath);
        const outputBytes = await fileBytes(outputPath);
        const dimensionsMatch = input.width === output.width && input.height === output.height;
        const validationErrors = [];
        if (outputBytes <= 0) validationErrors.push("output is empty");
        if (output.mime !== testCase.expected_mime) validationErrors.push(`expected MIME ${testCase.expected_mime}, received ${output.mime}`);
        if (Number(output.width) !== Number(testCase.expected_width)) validationErrors.push(`expected width ${testCase.expected_width}, received ${output.width}`);
        if (Number(output.height) !== Number(testCase.expected_height)) validationErrors.push(`expected height ${testCase.expected_height}, received ${output.height}`);
        if (Number(output.frames) !== Number(testCase.expected_frames)) validationErrors.push(`expected ${testCase.expected_frames} frames, received ${output.frames}`);
        if (testCase.expected_duration_ms !== "") {
          const durationDifference = Math.abs(Number(output.durationMs) - Number(testCase.expected_duration_ms));
          if (durationDifference > 20) validationErrors.push(`duration differs by ${durationDifference}ms; tolerance is 20ms`);
        }
        if (testCase.input_format === "gif" && output.loop !== input.loop) validationErrors.push(`expected GIF loop ${input.loop}, received ${output.loop}`);
        const row = {
          ...baseRow,
          processing_ms_tool: observation.toolMs,
          processing_ms_wall: observation.wallMs,
          output_path: path.relative(releaseRoot, outputPath),
          output_sha256: await sha256(outputPath),
          output_mime: output.mime,
          output_format: output.format,
          output_width: output.width,
          output_height: output.height,
          output_frames: output.frames,
          output_duration_ms: output.durationMs,
          output_bytes: outputBytes,
          byte_delta: outputBytes - inputBytes,
          size_change_pct: ((outputBytes - inputBytes) / inputBytes) * 100,
          compression_ratio: inputBytes / outputBytes,
          ssim: dimensionsMatch && testCase.input_format !== "gif" ? metric(inputPath, outputPath, "ssim", /All:([0-9.]+)/) : "",
          psnr_db: dimensionsMatch && testCase.input_format !== "gif" ? metric(inputPath, outputPath, "psnr", /average:([0-9.]+)/) : "",
          dimension_changed: !dimensionsMatch,
          decode_status: validationErrors.length === 0 ? "PASS" : "FAIL",
          visual_review_status: "PENDING",
          warning: [...validationErrors, ...observation.errors].join(" | "),
          notes: [
            testCase.output_selector === "webp" ? "UI quality records current adaptive WebP behavior; an internal retry may lower effective quality when the first output grows." : "",
            testCase.input_format === "gif" ? `input_loop=${input.loop}; output_loop=${output.loop}; duration_tolerance_ms=20` : "",
          ].filter(Boolean).join(" "),
        };
        if (!isWarmup) rawRows.push(row);
      } catch (error) {
        if (!isWarmup) rawRows.push({ ...baseRow, decode_status: "NOT_PRODUCED", visual_review_status: "NOT_REVIEWABLE", warning: error.message });
      }
      if (!isWarmup) await writeCsv(path.join(releaseRoot, "results/raw.csv"), RAW_HEADERS, rawRows);
    }
  }
} finally {
  await browser.close();
}

const grouped = Map.groupBy(rawRows, (row) => `${row.source_id}-${row.input_format}-${row.case_id}`);
const summaryRows = [...grouped].map(([caseKey, rows]) => {
  const completed = rows.filter((row) => row.decode_status === "PASS");
  const numeric = (key) => completed.map((row) => Number(row[key])).filter(Number.isFinite);
  const minimum = (values) => values.length ? Math.min(...values) : "";
  const maximum = (values) => values.length ? Math.max(...values) : "";
  return {
    case_key: caseKey,
    completed_runs: completed.length,
    failed_runs: rows.length - completed.length,
    median_output_bytes: median(numeric("output_bytes")),
    min_output_bytes: minimum(numeric("output_bytes")),
    max_output_bytes: maximum(numeric("output_bytes")),
    median_size_change_pct: median(numeric("size_change_pct")),
    median_processing_ms_tool: median(numeric("processing_ms_tool")),
    min_processing_ms_tool: minimum(numeric("processing_ms_tool")),
    max_processing_ms_tool: maximum(numeric("processing_ms_tool")),
    median_ssim: median(numeric("ssim")),
    median_psnr_db: median(numeric("psnr_db")),
  };
});
const summaryHeaders = ["case_key", "completed_runs", "failed_runs", "median_output_bytes", "min_output_bytes", "max_output_bytes", "median_size_change_pct", "median_processing_ms_tool", "min_processing_ms_tool", "max_processing_ms_tool", "median_ssim", "median_psnr_db"];
await writeCsv(path.join(releaseRoot, "results/derived-summary.csv"), summaryHeaders, summaryRows);
manifest.completed_at_utc = new Date().toISOString();
manifest.recorded_rows = rawRows.length;
manifest.successful_rows = rawRows.filter((row) => row.decode_status === "PASS").length;
manifest.status = rawRows.length === 380 && rawRows.every((row) => row.decode_status === "PASS") ? "MEASURED_REVIEW_PENDING" : "INCOMPLETE_NOT_PUBLICATION_READY";
manifest.publication_ready = false;
await writeJson(manifestPath, manifest);
await writeJson(path.join(releaseRoot, "results/run-status.json"), {
  status: manifest.status,
  publication_ready: false,
  reason: "Human visual review and independent reproduction remain required even after a complete automated run.",
});
console.log(`Recorded ${rawRows.length} rows. Status: ${manifest.status}`);
