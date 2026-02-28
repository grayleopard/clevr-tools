const ALLOWED_TAGS = new Set([
  "p",
  "span",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "br",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
]);

const DISALLOWED_BLOCK_TAG_PATTERN =
  /<\s*(script|style|iframe|object|embed|link|meta|base)\b[\s\S]*?(?:<\/\s*\1\s*>|\/\s*>)/gi;

const EVENT_HANDLER_ATTR_PATTERN =
  /\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const JS_URL_ATTR_PATTERN =
  /\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi;

const UNSAFE_DATA_URL_ATTR_PATTERN =
  /\s+src\s*=\s*(["'])\s*data:(?!image\/)[\s\S]*?\1/gi;

const TAG_PATTERN = /<\/?([a-z0-9-]+)\b[^>]*>/gi;

/**
 * Small HTML sanitizer for preview-only rendering.
 * Preserves common formatting tags and strips script/event-handler vectors.
 */
export function sanitizePreviewHtml(inputHtml) {
  let html = String(inputHtml || "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(DISALLOWED_BLOCK_TAG_PATTERN, "");
  html = html.replace(EVENT_HANDLER_ATTR_PATTERN, "");
  html = html.replace(JS_URL_ATTR_PATTERN, "");
  html = html.replace(UNSAFE_DATA_URL_ATTR_PATTERN, "");

  html = html.replace(TAG_PATTERN, (fullMatch, tagName) => {
    const lowerTag = String(tagName).toLowerCase();
    return ALLOWED_TAGS.has(lowerTag) ? fullMatch : "";
  });

  return html;
}
