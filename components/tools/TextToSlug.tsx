"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Slug conversion ───────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, "") // keep alphanumeric, spaces, hyphens
    .trim()
    .replace(/[\s\-]+/g, "-") // spaces and hyphens → single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function TextToSlug() {
  const [input, setInput] = useState("");

  const slug = useMemo(() => toSlug(input), [input]);

  const handlePaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
      addToast("Text pasted from clipboard", "success");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      addToast("Slug copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [slug]);

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">Input — any text, title, or heading</p>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste
            </button>
            <button
              onClick={handleClear}
              disabled={!input}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How to Make the Perfect Sourdough Bread"
          rows={3}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
        />
      </div>

      {/* Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">URL Slug</p>
          <button
            onClick={handleCopy}
            disabled={!slug}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>

        <div className="px-4 py-4 min-h-[72px] flex items-center">
          {slug ? (
            <div className="flex items-center gap-2 min-w-0 w-full">
              <span className="text-sm text-muted-foreground/60 shrink-0 select-none">
                /
              </span>
              <span className="font-mono text-sm font-medium text-primary break-all">
                {slug}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">
              Your slug will appear here as you type…
            </span>
          )}
        </div>

        {/* Character count */}
        {slug && (
          <div className="border-t border-border px-4 py-2 flex items-center gap-3 bg-muted/10">
            <span className="text-xs text-muted-foreground">
              {slug.length} characters
            </span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground">
              {slug.split("-").filter(Boolean).length} words
            </span>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How it works</p>
        <div className="space-y-2">
          {[
            ["Crème brûlée recipe!", "creme-brulee-recipe"],
            ["How to Use React's useState Hook", "how-to-use-reacts-usestate-hook"],
            ["10 Best Tools for 2025 (Updated)", "10-best-tools-for-2025-updated"],
          ].map(([input, output]) => (
            <div key={input} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground min-w-0 truncate">{input}</span>
              <span className="text-muted-foreground/40 shrink-0">→</span>
              <span className="font-mono text-primary min-w-0 truncate">{output}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
