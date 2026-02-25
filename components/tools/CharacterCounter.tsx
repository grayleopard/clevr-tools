"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Platform limits ────────────────────────────────────────────────────────

const platforms = [
  { name: "Twitter / X", limit: 280 },
  { name: "Instagram Caption", limit: 2200 },
  { name: "LinkedIn Post", limit: 3000 },
  { name: "YouTube Title", limit: 100 },
  { name: "Meta Description", limit: 160 },
  { name: "SMS", limit: 160 },
];

function progressColor(count: number, limit: number): string {
  if (count === 0) return "bg-muted";
  const ratio = count / limit;
  if (ratio <= 0.8) return "bg-green-500";
  if (ratio <= 1) return "bg-amber-500";
  return "bg-red-500";
}

function textColor(count: number, limit: number): string {
  if (count === 0) return "text-muted-foreground";
  const ratio = count / limit;
  if (ratio <= 0.8) return "text-green-600 dark:text-green-400";
  if (ratio <= 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CharacterCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const characters = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    return { characters, charsNoSpaces, words, sentences, lines };
  }, [text]);

  const handlePaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setText(t);
      addToast("Text pasted from clipboard", "success");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, []);

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  return (
    <div className="space-y-5">
      {/* Input area */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">Input</p>
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
              disabled={!text}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to count characters..."
          rows={8}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[200px]"
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {([
          ["Characters", stats.characters],
          ["No Spaces", stats.charsNoSpaces],
          ["Words", stats.words],
          ["Sentences", stats.sentences],
          ["Lines", stats.lines],
        ] as const).map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Platform limits */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Platform Character Limits
        </h2>
        <div className="space-y-3">
          {platforms.map((p) => {
            const pct = Math.min((stats.characters / p.limit) * 100, 100);
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {p.name}
                  </span>
                  <span
                    className={`text-xs font-medium tabular-nums ${textColor(stats.characters, p.limit)}`}
                  >
                    {stats.characters.toLocaleString()} / {p.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${progressColor(stats.characters, p.limit)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
