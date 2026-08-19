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

function convert(config, value, fromSymbol, toSymbol) {
  const from = config.units.find((unit) => unit.symbol === fromSymbol);
  const to = config.units.find((unit) => unit.symbol === toSymbol);
  assert.ok(from, `Missing source unit ${fromSymbol}`);
  assert.ok(to, `Missing target unit ${toSymbol}`);
  return to.fromBase(from.toBase(value));
}

test("speed and angle recovery vectors match their public reference values", () => {
  assert.ok(Math.abs(convert(conversions.speedConfig, 60, "mph", "km/h") - 96.56064) < 1e-12);
  assert.equal(convert(conversions.speedConfig, 1, "m/s", "km/h"), 3.6);
  assert.equal(convert(conversions.speedConfig, 1, "ft/s", "m/s"), 0.3048);
  assert.ok(Math.abs(convert(conversions.angleConfig, 180, "°", "rad") - Math.PI) < 1e-12);
  assert.equal(convert(conversions.angleConfig, 90, "°", "grad"), 100);
  assert.equal(convert(conversions.angleConfig, 1, "°", "arcmin"), 60);
  assert.equal(convert(conversions.angleConfig, 1, "°", "arcsec"), 3600);
});

test("only verified converter FAQs are exposed", () => {
  assert.equal(faqs.getToolFaqs("convert-data").length, dataSize.DATA_SIZE_FAQS.length);
  assert.deepEqual(
    faqs.getToolFaqs("convert-speed").map((item) => item.question),
    [
      "What speed units can I convert between?",
      "What are common speed conversions?",
      "What is a knot?",
    ]
  );
  assert.deepEqual(
    faqs.getToolFaqs("convert-angle").map((item) => item.question),
    [
      "What angle units can I convert between?",
      "How do I convert degrees to radians?",
      "What is a gradian?",
    ]
  );
  assert.deepEqual(faqs.getToolFaqs("convert-pressure"), []);
});

test("Mbps stays bounded to transfer-rate units while Data retains SI and IEC modes", () => {
  const mbpsPage = read("app/calc/convert/mbps-to-gbps/page.tsx");
  const dataPage = read("app/calc/convert/data/page.tsx");
  const component = read("components/tools/UnitConverterPage.tsx");

  assert.match(mbpsPage, /allowedUnits=\{\["Mbit", "Gbit"\]\}/);
  assert.doesNotMatch(dataPage, /allowedUnits=/);
  assert.match(component, /isDataSize && !hasFixedUnitSet/);
});

test("converter pages have one authoritative supporting-content source", () => {
  const speedPage = read("app/calc/convert/speed/page.tsx");
  const anglePage = read("app/calc/convert/angle/page.tsx");

  assert.doesNotMatch(speedPage, /Speed Conversion Reference|Speed in Everyday Context/);
  assert.doesNotMatch(anglePage, /Angle Unit Reference|When Radians Matter/);
  assert.match(registry.tools.find((tool) => tool.slug === "convert-speed").seoContent, /Feet per second/);
  assert.match(registry.tools.find((tool) => tool.slug === "convert-angle").seoContent, /Arcminutes/);
});

test("the converter hub and contextual related-tool links support discovery", () => {
  const calculatePage = read("app/calculate/page.tsx");
  for (const route of ["/calc/convert/data", "/calc/convert/speed", "/calc/convert/angle"]) {
    assert.match(calculatePage, new RegExp(route.replaceAll("/", "\\/")));
  }

  assert.deepEqual(
    registry.tools.find((tool) => tool.slug === "unit-converter").relatedTools,
    ["convert-data", "convert-speed", "convert-angle", "percentage-calculator"]
  );
  assert.equal(
    registry.tools.find((tool) => tool.slug === "pace").relatedTools[0],
    "convert-speed"
  );
});

test("Data metadata keeps common query language without ambiguous calculator math", () => {
  const tool = registry.tools.find((candidate) => candidate.slug === "convert-data");
  assert.match(tool.metaTitle, /kB, MB, GB, TB & GiB/);
  assert.match(tool.metaDescription, /SI decimal and IEC binary/);
  assert.equal(convert(conversions.dataConfig, 1, "GB", "MB"), 1000);
  assert.equal(convert(conversions.dataConfig, 1, "GiB", "MiB"), 1024);
});
