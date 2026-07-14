// Single source of truth for which tools exist — imported directly from the
// live registry so this suite can't drift out of sync with the site the way
// tests/e2e/tool-routes.ts (a hand-maintained, already-stale subset) did.
import { tools, type Tool } from "../../../lib/tools";

export type { Tool };

/** Every tool the registry knows about, live or hidden. */
export const ALL_TOOLS: Tool[] = tools;

/** Tools that are actually shipped (not `live: false`) — what a real user can find via nav/sitemap. */
export const LIVE_TOOLS: Tool[] = tools.filter((t) => t.live !== false);

/** Tools hidden from nav/sitemap but still reachable by direct URL — worth smoke-testing too. */
export const HIDDEN_TOOLS: Tool[] = tools.filter((t) => t.live === false);

export const FILE_CATEGORIES: ReadonlySet<Tool["category"]> = new Set([
  "compress",
  "convert",
  "tools",
  "files",
  "ai",
]);

export function isFileTool(tool: Tool): boolean {
  return FILE_CATEGORIES.has(tool.category);
}
