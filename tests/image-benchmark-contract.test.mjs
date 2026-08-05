import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { expectedReducedFrameCount } from "../scripts/benchmark/image-compression/lib.mjs";

const projectRoot = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

test("GIF benchmark frame expectations retain the final animation frame", () => {
  assert.equal(expectedReducedFrameCount(24, 1), 24);
  assert.equal(expectedReducedFrameCount(24, 2), 13);
  assert.equal(expectedReducedFrameCount(24, 3), 9);
  assert.equal(expectedReducedFrameCount(1, 4), 1);
});

test("image benchmark has stable UI hooks for measured downloads", () => {
  const dropZone = read("components/tool/FileDropZone.tsx");
  const stills = read("components/tools/ImageCompressor.tsx");
  const gifs = read("components/tools/GifCompressor.tsx");

  assert.match(dropZone, /data-testid=\{inputTestId\}/);
  for (const hook of [
    "benchmark-file-input",
    "benchmark-image-quality",
    "benchmark-image-format-",
    "benchmark-image-processing-ms",
    "benchmark-image-download",
  ]) assert.match(stills, new RegExp(hook));
  for (const hook of [
    "benchmark-file-input",
    "benchmark-gif-analysis",
    "benchmark-gif-compression",
    "benchmark-gif-colors-",
    "benchmark-gif-frame-",
    "benchmark-gif-scale-",
    "benchmark-gif-compress",
    "benchmark-gif-processing-ms",
    "benchmark-gif-download",
  ]) assert.match(gifs, new RegExp(hook));
});

test("benchmark harness preserves the evidence and publication gates", () => {
  const prepare = read("scripts/benchmark/image-compression/prepare.mjs");
  const runner = read("scripts/benchmark/image-compression/run.mjs");
  const approval = read("scripts/benchmark/image-compression/approve.mjs");
  const review = read("scripts/benchmark/image-compression/review.mjs");

  assert.equal((prepare.match(/case_id: "same-/g) ?? []).length, 3);
  assert.equal((prepare.match(/case_id: "to-/g) ?? []).length, 2);
  assert.equal((prepare.match(/gif_compression:/g) ?? []).length >= 4, true);
  assert.match(prepare, /expected_case_count: 76/);
  assert.match(prepare, /expected_recorded_rows: 380/);
  assert.match(runner, /Release .* is immutable/);
  assert.match(runner, /visual_review_status: "PENDING"/);
  assert.match(runner, /publication_ready = false/);
  assert.match(runner, /rawRows\.length === 380/);
  assert.match(runner, /getByRole\("slider"\)/);
  assert.match(runner, /aria-valuenow/);
  assert.match(runner, /aria-pressed/);
  assert.match(runner, /output\.mime !== testCase\.expected_mime/);
  assert.match(runner, /expected.*frames, received/);
  assert.match(runner, /duration differs by/);
  assert.match(runner, /output\.loop !== input\.loop/);
  assert.match(runner, /Human visual review and independent reproduction remain required/);
  assert.match(approval, /rows\.length !== 380/);
  assert.match(approval, /Visual review must name every one of the 76 frozen case keys/);
  assert.match(approval, /Independent reproduction must name at least/);
  assert.match(approval, /Output hash mismatch/);
  assert.match(approval, /APPROVED_FOR_PUBLICATION/);
  assert.match(review, /PENDING_HUMAN/);
  assert.match(review, /maximumErrorTile/);
  assert.match(review, /timestamp-contact-sheet\.png/);
  assert.match(review, /reviewRows\.length/);
});
