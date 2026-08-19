import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function loadCalculator() {
  const source = fs.readFileSync(
    path.join(projectRoot, "components/tools/CreditCardPayoffCalculator.tsx"),
    "utf8"
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    (request) => {
      if (request === "react/jsx-runtime") return { jsx: () => null, jsxs: () => null, Fragment: null };
      if (request === "react") return {};
      if (request === "next/link") return { default: () => null };
      if (request === "@/components/tool/TipJar") return { TipJar: () => null };
      if (request === "@/components/tool/CalculatorEmptyState") return { CalculatorEmptyState: () => null };
      throw new Error(`Unexpected runtime dependency: ${request}`);
    }
  );
  return transpiledModule.exports;
}

const { calcPayoff } = loadCalculator();

function assertClose(actual, expected, tolerance = 1e-8) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
}

test("normal payoff path preserves the existing zero-interest calculation", () => {
  const result = calcPayoff(1_000, 0, 100);

  assert.equal(result.ok, true);
  assert.equal(result.months, 10);
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalPaid, 1_000);
});

test("600-month cap reports the remaining balance instead of a successful payoff", () => {
  const result = calcPayoff(5_000, 22, 91.6667);

  assert.equal(result.ok, false);
  assert.equal(result.status, "capped");
  assertClose(result.remainingBalance, 4_901.458, 0.01);
  assertClose(result.requiredPayment, 91.66835805580402);
});
