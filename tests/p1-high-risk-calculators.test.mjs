import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function loadTypeScript(relativePath) {
  const output = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", output)(transpiledModule.exports, transpiledModule);
  return transpiledModule.exports;
}

const bodyFat = loadTypeScript("lib/p1-remediation/body-fat.ts");

test("circumference formula uses explicit centimeters and matches reference fixtures", () => {
  const male = bodyFat.estimateCircumferenceBodyFat({
    gender: "male",
    heightCm: 70 * 2.54,
    neckCm: 15 * 2.54,
    waistCm: 34 * 2.54,
  });
  assert.equal(male.ok, true);
  assert.ok(Math.abs(male.bodyFatPercent - 17.1688) < 0.001);

  const female = bodyFat.estimateCircumferenceBodyFat({
    gender: "female",
    heightCm: 70 * 2.54,
    neckCm: 15 * 2.54,
    waistCm: 34 * 2.54,
    hipCm: 38 * 2.54,
  });
  assert.equal(female.ok, true);
  assert.ok(Math.abs(female.bodyFatPercent - 27.3445) < 0.001);

  assert.match(bodyFat.CIRCUMFERENCE_FORMULAS.units, /centimeters/i);
  assert.match(bodyFat.CIRCUMFERENCE_FORMULAS.conversion, /495 \/ density - 450/);
});

test("equivalent imperial conversions and metric measurements have parity", () => {
  const imperialConverted = bodyFat.estimateCircumferenceBodyFat({
    gender: "male",
    heightCm: 68 * 2.54,
    neckCm: 14.5 * 2.54,
    waistCm: 32.25 * 2.54,
  });
  const metric = bodyFat.estimateCircumferenceBodyFat({
    gender: "male",
    heightCm: 172.72,
    neckCm: 36.83,
    waistCm: 81.915,
  });
  assert.equal(imperialConverted.ok, true);
  assert.equal(metric.ok, true);
  assert.ok(Math.abs(imperialConverted.bodyFatPercent - metric.bodyFatPercent) < 1e-10);
});

test("circumference formula rejects missing, non-finite, and impossible inputs", () => {
  for (const measurements of [
    { gender: "male", heightCm: 178, neckCm: 40, waistCm: 39 },
    { gender: "female", heightCm: 165, neckCm: 33, waistCm: 70 },
    { gender: "male", heightCm: Number.POSITIVE_INFINITY, neckCm: 38, waistCm: 86 },
    { gender: "male", heightCm: 1, neckCm: 1, waistCm: 1000 },
  ]) {
    assert.equal(bodyFat.estimateCircumferenceBodyFat(measurements).ok, false);
  }
});

test("body-fat public copy identifies the formula as legacy and avoids unsupported accuracy claims", () => {
  const publicCopy = `${read("lib/tools.ts")}\n${read("lib/seo/tool-faqs.ts")}`;
  assert.match(publicCopy, /legacy Hodgdon-Beckett|legacy screening equation/i);
  assert.doesNotMatch(publicCopy, /within 3.?4% of DEXA|reasonably accurate for most people/i);
  assert.match(publicCopy, /not the Navy's current official Body Composition Assessment/i);
});

test("unsupported poker starting-hand heuristic is contained", () => {
  const source = read("components/tools/PokerCalculator.tsx");
  assert.doesNotMatch(source, /getWinRate|pairRates|vs random|heads-up simulations/i);
  assert.match(source, /temporarily unavailable/i);
  assert.match(source, /not backed by a reproducible simulation/i);
});

test("incomplete payroll models are contained and direct users to the IRS", () => {
  for (const relativePath of [
    "components/tools/TakeHomePayCalculator.tsx",
    "components/tools/PaycheckCalculator.tsx",
  ]) {
    const source = read(relativePath);
    assert.doesNotMatch(source, /STANDARD_DEDUCTIONS|SINGLE_BRACKETS|calcFederalTax|176100/);
    assert.match(source, /temporarily unavailable/i);
    assert.match(source, /https:\/\/www\.irs\.gov\/individuals\/tax-withholding-estimator/);
    assert.match(source, /state and local/i);
  }
});
