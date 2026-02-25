"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Random helpers ─────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return min + (arr[0] % range);
}

function generateNumbers(
  min: number,
  max: number,
  count: number,
  allowDuplicates: boolean
): number[] {
  const range = max - min + 1;

  if (!allowDuplicates && count > range) {
    return []; // impossible
  }

  if (!allowDuplicates) {
    const set = new Set<number>();
    while (set.size < count) {
      set.add(randomInt(min, max));
    }
    return Array.from(set);
  }

  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(randomInt(min, max));
  }
  return results;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function RandomNumberGenerator() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortResults, setSortResults] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [genKey, setGenKey] = useState(0);
  const [error, setError] = useState("");

  // Quick actions
  const [coinResult, setCoinResult] = useState<"Heads" | "Tails" | null>(null);
  const [diceResults, setDiceResults] = useState<number[] | null>(null);
  const [diceCount, setDiceCount] = useState(0);

  const handleGenerate = useCallback(() => {
    setError("");
    setCoinResult(null);
    setDiceResults(null);

    const minVal = parseInt(min, 10);
    const maxVal = parseInt(max, 10);
    const countVal = parseInt(count, 10);

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(countVal)) {
      setError("Please enter valid numbers.");
      return;
    }
    if (minVal > maxVal) {
      setError("Minimum must be less than or equal to maximum.");
      return;
    }
    if (countVal < 1 || countVal > 1000) {
      setError("Count must be between 1 and 1000.");
      return;
    }

    const range = maxVal - minVal + 1;
    if (!allowDuplicates && countVal > range) {
      setError(
        `Cannot generate ${countVal} unique numbers in a range of ${range}. Increase range or enable duplicates.`
      );
      return;
    }

    let nums = generateNumbers(minVal, maxVal, countVal, allowDuplicates);
    if (sortResults) nums = nums.sort((a, b) => a - b);
    setResults(nums);
    setGenKey((k) => k + 1);
  }, [min, max, count, allowDuplicates, sortResults]);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(results.join(", "));
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [results]);

  const flipCoin = useCallback(() => {
    setError("");
    setResults([]);
    setDiceResults(null);
    setCoinResult(randomInt(0, 1) === 0 ? "Heads" : "Tails");
    setGenKey((k) => k + 1);
  }, []);

  const rollDice = useCallback((n: number) => {
    setError("");
    setResults([]);
    setCoinResult(null);
    const dice: number[] = [];
    for (let i = 0; i < n; i++) dice.push(randomInt(1, 6));
    setDiceResults(dice);
    setDiceCount(n);
    setGenKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-5">
      {/* Settings */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Min</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Max</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Count</label>
            <input
              type="number"
              value={count}
              min={1}
              max={1000}
              onChange={(e) => setCount(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="accent-primary h-3.5 w-3.5"
              />
              Allow duplicates
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={sortResults}
                onChange={(e) => setSortResults(e.target.checked)}
                className="accent-primary h-3.5 w-3.5"
              />
              Sort results
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.99]"
        >
          Generate
        </button>

        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>

      {/* Result display */}
      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          {results.length === 1 ? (
            <div
              key={genKey}
              className="flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300"
            >
              <span className="text-6xl font-bold tabular-nums text-foreground dark:text-emerald-500">
                {results[0]}
              </span>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {results.map((n, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm font-mono tabular-nums"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Coin result */}
      {coinResult && (
        <div
          key={`coin-${genKey}`}
          className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-2 animate-in fade-in duration-300"
        >
          <span className="text-4xl">&#x1FA99;</span>
          <span className="text-3xl font-bold text-foreground">{coinResult}</span>
        </div>
      )}

      {/* Dice result */}
      {diceResults && (
        <div
          key={`dice-${genKey}`}
          className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-2 animate-in fade-in duration-300"
        >
          <span className="text-4xl">&#x1F3B2;</span>
          <div className="flex items-center gap-3">
            {diceResults.map((d, i) => (
              <span key={i} className="text-5xl font-bold tabular-nums text-foreground">
                {d}
              </span>
            ))}
          </div>
          {diceCount > 1 && (
            <span className="text-sm text-muted-foreground">
              Sum: {diceResults.reduce((a, b) => a + b, 0)}
            </span>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-medium">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={flipCoin}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:border-primary/40"
          >
            &#x1FA99; Flip a Coin
          </button>
          <button
            onClick={() => rollDice(1)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:border-primary/40"
          >
            &#x1F3B2; Roll a Die
          </button>
          <button
            onClick={() => rollDice(2)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:border-primary/40"
          >
            &#x1F3B2; Roll 2 Dice
          </button>
        </div>
      </div>
    </div>
  );
}
