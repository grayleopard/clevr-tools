"use client";

import { cloneElement, isValidElement, useState, type ReactElement } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleToolListProps {
  previewCount?: number;
  children: React.ReactNode[];
}

export default function CollapsibleToolList({
  previewCount = 3,
  children,
}: CollapsibleToolListProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = children.length > previewCount;

  return (
    <>
      {children.map((child, i) => {
        if (i < previewCount || !isValidElement(child)) return child;

        const element = child as ReactElement<{ className?: string }>;
        const hiddenClass = expanded ? undefined : "hidden md:block";

        return cloneElement(element, {
          key: element.key ?? i,
          className: [element.props.className, hiddenClass].filter(Boolean).join(" "),
        });
      })}

      {hasMore && (
        <li className="md:hidden">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-center gap-1.5 border-b border-[color:var(--ghost-border)] py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
          >
            {expanded ? "Show less" : `Show ${children.length - previewCount} more`}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </li>
      )}
    </>
  );
}
