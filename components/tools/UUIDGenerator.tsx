"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { addToast } from "@/lib/toast";

function uuidFromBytes(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateV4(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return uuidFromBytes();
}

function generateV7(): string {
  const ms = Date.now();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, Math.floor(ms / 0x10000));
  view.setUint16(4, ms & 0xffff);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function formatUUID(
  uuid: string,
  uppercase: boolean,
  hyphens: boolean
): string {
  let result = uuid;
  if (!hyphens) result = result.replace(/-/g, "");
  if (uppercase) result = result.toUpperCase();
  return result;
}

type Version = "v4" | "v7";

export default function UUIDGenerator() {
  const [uuid, setUuid] = useState("");
  const [version, setVersion] = useState<Version>("v4");
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [count, setCount] = useState("1");
  const [bulkUUIDs, setBulkUUIDs] = useState<string[]>([]);

  const generate = useCallback(
    (v: Version) => (v === "v4" ? generateV4() : generateV7()),
    []
  );

  // Generate on mount
  useEffect(() => {
    setUuid(generate(version));
  }, []);

  const handleRegenerate = useCallback(() => {
    setUuid(generate(version));
  }, [version, generate]);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(
          formatUUID(text, uppercase, hyphens)
        );
        addToast("Copied to clipboard", "success");
      } catch {
        addToast("Failed to copy", "error");
      }
    },
    [uppercase, hyphens]
  );

  const handleBulkGenerate = useCallback(() => {
    const n = Math.min(Math.max(parseInt(count) || 1, 1), 100);
    const uuids = Array.from({ length: n }, () => generate(version));
    setBulkUUIDs(uuids);
  }, [count, version, generate]);

  const handleCopyAll = useCallback(async () => {
    const text = bulkUUIDs
      .map((u) => formatUUID(u, uppercase, hyphens))
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      addToast("All UUIDs copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [bulkUUIDs, uppercase, hyphens]);

  const displayUUID = formatUUID(uuid, uppercase, hyphens);

  return (
    <div className="space-y-6">
      {/* Main UUID display */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="flex-1 text-lg sm:text-xl font-mono font-semibold text-foreground dark:text-emerald-500 break-all select-all text-center sm:text-left">
            {displayUUID}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleCopy(uuid)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Copy className="h-4 w-4" /> Copy
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> New
            </button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setVersion("v4");
              setUuid(generate("v4"));
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              version === "v4"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            UUID v4
          </button>
          <button
            onClick={() => {
              setVersion("v7");
              setUuid(generate("v7"));
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              version === "v7"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            UUID v7
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-border"
          />
          Uppercase
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(e) => setHyphens(e.target.checked)}
            className="rounded border-border"
          />
          Hyphens
        </label>
      </div>

      {/* Bulk generate */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Bulk Generate
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={handleBulkGenerate}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Generate
          </button>
          {bulkUUIDs.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Copy className="h-4 w-4" /> Copy All
            </button>
          )}
        </div>

        {bulkUUIDs.length > 0 && (
          <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-background p-3 space-y-1">
            {bulkUUIDs.map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 py-1 group"
              >
                <span className="text-sm font-mono text-foreground break-all select-all">
                  {formatUUID(u, uppercase, hyphens)}
                </span>
                <button
                  onClick={() => handleCopy(u)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
