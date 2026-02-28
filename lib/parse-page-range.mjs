/**
 * Parse a page-range string like "1-3, 5, 7-9" into 0-based page indices.
 * "all" (or empty) returns all pages.
 */
export function parsePageRange(input, maxPages) {
  const trimmed = String(input || "").trim().toLowerCase();
  if (!trimmed || trimmed === "all") {
    return Array.from({ length: maxPages }, (_, i) => i);
  }

  const set = new Set();
  for (const part of trimmed.split(",")) {
    const token = part.trim();
    const rangeMatch = token.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, Number.parseInt(rangeMatch[1], 10));
      const end = Math.min(maxPages, Number.parseInt(rangeMatch[2], 10));
      for (let i = start; i <= end; i += 1) set.add(i - 1);
      continue;
    }

    const page = Number.parseInt(token, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= maxPages) {
      set.add(page - 1);
    }
  }

  return Array.from(set).sort((a, b) => a - b);
}
