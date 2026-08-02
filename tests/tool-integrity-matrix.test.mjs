import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();
const matrixPath = path.join(
  projectRoot,
  "reports/audits/tool-integrity/tool-integrity-matrix.csv"
);

const requiredColumns = [
  "tool_name",
  "route",
  "category",
  "registry_status",
  "indexable",
  "sitemap_included",
  "navigation_discoverable",
  "category_discoverable",
  "search_discoverable",
  "functional_status",
  "verification_status",
  "tested_inputs",
  "expected_output",
  "actual_output",
  "output_verified",
  "desktop_status",
  "mobile_status",
  "accessibility_status",
  "privacy_model",
  "external_dependencies",
  "known_limitations",
  "gsc_impressions",
  "gsc_clicks",
  "gsc_position",
  "demand_status",
  "correctness_score",
  "demand_score",
  "differentiation_score",
  "strategic_fit_score",
  "maintainability_score",
  "total_score",
  "recommendation",
  "highest_defect_severity",
  "defect_summary",
  "evidence",
  "recommended_seo_action",
  "recommended_product_action",
  "original_defect",
  "resolution_status",
  "remediation_files",
  "remediation_tests",
  "remediation_evidence",
  "post_remediation_recommendation",
  "remaining_risks",
];

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("unterminated quoted CSV field");
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function loadRegistry() {
  const source = fs.readFileSync(path.join(projectRoot, "lib/tools.ts"), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    () => {
      throw new Error("lib/tools.ts unexpectedly imported a runtime dependency");
    }
  );
  return transpiledModule.exports.tools;
}

test("tool integrity matrix is complete, unique, and enum-safe", () => {
  const [header, ...data] = parseCsv(fs.readFileSync(matrixPath, "utf8"));
  assert.deepEqual(header, requiredColumns);
  assert.equal(data.length, 116);
  assert.ok(data.every((row) => row.length === requiredColumns.length));

  const records = data.map((row) => Object.fromEntries(header.map((key, i) => [key, row[i]])));
  const routes = records.map((record) => record.route);
  assert.equal(new Set(routes).size, routes.length, "matrix routes must be unique");

  const registryRoutes = new Set(loadRegistry().map((tool) => tool.route));
  assert.equal(registryRoutes.size, 114);
  for (const route of registryRoutes) {
    assert.ok(routes.includes(route), `missing registered route: ${route}`);
  }
  assert.ok(routes.includes("/play/numble"));
  assert.ok(routes.includes("/play/meme-generator"));
  assert.ok(!routes.includes("/files/image-resizer"));
  assert.equal(records.filter((record) => record.expected_output === record.actual_output).length, 0);
  assert.equal(records.filter((record) => record.tested_inputs === record.expected_output).length, 0);

  const recommendations = new Set([
    "FLAGSHIP",
    "KEEP",
    "FIX",
    "HIDE",
    "CONSOLIDATE",
    "REMOVE",
  ]);
  const verificationStatuses = new Set([
    "PASS",
    "PARTIAL",
    "FAIL",
    "UNVERIFIED",
    "NOT_APPLICABLE",
  ]);
  const severities = new Set(["", "P0", "P1", "P2", "P3"]);
  const resolutionStatuses = new Set([
    "FIXED",
    "CONTAINED",
    "REMOVED",
    "BLOCKED",
    "NOT_IN_P0_P1_SCOPE",
  ]);

  for (const record of records) {
    assert.ok(recommendations.has(record.recommendation), record.route);
    assert.ok(verificationStatuses.has(record.verification_status), record.route);
    assert.ok(severities.has(record.highest_defect_severity), record.route);
    assert.ok(resolutionStatuses.has(record.resolution_status), record.route);
    assert.equal(record.original_defect, record.defect_summary, record.route);
    assert.equal(record.demand_status, "UNKNOWN", record.route);
    assert.equal(record.demand_score, "UNKNOWN", record.route);
    assert.equal(record.total_score, "UNKNOWN", record.route);
    assert.ok(record.evidence.length > 0, `missing evidence: ${record.route}`);
    assert.ok(record.recommended_product_action.length > 0, `missing action: ${record.route}`);

    if (["FIX", "HIDE", "CONSOLIDATE"].includes(record.recommendation)) {
      assert.ok(record.recommended_product_action.length >= 60, `action lacks remedy detail: ${record.route}`);
      assert.notEqual(record.recommended_product_action, record.actual_output, `action repeats output: ${record.route}`);
      assert.notEqual(record.recommended_product_action, record.defect_summary, `action repeats defect: ${record.route}`);
      assert.match(
        record.recommended_product_action,
        /^(Repair|Replace|Apply|Centralize|Share|Stop|Synchronize|Implement|Remove|Use|Record|Scope|Measure|Keep|Hide|Consolidate|Select|Cap|Normalize|Correct|Prevent|Retain|Reflow)/,
        `action is not imperative: ${record.route}`
      );
    }

    if (["FAIL", "UNVERIFIED"].includes(record.verification_status)) {
      assert.ok(
        !["KEEP", "FLAGSHIP"].includes(record.recommendation),
        `hard-gated tool retained without repair classification: ${record.route}`
      );
    }

    if (["P0", "P1"].includes(record.highest_defect_severity)) {
      assert.notEqual(record.resolution_status, "NOT_IN_P0_P1_SCOPE", record.route);
      assert.ok(record.remediation_files.length > 5, `missing remediation files: ${record.route}`);
      assert.ok(record.remediation_tests.length > 5, `missing remediation tests: ${record.route}`);
      assert.ok(record.remediation_evidence.length > 40, `missing remediation evidence: ${record.route}`);
      assert.ok(
        record.post_remediation_recommendation.length > 3,
        `missing post-remediation recommendation: ${record.route}`
      );
      assert.ok(record.remaining_risks.length > 5, `missing remaining risks: ${record.route}`);
    } else {
      assert.equal(record.resolution_status, "NOT_IN_P0_P1_SCOPE", record.route);
    }
  }
});
