import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("mortgage and auto-loan results provide a contextual down-payment path", () => {
  for (const file of [
    "components/tools/MortgageCalculator.tsx",
    "components/tools/AutoLoanCalculator.tsx",
  ]) {
    const content = source(file);
    assert.match(content, /href="\/calc\/down-payment"/);
  }
});

test("savings goal states contribution timing without stale rate claims", () => {
  const content = source("components/tools/SavingsGoalCalculator.tsx");
  assert.match(content, /contributions are made at the end of each month/i);
  assert.doesNotMatch(content, /As of 2025|4–5% APY|0\.01–0\.1%/);
});
