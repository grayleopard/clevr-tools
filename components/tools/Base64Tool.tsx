"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Trash2 } from "lucide-react";
import { addToast } from "@/lib/toast";

function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}

export default function Base64Tool() {
  const [plainText, setPlainText] = useState("");
  const [base64Text, setBase64Text] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const lastEdited = useRef<"plain" | "base64" | null>(null);

  const handlePlainTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      lastEdited.current = "plain";
      setPlainText(value);
      setDecodeError("");
      if (value === "") {
        setBase64Text("");
        return;
      }
      try {
        setBase64Text(encodeBase64(value));
      } catch {
        setBase64Text("");
      }
    },
    []
  );

  const handleBase64Change = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      lastEdited.current = "base64";
      setBase64Text(value);
      if (value === "") {
        setPlainText("");
        setDecodeError("");
        return;
      }
      try {
        setPlainText(decodeBase64(value));
        setDecodeError("");
      } catch (err) {
        setDecodeError(
          err instanceof Error ? err.message : "Invalid Base64 input"
        );
      }
    },
    []
  );

  const handleCopyPlain = useCallback(async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      addToast("Copied plain text to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [plainText]);

  const handleCopyBase64 = useCallback(async () => {
    if (!base64Text) return;
    try {
      await navigator.clipboard.writeText(base64Text);
      addToast("Copied Base64 to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [base64Text]);

  const handleClear = useCallback(() => {
    setPlainText("");
    setBase64Text("");
    setDecodeError("");
    lastEdited.current = null;
  }, []);

  return (
    <div className="space-y-4">
      {/* Clear button */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          disabled={!plainText && !base64Text}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Two-pane layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Plain Text */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground">
              Plain Text
            </p>
            <button
              onClick={handleCopyPlain}
              disabled={!plainText}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <textarea
            value={plainText}
            onChange={handlePlainTextChange}
            placeholder="Type or paste plain text..."
            rows={12}
            className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[250px]"
          />
        </div>

        {/* Base64 */}
        <div
          className={`rounded-xl border bg-card overflow-hidden ${
            decodeError
              ? "border-red-300 dark:border-red-700"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground">Base64</p>
            <button
              onClick={handleCopyBase64}
              disabled={!base64Text}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <textarea
            value={base64Text}
            onChange={handleBase64Change}
            placeholder="Type or paste Base64..."
            rows={12}
            className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[250px] font-mono"
          />
        </div>
      </div>

      {/* Decode error */}
      {decodeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-3 py-2">
          <p className="text-sm text-red-700 dark:text-red-300">
            {decodeError}
          </p>
        </div>
      )}
    </div>
  );
}
