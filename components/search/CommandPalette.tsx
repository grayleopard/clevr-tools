"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchTool } from "@/lib/search-index";

const OPEN_EVENT = "clevr:open-search";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type SearchModule = typeof import("@/lib/search");
type ToolIconModule = typeof import("@/lib/tool-icons");

/** Open the global tool search from a trigger outside this component. */
export function openSearch(returnFocus?: HTMLElement | null) {
  window.dispatchEvent(
    new CustomEvent(OPEN_EVENT, { detail: { returnFocus: returnFocus ?? null } })
  );
}

export function MobileSearchTrigger({
  className,
  onTrigger,
}: {
  className?: string;
  onTrigger?: () => HTMLElement | null;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const returnFocus = onTrigger?.();
        openSearch(returnFocus);
      }}
      className={className}
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      Search tools
    </button>
  );
}

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function optionId(listId: string, tool: SearchTool) {
  return `${listId}-${tool.route.replace(/[^a-z0-9]+/gi, "-")}`;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mac, setMac] = useState(false);
  const [searchModule, setSearchModule] = useState<SearchModule | null>(null);
  const [iconModule, setIconModule] = useState<ToolIconModule | null>(null);
  const [loadError, setLoadError] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const listId = useId();
  const router = useRouter();

  const results = useMemo(
    () => searchModule?.searchTools(query) ?? [],
    [query, searchModule]
  );

  useEffect(() => {
    setMac(isMac());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    window.requestAnimationFrame(() => {
      const previous = lastFocusedRef.current;
      if (previous?.isConnected) previous.focus();
    });
  }, []);

  const show = useCallback((event?: unknown) => {
    const requestedFocus =
      event instanceof CustomEvent && event.detail?.returnFocus instanceof HTMLElement
        ? event.detail.returnFocus
        : null;
    if (requestedFocus) lastFocusedRef.current = requestedFocus;
    else if (document.activeElement instanceof HTMLElement) {
      lastFocusedRef.current = document.activeElement;
    }
    setLoadError(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCmdK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        if (open) close();
        else show();
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [close, open, show]);

  useEffect(() => {
    if (!open || (searchModule && iconModule)) return;

    let cancelled = false;
    Promise.all([import("@/lib/search"), import("@/lib/tool-icons")])
      .then(([loadedSearch, loadedIcons]) => {
        if (cancelled) return;
        setSearchModule(loadedSearch);
        setIconModule(loadedIcons);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [iconModule, open, searchModule]);

  useEffect(() => {
    if (open) {
      // Focus after the dialog paints so it does not fight the open transition.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery("");
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function choose(tool: SearchTool) {
    close();
    router.push(tool.route);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const tool = results[activeIndex];
      if (tool) choose(tool);
    }
  }

  function containDialogFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(
      (element) =>
        element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true"
    );
    const first = focusableElements[0];
    const last = focusableElements.at(-1);
    if (!first || !last) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const activeElement = document.activeElement;
    if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        className="hidden items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-muted/60 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span>Search tools</span>
        <kbd className="ml-2 rounded-md border border-[color:var(--ghost-border)] bg-card/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
            tabIndex={-1}
            onKeyDown={containDialogFocus}
            className="relative w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-[color:var(--ghost-border)] bg-card shadow-[var(--ambient-shadow-strong)]"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search tools… try “shrink image” or “word count”"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                role="combobox"
                aria-label="Search tools"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={
                  results[activeIndex]
                    ? optionId(listId, results[activeIndex])
                    : undefined
                }
              />
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div
              id={listId}
              role="listbox"
              aria-live="polite"
              className="max-h-[60vh] overflow-y-auto p-2"
            >
              {query.trim() === "" ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Start typing to find any tool.
                </p>
              ) : loadError ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Search could not load. Close and try again.
                </p>
              ) : !searchModule ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Loading tools…
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No tools match &quot;{query}&quot;.
                </p>
              ) : (
                results.map((tool, index) => {
                  const Icon = iconModule?.getToolIcon(tool.icon) ?? Search;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={tool.route}
                      id={optionId(listId, tool)}
                      role="option"
                      aria-selected={isActive}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(tool)}
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
      )}
    </>
  );
}
