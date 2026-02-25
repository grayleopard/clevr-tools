"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type Mode = "percent-of" | "is-what-percent" | "percent-change";

const MODES: { id: Mode; label: string }[] = [
  { id: "percent-of", label: "X% of Y" },
  { id: "is-what-percent", label: "X is what % of Y" },
  { id: "percent-change", label: "% Change" },
];

// ─── Formatting helpers ─────────────────────────────────────────────────────

function formatResult(n: number): string {
  if (!isFinite(n)) return "";
  // Up to 6 significant digits, trimmed
  const s = Number(n.toPrecision(6));
  return String(s);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("percent-of");

  // percent-of
  const [xPct, setXPct] = useState("");
  const [yNum, setYNum] = useState("");

  // is-what-percent
  const [xPart, setXPart] = useState("");
  const [yWhole, setYWhole] = useState("");

  // percent-change
  const [xOriginal, setXOriginal] = useState("");
  const [yNew, setYNew] = useState("");

  const { result, formula } = useMemo(() => {
    switch (mode) {
      case "percent-of": {
        const x = parseFloat(xPct);
        const y = parseFloat(yNum);
        if (isNaN(x) || isNaN(y)) return { result: "", formula: "" };
        const r = (x / 100) * y;
        return {
          result: formatResult(r),
          formula: `(${x} \u00F7 100) \u00D7 ${y} = ${formatResult(r)}`,
        };
      }
      case "is-what-percent": {
        const x = parseFloat(xPart);
        const y = parseFloat(yWhole);
        if (isNaN(x) || isNaN(y)) return { result: "", formula: "" };
        if (y === 0) return { result: "Cannot divide by zero", formula: "" };
        const r = (x / y) * 100;
        return {
          result: `${formatResult(r)}%`,
          formula: `(${x} \u00F7 ${y}) \u00D7 100 = ${formatResult(r)}%`,
        };
      }
      case "percent-change": {
        const x = parseFloat(xOriginal);
        const y = parseFloat(yNew);
        if (isNaN(x) || isNaN(y)) return { result: "", formula: "" };
        if (x === 0) return { result: "Cannot divide by zero", formula: "" };
        const change = ((y - x) / x) * 100;
        const formatted = formatResult(Math.abs(change));
        const label =
          change >= 0
            ? `+${formatted}% increase`
            : `${formatted}% decrease`;
        return {
          result: label,
          formula: `((${y} \u2212 ${x}) \u00F7 ${x}) \u00D7 100 = ${change >= 0 ? "+" : "-"}${formatted}%`,
        };
      }
      default:
        return { result: "", formula: "" };
    }
  }, [mode, xPct, yNum, xPart, yWhole, xOriginal, yNew]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [result]);

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors tabular-nums";

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              mode === m.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        {mode === "percent-of" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Percentage (%)
              </label>
              <input
                type="number"
                value={xPct}
                onChange={(e) => setXPct(e.target.value)}
                placeholder="15"
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-sm font-medium text-muted-foreground">
              % of
            </span>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Number
              </label>
              <input
                type="number"
                value={yNum}
                onChange={(e) => setYNum(e.target.value)}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {mode === "is-what-percent" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Part
              </label>
              <input
                type="number"
                value={xPart}
                onChange={(e) => setXPart(e.target.value)}
                placeholder="30"
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-sm font-medium text-muted-foreground">
              is what % of
            </span>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Whole
              </label>
              <input
                type="number"
                value={yWhole}
                onChange={(e) => setYWhole(e.target.value)}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {mode === "percent-change" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Original Value
              </label>
              <input
                type="number"
                value={xOriginal}
                onChange={(e) => setXOriginal(e.target.value)}
                placeholder="200"
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-lg text-muted-foreground">&rarr;</span>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                New Value
              </label>
              <input
                type="number"
                value={yNew}
                onChange={(e) => setYNew(e.target.value)}
                placeholder="250"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Result
          </span>
          {result && result !== "Cannot divide by zero" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          )}
        </div>
        <div
          className={`text-4xl font-bold tabular-nums ${
            result === "Cannot divide by zero"
              ? "text-red-500 text-lg"
              : result
                ? "text-foreground"
                : "text-muted-foreground/30"
          }`}
        >
          {result || "---"}
        </div>
        {formula && (
          <p className="text-sm text-muted-foreground font-mono">{formula}</p>
        )}
      </div>
    </div>
  );
}
