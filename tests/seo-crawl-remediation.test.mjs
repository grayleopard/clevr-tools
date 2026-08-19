import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function readObjectBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;

  const openBrace = source.indexOf("{", markerIndex);
  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openBrace, index + 1);
  }

  throw new Error(`Unclosed object after ${marker}`);
}

test("Numble exposes one stable page heading before client hydration", async () => {
  const [page, game] = await Promise.all([
    readSource("app/play/numble/page.tsx"),
    readSource("components/numble/NumbleGame.tsx"),
  ]);

  assert.doesNotMatch(page, /<h1\b/);
  assert.match(game, /function NumbleTitle\(\)[\s\S]*?<h1[^>]*>NUMBLE<\/h1>/);
  assert.match(game, /if \(!hasHydrated \|\| !puzzle\)[\s\S]*?<NumbleTitle \/>/);
});

test("page Open Graph objects remain complete when they replace layout defaults", async () => {
  const appDirectory = fileURLToPath(new URL("../app", import.meta.url));
  const entries = await readdir(appDirectory, { recursive: true });
  const pagePaths = entries.filter((entry) => entry.endsWith("page.tsx"));
  let auditedBlocks = 0;

  for (const pagePath of pagePaths) {
    const source = await readFile(`${appDirectory}/${pagePath}`, "utf8");
    const openGraphBlock = readObjectBlock(source, "openGraph: {");
    if (!openGraphBlock) continue;
    auditedBlocks += 1;

    const typeFields = openGraphBlock.match(/\btype:\s*"(?:website|article)"/g) ?? [];
    const imageFields = openGraphBlock.match(/\bimages:\s*\[/g) ?? [];
    assert.equal(typeFields.length, 1, `${pagePath} must define exactly one og:type`);
    assert.equal(imageFields.length, 1, `${pagePath} must define exactly one og:image`);
  }

  assert.ok(auditedBlocks >= 120, `only audited ${auditedBlocks} Open Graph blocks`);
});

test("crawl-flagged titles stay within a useful search-result range", async () => {
  const [privacy, tools] = await Promise.all([
    readSource("app/privacy/page.tsx"),
    readSource("lib/tools.ts"),
  ]);

  assert.match(privacy, /title: "Privacy Policy & Data Handling \| clevr\.tools"/);
  assert.match(tools, /metaTitle: 'Odds Calculator — Convert Odds & Parlays \| clevr\.tools'/);
});

test("selected isolated tools receive at least two contextual related-tool inlinks", async () => {
  const tools = await readSource("lib/tools.ts");
  const relatedLists = (tools.match(/relatedTools:\s*\[[^\]]*\]/g) ?? []).map((list) =>
    [...list.matchAll(/'([^']+)'/g)].map((match) => match[1]).slice(0, 4)
  );

  for (const slug of [
    "word-to-pdf",
    "image-cropper",
    "invoice-generator",
    "sales-tax",
    "net-worth",
  ]) {
    const inlinkCount = relatedLists.filter((list) => list.includes(slug)).length;
    assert.ok(inlinkCount >= 2, `${slug} has only ${inlinkCount} related-tool inlinks`);
  }
});
