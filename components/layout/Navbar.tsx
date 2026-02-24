"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Zap, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { tools, toolCategories } from "@/lib/tools";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Desktop hover dropdowns
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
        setMobileExpanded(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, []);

  const liveCategories = toolCategories.filter((cat) =>
    tools.some((t) => t.category === cat.id)
  );

  return (
    <>
      <header
        ref={menuRef}
        className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
            onClick={closeMobile}
          >
            <Zap className="h-5 w-5 text-primary" />
            <span>
              <span className="text-primary">clevr</span>
              <span className="text-muted-foreground">.tools</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {liveCategories.map((cat) => {
              const catTools = tools.filter((t) => t.category === cat.id);
              return (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => setOpenCategory(cat.id)}
                  onMouseLeave={() => setOpenCategory(null)}
                >
                  <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    {cat.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {openCategory === cat.id && (
                    <div className="absolute left-0 top-full min-w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
                      {catTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={tool.route}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => setOpenCategory(null)}
                        >
                          <span className="font-medium">{tool.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right side: theme toggle + hamburger */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => {
                setMobileOpen((prev) => !prev);
                setMobileExpanded(null);
              }}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
              {liveCategories.map((cat) => {
                const catTools = tools.filter((t) => t.category === cat.id);
                const isExpanded = mobileExpanded === cat.id;

                return (
                  <div key={cat.id}>
                    <button
                      onClick={() =>
                        setMobileExpanded(isExpanded ? null : cat.id)
                      }
                      className="flex w-full items-center justify-between rounded-md px-2 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {cat.label}
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mb-1 ml-3 border-l border-border pl-3">
                        {catTools.map((tool) => (
                          <Link
                            key={tool.slug}
                            href={tool.route}
                            onClick={closeMobile}
                            className="flex items-center rounded-md px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop — closes menu on tap outside, sits behind header */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          aria-hidden="true"
          onClick={closeMobile}
        />
      )}
    </>
  );
}
