export type ToolCategory =
  | "convert"
  | "compress"
  | "files"
  | "tools"
  | "text"
  | "dev"
  | "calc"
  | "time"
  | "type";

export const TOOL_ROUTES = [
  "/convert/heic-to-jpg",
  "/convert/jpg-to-pdf",
  "/convert/jpg-to-png",
  "/convert/pdf-to-jpg",
  "/convert/png-to-jpg",
  "/convert/png-to-pdf",
  "/convert/png-to-webp",
  "/convert/webp-to-png",
  "/convert/word-to-pdf",
  "/compress/image",
  "/compress/pdf",
  "/files/image-cropper",
  "/files/invoice-generator",
  "/tools/merge-pdf",
  "/tools/rotate-pdf",
  "/tools/split-pdf",
  "/text/case-converter",
  "/text/character-counter",
  "/text/find-and-replace",
  "/text/lorem-generator",
  "/text/remove-line-breaks",
  "/text/sort-lines",
  "/text/text-to-slug",
  "/text/word-counter",
  "/dev/base64",
  "/dev/color-picker",
  "/dev/json-formatter",
  "/dev/url-encoder",
  "/dev/uuid",
  "/calc/age",
  "/calc/bmi",
  "/calc/compound-interest",
  "/calc/date-difference",
  "/calc/discount",
  "/calc/gpa",
  "/calc/mortgage",
  "/calc/percentage",
  "/calc/tip",
  "/calc/unit-converter",
  "/time/pomodoro",
  "/time/stopwatch",
  "/time/timer",
  "/type/typing-test",
] as const;

export function categoryForRoute(route: string): ToolCategory {
  if (route.startsWith("/convert/")) return "convert";
  if (route.startsWith("/compress/")) return "compress";
  if (route.startsWith("/files/")) return "files";
  if (route.startsWith("/tools/")) return "tools";
  if (route.startsWith("/text/")) return "text";
  if (route.startsWith("/dev/")) return "dev";
  if (route.startsWith("/calc/")) return "calc";
  if (route.startsWith("/time/")) return "time";
  if (route.startsWith("/type/")) return "type";
  throw new Error(`Unknown category for route: ${route}`);
}

export const FILE_TOOL_CATEGORIES: ReadonlySet<ToolCategory> = new Set([
  "convert",
  "compress",
  "files",
  "tools",
]);
