import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("flagship analytics has a fixed, content-free event contract", async () => {
  const analytics = await source("lib/analytics/safe-tool-events.ts");

  assert.match(analytics, /"opened",\s*"valid_input",\s*"started",\s*"succeeded",\s*"download",\s*"process_another"/);
  assert.match(analytics, /"invalid_input",\s*"processing",\s*"rendering",\s*"download"/);
  assert.match(analytics, /send\(`tool_\$\{event\}`, \{ tool \}\)/);
  assert.match(analytics, /send\("tool_failed", \{ tool, failure_category: failureCategory \}\)/);
  assert.match(analytics, /send\("tool_duration", \{ tool, duration_ms: boundedDuration \}\)/);
  assert.doesNotMatch(analytics, /Record<string, unknown>/);
});

test("PDF to JPG keeps valid buffers aligned and keeps File X-Ray out of the flagship flow", async () => {
  const pdfToJpg = await source("components/tools/PdfToJpg.tsx");
  const entryPush = pdfToJpg.indexOf("entries.push({ file, pageCount, thumbnails })");
  const bufferPush = pdfToJpg.indexOf("buffers.push(buffer)");

  assert.ok(entryPush >= 0, "validated entries are recorded");
  assert.ok(bufferPush > entryPush, "a buffer is recorded only after its matching entry validates");
  assert.doesNotMatch(pdfToJpg, /FileXRayTrigger|File X-Ray/);
});
