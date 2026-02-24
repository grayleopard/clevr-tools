"use client";

import { useState, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Operations ────────────────────────────────────────────────────────────

const ops = {
  lineBreaks: (t: string) =>
    t.replace(/\r?\n/g, " ").replace(/ {2,}/g, " "),

  extraSpaces: (t: string) =>
    t.replace(/[^\S\n]{2,}/g, " "),

  emptyLines: (t: string) =>
    t
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .join("\n"),

  cleanAll: (t: string) =>
    t
      .replace(/\r?\n/g, " ")
      .replace(/ {2,}/g, " ")
      .trim(),

  trimEach: (t: string) =>
    t
      .split("\n")
      .map((l) => l.trim())
      .join("\n"),
};

interface ButtonDef {
  id: keyof typeof ops;
  label: string;
  description: string;
}

const BUTTONS: ButtonDef[] = [
  {
    id: "lineBreaks",
    label: "Remove Line Breaks",
    description: "Join all lines into one continuous paragraph",
  },
  {
    id: "extraSpaces",
    label: "Remove Extra Spaces",
    description: "Collapse 2+ spaces to a single space",
  },
  {
    id: "emptyLines",
    label: "Remove Empty Lines",
    description: "Filter out blank or whitespace-only lines",
  },
  {
    id: "cleanAll",
    label: "Clean All",
    description: "Apply all operations + trim",
  },
  {
    id: "trimEach",
    label: "Trim Each Line",
    description: "Remove leading/trailing spaces from every line",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function RemoveLineBreaks() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeOp, setActiveOp] = useState<string | null>(null);

  const applyOp = useCallback(
    (id: keyof typeof ops) => {
      setOutput(ops[id](input));
      setActiveOp(id);
    },
    [input]
  );

  const handlePaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
      setOutput("");
      setActiveOp(null);
      addToast("Text pasted from clipboard", "success");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setActiveOp(null);
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
            if (activeOp && ops[activeOp as keyof typeof ops]) {
              setOutput(ops[activeOp as keyof typeof ops](e.target.value));
            }
          }}
          placeholder="Paste your messy text here…"
          rows={7}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[160px]"
        />
      </div>

      {/* Operation buttons */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BUTTONS.map(({ id, label, description }) => (
          <button
            key={id}
            onClick={() => applyOp(id as keyof typeof ops)}
            disabled={!input.trim()}
            className={[
              "flex flex-col gap-0.5 rounded-xl border p-3.5 text-left transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              activeOp === id
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
            ].join(" ")}
          >
            <span
              className={`text-sm font-semibold ${
                activeOp === id ? "text-primary" : "text-foreground"
              }`}
            >
              {label}
            </span>
            <span className="text-xs text-muted-foreground leading-snug">
              {description}
            </span>
          </button>
        ))}
      </div>

      {/* Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">
            {activeOp
              ? BUTTONS.find((b) => b.id === activeOp)?.label ?? "Output"
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
          className={`min-h-[100px] whitespace-pre-wrap px-4 py-3 text-sm ${
            output ? "text-foreground" : "text-muted-foreground/50 italic"
          }`}
        >
          {output || "Select an operation above to clean your text…"}
        </div>
      </div>
    </div>
  );
}
