import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function loadTypeScript(relativePath, dependencies = {}) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  const output = ts.transpileModule(source, {
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

const toolRegistry = loadTypeScript("lib/tools.ts");
const searchIndexModule = loadTypeScript("lib/search-index.ts");
const searchModule = loadTypeScript("lib/search.ts", {
  "@/lib/search-index": searchIndexModule,
});
const navigationModule = loadTypeScript("lib/navigation.ts");

const liveTools = toolRegistry.tools.filter((tool) => tool.live !== false);

test("search index is a minimal projection of every live tool", () => {
  assert.equal(searchIndexModule.searchIndex.length, liveTools.length);

  const expectedByRoute = new Map(liveTools.map((tool) => [tool.route, tool]));
  for (const entry of searchIndexModule.searchIndex) {
    assert.deepEqual(Object.keys(entry).sort(), [
      "aliases",
      "category",
      "icon",
      "name",
      "route",
      "shortDescription",
    ]);

    const source = expectedByRoute.get(entry.route);
    assert.ok(source, `unexpected or hidden route in search index: ${entry.route}`);
    assert.equal(entry.name, source.name);
    assert.equal(entry.category, source.category);
    assert.equal(entry.shortDescription, source.shortDescription);
    assert.equal(entry.icon, source.icon);
  }
});

test("exact-name search finds every live tool within the palette limit", () => {
  for (const tool of liveTools) {
    const matches = searchModule.searchTools(tool.name);
    assert.ok(
      matches.some((match) => match.route === tool.route),
      `search did not find ${tool.name} (${tool.route})`
    );
  }
});

test("high-value aliases retain their expected top result", () => {
  const expectations = new Map([
    ["shrink image", "/compress/image"],
    ["combine pdf", "/tools/merge-pdf"],
    ["pretty print json", "/dev/json-formatter"],
    ["home loan calculator", "/calc/mortgage"],
    ["focus timer", "/time/pomodoro"],
    ["reflex test", "/type/reaction-time"],
  ]);

  for (const [query, route] of expectations) {
    assert.equal(searchModule.searchTools(query)[0]?.route, route, query);
  }
});

test("header data keeps every top-level destination and only live featured tools", () => {
  assert.deepEqual(
    navigationModule.navigationCategories.map((category) => category.label),
    ["Files", "Text & Code", "Calculate", "Time", "Type"]
  );
  assert.deepEqual(
    navigationModule.playLinks.map((link) => link.label),
    ["Numble", "Meme Generator"]
  );

  const liveRoutes = new Set(liveTools.map((tool) => tool.route));
  for (const category of navigationModule.navigationCategories) {
    assert.ok(category.featured.length > 0, `${category.label} has no featured links`);
    for (const featured of category.featured) {
      assert.ok(liveRoutes.has(featured.route), `hidden featured route: ${featured.route}`);
    }
  }
});
