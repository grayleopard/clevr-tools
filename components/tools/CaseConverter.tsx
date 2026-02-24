"use client";

import { useState, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Conversion functions ──────────────────────────────────────────────────

const converters: Record<string, (t: string) => string> = {
  sentence: (t) => {
    return t
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
  },
  lower: (t) => t.toLowerCase(),
  upper: (t) => t.toUpperCase(),
  title: (t) => {
    // Capitalize first letter of each word; preserve existing spacing
    return t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  },
  toggle: (t) =>
    t
      .split("")
      .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
      .join(""),
  camel: (t) => {
    const words = t.trim().split(/[\s_\-\.]+/).filter(Boolean);
    return words
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");
  },
  pascal: (t) =>
    t
      .trim()
      .split(/[\s_\-\.]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(""),
  snake: (t) =>
    t
      .trim()
      .toLowerCase()
      .replace(/[\s\-\.]+/g, "_")
      .replace(/[^a-z0-9_]/g, ""),
  kebab: (t) =>
    t
      .trim()
      .toLowerCase()
      .replace(/[\s_\.]+/g, "-")
      .replace(/[^a-z0-9\-]/g, ""),
  dot: (t) =>
    t
      .trim()
      .toLowerCase()
      .replace(/[\s_\-]+/g, ".")
      .replace(/[^a-z0-9\.]/g, ""),
};

const BUTTONS: { id: string; label: string }[] = [
  { id: "sentence", label: "Sentence case" },
  { id: "lower", label: "lower case" },
  { id: "upper", label: "UPPER CASE" },
  { id: "title", label: "Title Case" },
  { id: "toggle", label: "tOGGLE cASE" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
  { id: "dot", label: "dot.case" },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const applyCase = useCallback(
    (id: string) => {
      const fn = converters[id];
      if (!fn) return;
      setOutput(fn(input));
      setActiveCase(id);
    },
    [input]
  );

  const handlePaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
      setOutput("");
      setActiveCase(null);
      addToast("Text pasted from clipboard", "success");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setActiveCase(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [output]);

  return (
    <div className="space-y-4">
      {/* Input */}
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
          onChange={(e) => {
            setInput(e.target.value);
            // Re-apply active case in real time
            if (activeCase && converters[activeCase]) {
              setOutput(converters[activeCase](e.target.value));
            }
          }}
          placeholder="Paste or type your text here…"
          rows={6}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[140px]"
        />
      </div>

      {/* Case buttons */}
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => applyCase(id)}
            disabled={!input.trim()}
            className={[
              "rounded-lg border px-3.5 py-2 text-sm font-medium transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              activeCase === id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted hover:border-primary/40",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">
            {activeCase
              ? BUTTONS.find((b) => b.id === activeCase)?.label ?? "Output"
              : "Output"}
          </p>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <div
          className={`min-h-[100px] px-4 py-3 text-sm ${
            output ? "text-foreground" : "text-muted-foreground/50 italic"
          }`}
        >
          {output || "Select a case format above to convert your text…"}
        </div>
      </div>
    </div>
  );
}
