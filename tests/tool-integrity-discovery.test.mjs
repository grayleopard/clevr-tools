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

const registry = loadTypeScript("lib/tools.ts");
const navigation = loadTypeScript("lib/navigation.ts");
const siteStructure = loadTypeScript("lib/site-structure.ts", {
  "@/lib/tools": registry,
  "@/lib/navigation": navigation,
});
const searchIndex = loadTypeScript("lib/search-index.ts");

const liveTools = registry.tools.filter((tool) => tool.live !== false);
const liveRoutes = new Set(liveTools.map((tool) => tool.route));
const liveSlugs = new Set(liveTools.map((tool) => tool.slug));

test("registered tool routes, slugs, related links, and page sources are internally consistent", () => {
  assert.equal(registry.tools.length, 114);
  assert.equal(liveTools.length, 112);
  assert.equal(new Set(registry.tools.map((tool) => tool.route)).size, 114);
  assert.equal(new Set(registry.tools.map((tool) => tool.slug)).size, 114);

  for (const tool of registry.tools) {
    const pagePath = path.join(projectRoot, "app", tool.route.slice(1), "page.tsx");
    assert.ok(fs.existsSync(pagePath), `missing page source: ${tool.route}`);
    for (const relatedSlug of tool.relatedTools) {
      assert.ok(liveSlugs.has(relatedSlug), `${tool.route} links to missing/hidden ${relatedSlug}`);
      assert.notEqual(relatedSlug, tool.slug, `${tool.route} self-references`);
    }
  }
});

test("sitemap projects exactly the current public portfolio", () => {
  const blogDir = path.join(projectRoot, "content/blog");
  const posts = fs
    .readdirSync(blogDir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => ({ slug: name.slice(0, -4) }));
  const sitemapModule = loadTypeScript("app/sitemap.ts", {
    "@/lib/blog": { getAllPosts: () => posts },
    "@/lib/site-structure": siteStructure,
    "@/lib/tools": registry,
  });
  const entries = sitemapModule.default();
  const routes = new Set(entries.map((entry) => new URL(entry.url).pathname));

  assert.equal(entries.length, 132);
  for (const route of liveRoutes) assert.ok(routes.has(route), `sitemap omitted ${route}`);
  for (const tool of registry.tools.filter((item) => item.live === false)) {
    assert.ok(!routes.has(tool.route), `sitemap exposed hidden ${tool.route}`);
  }
  assert.ok(routes.has("/play/numble"));
  assert.ok(routes.has("/play/meme-generator"));
});

test("navigation and search expose live tools without leaking hidden tools", () => {
  assert.equal(searchIndex.searchIndex.length, 112);
  assert.deepEqual(new Set(searchIndex.searchIndex.map((entry) => entry.route)), liveRoutes);

  const featuredRoutes = navigation.navigationCategories.flatMap((category) =>
    category.featured.map((entry) => entry.route)
  );
  assert.equal(featuredRoutes.length, 26);
  assert.ok(featuredRoutes.every((route) => liveRoutes.has(route)));
  assert.deepEqual(
    navigation.playLinks.map((entry) => entry.route),
    ["/play/numble", "/play/meme-generator"]
  );
});

test("category audit preserves the known 22-route converter discovery gap", () => {
  const categorySlugs = new Set(
    siteStructure.siteCategories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) => subcategory.slugs)
    )
  );
  const missingRoutes = liveTools
    .filter((tool) => !categorySlugs.has(tool.slug))
    .map((tool) => tool.route)
    .sort();
  const expected = [
    "/calc/convert/acres-to-sq-ft",
    "/calc/convert/angle",
    "/calc/convert/cm-to-inches",
    "/calc/convert/cups-to-ml",
    "/calc/convert/energy",
    "/calc/convert/fahrenheit-to-celsius",
    "/calc/convert/feet-to-meters",
    "/calc/convert/force",
    "/calc/convert/frequency",
    "/calc/convert/fuel-economy",
    "/calc/convert/inches-to-feet",
    "/calc/convert/kg-to-lbs",
    "/calc/convert/lbs-to-kg",
    "/calc/convert/liters-to-gallons",
    "/calc/convert/mbps-to-gbps",
    "/calc/convert/meters-to-feet",
    "/calc/convert/miles-to-km",
    "/calc/convert/mm-to-inches",
    "/calc/convert/oz-to-grams",
    "/calc/convert/power",
    "/calc/convert/pressure",
    "/calc/convert/time",
  ];
  assert.deepEqual(missingRoutes, expected);
});

test("legacy tool aliases remain explicit, bounded, permanent redirects", () => {
  const config = fs.readFileSync(path.join(projectRoot, "next.config.ts"), "utf8");
  const redirectSources = [...config.matchAll(/source:\s*"(\/(?:convert|files|generate)\/[^"\n]+)"/g)].map(
    (match) => match[1]
  );
  assert.deepEqual(redirectSources, [
    "/convert/pdf-to-word",
    "/files/image-resizer",
    "/generate/url-encoder",
    "/generate/base64",
    "/generate/json-formatter",
    "/generate/color-picker",
    "/generate/uuid",
  ]);
  assert.match(config, /source:\s*"\/files\/image-resizer"[\s\S]*?destination:\s*"\/tools\/resize-image"[\s\S]*?permanent:\s*true/);
});
