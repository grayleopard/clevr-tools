"use client";

import { useState, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

function fisherYatesShuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SortLines() {
  const [sourceText, setSourceText] = useState("");
  const [output, setOutput] = useState("");
  const [inputLineCount, setInputLineCount] = useState(0);
  const [outputLineCount, setOutputLineCount] = useState(0);

  const getLines = useCallback(() => {
    const lines = sourceText.split("\n").filter((l) => l.trim() !== "");
    setInputLineCount(lines.length);
    return lines;
  }, [sourceText]);

  const setResult = useCallback((lines: string[]) => {
    setOutputLineCount(lines.length);
    setOutput(lines.join("\n"));
  }, []);

  const handleAZ = useCallback(() => {
    const lines = getLines();
    const sorted = [...lines].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    setResult(sorted);
  }, [getLines, setResult]);

  const handleZA = useCallback(() => {
    const lines = getLines();
    const sorted = [...lines].sort((a, b) =>
      b.toLowerCase().localeCompare(a.toLowerCase())
    );
    setResult(sorted);
  }, [getLines, setResult]);

  const handleShortest = useCallback(() => {
    const lines = getLines();
    const sorted = [...lines].sort((a, b) => a.length - b.length);
    setResult(sorted);
  }, [getLines, setResult]);

  const handleLongest = useCallback(() => {
    const lines = getLines();
    const sorted = [...lines].sort((a, b) => b.length - a.length);
    setResult(sorted);
  }, [getLines, setResult]);

  const handleRandomize = useCallback(() => {
    const lines = getLines();
    const shuffled = fisherYatesShuffle(lines);
    setResult(shuffled);
  }, [getLines, setResult]);

  const handleDeduplicate = useCallback(() => {
    const lines = getLines();
    const unique = [...new Set(lines)];
    setResult(unique);
  }, [getLines, setResult]);

  const handlePaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setSourceText(t);
      addToast("Text pasted from clipboard", "success");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, []);

  const handleClear = useCallback(() => {
    setSourceText("");
    setOutput("");
    setInputLineCount(0);
    setOutputLineCount(0);
  }, []);

  const handleCopyOutput = useCallback(async () => {
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
              disabled={!sourceText && !output}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste lines of text to sort..."
          rows={8}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[160px]"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          ["A \u2192 Z", handleAZ],
          ["Z \u2192 A", handleZA],
          ["Shortest first", handleShortest],
          ["Longest first", handleLongest],
          ["Randomize", handleRandomize],
          ["Remove Duplicates", handleDeduplicate],
        ] as const).map(([label, handler]) => (
          <button
            key={label}
            onClick={handler as () => void}
            disabled={!sourceText.trim()}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats line */}
      {output && (
        <p className="text-sm text-muted-foreground">
          {inputLineCount} line{inputLineCount !== 1 ? "s" : ""} &rarr;{" "}
          {outputLineCount} line{outputLineCount !== 1 ? "s" : ""}
        </p>
      )}

      {/* Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">Output</p>
          <button
            onClick={handleCopyOutput}
            disabled={!output}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="Sorted output will appear here..."
          rows={8}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[160px]"
        />
      </div>
    </div>
  );
}
