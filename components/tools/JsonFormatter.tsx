"use client";

import { useState, useCallback } from "react";
import { Copy, Trash2, ClipboardPaste, Check, X } from "lucide-react";
import { addToast } from "@/lib/toast";

type IndentType = "2" | "4" | "tab";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [validation, setValidation] = useState<
    | { status: "valid" }
    | { status: "invalid"; message: string }
    | { status: "empty" }
  >({ status: "empty" });

  const getIndent = useCallback((): string | number => {
    if (indent === "tab") return "\t";
    return Number(indent);
  }, [indent]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, getIndent());
      setOutput(formatted);
      setValidation({ status: "valid" });
    } catch (e) {
      setValidation({
        status: "invalid",
        message: e instanceof Error ? e.message : "Invalid JSON",
      });
    }
  }, [input, getIndent]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setValidation({ status: "valid" });
    } catch (e) {
      setValidation({
        status: "invalid",
        message: e instanceof Error ? e.message : "Invalid JSON",
      });
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) return;
    try {
      JSON.parse(input);
      setValidation({ status: "valid" });
    } catch (e) {
      setValidation({
        status: "invalid",
        message: e instanceof Error ? e.message : "Invalid JSON",
      });
    }
  }, [input]);

  const handleCopyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [output]);

  const handlePaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
      setValidation({ status: "empty" });
      addToast("Text pasted from clipboard", "success");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setValidation({ status: "empty" });
  }, []);

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
            if (!e.target.value.trim()) setValidation({ status: "empty" });
          }}
          placeholder="Paste JSON here..."
          rows={10}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[200px] font-mono"
        />
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleFormat}
          disabled={!input.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          disabled={!input.trim()}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Minify
        </button>
        <button
          onClick={handleValidate}
          disabled={!input.trim()}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Validate
        </button>
        <button
          onClick={handleCopyOutput}
          disabled={!output}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Output
        </button>

        {/* Indent selector */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Indent:</span>
          {(
            [
              ["2", "2 spaces"],
              ["4", "4 spaces"],
              ["tab", "Tabs"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setIndent(val)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                indent === val
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Validation badge */}
      {validation.status === "valid" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 px-3 py-2">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-emerald-500">
            Valid JSON
          </span>
        </div>
      )}
      {validation.status === "invalid" && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-3 py-2">
          <X className="h-4 w-4 mt-0.5 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Invalid JSON
            </span>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {validation.message}
            </p>
          </div>
        </div>
      )}

      {/* Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">Output</p>
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="Formatted JSON will appear here..."
          rows={10}
          className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[200px] font-mono"
        />
      </div>
    </div>
  );
}
