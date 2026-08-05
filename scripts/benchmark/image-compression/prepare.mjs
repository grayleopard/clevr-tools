import { execFileSync } from "node:child_process";
import { cp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { commandVersion, expectedReducedFrameCount, fileBytes, parseArgs, run, sha256, writeCsv, writeJson } from "./lib.mjs";

const projectRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));
const benchmarkVersion = String(args.version ?? "").trim();
if (!benchmarkVersion) throw new Error("Pass an immutable release name with --version, for example 2026-08-04-pilot-01");
if (!/^[a-z0-9][a-z0-9._-]+$/i.test(benchmarkVersion)) throw new Error("--version contains unsupported characters");

const releaseRoot = path.resolve(projectRoot, String(args.output ?? `benchmark-artifacts/image-compression/${benchmarkVersion}`));
const directories = ["manifest", "scripts", "inputs/source", "outputs", "results", "review"];
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const dirty = execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], { encoding: "utf8" }).trim() !== "";
if (dirty && !args["allow-dirty-pilot"]) {
  throw new Error("The tracked worktree is dirty. Commit the benchmark implementation first, or pass --allow-dirty-pilot for a permanently non-publishable dry run.");
}

const sources = [
  { id: "cc0-landscape-dense", title: "File:A lush verdant landscape.jpg", uploader: "Ayyuha Sideeq" },
  { id: "cc0-landscape-gradient", title: "File:Landscape of Nature.jpg", uploader: "Yasir 48" },
  { id: "cc0-architecture-lines", title: "File:Architecture building .jpg", uploader: "Wiki_Ruhan" },
  { id: "cc0-food-texture", title: "File:Food photography image.jpg", uploader: "Santhosh annakili" },
];

const stillCases = [
  { case_id: "same-q60", quality_setting: 60, output_selector: "original" },
  { case_id: "same-q80", quality_setting: 80, output_selector: "original" },
  { case_id: "same-q95", quality_setting: 95, output_selector: "original" },
  { case_id: "to-webp-q80", quality_setting: 80, output_selector: "webp" },
  { case_id: "to-jpeg-q80", quality_setting: 80, output_selector: "jpeg" },
];

const gifCases = [
  { case_id: "balanced-current", gif_compression: 58, gif_max_colors: 128, gif_frame_reduction: 1, gif_scale_pct: 100 },
  { case_id: "color-reduction", gif_compression: 82, gif_max_colors: 64, gif_frame_reduction: 1, gif_scale_pct: 100 },
  { case_id: "frame-and-scale", gif_compression: 82, gif_max_colors: 64, gif_frame_reduction: 2, gif_scale_pct: 75 },
  { case_id: "aggressive", gif_compression: 90, gif_max_colors: 32, gif_frame_reduction: 3, gif_scale_pct: 50 },
];

async function fetchCommonsRecord(source) {
  const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo|revisions",
    titles: source.title,
    iiprop: "url|size|mime|extmetadata",
    rvprop: "ids",
    rvlimit: "1",
    origin: "*",
  });
  const response = await fetch(endpoint, { headers: { "user-agent": "clevr.tools benchmark corpus freezer/1.0" } });
  if (!response.ok) throw new Error(`Wikimedia API failed for ${source.title}: ${response.status}`);
  const payload = await response.json();
  const page = payload.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!page || page.missing || !info?.url) throw new Error(`Wikimedia file not found: ${source.title}`);
  const license = info.extmetadata?.LicenseShortName?.value ?? "";
  if (!/CC0/i.test(license)) throw new Error(`Expected CC0 metadata for ${source.title}; received ${license || "none"}`);
  return { page, info, license };
}

