import type { Metadata } from "next";
import type { Tool } from "@/lib/tools";

/**
 * live: false tools (unfinished/hidden — not in the sitemap, not in
 * getRelatedTools(), not in search) are still fully public, crawlable pages:
 * nothing about live: false stops Next.js from rendering them at their
 * route. background-remover and pdf-to-fillable were both indexed by Google
 * despite the sitemap exclusion — a page being absent from the sitemap
 * doesn't stop it from being crawled and indexed if discovered any other
 * way (an old sitemap Google already has, a stale external link, etc).
 *
 * Spread this into every hidden tool's generateMetadata() return value so
 * the page stays fully functional for anyone who lands on it directly, but
 * Google is explicitly told not to index it — the sitemap filter alone
 * isn't a substitute for this.
 */
export function hiddenToolRobots(tool: Tool): Pick<Metadata, "robots"> {
  if (tool.live === false) {
    return { robots: { index: false, follow: true } };
  }
  return {};
}
