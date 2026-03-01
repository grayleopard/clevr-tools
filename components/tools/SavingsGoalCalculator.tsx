"use client";

import { useState, useMemo } from "react";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SavingsGoalCalculator() {
  const [goalAmount, setGoalAmount] = useState("20000");
  const [currentSavings, setCurrentSavings] = useState("2000");
  const [annualRate, setAnnualRate] = useState("4.5");
  const [timelineMonths, setTimelineMonths] = useState("24");

  const result = useMemo(() => {
    const FV = parseFloat(goalAmount) || 0;
    const PV = parseFloat(currentSavings) || 0;
    const rate = parseFloat(annualRate) || 0;
    const n = parseInt(timelineMonths) || 0;
    if (FV <= 0 || n <= 0) return null;

    const r = rate / 100 / 12;

    let monthlyNeeded: number;
    if (r === 0) {
      monthlyNeeded = (FV - PV) / n;
    } else {
      const compound = Math.pow(1 + r, n);
      const futureCurrentSavings = PV * compound;
      const remaining = FV - futureCurrentSavings;
      if (remaining <= 0) {
        monthlyNeeded = 0;
      } else {
        monthlyNeeded = (remaining * r) / (compound - 1);
      }
    }

    const totalContributions = Math.max(0, monthlyNeeded) * n;
    const interestEarned = FV - PV - totalContributions;

    return {
      monthlyNeeded: Math.max(0, monthlyNeeded),
      totalContributions,
      interestEarned: Math.max(0, interestEarned),
      weeklyNeeded: Math.max(0, monthlyNeeded) * 12 / 52,
      biweeklyNeeded: Math.max(0, monthlyNeeded) * 12 / 26,
    };
  }, [goalAmount, currentSavings, annualRate, timelineMonths]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Savings Goal ($)
          </label>
          <input
            type="number"
            min="0"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Current Savings ($)
          </label>
          <input
            type="number"
            min="0"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Timeline (months)
          </label>
          <input
            type="number"
            min="1"
            max="600"
            value={timelineMonths}
            onChange={(e) => setTimelineMonths(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Monthly needed */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Monthly Savings Needed</p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground dark:text-emerald-500">
              {fmt(result.monthlyNeeded)}
            </p>
          </div>

          {/* Other frequencies */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(result.weeklyNeeded)}</span>
              <span className="text-xs text-muted-foreground">Per Week</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(result.biweeklyNeeded)}</span>
              <span className="text-xs text-muted-foreground">Bi-Weekly</span>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(parseFloat(goalAmount) || 0)}</span>
              <span className="text-xs text-muted-foreground">Goal</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalContributions)}</span>
              <span className="text-xs text-muted-foreground">Total Contributions</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground dark:text-emerald-500">{fmt(result.interestEarned)}</span>
              <span className="text-xs text-muted-foreground">Interest Earned</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
