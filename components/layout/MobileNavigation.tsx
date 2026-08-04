"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Hash, ImageIcon, Menu, X } from "lucide-react";
import {
  navigationCategories,
  playLinks,
  type PlayLink,
} from "@/lib/navigation";
import { MobileSearchTrigger } from "@/components/search/CommandPalette";

function PlayLinkIcon({ icon }: { icon: PlayLink["icon"] }) {
  if (icon === "image") {
    return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  }

  return <Hash className="h-4 w-4" aria-hidden="true" />;
}

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setExpandedSection(null);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [close, open]);

  function toggleSection(section: string) {
    setExpandedSection((current) => (current === section ? null : section));
  }

  return (
    <div ref={rootRef} className="relative lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="rounded-xl border border-[color:var(--ghost-border)] bg-muted/70 p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-14 z-50 max-h-[70dvh] w-[calc(100vw-2rem)] overflow-y-auto border border-[color:var(--ghost-border)] bg-card/95 p-3 shadow-[var(--ambient-shadow-strong)] backdrop-blur-2xl"
        >
          <nav className="space-y-2" aria-label="Mobile navigation">
            <MobileSearchTrigger
              onTrigger={() => {
                close();
                return triggerRef.current;
              }}
              className="flex w-full items-center gap-2 rounded-2xl bg-muted/55 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:text-primary"
            />

            <div className="rounded-2xl bg-muted/55 p-2">
              <button
                type="button"
                onClick={() => toggleSection("play")}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                aria-expanded={expandedSection === "play"}
                aria-controls={`${menuId}-play`}
              >
                Play
                <ChevronDown
                  className={`h-4 w-4 text-primary transition-transform ${
                    expandedSection === "play" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {expandedSection === "play" && (
                <div id={`${menuId}-play`} className="mt-2 space-y-1 rounded-2xl bg-card/80 p-2">
                  {playLinks.map((item) => (
                    <Link
                      key={item.route}
                      href={item.route}
                      onClick={() => close()}
                      className="flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/70"
                    >
                      <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                        <PlayLinkIcon icon={item.icon} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{item.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/play"
                    onClick={() => close()}
                    className="mt-1 flex items-center gap-1 rounded-xl px-3 py-3 text-sm text-primary transition-colors hover:bg-primary/[0.08] hover:text-primary/80"
                  >
                    View all Play tools
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>

            {navigationCategories.map((category) => {
              const expanded = expandedSection === category.id;
              const sectionId = `${menuId}-${category.id}`;

              return (
                <div key={category.id} className="rounded-2xl bg-muted/55 p-2">
                  <button
                    type="button"
                    onClick={() => toggleSection(category.id)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 hover:text-primary"
                    aria-expanded={expanded}
                    aria-controls={sectionId}
                  >
                    {category.label}
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {expanded && (
                    <div id={sectionId} className="mt-2 space-y-1 rounded-2xl bg-card/80 p-2">
                      {category.featured.map((tool) => (
                        <Link
                          key={tool.route}
                          href={tool.route}
                          onClick={() => close()}
                          className="block rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/70 hover:text-primary"
                        >
                          {tool.label}
                        </Link>
                      ))}
                      <Link
                        href={category.route}
                        onClick={() => close()}
                        className="mt-1 flex items-center gap-1 rounded-xl px-3 py-3 text-sm text-primary transition-colors hover:bg-primary/[0.08] hover:text-primary/80"
                      >
                        View all {category.label} tools
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/blog"
              onClick={() => close()}
              className="block rounded-2xl bg-muted/55 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Blog
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
