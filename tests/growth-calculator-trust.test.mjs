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
  const component = source("components/tools/SavingsGoalCalculator.tsx");
  const tools = source("lib/tools.ts");
  const faqs = source("lib/seo/tool-faqs.ts");
  assert.match(component, /contributions are made at the end of each month/i);
  for (const content of [component, tools, faqs]) {
    assert.doesNotMatch(content, /As of 2025|4[–-]5% APY|typical high-yield savings/i);
  }
});

test("amortization guidance does not hardcode a contradictory extra-payment outcome", () => {
  const tools = source("lib/tools.ts");
  const component = source("components/tools/AmortizationCalculator.tsx");
  for (const content of [tools, component]) {
    assert.doesNotMatch(
      content,
      /\$82,?000 in interest|6\.5 years early|saves \$82,?153|~\$89,?000|~6 years/i
    );
  }
});
