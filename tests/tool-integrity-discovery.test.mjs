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
const requiredContainedSlugs = [
  "background-remover",
  "heic-to-jpg",
  "paycheck",
  "poker",
  "take-home-pay",
];

function inboundLinkPattern(route) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:` +
      `(?:href|destination)\\s*=\\s*[\\\"']${escapedRoute}[\\\"']` +
      `|\\]\\((?:https:\\/\\/(?:www\\.)?clevr\\.tools)?${escapedRoute}(?:[?#][^)]*)?\\)` +
    `)`
  );
}

test("registered tool routes, slugs, related links, and page sources are internally consistent", () => {
  assert.equal(registry.tools.length, 114);
  assert.equal(liveTools.length, 108);
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

  assert.equal(entries.length, 128);
  for (const route of liveRoutes) assert.ok(routes.has(route), `sitemap omitted ${route}`);
  for (const tool of registry.tools.filter((item) => item.live === false)) {
    assert.ok(!routes.has(tool.route), `sitemap exposed hidden ${tool.route}`);
  }
  assert.ok(routes.has("/play/numble"));
  assert.ok(routes.has("/play/meme-generator"));
});

test("navigation and search expose live tools without leaking hidden tools", () => {
  assert.equal(searchIndex.searchIndex.length, 108);
  assert.deepEqual(new Set(searchIndex.searchIndex.map((entry) => entry.route)), liveRoutes);

  const featuredRoutes = navigation.navigationCategories.flatMap((category) =>
    category.featured.map((entry) => entry.route)
  );
  assert.equal(featuredRoutes.length, 25);
  assert.ok(featuredRoutes.every((route) => liveRoutes.has(route)));
  assert.deepEqual(
    navigation.playLinks.map((entry) => entry.route),
    ["/play/numble", "/play/meme-generator"]
  );
});

test("P0/P1 contained tools are disabled and absent from every discovery projection", () => {
  const containedTools = registry.tools.filter((tool) => tool.contained === true);
  assert.deepEqual(
    containedTools.map((tool) => tool.slug).sort(),
    requiredContainedSlugs
  );

  const searchRoutes = new Set(searchIndex.searchIndex.map((entry) => entry.route));
  const featuredRoutes = new Set(
    navigation.navigationCategories.flatMap((category) =>
      category.featured.map((entry) => entry.route)
    )
  );
  const categorySlugs = new Set(
    siteStructure.siteCategories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) => subcategory.slugs)
    )
  );

  for (const tool of containedTools) {
    assert.equal(tool.live, false, `${tool.slug} must remain hidden`);
    assert.ok(!searchRoutes.has(tool.route), `${tool.slug} leaked into search`);
    assert.ok(!featuredRoutes.has(tool.route), `${tool.slug} leaked into navigation`);
    assert.ok(!categorySlugs.has(tool.slug), `${tool.slug} leaked into category data`);

    const pagePath = path.join(projectRoot, "app", tool.route.slice(1), "page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");
    assert.match(pageSource, /hiddenToolRobots\(tool\)/, `${tool.slug} lacks noindex metadata`);
    assert.match(pageSource, /ContainedToolNotice/, `${tool.slug} direct capability is not disabled`);
  }

  const privacySource = fs.readFileSync(path.join(projectRoot, "app/privacy/page.tsx"), "utf8");
  assert.doesNotMatch(
    privacySource,
    /Files are processed in memory and\s+deleted immediately after/i,
    "privacy policy still guarantees unverified server-side deletion"
  );
  assert.match(
    privacySource,
    /Background Remover is\s+currently disabled because its processor, retention, and deletion contract has\s+not been verified/i
  );
});

test("public production sources do not hard-code inbound links to contained routes", () => {
  const containedRoutes = registry.tools
    .filter((tool) => tool.contained === true)
    .map((tool) => tool.route);
  const roots = ["app", "components", "content"];
  const sourceFiles = [];

  function collect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(absolutePath);
      else if (/\.(?:ts|tsx|md|mdx)$/.test(entry.name)) sourceFiles.push(absolutePath);
    }
  }

  for (const root of roots) collect(path.join(projectRoot, root));
  for (const sourceFile of sourceFiles) {
    const source = fs.readFileSync(sourceFile, "utf8");
    for (const route of containedRoutes) {
      assert.doesNotMatch(
        source,
        inboundLinkPattern(route),
        `${path.relative(projectRoot, sourceFile)} links to contained ${route}`
      );
    }
  }
});

test("contained-route link detector covers JSX attributes and Markdown links", () => {
  const pattern = inboundLinkPattern("/convert/heic-to-jpg");
  assert.match('<Link href="/convert/heic-to-jpg">HEIC</Link>', pattern);
  assert.match("[convert a copy](/convert/heic-to-jpg)", pattern);
  assert.match("[convert](https://clevr.tools/convert/heic-to-jpg?from=blog)", pattern);
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
