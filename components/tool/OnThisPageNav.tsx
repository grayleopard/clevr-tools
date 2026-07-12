"use client";

import { useEffect, useState } from "react";

interface HeadingLink {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Scans the rendered page for h2 headings inside [data-toc-scope] regions
 * (the tool's main content and its below-fold seoContent block) and lists
 * them as anchor links. Works across all tools without per-tool authoring —
 * headings already exist in every tool's real content.
 */
export default function OnThisPageNav() {
  const [headings, setHeadings] = useState<HeadingLink[]>([]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-toc-scope] h2");
    const seen = new Set<string>();
    const found: HeadingLink[] = [];

    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;

      let id = el.id || slugify(text);
      let unique = id;
      let suffix = 2;
      while (seen.has(unique)) {
        unique = `${id}-${suffix}`;
        suffix++;
      }
      id = unique;
      el.id = id;
      seen.add(id);
      found.push({ id, text });
    });

    setHeadings(found);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="space-y-1">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className="block rounded-[0.75rem] px-3 py-2 text-sm leading-6 text-muted-foreground transition-colors hover:bg-card/70 hover:text-primary"
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