async function download(url, destination) {
  const response = await fetch(url, { headers: { "user-agent": "clevr.tools benchmark corpus freezer/1.0" } });
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${url}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

await mkdir(path.dirname(releaseRoot), { recursive: true });
await mkdir(releaseRoot, { recursive: false });
for (const directory of directories) await mkdir(path.join(releaseRoot, directory), { recursive: true });

const corpusRows = [];
const caseRows = [];
const commands = [];
for (const source of sources) {
  const { page, info, license } = await fetchCommonsRecord(source);
  const sourcePage = `https://commons.wikimedia.org/wiki/${encodeURIComponent(source.title.replaceAll(" ", "_"))}`;
  const revisionId = page.revisions?.[0]?.revid;
  const sourceRevision = revisionId ? `${sourcePage}?oldid=${revisionId}` : sourcePage;
  const sourcePath = path.join(releaseRoot, "inputs/source", `${source.id}.jpg`);
  await download(info.url, sourcePath);
  const sourceMetadata = await sharp(sourcePath).metadata();
  if (sourceMetadata.format !== "jpeg") throw new Error(`${source.id} did not decode as JPEG`);

  corpusRows.push({
    source_id: source.id,
    source_page: sourcePage,
    source_revision: sourceRevision,
    original_url: info.url,
    uploader: source.uploader,
    license,
    license_url: info.extmetadata?.LicenseUrl?.value ?? "https://creativecommons.org/publicdomain/zero/1.0/",
    downloaded_at_utc: new Date().toISOString(),
    original_width: sourceMetadata.width,
    original_height: sourceMetadata.height,
    original_bytes: await fileBytes(sourcePath),
    sha256: await sha256(sourcePath),
  });

  const inputDir = path.join(releaseRoot, "inputs", source.id);
  await mkdir(inputDir, { recursive: true });
  const canonicalPath = path.join(inputDir, "canonical.png");
  const pngPath = path.join(inputDir, "input.png");
  const jpgPath = path.join(inputDir, "input.jpg");
  const webpPath = path.join(inputDir, "input.webp");
  const gifPath = path.join(inputDir, "input.gif");
  const fixtureCommands = [
    ["magick", [sourcePath, "-auto-orient", "-colorspace", "sRGB", "-resize", "2560x2560>", "-strip", canonicalPath]],
    ["magick", [canonicalPath, "-strip", "-define", "png:compression-level=9", pngPath]],
    ["magick", [canonicalPath, "-strip", "-quality", "90", jpgPath]],
    ["cwebp", ["-quiet", "-q", "90", "-m", "6", "-metadata", "none", canonicalPath, "-o", webpPath]],
    ["ffmpeg", ["-y", "-loop", "1", "-framerate", "12", "-t", "2", "-i", canonicalPath, "-filter_complex", "scale=900:506:force_original_aspect_ratio=increase,crop=900:506,zoompan=z='min(zoom+0.003,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=24:s=800x450:fps=12,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a", "-frames:v", "24", gifPath]],
  ];
  for (const [command, commandArgs] of fixtureCommands) {
    commands.push(`${command} ${commandArgs.map((value) => JSON.stringify(value)).join(" ")}`);
    run(command, commandArgs);
  }

  for (const format of ["png", "jpg", "webp"]) {
    const inputPath = path.join(inputDir, `input.${format}`);
    const metadata = await sharp(inputPath).metadata();
    for (const testCase of stillCases) {
      const expectedFormat = testCase.output_selector === "original" ? (format === "jpg" ? "jpeg" : format) : testCase.output_selector;
      caseRows.push({
        case_key: `${source.id}-${format}-${testCase.case_id}`,
        tool_route: "/compress/image",
        source_id: source.id,
        input_format: format,
        input_path: path.relative(releaseRoot, inputPath),
        input_sha256: await sha256(inputPath),
        case_id: testCase.case_id,
        quality_setting: testCase.quality_setting,
        output_selector: testCase.output_selector,
        gif_compression: "",
        gif_max_colors: "",
        gif_frame_reduction: "",
        gif_scale_pct: "",
        expected_mime: `image/${expectedFormat}`,
        expected_width: metadata.width,
        expected_height: metadata.height,
        expected_frames: 1,
        expected_duration_ms: "",
      });
    }
  }

  const gifMetadata = await sharp(gifPath, { animated: true }).metadata();
  for (const testCase of gifCases) {
    caseRows.push({
      case_key: `${source.id}-gif-${testCase.case_id}`,
      tool_route: "/tools/gif-compressor",
      source_id: source.id,
      input_format: "gif",
      input_path: path.relative(releaseRoot, gifPath),
      input_sha256: await sha256(gifPath),
      case_id: testCase.case_id,
      quality_setting: "",
      output_selector: "gif",
      gif_compression: testCase.gif_compression,
      gif_max_colors: testCase.gif_max_colors,
      gif_frame_reduction: testCase.gif_frame_reduction,
      gif_scale_pct: testCase.gif_scale_pct,
      expected_mime: "image/gif",
      expected_width: Math.max(1, Math.round(800 * testCase.gif_scale_pct / 100)),
      expected_height: Math.max(1, Math.round(450 * testCase.gif_scale_pct / 100)),
      expected_frames: expectedReducedFrameCount(gifMetadata.pages ?? 24, testCase.gif_frame_reduction),
      expected_duration_ms: (gifMetadata.delay ?? []).reduce((sum, delay) => sum + delay, 0),
    });
  }
}

const corpusHeaders = ["source_id", "source_page", "source_revision", "original_url", "uploader", "license", "license_url", "downloaded_at_utc", "original_width", "original_height", "original_bytes", "sha256"];
const caseHeaders = ["case_key", "tool_route", "source_id", "input_format", "input_path", "input_sha256", "case_id", "quality_setting", "output_selector", "gif_compression", "gif_max_colors", "gif_frame_reduction", "gif_scale_pct", "expected_mime", "expected_width", "expected_height", "expected_frames", "expected_duration_ms"];
const corpusManifestPath = path.join(releaseRoot, "manifest/corpus-manifest.csv");
const caseManifestPath = path.join(releaseRoot, "manifest/case-manifest.csv");
await writeCsv(corpusManifestPath, corpusHeaders, corpusRows);
await writeCsv(caseManifestPath, caseHeaders, caseRows);
await writeFile(path.join(releaseRoot, "scripts/fixture-commands.txt"), `${commands.join("\n")}\n`);
for (const file of ["prepare.mjs", "run.mjs", "approve.mjs", "lib.mjs"]) {
  await cp(new URL(file, import.meta.url), path.join(releaseRoot, "scripts", file));
}
await cp(new URL("release-approval.template.json", import.meta.url), path.join(releaseRoot, "review/release-approval.template.json"));

const runManifest = {
  benchmark_version: benchmarkVersion,
  status: "PREPARED_NOT_RUN",
  publication_ready: false,
  started_at_utc: null,
  completed_at_utc: null,
  git_commit: gitCommit,
  dirty_state: dirty,
  pilot_only: dirty,
  package_lock_sha256: await sha256(path.join(projectRoot, "package-lock.json")),
  fixture_tools: {
    imagemagick: commandVersion("magick").split("\n")[0],
    cwebp: commandVersion("cwebp").split("\n")[0],
    ffmpeg: commandVersion("ffmpeg").split("\n")[0],
  },
  browser: null,
  environment: {
    os: `${os.type()} ${os.release()} ${os.arch()}`,
    cpu: os.cpus()[0]?.model ?? "unknown",
    memory_gb: Number((os.totalmem() / 1024 ** 3).toFixed(2)),
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  serving_url: null,
  operator: String(args.operator ?? "UNASSIGNED"),
  reviewer: String(args.reviewer ?? "UNASSIGNED"),
  corpus_manifest_sha256: await sha256(corpusManifestPath),
  case_manifest_sha256: await sha256(caseManifestPath),
  expected_case_count: 76,
  expected_recorded_rows: 380,
};
await writeJson(path.join(releaseRoot, "manifest/run-manifest.json"), runManifest);
await writeFile(path.join(releaseRoot, "README.md"), `# Image compression benchmark ${benchmarkVersion}\n\nStatus: prepared, not run, not publication-ready. This package contains ${caseRows.length} frozen cases. No result claim may be derived until all publication gates in the repository execution specification pass.\n`);

console.log(`Prepared ${caseRows.length} cases at ${releaseRoot}`);
