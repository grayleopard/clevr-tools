"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { getToolIcon } from "@/lib/tool-icons";
import { searchTools } from "@/lib/search";

const OPEN_EVENT = "clevr:open-search";

/** Fired by any trigger (e.g. the mobile menu item) to open the palette
 *  without needing to lift state up through Navbar. */
export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Standalone trigger for use inside Server Components (e.g. the mobile
 *  menu in Navbar) that can't hold an onClick themselves. */
export function MobileSearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.closest("details")?.removeAttribute("open");
        openSearch();
      }}
      className={className}
    >
      <Search className="h-4 w-4" />
      Search tools
    </button>
  );
}

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mac, setMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const router = useRouter();

  const results = useMemo(() => searchTools(query), [query]);

  useEffect(() => {
    setMac(isMac());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (event.key === "Escape") {
        setOpen((prev) => (prev ? false : prev));
      }
    }

    function handleOpenEvent() {
      setOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_EVENT, handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      // Focus after the modal paints so autofocus doesn't fight the open transition.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery("");
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const tool = results[activeIndex];
      if (tool) {
        close();
        router.push(tool.route);
      }
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-muted/60 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search tools</span>
        <kbd className="ml-2 rounded-md border border-[color:var(--ghost-border)] bg-card/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-[color:var(--ghost-border)] bg-card shadow-[var(--ambient-shadow-strong)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search tools… try “shrink image” or “word count”"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[activeIndex] ? `${listId}-${results[activeIndex].slug}` : undefined}
          />
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Start typing to find any of the 110+ tools.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No tools match "{query}".
            </p>
          ) : (
            results.map((tool, index) => {
              const Icon = getToolIcon(tool.icon);
              const isActive = index === activeIndex;
              return (
                <button
                  key={tool.slug}
                  id={`${listId}-${tool.slug}`}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    close();
                    router.push(tool.route);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                    isActive ? "bg-primary/10" : "hover:bg-muted/70"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {tool.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {tool.shortDescription}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
