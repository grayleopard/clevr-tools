"use client";

import { useEffect, useState } from "react";
import { slugify, type TocHeading } from "@/lib/seo/toc";

const EMPTY_HEADINGS: TocHeading[] = [];

interface OnThisPageNavProps {
  /** Headings already known server-side (from tool.seoContent) — render immediately,
   *  no client JS required, ids already exist in the SSR'd HTML. */
  seedHeadings?: TocHeading[];
}

/**
 * Lists the tool's real content sections as anchor links. The seoContent
 * headings are known at render time and render immediately with working
 * ids (see lib/seo/toc.ts). Any additional headings embedded directly in
 * the tool's own component (e.g. "How Loan Payments Are Calculated") can't
 * be known server-side without per-tool authoring, so those are picked up
 * via a DOM scan after mount and appended — progressive enhancement, not
 * the primary render path.
 */
export default function OnThisPageNav({ seedHeadings = EMPTY_HEADINGS }: OnThisPageNavProps) {
  const [extraHeadings, setExtraHeadings] = useState<TocHeading[]>([]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const seedIds = new Set(seedHeadings.map((heading) => heading.id));
      const elements = document.querySelectorAll<HTMLElement>("[data-toc-scope] h2");
      const seen = new Set(seedIds);
      const found: TocHeading[] = [];

      elements.forEach((element) => {
        const text = element.textContent?.trim();
        if (!text) return;

        // Already server-rendered with the correct id — nothing to add.
        if (element.id && seedIds.has(element.id)) return;

        const baseId = element.id || slugify(text);
        let id = baseId;
        let suffix = 2;
        while (seen.has(id)) {
          id = `${baseId}-${suffix}`;
          suffix++;
        }
        element.id = id;
        seen.add(id);
        found.push({ id, text });
      });

      setExtraHeadings(found);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [seedHeadings]);

  const headings = [...seedHeadings, ...extraHeadings];
  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="space-y-1">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className="block break-words rounded-[0.75rem] px-3 py-2 text-sm leading-6 text-muted-foreground transition-colors hover:bg-card/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
