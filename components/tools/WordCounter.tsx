"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Stats calculation ─────────────────────────────────────────────────────

function computeStats(text: string) {
  if (!text.trim()) {
    return {
      words: 0, chars: 0, charsNoSpaces: 0,
      sentences: 0, paragraphs: 0, lines: 0,
      readingSec: 0, speakingSec: 0, avgWordLen: "0.0",
    };
  }

  const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;

  // Sentences: split on . ! ? followed by whitespace or end
  const sentences = text
    .split(/(?<=[.!?])\s+|(?<=[.!?])$/)
    .filter((s) => s.trim().length > 0).length;

  // Paragraphs: blocks separated by one or more blank lines
  const paragraphs = text
    .split(/\n\s*\n+/)
    .filter((p) => p.trim().length > 0).length;

  // Lines: non-empty lines
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0).length;

  const readingSec = Math.round((words / 238) * 60);
  const speakingSec = Math.round((words / 150) * 60);

  const allWords = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const totalWordChars = allWords.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, "").length, 0);
  const avgWordLen = words > 0 ? (totalWordChars / words).toFixed(1) : "0.0";

  return { words, chars, charsNoSpaces, sentences, paragraphs, lines, readingSec, speakingSec, avgWordLen };
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Stat chip ─────────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-xl font-semibold tabular-nums text-foreground dark:text-emerald-500">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => computeStats(text), [text]);

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

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [text]);

  return (
    <div className="space-y-5">
      {/* Input area */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
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
              onClick={handleCopy}
              disabled={!text}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
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
          placeholder="Start typing or paste your text here…"
          rows={10}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[240px]"
        />
      </div>

      {/* Primary stats grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <StatChip label="Words" value={stats.words.toLocaleString()} />
        <StatChip label="Characters" value={stats.chars.toLocaleString()} />
        <StatChip label="No Spaces" value={stats.charsNoSpaces.toLocaleString()} />
        <StatChip label="Sentences" value={stats.sentences.toLocaleString()} />
        <StatChip label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        <StatChip label="Lines" value={stats.lines.toLocaleString()} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{formatTime(stats.readingSec)}</span>
          <span className="text-xs text-muted-foreground">Reading time</span>
          <span className="text-xs text-muted-foreground/60">@ 238 wpm</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{formatTime(stats.speakingSec)}</span>
          <span className="text-xs text-muted-foreground">Speaking time</span>
          <span className="text-xs text-muted-foreground/60">@ 150 wpm</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{stats.avgWordLen}</span>
          <span className="text-xs text-muted-foreground">Avg word length</span>
          <span className="text-xs text-muted-foreground/60">characters</span>
        </div>
      </div>
    </div>
  );
}
