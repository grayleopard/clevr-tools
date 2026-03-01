"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
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
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Down Payment Goal ({downPaymentPercent}%)
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {fmt(result.goal)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {result.remaining > 0
                ? `${fmt(result.remaining)} remaining -- ${formatMonths(result.monthsNeeded)} to goal`
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
            <div className="px-4 py-2.5 border-b border-border bg-primary/10">
              <span className="text-xs font-medium text-foreground">Down Payment Comparison</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/10">
                  <th className="px-3 py-2 text-left text-xs font-medium text-foreground">Down %</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Loan</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Time to Save</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-foreground">PMI</th>
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((c) => (
                  <tr
                    key={c.percent}
                    className={`border-b border-border last:border-0 even:bg-muted/30 ${
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

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Down Payment Requirements by Loan Type</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Loan Type</th>
                  <th className="text-left p-2 font-medium">Minimum Down</th>
                  <th className="text-left p-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Conventional", "3% - 20%", "<20% requires PMI"],
                  ["FHA", "3.5%", "Credit score 580+; 10% if below 580"],
                  ["VA", "0%", "Military/veterans only"],
                  ["USDA", "0%", "Rural areas; income limits apply"],
                  ["Jumbo", "10%-20%", "Loans above conforming limits"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    {row.map((cell, j) => (
                      <td key={j} className="p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            PMI (private mortgage insurance) is required on conventional loans with less than 20% down.
            It typically costs 0.5--1.5% of the loan amount annually. On a $400,000 loan, that&apos;s
            $2,000--$6,000 per year until you reach 20% equity.
          </p>
          <p className="mt-3">
            The PMI cost often makes reaching 20% down worth pursuing -- but if it delays buying by
            years while rents and home prices rise, the math may favor buying sooner with less down.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Down Payment Assistance Programs</h2>
          <p>
            First-time buyers shouldn&apos;t overlook assistance programs. Most states have:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Down payment assistance grants (free money, not repaid)</li>
            <li>Soft second mortgages (deferred or forgivable loans)</li>
            <li>Below-market interest rate programs</li>
          </ul>
          <p className="mt-3">
            Search &quot;[your state] down payment assistance&quot; or visit the HUD website for a directory.
            Income limits apply, but many programs extend to moderate-income buyers. Once you know
            your target down payment, use our{" "}
            <Link href="/calc/loan" className="text-primary underline hover:no-underline">loan calculator</Link>{" "}
            and{" "}
            <Link href="/calc/amortization" className="text-primary underline hover:no-underline">amortization calculator</Link>{" "}
            to model the full picture.
          </p>
        </section>
      </div>
    </div>
  );
}
