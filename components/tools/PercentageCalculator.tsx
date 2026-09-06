"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Copy } from "lucide-react";
import { addToast } from "@/lib/toast";
import { TipJar } from "@/components/tool/TipJar";

import { calculatePercentage, type PercentageMode as Mode } from "@/lib/percentage";
import { trackCalculatorEvent } from "@/lib/analytics/calculator-events";

const MODES: { id: Mode; label: string }[] = [
  { id: "percent-of", label: "X% of Y" },
  { id: "is-what-percent", label: "X is what % of Y" },
  { id: "percent-change", label: "% Change" },
];

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

  const attemptRef = useRef({ started: false, succeeded: false });
  const first = mode === "percent-of" ? xPct : mode === "is-what-percent" ? xPart : xOriginal;
  const second = mode === "percent-of" ? yNum : mode === "is-what-percent" ? yWhole : yNew;
  const { result, formula, error } = useMemo(() => calculatePercentage(mode, first, second), [mode, first, second]);
  const recordInput = (nextFirst: string, nextSecond: string) => {
    if (!attemptRef.current.started) {
      trackCalculatorEvent("percentage", "started");
      attemptRef.current.started = true;
    }
    const next = calculatePercentage(mode, nextFirst, nextSecond);
    if (next.result && !next.error && !attemptRef.current.succeeded) {
      trackCalculatorEvent("percentage", "succeeded");
      attemptRef.current.succeeded = true;
    }
  };

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      addToast("Copied to clipboard", "success");
      trackCalculatorEvent("percentage", "copy");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [result]);

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors tabular-nums";

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); attemptRef.current = { started: false, succeeded: false }; }}
            aria-pressed={mode === m.id}
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
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="percentage-pct" className="text-xs font-medium text-muted-foreground">
                Percentage (%)
              </label>
              <input
                id="percentage-pct"
                type="number"
                value={xPct}
                onChange={(e) => { setXPct(e.target.value); recordInput(e.target.value, yNum); }}
                placeholder="15"
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-sm font-medium text-muted-foreground">
              % of
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="percentage-number" className="text-xs font-medium text-muted-foreground">
                Number
              </label>
              <input
                id="percentage-number"
                type="number"
                value={yNum}
                onChange={(e) => { setYNum(e.target.value); recordInput(xPct, e.target.value); }}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {mode === "is-what-percent" && (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="percent-part" className="text-xs font-medium text-muted-foreground">
                Part
              </label>
              <input
                id="percent-part"
                type="number"
                value={xPart}
                onChange={(e) => { setXPart(e.target.value); recordInput(e.target.value, yWhole); }}
                placeholder="30"
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-sm font-medium text-muted-foreground">
              is what % of
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="percent-whole" className="text-xs font-medium text-muted-foreground">
                Whole
              </label>
              <input
                id="percent-whole"
                type="number"
                value={yWhole}
                onChange={(e) => { setYWhole(e.target.value); recordInput(xPart, e.target.value); }}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {mode === "percent-change" && (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="percent-original-value" className="text-xs font-medium text-muted-foreground">
                Original Value
              </label>
              <input
                id="percent-original-value"
                type="number"
                value={xOriginal}
                onChange={(e) => { setXOriginal(e.target.value); recordInput(e.target.value, yNew); }}
                placeholder="200"
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-lg text-muted-foreground">&rarr;</span>
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="percent-new-value" className="text-xs font-medium text-muted-foreground">
                New Value
              </label>
              <input
                id="percent-new-value"
                type="number"
                value={yNew}
                onChange={(e) => { setYNew(e.target.value); recordInput(xOriginal, e.target.value); }}
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
          {result && !error && (
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
          aria-live="polite"
          className={`break-words text-4xl font-bold tabular-nums ${
            error
              ? "text-red-500 text-lg"
              : result
                ? "text-foreground dark:text-emerald-500"
                : "text-muted-foreground/30"
          }`}
        >
          {error || result || "Enter two values above"}
        </div>
        {formula && (
          <p className="break-words text-sm text-muted-foreground font-mono">{formula}</p>
        )}
      </div>

      <TipJar />
    </div>
  );
}
