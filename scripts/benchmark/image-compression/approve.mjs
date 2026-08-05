import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileBytes, parseArgs, parseCsv, sha256, writeJson } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.release) throw new Error("Pass the measured release directory with --release");
const releaseRoot = path.resolve(process.cwd(), String(args.release));
const manifestPath = path.join(releaseRoot, "manifest/run-manifest.json");
const approvalPath = path.join(releaseRoot, "review/release-approval.json");
const gatePath = path.join(releaseRoot, "review/publication-gate.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.publication_ready || manifest.status === "APPROVED_FOR_PUBLICATION") {
  throw new Error("This immutable release already has a completed publication gate.");
}
if (manifest.dirty_state || manifest.pilot_only) throw new Error("A dirty or pilot-only release cannot be approved.");
if (!manifest.served_build_verified || manifest.served_build_commit !== manifest.git_commit) {
  throw new Error("The measured build was not verified against the frozen Git commit.");
}

const corpusManifestPath = path.join(releaseRoot, "manifest/corpus-manifest.csv");
const caseManifestPath = path.join(releaseRoot, "manifest/case-manifest.csv");
if (await sha256(corpusManifestPath) !== manifest.corpus_manifest_sha256) throw new Error("Corpus manifest hash changed after preparation.");
if (await sha256(caseManifestPath) !== manifest.case_manifest_sha256) throw new Error("Case manifest hash changed after preparation.");

const cases = parseCsv(await readFile(caseManifestPath, "utf8"));
const rows = parseCsv(await readFile(path.join(releaseRoot, "results/raw.csv"), "utf8"));
if (cases.length !== 76) throw new Error(`Expected 76 frozen cases; found ${cases.length}.`);
if (rows.length !== 380) throw new Error(`Expected 380 recorded rows; found ${rows.length}.`);
if (rows.some((row) => row.decode_status !== "PASS")) throw new Error("Every recorded output must pass its decode and output-contract checks.");

const caseKeys = new Set(cases.map((row) => row.case_key));
const rowCounts = new Map();
for (const row of rows) {
  const key = `${row.source_id}-${row.input_format}-${row.case_id}`;
  rowCounts.set(key, (rowCounts.get(key) ?? 0) + 1);
  const outputPath = path.resolve(releaseRoot, row.output_path);
  if (!outputPath.startsWith(`${releaseRoot}${path.sep}`)) throw new Error(`Output escapes the release directory: ${row.output_path}`);
  await access(outputPath);
  if (await fileBytes(outputPath) <= 0) throw new Error(`Output is empty: ${row.output_path}`);
  if (await sha256(outputPath) !== row.output_sha256) throw new Error(`Output hash mismatch: ${row.output_path}`);
}
for (const caseKey of caseKeys) {
  if (rowCounts.get(caseKey) !== 5) throw new Error(`Case ${caseKey} does not contain exactly five recorded runs.`);
}

const approval = JSON.parse(await readFile(approvalPath, "utf8"));
const requiredText = ["release_owner", "release_owner_approved_at_utc", "visual_reviewer", "independent_reviewer", "independent_reproduction_evidence", "correction_contact"];
if (approval.schema_version !== 1) throw new Error("release-approval.json must use schema_version 1.");
if (approval.benchmark_version !== manifest.benchmark_version) throw new Error("Approval benchmark_version does not match the release.");
for (const field of requiredText) {
  if (typeof approval[field] !== "string" || !approval[field].trim()) throw new Error(`Approval field ${field} is required.`);
}
if (Number.isNaN(Date.parse(approval.release_owner_approved_at_utc))) throw new Error("release_owner_approved_at_utc must be an ISO date-time.");
if (approval.clean_production_build_confirmed !== true || approval.build_commit !== manifest.git_commit) {
  throw new Error("Approval must confirm the clean production build and exact frozen commit.");
}
if (approval.independent_reviewer === manifest.operator || approval.independent_reviewer === approval.release_owner) {
  throw new Error("Independent reproduction must be recorded by a different person.");
}

const visualKeys = new Set(approval.visual_review_case_keys ?? []);
if (visualKeys.size !== caseKeys.size || [...caseKeys].some((key) => !visualKeys.has(key))) {
  throw new Error("Visual review must name every one of the 76 frozen case keys.");
}
const reproducedKeys = new Set(approval.independent_reproduction_case_keys ?? []);
const minimumIndependentCases = Math.ceil(caseKeys.size * 0.1);
if (reproducedKeys.size < minimumIndependentCases || [...reproducedKeys].some((key) => !caseKeys.has(key))) {
  throw new Error(`Independent reproduction must name at least ${minimumIndependentCases} valid case keys.`);
}
const reproductionEvidence = path.resolve(releaseRoot, approval.independent_reproduction_evidence);
if (!reproductionEvidence.startsWith(`${releaseRoot}${path.sep}`)) throw new Error("Independent reproduction evidence must stay inside the release package.");
await access(reproductionEvidence);

const gate = {
  schema_version: 1,
  benchmark_version: manifest.benchmark_version,
  approved_at_utc: new Date().toISOString(),
  approved_by: approval.release_owner,
  checks: {
    clean_frozen_commit: true,
    served_build_verified: true,
    corpus_manifest_hash_verified: true,
    case_manifest_hash_verified: true,
    expected_cases: 76,
    recorded_rows: 380,
    output_contract_passed: true,
    artifact_hashes_verified: true,
    visual_reviewed_cases: visualKeys.size,
    independent_reproduced_cases: reproducedKeys.size,
    correction_contact_recorded: true,
  },
};
await writeJson(gatePath, gate);
manifest.status = "APPROVED_FOR_PUBLICATION";
manifest.publication_ready = true;
manifest.publication_gate = path.relative(releaseRoot, gatePath);
await writeJson(manifestPath, manifest);
console.log(`Release ${manifest.benchmark_version} passed the publication gate.`);
