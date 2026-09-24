import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("methodology is a canonical public trust page", () => {
  const source = read("app/methodology/page.tsx");

  assert.match(source, /title:\s*"How clevr\.tools Works \| Methodology"/);
  assert.match(source, /canonical:\s*"https:\/\/www\.clevr\.tools\/methodology"/);
  assert.match(source, /clevr-tools@agentmail\.to/);
  assert.match(source, /State the processing boundary/);
  assert.match(source, /Updates and corrections/);
  assert.match(source, /Last reviewed:/);
  assert.match(source, /dateTime="2026-08-04"/);
  assert.match(source, /behaviors and inputs covered by our current checks/);
});

test("privacy policy uses the approved interim contact", () => {
  const source = read("app/privacy/page.tsx");

  assert.match(source, /mailto:clevr-tools@agentmail\.to/);
  assert.doesNotMatch(source, /privacy@clevr\.tools/);
});

test("methodology is discoverable from the sitemap, footer, and About page", () => {
  assert.match(read("app/sitemap.ts"), /createEntry\("\/methodology"\)/);
  assert.match(read("components/layout/Footer.tsx"), /href="\/methodology"/);
  assert.match(read("app/about/page.tsx"), /href="\/methodology"/);
});
