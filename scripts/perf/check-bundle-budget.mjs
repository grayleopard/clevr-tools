#!/usr/bin/env node

import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

if (process.env.SKIP_BUNDLE_BUDGET === "1") {
  console.log("bundle-budget: skipped via SKIP_BUNDLE_BUDGET=1");
  process.exit(0);
}

const ROUTE_BUDGETS_KB = {
  "/": Number(process.env.BUNDLE_BUDGET_HOME_KB || 1600),
  "/compress/image": Number(process.env.BUNDLE_BUDGET_COMPRESS_IMAGE_KB || 2200),
  "/convert/pdf-to-jpg": Number(process.env.BUNDLE_BUDGET_PDF_TO_JPG_KB || 1700),
  "/convert/word-to-pdf": Number(process.env.BUNDLE_BUDGET_WORD_TO_PDF_KB || 1700),
};

const SHARED_CHUNK_BUDGET_KB = Number(process.env.BUNDLE_BUDGET_SHARED_CHUNK_KB || 900);
const NEXT_DIR = path.join(process.cwd(), ".next");

function cleanRoute(route) {
  if (!route.startsWith("/")) return `/${route}`;
  if (route.length > 1 && route.endsWith("/")) return route.slice(0, -1);
  return route;
}

function normalizeRouteToAppKey(route) {
  const clean = cleanRoute(route);
  if (clean === "/") return "/page";
  return `${clean}/page`;
}

function clientReferenceManifestPath(route) {
  const clean = cleanRoute(route);
  if (clean === "/") {
    return path.join(NEXT_DIR, "server", "app", "page_client-reference-manifest.js");
  }
  return path.join(NEXT_DIR, "server", "app", clean.slice(1), "page_client-reference-manifest.js");
}

function fileSizeBytes(assetPath) {
  const normalized = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  const absolute = path.join(NEXT_DIR, normalized);
  try {
    return statSync(absolute).size;
  } catch {
    return 0;
  }
}

function parseRouteManifest(route) {
  const routeKey = normalizeRouteToAppKey(route);
  const manifestFile = clientReferenceManifestPath(route);
  const raw = readFileSync(manifestFile, "utf8");
  const context = { globalThis: {} };
  vm.runInNewContext(raw, context);
  const routeManifest = context.globalThis?.__RSC_MANIFEST?.[routeKey];
  if (!routeManifest) {
    throw new Error(`Missing route manifest key ${routeKey}`);
  }
  return routeManifest;
}

function formatKB(bytes) {
  return Number((bytes / 1024).toFixed(1));
}

function main() {
  const buildManifest = JSON.parse(
    readFileSync(path.join(NEXT_DIR, "build-manifest.json"), "utf8")
  );
  const rootJs = new Set([
    ...(buildManifest.rootMainFiles || []),
    ...(buildManifest.polyfillFiles || []),
  ].filter((file) => file.endsWith(".js")));

  let hasFailure = false;
  const sharedCounts = new Map();

  console.log("bundle-budget: route JS totals (manifest chunk aggregation)");

  for (const [route, budgetKB] of Object.entries(ROUTE_BUDGETS_KB)) {
    const routeManifest = parseRouteManifest(route);
    const routeChunks = new Set([...rootJs]);

    for (const moduleMeta of Object.values(routeManifest.clientModules || {})) {
      for (const chunk of moduleMeta.chunks || []) {
        if (typeof chunk === "string" && chunk.endsWith(".js")) {
          routeChunks.add(chunk);
        }
      }
    }

    for (const chunk of routeChunks) {
      sharedCounts.set(chunk, (sharedCounts.get(chunk) || 0) + 1);
    }

    const jsBytes = [...routeChunks].reduce((sum, chunk) => sum + fileSizeBytes(chunk), 0);
    const jsKB = formatKB(jsBytes);
    const status = jsKB <= budgetKB ? "PASS" : "FAIL";
    console.log(`  [${status}] ${route}: ${jsKB} KiB (budget ${budgetKB} KiB)`);

    if (jsKB > budgetKB) {
      hasFailure = true;
    }
  }

  const routeCount = Object.keys(ROUTE_BUDGETS_KB).length;
  const sharedChunks = [...sharedCounts.entries()]
    .filter(([, count]) => count === routeCount)
    .map(([chunk]) => ({ chunk, kb: formatKB(fileSizeBytes(chunk)) }))
    .sort((a, b) => b.kb - a.kb);

  const sharedCandidates = sharedChunks.filter(({ chunk }) => {
    return !(
      chunk.includes("polyfills") ||
      chunk.includes("webpack") ||
      chunk.includes("main-app") ||
      chunk.includes("app/layout") ||
      chunk.includes("app/page")
    );
  });

  if (sharedCandidates.length > 0) {
    const largest = sharedCandidates[0];
    const status = largest.kb <= SHARED_CHUNK_BUDGET_KB ? "PASS" : "FAIL";
    console.log(
      `  [${status}] largest shared app/vendor chunk: ${largest.chunk} (${largest.kb} KiB, budget ${SHARED_CHUNK_BUDGET_KB} KiB)`
    );
    if (largest.kb > SHARED_CHUNK_BUDGET_KB) {
      hasFailure = true;
    }
  }

  if (hasFailure) {
    console.error("bundle-budget: one or more budgets exceeded");
    process.exit(1);
  }

  console.log("bundle-budget: all budgets passed");
}

main();
