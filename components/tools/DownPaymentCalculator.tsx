"use client";

import { useState, useMemo } from "react";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const DP_PERCENTAGES = [5, 10, 15, 20, 25];

export default function DownPaymentCalculator() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [currentSavings, setCurrentSavings] = useState("20000");
  const [monthlySavings, setMonthlySavings] = useState("1500");

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const current = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlySavings) || 0;
    if (price <= 0) return null;

    const goal = price * downPaymentPercent / 100;
    const remaining = Math.max(0, goal - current);
    const monthsNeeded = monthly > 0 ? Math.ceil(remaining / monthly) : remaining > 0 ? Infinity : 0;

    // Comparison table
    const comparison = DP_PERCENTAGES.map((pct) => {
      const dpAmount = price * pct / 100;
      const rem = Math.max(0, dpAmount - current);
      const months = monthly > 0 ? Math.ceil(rem / monthly) : rem > 0 ? Infinity : 0;
      const loanAmount = price - dpAmount;
      const needsPMI = pct < 20;
      return { percent: pct, amount: dpAmount, remaining: rem, months, loanAmount, needsPMI };
    });

    return { goal, remaining, monthsNeeded, comparison, loanAmount: price - goal };
  }, [homePrice, downPaymentPercent, currentSavings, monthlySavings]);

  const formatMonths = (m: number) => {
    if (m === Infinity) return "N/A";
    if (m === 0) return "Ready!";
    const years = Math.floor(m / 12);
    const months = m % 12;
    if (years === 0) return `${months} mo`;
    if (months === 0) return `${years} yr`;
    return `${years} yr ${months} mo`;
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Home Price ($)</label>
          <input
            type="number"
            min="0"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Down Payment %</label>
          <div className="flex flex-wrap gap-2">
            {DP_PERCENTAGES.map((pct) => (
              <button
                key={pct}
                onClick={() => setDownPaymentPercent(pct)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  downPaymentPercent === pct
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Current Savings ($)</label>
          <input
            type="number"
            min="0"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Monthly Savings ($)</label>
          <input
            type="number"
            min="0"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Goal */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Down Payment Goal ({downPaymentPercent}%)
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground dark:text-emerald-500">
              {fmt(result.goal)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {result.remaining > 0
                ? `${fmt(result.remaining)} remaining — ${formatMonths(result.monthsNeeded)} to goal`
                : "You have enough saved!"}
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.goal)}</span>
              <span className="text-xs text-muted-foreground">Down Payment</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.loanAmount)}</span>
              <span className="text-xs text-muted-foreground">Loan Amount</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">
                {downPaymentPercent < 20 ? "Yes" : "No"}
              </span>
              <span className="text-xs text-muted-foreground">PMI Required</span>
            </div>
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/80">
              <span className="text-xs font-medium text-muted-foreground">Down Payment Comparison</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Down %</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Loan</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Time to Save</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">PMI</th>
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((c) => (
                  <tr
                    key={c.percent}
                    className={`border-b border-border last:border-0 ${
                      c.percent === downPaymentPercent ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-foreground">
                      {c.percent}%
                      {c.percent === downPaymentPercent && (
                        <span className="ml-1.5 text-xs text-primary font-medium">selected</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(c.amount)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(c.loanAmount)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatMonths(c.months)}</td>
                    <td className="px-3 py-2 text-center">
                      {c.needsPMI ? (
                        <span className="text-yellow-600 dark:text-yellow-400 text-xs">Yes</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
