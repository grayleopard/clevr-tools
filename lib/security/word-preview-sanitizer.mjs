import createDOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
  "u",
];

const ALLOWED_ATTR = [
  "alt",
  "colspan",
  "height",
  "href",
  "rel",
  "rowspan",
  "src",
  "target",
  "title",
  "width",
];

const DROP_WITH_CONTENT_TAGS = new Set([
  "embed",
  "form",
  "iframe",
  "input",
  "meta",
  "noscript",
  "object",
  "script",
  "style",
  "template",
  "textarea",
]);

const ALLOWED_TAGS_SET = new Set(ALLOWED_TAGS);
const ALLOWED_ATTR_SET = new Set(ALLOWED_ATTR);

let domPurifyInstance = null;
let hooksInstalled = false;

function isSafeHref(rawHref) {
  if (!rawHref) return false;
  const href = rawHref.trim();
  if (!href) return false;

  if (href.startsWith("#")) return true;
  if (href.startsWith("/")) return true;
  if (href.startsWith("./") || href.startsWith("../")) return true;

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const parsed = new URL(href, base);
    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:" ||
      parsed.protocol === "tel:"
    );
  } catch {
    return false;
  }
}

function isSafeImageSrc(rawSrc) {
  if (!rawSrc) return false;
  const src = rawSrc.trim();
  if (!src) return false;

  if (/^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i.test(src)) return true;
  if (src.startsWith("blob:")) return true;
  if (src.startsWith("/")) return true;
  if (src.startsWith("./") || src.startsWith("../")) return true;

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const parsed = new URL(src, base);
    return parsed.origin === base && (parsed.protocol === "http:" || parsed.protocol === "https:");
  } catch {
    return false;
  }
}

function stripHighRiskContent(input) {
  return input
    .replace(/<\s*(script|style|iframe|object|embed|template|noscript)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|template|noscript)[^>]*\/?\s*>/gi, "")
    .replace(/\son[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]*/gi, "");
}

function unwrapElement(element) {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function sanitizeAttributes(element) {
  const tag = element.tagName.toLowerCase();
  const attrs = Array.from(element.attributes || []);

  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    const value = attr.value ?? "";

    if (name.startsWith("on")) {
      element.removeAttribute(attr.name);
      continue;
    }

    if (!ALLOWED_ATTR_SET.has(name)) {
      element.removeAttribute(attr.name);
      continue;
    }

    if (name === "href" && !isSafeHref(value)) {
      element.removeAttribute(attr.name);
      continue;
    }

    if (name === "src" && !isSafeImageSrc(value)) {
      element.removeAttribute(attr.name);
      continue;
    }
  }

  if (tag === "a") {
    if (element.hasAttribute("href")) {
      element.setAttribute("rel", "noopener noreferrer");
      if (element.hasAttribute("target") && element.getAttribute("target") !== "_blank") {
        element.removeAttribute("target");
      }
    } else {
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }

  if (tag === "img" && !element.getAttribute("src")) {
    element.remove();
  }
}

function sanitizeNodeTree(parent) {
  const children = Array.from(parent.childNodes || []);

  for (const child of children) {
    if (child.nodeType === 8) {
      parent.removeChild(child);
      continue;
    }

    if (child.nodeType !== 1) continue;

    sanitizeNodeTree(child);

    const tag = child.tagName.toLowerCase();
    if (DROP_WITH_CONTENT_TAGS.has(tag)) {
      parent.removeChild(child);
      continue;
    }

    if (!ALLOWED_TAGS_SET.has(tag)) {
      unwrapElement(child);
      continue;
    }

    sanitizeAttributes(child);
  }
}

function applyStructuralPolicies(html) {
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return stripHighRiskContent(html);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const root = doc.body ?? doc.documentElement;
  if (!root) return "";

  sanitizeNodeTree(root);

  const serializer = new XMLSerializer();
  const serialized = serializer.serializeToString(root);
  const bodyMatch = serialized.match(/^<body[^>]*>([\s\S]*)<\/body>$/i);
  return (bodyMatch ? bodyMatch[1] : serialized).trim();
}

function getDomPurify() {
  if (typeof window === "undefined") return null;
  if (domPurifyInstance) return domPurifyInstance;

  domPurifyInstance = createDOMPurify(window);

  if (!hooksInstalled) {
    domPurifyInstance.addHook("afterSanitizeAttributes", (node) => {
      if (!node || !node.tagName) return;
      const tag = node.tagName.toLowerCase();

      if (tag === "a") {
        const href = node.getAttribute("href");
        if (!isSafeHref(href)) {
          node.removeAttribute("href");
          node.removeAttribute("target");
          node.removeAttribute("rel");
          return;
        }
        node.setAttribute("rel", "noopener noreferrer");
      }

      if (tag === "img") {
        const src = node.getAttribute("src");
        if (!isSafeImageSrc(src)) {
          node.removeAttribute("src");
        }
      }
    });
    hooksInstalled = true;
  }

  return domPurifyInstance;
}

export function sanitizeWordPreviewHtml(rawHtml) {
  if (typeof rawHtml !== "string") return "";
  const input = rawHtml.trim();
  if (!input) return "";

  const purifier = getDomPurify();
  const cleaned = purifier
    ? purifier.sanitize(input, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: false,
        FORBID_TAGS: ["base", "form", "input", "link", "meta", "object", "script", "style"],
        FORBID_ATTR: ["srcset", "style"],
      })
    : stripHighRiskContent(input);

  return applyStructuralPolicies(cleaned);
}

export const __previewSanitizerTestUtils = {
  isSafeHref,
  isSafeImageSrc,
  stripHighRiskContent,
};
