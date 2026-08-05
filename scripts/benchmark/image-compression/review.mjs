import { spawnSync } from "node:child_process";
import { access, cp, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { median, parseArgs, parseCsv, sha256, writeCsv, writeJson } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.release) throw new Error("Pass the measured release directory with --release");
const releaseRoot = path.resolve(process.cwd(), String(args.release));
const reviewRoot = path.join(releaseRoot, "review");
const reviewManifestPath = path.join(reviewRoot, "visual-review-manifest.csv");
try {
  await access(reviewManifestPath);
  throw new Error("Visual review assets already exist for this immutable release.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const manifest = JSON.parse(await readFile(path.join(releaseRoot, "manifest/run-manifest.json"), "utf8"));
if (manifest.status !== "MEASURED_REVIEW_PENDING" || manifest.publication_ready) {
  throw new Error(`Release must be measured and review-pending; received ${manifest.status}.`);
}
const cases = parseCsv(await readFile(path.join(releaseRoot, "manifest/case-manifest.csv"), "utf8"));
const rows = parseCsv(await readFile(path.join(releaseRoot, "results/raw.csv"), "utf8"));
if (rows.length !== 380 || rows.some((row) => row.decode_status !== "PASS")) {
  throw new Error("Visual assets require 380 passing recorded rows.");
}

function representativeRow(caseKey) {
  const matches = rows.filter((row) => `${row.source_id}-${row.input_format}-${row.case_id}` === caseKey);
  const target = median(matches.map((row) => Number(row.output_bytes)));
  return matches.toSorted((a, b) => Math.abs(Number(a.output_bytes) - target) - Math.abs(Number(b.output_bytes) - target))[0];
}

async function maximumErrorTile(inputPath, outputPath, tileSize = 256) {
  const input = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const output = await sharp(outputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (input.info.width !== output.info.width || input.info.height !== output.info.height) throw new Error("Cannot compare different dimensions visually.");
  const width = input.info.width;
  const height = input.info.height;
  const cropWidth = Math.min(tileSize, width);
  const cropHeight = Math.min(tileSize, height);
  let best = { left: 0, top: 0, score: -1 };
  for (let top = 0; top <= height - cropHeight; top += cropHeight) {
    for (let left = 0; left <= width - cropWidth; left += cropWidth) {
      let error = 0;
      let samples = 0;
      for (let y = top; y < top + cropHeight; y += 4) {
        for (let x = left; x < left + cropWidth; x += 4) {
          const offset = (y * width + x) * 4;
          error += Math.abs(input.data[offset] - output.data[offset]);
          error += Math.abs(input.data[offset + 1] - output.data[offset + 1]);
          error += Math.abs(input.data[offset + 2] - output.data[offset + 2]);
          samples += 3;
        }
      }
      const score = samples ? error / samples : 0;
      if (score > best.score) best = { left, top, score };
    }
  }
  return { ...best, width: cropWidth, height: cropHeight };
}

async function cropPair(caseKey, inputPath, outputPath, label, rectangle) {
  const directory = path.join(reviewRoot, "stills", caseKey);
  await mkdir(directory, { recursive: true });
  const inputCrop = path.join(directory, `${label}-input.png`);
  const outputCrop = path.join(directory, `${label}-output.png`);
  await sharp(inputPath).extract(rectangle).png().toFile(inputCrop);
  await sharp(outputPath).extract(rectangle).png().toFile(outputCrop);
  return {
    input: path.relative(releaseRoot, inputCrop),
    output: path.relative(releaseRoot, outputCrop),
  };
}

function runCommand(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
}

async function createContactSheet(frames, destination) {
  const cellWidth = 320;
  const cellHeight = 180;
  const columns = 6;
  const rows = 4;
  const tiles = await Promise.all(frames.map(async (frame, index) => ({
    input: await sharp(frame).resize(cellWidth, cellHeight, {
      fit: "contain",
      background: { r: 17, g: 24, b: 39, alpha: 1 },
    }).png().toBuffer(),
    left: (index % columns) * cellWidth,
    top: Math.floor(index / columns) * cellHeight,
  })));
  await sharp({
    create: {
      width: columns * cellWidth,
      height: rows * cellHeight,
      channels: 4,
      background: { r: 17, g: 24, b: 39, alpha: 1 },
    },
  }).composite(tiles).png().toFile(destination);
}

async function extractGifFrame(source, destination, timestampMs) {
  await unlink(destination).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  const attempts = [timestampMs, timestampMs - 100, timestampMs - 250, timestampMs - 500]
    .map((value) => Math.max(0, value));
  let lastError;
  for (const attemptMs of [...new Set(attempts)]) {
    try {
      runCommand("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-i", source,
        "-ss", (attemptMs / 1000).toFixed(3), "-frames:v", "1", "-y", destination,
      ]);
      await access(destination);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function gifReviewSheet(caseKey, inputPath, outputPath, inputDurationMs, outputDurationMs) {
  const directory = path.join(reviewRoot, "gifs", caseKey);
  await mkdir(directory, { recursive: true });
  const frames = [];
  const commonDurationMs = Math.min(inputDurationMs, outputDurationMs);
  if (!Number.isFinite(commonDurationMs) || commonDurationMs <= 0) throw new Error(`Invalid GIF duration for ${caseKey}.`);
  const safeEndMs = Math.max(0, commonDurationMs - 100);
  for (let index = 0; index < 12; index += 1) {
    const timestampMs = ((index + 0.5) / 12) * safeEndMs;
    for (const [label, source] of [["input", inputPath], ["output", outputPath]]) {
      const destination = path.join(directory, `${String(index + 1).padStart(2, "0")}-${label}.png`);
      await extractGifFrame(source, destination, timestampMs);
      frames.push(destination);
    }
  }
  const sheet = path.join(directory, "timestamp-contact-sheet.png");
  await createContactSheet(frames, sheet);
  return path.relative(releaseRoot, sheet);
}

const reviewRows = [];
for (const testCase of cases) {
  const row = representativeRow(testCase.case_key);
  const inputPath = path.join(releaseRoot, row.input_path);
  const outputPath = path.join(releaseRoot, row.output_path);
  const common = {
    case_key: testCase.case_key,
    source_id: row.source_id,
    input_format: row.input_format,
    case_id: row.case_id,
    representative_run: row.run_number,
    representative_output_path: row.output_path,
    representative_output_sha256: row.output_sha256,
    ssim: row.ssim,
    psnr_db: row.psnr_db,
    review_status: "PENDING_HUMAN",
    reviewer: "",
    reviewed_at_utc: "",
    notes: "",
  };
  if (row.input_format === "gif") {
    reviewRows.push({
      ...common,
      center_input: "",
      center_output: "",
      max_error_input: "",
      max_error_output: "",
      max_error_score: "",
      gif_contact_sheet: await gifReviewSheet(
        testCase.case_key,
        inputPath,
        outputPath,
        Number(row.input_duration_ms),
        Number(row.output_duration_ms),
      ),
    });
    continue;
  }
  const metadata = await sharp(inputPath).metadata();
  const centerWidth = Math.min(512, metadata.width);
  const centerHeight = Math.min(512, metadata.height);
  const center = {
    left: Math.floor((metadata.width - centerWidth) / 2),
    top: Math.floor((metadata.height - centerHeight) / 2),
    width: centerWidth,
    height: centerHeight,
  };
  const errorTile = await maximumErrorTile(inputPath, outputPath);
  const centerPair = await cropPair(testCase.case_key, inputPath, outputPath, "center", center);
  const errorPair = await cropPair(testCase.case_key, inputPath, outputPath, "max-error", errorTile);
  reviewRows.push({
    ...common,
    center_input: centerPair.input,
    center_output: centerPair.output,
    max_error_input: errorPair.input,
    max_error_output: errorPair.output,
    max_error_score: errorTile.score,
    gif_contact_sheet: "",
  });
}

const headers = ["case_key", "source_id", "input_format", "case_id", "representative_run", "representative_output_path", "representative_output_sha256", "ssim", "psnr_db", "center_input", "center_output", "max_error_input", "max_error_output", "max_error_score", "gif_contact_sheet", "review_status", "reviewer", "reviewed_at_utc", "notes"];
await writeCsv(reviewManifestPath, headers, reviewRows);
await cp(new URL("review.mjs", import.meta.url), path.join(releaseRoot, "scripts/review.mjs"));
await writeFile(path.join(reviewRoot, "README.md"), `# Visual review\n\nStatus: pending human review. Review all ${reviewRows.length} case rows in visual-review-manifest.csv. For stills, compare the input/output center crop and highest-error tile at 100% scale. For GIFs, the contact sheet is ordered as 12 input/output pairs from left to right and top to bottom; compare each pair and inspect timing, disposal, transparency, flicker, and loop completion in the original artifacts. Record PASS or CONCERN, reviewer identity, UTC review time, and notes. Do not approve aggregate claims from an incomplete review.\n`);
await writeJson(path.join(reviewRoot, "visual-review-status.json"), {
  status: "PENDING_HUMAN",
  case_count: reviewRows.length,
  generated_at_utc: new Date().toISOString(),
  generator_sha256: await sha256(new URL("review.mjs", import.meta.url)),
});
console.log(`Generated visual-review assets for ${reviewRows.length} cases.`);
