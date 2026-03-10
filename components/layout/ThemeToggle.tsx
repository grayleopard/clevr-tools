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
    return <div className="size-8" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="size-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
      aria-label="Toggle theme"
      type="button"
    >
      {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
