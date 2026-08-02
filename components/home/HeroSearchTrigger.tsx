"use client";

import { Search } from "lucide-react";
import { openSearch } from "@/components/search/CommandPalette";

export default function HeroSearchTrigger({ toolCount }: { toolCount: number }) {
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className="flex w-full items-center gap-3 border border-foreground/70 bg-card px-5 py-4 text-left transition-colors duration-150 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Search className="h-5 w-5 shrink-0 text-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground sm:text-[15px]">
        Search {toolCount} tools — &ldquo;shrink image&rdquo;, &ldquo;pdf to jpg&rdquo;, &ldquo;word count&rdquo;…
      </span>
      <kbd className="hidden shrink-0 border border-[color:var(--ghost-border)] bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
