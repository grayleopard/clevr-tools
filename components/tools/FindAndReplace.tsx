"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste } from "lucide-react";
import { addToast } from "@/lib/toast";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function FindAndReplace() {
  const [sourceText, setSourceText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regexMode, setRegexMode] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [output, setOutput] = useState("");

  const regexState = useMemo(() => {
    if (!findText) return { regex: null as RegExp | null, error: "" };
    try {
      const flags = caseSensitive ? "g" : "gi";
      let pattern = regexMode ? findText : escapeRegex(findText);
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      return { regex: new RegExp(pattern, flags), error: "" };
    } catch (e) {
      return { regex: null as RegExp | null, error: e instanceof Error ? e.message : "Invalid regex" };
    }
  }, [findText, caseSensitive, regexMode, wholeWord]);

  const matchCount = useMemo(() => {
    if (!sourceText || !findText || !regexState.regex) return 0;
    const matches = sourceText.match(regexState.regex);
    return matches ? matches.length : 0;
  }, [sourceText, findText, regexState.regex]);

  const regexError = regexState.error;

  const handleReplace = useCallback(() => {
    if (!findText || !sourceText || !regexState.regex) return;
    const result = sourceText.replace(regexState.regex, replaceText);
    setOutput(result);
    addToast(`Replaced ${matchCount} match${matchCount !== 1 ? "es" : ""}`, "success");
  }, [findText, sourceText, regexState.regex, replaceText, matchCount]);

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
    setFindText("");
    setReplaceText("");
    setOutput("");
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
      {/* Source text */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">
            Source Text
          </p>
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
              disabled={!sourceText && !findText && !output}
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
          placeholder="Paste your source text here..."
          rows={8}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[160px]"
        />
      </div>

      {/* Find and Replace inputs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Find
          </label>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Search text..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Replace with
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement text..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Options row */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-border"
          />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={regexMode}
            onChange={(e) => setRegexMode(e.target.checked)}
            className="rounded border-border"
          />
          Regex mode
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
            className="rounded border-border"
          />
          Whole word only
        </label>
      </div>

      {/* Match count & Replace button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReplace}
          disabled={!findText || !sourceText}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Replace All
        </button>
        <span className="text-sm text-muted-foreground">
          {findText && sourceText
            ? `${matchCount} match${matchCount !== 1 ? "es" : ""} found`
            : ""}
        </span>
      </div>

      {/* Regex error */}
      {regexError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-3 py-2">
          <p className="text-sm text-red-700 dark:text-red-300">{regexError}</p>
        </div>
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
          placeholder="Result will appear here after replacing..."
          rows={8}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[160px]"
        />
      </div>
    </div>
  );
}
