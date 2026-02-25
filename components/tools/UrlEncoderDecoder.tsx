"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Trash2 } from "lucide-react";
import { addToast } from "@/lib/toast";

type Mode = "component" | "uri";

export default function UrlEncoderDecoder() {
  const [decoded, setDecoded] = useState("");
  const [encoded, setEncoded] = useState("");
  const [mode, setMode] = useState<Mode>("component");
  const [decodeError, setDecodeError] = useState("");
  const lastEdited = useRef<"decoded" | "encoded" | null>(null);

  const encode = useCallback(
    (text: string, m: Mode): string => {
      if (!text) return "";
      return m === "component" ? encodeURIComponent(text) : encodeURI(text);
    },
    []
  );

  const decode = useCallback(
    (text: string, m: Mode): string => {
      return m === "component" ? decodeURIComponent(text) : decodeURI(text);
    },
    []
  );

  const handleDecodedChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      lastEdited.current = "decoded";
      setDecoded(value);
      setDecodeError("");
      try {
        setEncoded(encode(value, mode));
      } catch {
        setEncoded("");
      }
    },
    [mode, encode]
  );

  const handleEncodedChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      lastEdited.current = "encoded";
      setEncoded(value);
      if (!value) {
        setDecoded("");
        setDecodeError("");
        return;
      }
      try {
        setDecoded(decode(value, mode));
        setDecodeError("");
      } catch (err) {
        setDecodeError(
          err instanceof Error ? err.message : "Invalid encoded input"
        );
      }
    },
    [mode, decode]
  );

  const handleModeChange = useCallback(
    (m: Mode) => {
      setMode(m);
      setDecodeError("");
      // Re-encode or re-decode based on last edited side
      if (lastEdited.current === "decoded" && decoded) {
        try {
          setEncoded(encode(decoded, m));
        } catch {
          setEncoded("");
        }
      } else if (lastEdited.current === "encoded" && encoded) {
        try {
          setDecoded(decode(encoded, m));
        } catch (err) {
          setDecodeError(
            err instanceof Error ? err.message : "Invalid encoded input"
          );
        }
      }
    },
    [decoded, encoded, encode, decode]
  );

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        addToast(`Copied ${label} to clipboard`, "success");
      } catch {
        addToast("Failed to copy", "error");
      }
    },
    []
  );

  const handleClear = useCallback(() => {
    setDecoded("");
    setEncoded("");
    setDecodeError("");
    lastEdited.current = null;
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange("component")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "component"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            encodeURIComponent
          </button>
          <button
            onClick={() => handleModeChange("uri")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "uri"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            encodeURI
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "component"
            ? "encodeURIComponent encodes all special characters — use for query string values."
            : "encodeURI preserves URL structure characters (: / ? # @) — use for encoding a full URL."}
        </p>
      </div>

      {/* Clear button */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          disabled={!decoded && !encoded}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Two-pane layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Decoded */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground">
              Decoded (Plain Text)
            </p>
            <button
              onClick={() => handleCopy(decoded, "decoded text")}
              disabled={!decoded}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <textarea
            value={decoded}
            onChange={handleDecodedChange}
            placeholder="Type or paste plain text..."
            rows={12}
            className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[250px]"
          />
        </div>

        {/* Encoded */}
        <div
          className={`rounded-xl border bg-card overflow-hidden ${
            decodeError
              ? "border-red-300 dark:border-red-700"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground">
              Encoded
            </p>
            <button
              onClick={() => handleCopy(encoded, "encoded text")}
              disabled={!encoded}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          <textarea
            value={encoded}
            onChange={handleEncodedChange}
            placeholder="Type or paste encoded URL text..."
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
