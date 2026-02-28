import test from "node:test";
import assert from "node:assert/strict";
import { sanitizePreviewHtml } from "../lib/sanitize-preview-html.mjs";

test("sanitizePreviewHtml strips scripts and inline event handlers", () => {
  const dirty = [
    '<p onclick="alert(1)">Hello</p>',
    '<img src="x" onerror="alert(2)">',
    '<script>alert(3)</script>',
    '<a href="javascript:alert(4)">bad link</a>',
  ].join("");

  const clean = sanitizePreviewHtml(dirty);

  assert.equal(/<script/i.test(clean), false);
  assert.equal(/onerror\s*=|onclick\s*=/i.test(clean), false);
  assert.equal(/javascript:/i.test(clean), false);
});

test("sanitizePreviewHtml preserves allowed formatting tags", () => {
  const html = '<p><strong>Bold</strong> <em>Italic</em> <a href="https://clevr.tools">Link</a></p><ul><li>One</li><li>Two</li></ul>';

  const clean = sanitizePreviewHtml(html);

  assert.equal(clean.includes("<strong>Bold</strong>"), true);
  assert.equal(clean.includes("<em>Italic</em>"), true);
  assert.equal(clean.includes('<a href="https://clevr.tools">Link</a>'), true);
  assert.equal(clean.includes("<ul><li>One</li><li>Two</li></ul>"), true);
});
