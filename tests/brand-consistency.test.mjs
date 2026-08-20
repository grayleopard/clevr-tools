import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("navigation and footer share the current brand lockup", async () => {
  const [lockup, navbar, footer] = await Promise.all([
    readSource("components/brand/BrandLockup.tsx"),
    readSource("components/layout/NavbarLogo.tsx"),
    readSource("components/layout/Footer.tsx"),
  ]);

  assert.match(lockup, /rotate-45 border-2 border-primary/);
  assert.match(lockup, /<span>clevr<\/span>/);
  assert.match(lockup, /text-primary">\.tools<\/span>/);
  assert.match(navbar, /<BrandLockup \/>/);
  assert.match(footer, /<BrandLockup markClassName="size-7" \/>/);
  assert.doesNotMatch(footer, /\bZap\b/);
});

test("browser, installed-app, and social assets exclude the legacy blue lightning logo", async () => {
  const [icon, appleIcon, socialImage, manifest, staticSocialImage] = await Promise.all([
    readSource("app/icon.svg"),
    readSource("app/apple-icon.tsx"),
    readSource("app/opengraph-image.tsx"),
    readSource("public/manifest.json"),
    readSource("public/og-default.svg"),
  ]);

  for (const source of [icon, appleIcon, socialImage, manifest, staticSocialImage]) {
    assert.doesNotMatch(source, /#1D4ED8/i);
    assert.doesNotMatch(source, /points="17,3 7,18 15,18 13,29 25,14 17,14"/);
  }

  assert.match(icon, /#060e20/i);
  assert.match(icon, /#6ee7b7/i);
  assert.match(manifest, /"src": "\/icon\.svg"/);
  assert.match(manifest, /"theme_color": "#060e20"/);
  assert.match(socialImage, /LOCAL-FIRST UTILITIES/);
});
