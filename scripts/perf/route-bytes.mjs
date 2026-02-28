#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

function toKB(bytes) {
  return Number((bytes / 1024).toFixed(1));
}

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

function clientReferenceManifestPath(nextDir, route) {
  const clean = cleanRoute(route);
  if (clean === "/") {
    return path.join(nextDir, "server", "app", "page_client-reference-manifest.js");
  }

  return path.join(
    nextDir,
    "server",
    "app",
    clean.slice(1),
    "page_client-reference-manifest.js"
  );
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function fileSize(nextDir, assetPath) {
  const normalized = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  const absolute = path.join(nextDir, normalized);
  try {
    const info = await stat(absolute);
    return info.size;
  } catch {
    return 0;
  }
}

async function main() {
  const routes = process.argv.slice(2);
  if (routes.length === 0) {
    console.error("Usage: node scripts/perf/route-bytes.mjs / /compress/image [/convert/pdf-to-jpg]");
    process.exit(1);
  }

  const nextDir = path.join(process.cwd(), ".next");
  const buildManifest = await readJson(path.join(nextDir, "build-manifest.json"));
  const rootFiles = new Set([
    ...(buildManifest.rootMainFiles || []),
    ...(buildManifest.polyfillFiles || []),
  ]);

  for (const route of routes) {
    const appKey = normalizeRouteToAppKey(route);
    const manifestFile = clientReferenceManifestPath(nextDir, route);

    let rawManifest;
    try {
      rawManifest = await readFile(manifestFile, "utf8");
    } catch {
      console.log(`Route: ${route} (missing client manifest ${manifestFile})`);
      continue;
    }

    const context = { globalThis: {} };
    vm.runInNewContext(rawManifest, context);
    const routeManifest = context.globalThis?.__RSC_MANIFEST?.[appKey];
    if (!routeManifest) {
      console.log(`Route: ${route} (missing RSC manifest key ${appKey})`);
      continue;
    }

    const entryJsFiles = Object.values(routeManifest.entryJSFiles || {}).flat();
    const entryCssFiles = Object.values(routeManifest.entryCSSFiles || {})
      .flat()
      .map((entry) => entry.path);

    const files = new Set([...rootFiles, ...entryJsFiles, ...entryCssFiles]);
    let jsBytes = 0;
    let cssBytes = 0;

    for (const file of files) {
      const bytes = await fileSize(nextDir, file);
      if (file.endsWith(".js")) jsBytes += bytes;
      if (file.endsWith(".css")) cssBytes += bytes;
    }

    console.log(`Route: ${route}`);
    console.log(`  JS: ${toKB(jsBytes)} KiB`);
    console.log(`  CSS: ${toKB(cssBytes)} KiB`);
    console.log(`  Total: ${toKB(jsBytes + cssBytes)} KiB`);
  }
}

await main();
