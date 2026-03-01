"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Monthly Savings Needed</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
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
              <span className="text-sm font-semibold text-primary">{fmt(result.interestEarned)}</span>
              <span className="text-xs text-muted-foreground">Interest Earned</span>
            </div>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Building a Savings Plan That Works</h2>
          <p>The most effective savings systems share a few traits:</p>
          <p className="mt-3">
            <strong className="text-foreground">Automate it.</strong> Transfer funds to savings on the same day as your paycheck. You can&apos;t spend
            what you don&apos;t see. Most banks let you set up recurring automatic transfers.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Use a high-yield savings account.</strong> As of 2025, many online banks and credit unions offer
            4--5% APY on savings accounts. Traditional brick-and-mortar banks often offer 0.01--0.1%.
            This difference compounds significantly over time. For a $20,000 emergency fund, the
            difference is $800--$1,000 per year in interest.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Set specific goals, not vague intentions.</strong> &quot;Save $10,000 by December&quot; is more effective
            than &quot;save more money.&quot; The calculator above shows exactly what monthly contribution you need.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Emergency Fund</h2>
          <p>
            Financial advisors typically recommend 3--6 months of essential expenses (housing, food,
            utilities, transportation, minimum debt payments) in an accessible, liquid account. This
            provides a buffer against job loss, medical expenses, or unexpected repairs without resorting
            to high-interest credit card debt.
          </p>
          <p className="mt-3">
            If you have variable income or work in a cyclical industry, aim for 6--12 months. Use the
            calculator above to set a savings goal and see how long it will take to reach it. Once your
            emergency fund is complete, redirect those monthly contributions toward{" "}
            <Link href="/calc/retirement" className="text-primary underline hover:no-underline">retirement savings</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
