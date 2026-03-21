"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: must run after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder the same size to avoid layout shift
    return <div className="size-10" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex size-10 items-center justify-center rounded-xl border border-[color:var(--ghost-border)] bg-muted/70 text-muted-foreground transition-[color,background-color,border-color,transform] duration-200 hover:border-primary/25 hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98]"
      aria-label="Toggle theme"
      type="button"
    >
      {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
