import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function loadTypeScript(relativePath, dependencies = {}) {
  const output = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  const localRequire = (specifier) => {
    if (!Object.hasOwn(dependencies, specifier)) {
      throw new Error(`Missing test dependency: ${specifier}`);
    }
    return dependencies[specifier];
  };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    localRequire
  );
  return transpiledModule.exports;
}

const dataSize = loadTypeScript("lib/data-size.ts");
const conversions = loadTypeScript("lib/conversions.ts", {
  "@/lib/data-size": dataSize,
});
const faqs = loadTypeScript("lib/seo/tool-faqs.ts", {
  "@/lib/data-size": dataSize,
});
const registry = loadTypeScript("lib/tools.ts", {
  "@/lib/data-size": dataSize,
});

test("data-size registry uses explicit SI, IEC, byte, and decimal bit symbols", () => {
  assert.deepEqual(
    dataSize.DATA_SIZE_UNIT_REGISTRY.map((unit) => unit.symbol),
    [
      "B",
      "kB", "MB", "GB", "TB", "PB",
      "KiB", "MiB", "GiB", "TiB", "PiB",
      "bit", "kbit", "Mbit", "Gbit", "Tbit", "Pbit",
    ]
  );
  assert.equal(dataSize.DEFAULT_DATA_SIZE_MODE, "si");
  assert.equal(dataSize.DATA_SIZE_UNIT_REGISTRY.some((unit) => unit.symbol === "KB"), false);
  assert.match(dataSize.DATA_SIZE_MODES[0].description, /Default.*1,000/i);
});

test("RB-1 SI, IEC, and transfer-rate vectors are exact before display rounding", () => {
  const convert = dataSize.convertDataSize;

  assert.equal(convert(1, "MB", "B"), 1_000_000);
  assert.equal(convert(1, "MB", "Mbit"), 8);
  assert.equal(convert(1, "MiB", "B"), 1_048_576);
  assert.equal(convert(1, "MiB", "Mbit"), 8.388608);
  assert.equal(convert(1, "GB", "MB"), 1_000);
  assert.equal(convert(1, "GiB", "MiB"), 1_024);
  assert.equal(convert(1, "GiB", "GB"), 1.073741824);
  assert.equal(convert(1, "TB", "B"), 1_000_000_000_000);
  assert.equal(convert(1, "TB", "GiB"), 931.3225746154785);
  assert.equal(convert(100, "Mbit", "MB"), 12.5);
  assert.equal(convert(100, "Mbit", "MiB"), 11.920928955078125);
});

test("calculator, generated tables, worked examples, and FAQs share the registry", () => {
  for (const unit of dataSize.DATA_SIZE_UNIT_REGISTRY) {
    const calculatorUnit = conversions.dataConfig.units.find(
      (candidate) => candidate.symbol === unit.symbol
    );
    assert.ok(calculatorUnit, `calculator omitted ${unit.symbol}`);
    assert.equal(calculatorUnit.toBase(1), unit.bytesPerUnit);
    assert.equal(calculatorUnit.fromBase(unit.bytesPerUnit), 1);
  }

  for (const row of dataSize.DATA_SIZE_REFERENCE_ROWS) {
    const symbol = row.unit.replace(/^1 /, "");
    const unit = dataSize.getDataSizeUnit(symbol);
    assert.equal(row.bytes, `${dataSize.formatExactDataSizeValue(unit.bytesPerUnit)} B`);
  }

  for (const example of dataSize.DATA_SIZE_WORKED_EXAMPLES) {
    for (const target of example.targets) {
      assert.equal(
        target.value,
        dataSize.convertDataSize(example.value, example.from, target.symbol),
        example.text
      );
    }
    assert.match(dataSize.dataSizeSeoContent, new RegExp(example.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.deepEqual(faqs.toolFaqsBySlug["convert-data"], [...dataSize.DATA_SIZE_FAQS]);
  assert.equal(
    registry.tools.find((tool) => tool.slug === "convert-data").seoContent,
    dataSize.dataSizeSeoContent
  );
});

test("Data Size keeps its clean canonical and sitemap eligibility without result URLs", () => {
  const pageSource = read("app/calc/convert/data/page.tsx");
  const componentSource = read("components/tools/UnitConverterPage.tsx");
  assert.match(pageSource, /alternates:\s*{\s*canonical:\s*`https:\/\/www\.clevr\.tools\$\{tool\.route\}`\s*}/);
  assert.doesNotMatch(pageSource, /searchParams|generateStaticParams/);
  assert.doesNotMatch(componentSource, /useSearchParams|window\.history|router\.push/);

  const sitemap = loadTypeScript("app/sitemap.ts", {
    "@/lib/blog": { getAllPosts: () => [] },
    "@/lib/site-structure": { siteCategories: [] },
    "@/lib/tools": registry,
  }).default();
  const routes = new Set(sitemap.map((entry) => new URL(entry.url).pathname));
  assert.ok(routes.has("/calc/convert/data"));
  assert.ok(!routes.has("/convert/heic-to-jpg"));

  const heic = registry.tools.find((tool) => tool.slug === "heic-to-jpg");
  assert.equal(heic.live, false);
  assert.equal(heic.contained, true);
});

test("Data Size UI keeps bounded controls and responsive layout cues", () => {
  const source = read("components/tools/UnitConverterPage.tsx");
  assert.match(source, /\[3, 4, 5, 6, 8, 10, 12, 15]/);
  assert.match(source, /Copy result/);
  assert.match(source, /sm:grid-cols-3/);
  assert.match(source, /sm:flex-row/);
});
