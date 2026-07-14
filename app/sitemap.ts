import { MetadataRoute } from "next";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { tools } from "@/lib/tools";
import { siteCategories } from "@/lib/site-structure";
import { memeTemplates } from "@/lib/memes/templates";
import { getAllPosts } from "@/lib/blog";

const FALLBACK_LASTMOD = new Date("2026-03-10");

/**
 * Real per-tool lastmod instead of one hardcoded date for all 112 tool
 * pages: git commit date of the route's page.tsx, and of its main
 * components/tools/*.tsx (extracted from the page's own import), whichever
 * is more recent — a tool changes far more often via its component than
 * its thin page.tsx wrapper. Falls back to FALLBACK_LASTMOD if git isn't
 * available in the build environment (e.g. a shallow clone with the file's
 * real last-change commit outside the fetched depth) — this degrades to
 * the old behavior for that one entry rather than failing the build.
 */
function getToolLastModified(route: string): Date {
  const cwd = process.cwd();
  const pagePath = path.join(cwd, "app", ...route.slice(1).split("/"), "page.tsx");
  const candidates = [pagePath];

  try {
    const src = readFileSync(pagePath, "utf-8");
    const match = src.match(/from ["']@\/components\/tools\/([A-Za-z0-9]+)["']/);
    if (match) {
      candidates.push(path.join(cwd, "components", "tools", `${match[1]}.tsx`));
    }
  } catch {
    // page.tsx not found at the expected path — fall back below
  }

  let latestMs = 0;
  for (const file of candidates) {
    try {
      const iso = execSync(`git log -1 --format=%cI -- "${file}"`, { cwd, encoding: "utf-8" }).trim();
      if (iso) {
        const ms = new Date(iso).getTime();
        if (ms > latestMs) latestMs = ms;
      }
    } catch {
      // git unavailable or no history for this file — try the next candidate
    }
  }

  return latestMs > 0 ? new Date(latestMs) : FALLBACK_LASTMOD;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.clevr.tools";

  const toolEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.live !== false)
    .map((tool) => ({
      url: `${base}${tool.route}`,
      lastModified: getToolLastModified(tool.route),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const categoryEntries: MetadataRoute.Sitemap = siteCategories.map((cat) => ({
    url: `${base}${cat.route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: base,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/about`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/play`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/play/numble`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/play/meme-generator`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...categoryEntries,
    ...toolEntries,
    ...memeTemplates.map((t) => ({
      url: `${base}/play/meme-generator/${t.id}`,
      lastModified: new Date("2026-03-14"),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${base}/blog`,
      lastModified: new Date("2026-03-15"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...getAllPosts().map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
