"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleToolListProps {
  totalCount: number;
  previewCount?: number;
  children: React.ReactNode[];
}

export default function CollapsibleToolList({
  totalCount,
  previewCount = 3,
  children,
}: CollapsibleToolListProps) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = totalCount > previewCount;

  return (
    <>
      {children.map((child, i) => (
        <div
          key={i}
          className={
            needsCollapse && !expanded && i >= previewCount
              ? "sr-only md:not-sr-only"
              : undefined
          }
        >
          {child}
        </div>
      ))}
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-muted/50 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted/80 md:hidden"
        >
          {expanded ? "Show less" : `Show all ${totalCount} tools`}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </>
  );
}
