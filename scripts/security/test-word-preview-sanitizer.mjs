import assert from "node:assert/strict";
import {
  sanitizeWordPreviewHtml,
  __previewSanitizerTestUtils,
} from "../../lib/security/word-preview-sanitizer.mjs";

function run() {
  const maliciousHtml = `
    <p>Hello <strong>world</strong></p>
    <img src="x" onerror="alert(1)" />
    <a href="javascript:alert(1)" onclick="alert(2)">Click me</a>
    <script>alert("xss")</script>
    <iframe src="https://evil.example"></iframe>
  `;

  const sanitized = sanitizeWordPreviewHtml(maliciousHtml);

  assert.match(sanitized, /<strong>world<\/strong>/i, "Expected allowed formatting tags to remain");
  assert.doesNotMatch(sanitized, /<script/i, "Expected script tags to be removed");
  assert.doesNotMatch(sanitized, /<iframe/i, "Expected iframe tags to be removed");
  assert.doesNotMatch(sanitized, /\sonerror\s*=/i, "Expected event handler attributes to be removed");
  assert.doesNotMatch(sanitized, /javascript:/i, "Expected javascript: URLs to be removed");

  assert.equal(__previewSanitizerTestUtils.isSafeHref("https://example.com"), true);
  assert.equal(__previewSanitizerTestUtils.isSafeHref("javascript:alert(1)"), false);
  assert.equal(__previewSanitizerTestUtils.isSafeImageSrc("data:image/png;base64,aGVsbG8="), true);
  assert.equal(__previewSanitizerTestUtils.isSafeImageSrc("https://cdn.example.com/x.png"), false);

  console.log("Word preview sanitizer checks passed.");
}

run();
