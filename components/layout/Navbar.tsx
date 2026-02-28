"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Zap, ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { siteCategories } from "@/lib/site-structure";
import { getToolBySlug } from "@/lib/tools";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Desktop hover dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOpenCategory, setMobileOpenCategory] = useState<string | null>(
    null
  );

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
        setMobileOpenCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobile = useCallback(() => {
    setMobileMenuOpen(false);
    setMobileOpenCategory(null);
  }, []);

  // Desktop hover handlers with delay
  const handleMouseEnter = useCallback((categoryId: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setActiveDropdown(categoryId);
    }, 80);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
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
          <nav className="hidden items-center gap-0.5 md:flex">
            {siteCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              return (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(cat.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={cat.route}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors ${
                      isOpen
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Link>

                  {/* Mega dropdown */}
                  {isOpen && (
                    <div className="absolute left-1/2 top-full pt-1 -translate-x-1/2">
                      <div
                        className={`rounded-xl border border-border bg-popover p-5 shadow-xl ${
                          cat.subcategories.length === 1
                            ? "min-w-[220px]"
                            : cat.subcategories.length === 2
                            ? "min-w-[400px]"
                            : "min-w-[560px]"
                        }`}
                      >
                        <div
                          className={`grid gap-6 ${
                            cat.subcategories.length === 1
                              ? "grid-cols-1"
                              : cat.subcategories.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                          }`}
                        >
                          {cat.subcategories.map((sub) => (
                            <div key={sub.label}>
                              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {sub.label}
                              </h4>
                              <ul className="space-y-0.5">
                                {sub.slugs.map((slug) => {
                                  const tool = getToolBySlug(slug);
                                  if (!tool || tool.live === false) return null;
                                  return (
                                    <li key={slug}>
                                      <Link
                                        href={tool.route}
                                        className="block rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        {tool.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* View all link */}
                        <div className="mt-4 border-t border-border pt-3">
                          <Link
                            href={cat.route}
                            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                            onClick={() => setActiveDropdown(null)}
                          >
                            View all {cat.label} tools
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
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

            {/* Hamburger -- mobile only */}
            <button
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setMobileOpenCategory(null);
              }}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100dvh-60px)] overflow-y-auto border-t border-border bg-background md:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
              {siteCategories.map((cat) => {
                const isExpanded = mobileOpenCategory === cat.id;

                return (
                  <div key={cat.id}>
                    <button
                      onClick={() =>
                        setMobileOpenCategory(isExpanded ? null : cat.id)
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
                      <div className="mb-1 ml-2 border-l border-border pl-3">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.label} className="mb-2">
                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {sub.label}
                            </p>
                            {sub.slugs.map((slug) => {
                              const tool = getToolBySlug(slug);
                              if (!tool || tool.live === false) return null;
                              return (
                                <Link
                                  key={slug}
                                  href={tool.route}
                                  onClick={closeMobile}
                                  className="flex items-center rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                  {tool.name}
                                </Link>
                              );
                            })}
                          </div>
                        ))}

                        {/* View all link in mobile */}
                        <Link
                          href={cat.route}
                          onClick={closeMobile}
                          className="flex items-center gap-1 px-2 py-2 text-sm text-primary transition-colors hover:text-primary/80"
                        >
                          View all {cat.label} tools
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop -- closes menu on tap outside, sits behind header */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          aria-hidden="true"
          onClick={closeMobile}
        />
      )}
    </>
  );
}
