"use client";

import { useState, useMemo } from "react";

const TIP_PRESETS = [10, 15, 18, 20, 25];

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("18");
  const [split, setSplit] = useState("1");

  const result = useMemo(() => {
    const billAmt = parseFloat(bill) || 0;
    const tipPct = parseFloat(tipPercent) || 0;
    const splitNum = Math.max(1, parseInt(split) || 1);

    if (billAmt <= 0) return null;

    const tipAmount = billAmt * (tipPct / 100);
    const total = billAmt + tipAmount;
    const perPerson = splitNum > 1 ? total / splitNum : null;

    return { tipAmount, total, perPerson, splitNum };
  }, [bill, tipPercent, split]);

  return (
    <div className="space-y-6">
      {/* Bill amount */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Bill Amount ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Tip preset buttons */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tip Percentage
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {TIP_PRESETS.map((pct) => (
            <button
              key={pct}
              onClick={() => setTipPercent(pct.toString())}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tipPercent === pct.toString()
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
        <input
          type="number"
          min="0"
          max="100"
          value={tipPercent}
          onChange={(e) => setTipPercent(e.target.value)}
          placeholder="Custom %"
          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Split */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Split Between
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={split}
          onChange={(e) => setSplit(e.target.value)}
          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <span className="text-sm text-muted-foreground ml-2">
          {parseInt(split) === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tip</span>
            <span className="text-xl font-semibold text-foreground dark:text-emerald-500">
              {fmt(result.tipAmount)}
            </span>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-2xl font-bold text-foreground dark:text-emerald-500">
              {fmt(result.total)}
            </span>
          </div>
          {result.perPerson !== null && (
            <>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Per person ({result.splitNum})
                </span>
                <span className="text-xl font-semibold text-foreground dark:text-emerald-500">
                  {fmt(result.perPerson)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
