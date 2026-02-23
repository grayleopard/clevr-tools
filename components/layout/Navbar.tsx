"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Zap, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { tools, toolCategories } from "@/lib/tools";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Zap className="h-5 w-5 text-primary" />
          <span>
            <span className="text-primary">clevr</span>
            <span className="text-muted-foreground">.tools</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {toolCategories.map((cat) => {
            const catTools = tools.filter((t) => t.category === cat.id);
            if (catTools.length === 0) return null;
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

        {/* Theme toggle */}
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
      </div>
    </header>
  );
}
