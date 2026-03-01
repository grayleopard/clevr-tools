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

interface YearData {
  year: number;
  startBalance: number;
  contributions: number;
  earnings: number;
  endBalance: number;
}

export default function InvestmentReturnCalculator() {
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [annualReturn, setAnnualReturn] = useState("8");
  const [years, setYears] = useState("20");
  const [showTable, setShowTable] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(initialInvestment) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const rate = parseFloat(annualReturn) || 0;
    const yrs = parseInt(years) || 0;
    if (yrs <= 0) return null;

    const r = rate / 100 / 12;
    let balance = P;
    const yearData: YearData[] = [];

    for (let y = 1; y <= yrs; y++) {
      const startBalance = balance;
      let yearEarnings = 0;
      for (let m = 1; m <= 12; m++) {
        const interest = balance * r;
        balance += interest + PMT;
        yearEarnings += interest;
      }
      yearData.push({
        year: y,
        startBalance,
        contributions: PMT * 12,
        earnings: yearEarnings,
        endBalance: balance,
      });
    }

    const totalContributions = P + PMT * yrs * 12;
    const totalEarnings = balance - totalContributions;

    return { finalBalance: balance, totalContributions, totalEarnings, yearData };
  }, [initialInvestment, monthlyContribution, annualReturn, years]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Initial Investment ($)</label>
          <input
            type="number"
            min="0"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Monthly Contribution ($)</label>
          <input
            type="number"
            min="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Annual Return (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Years</label>
          <input
            type="number"
            min="1"
            max="50"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Results */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 px-4 py-4">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-primary">
                {fmt(result.finalBalance)}
              </span>
              <span className="text-xs text-muted-foreground">Final Balance</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-4">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-foreground">
                {fmt(result.totalContributions)}
              </span>
              <span className="text-xs text-muted-foreground">Total Invested</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-4">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-primary">
                {fmt(result.totalEarnings)}
              </span>
              <span className="text-xs text-muted-foreground">Investment Gains</span>
            </div>
          </div>

          {/* Table toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {showTable ? "Hide Year-by-Year Table" : "Show Year-by-Year Table"}
          </button>

          {showTable && (
            <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-primary/10 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-foreground">Year</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Starting</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Contributions</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Earnings</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Ending</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearData.map((d) => (
                    <tr key={d.year} className="border-b border-border last:border-0 even:bg-muted/30">
                      <td className="px-3 py-2 text-foreground">{d.year}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(d.startBalance)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(d.contributions)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(d.earnings)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">{fmt(d.endBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Historical Stock Market Returns</h2>
          <p>
            The S&amp;P 500 has delivered an average annual return of approximately 10% nominal (7% after
            inflation) since 1926. However, individual years vary wildly: -38% in 2008, +32% in 2013,
            -18% in 2022, +26% in 2023. The &quot;average&quot; disguises dramatic year-to-year swings.
          </p>
          <p className="mt-3">
            This is why time in the market matters more than timing the market. Someone who missed the
            10 best trading days of each decade since 1980 would have returns dramatically below someone
            who stayed fully invested throughout.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Hidden Cost of Investment Fees</h2>
          <p>Investment fees compound just like returns do -- but against you.</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Annual Fee</th>
                  <th className="text-left p-2 font-medium">Balance After 30 Years (starting $100K at 7%)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0.05% (index fund)", "$761,000"],
                  ["0.5%", "$689,000"],
                  ["1.0%", "$574,000"],
                  ["1.5%", "$481,000"],
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
            A 1% annual fee on a $100K portfolio over 30 years costs over $187,000 in lost growth. Low-cost
            index funds and ETFs (expense ratios of 0.03--0.20%) leave dramatically more of your returns in
            your portfolio. See our{" "}
            <Link href="/calc/retirement" className="text-primary underline hover:no-underline">retirement calculator</Link>{" "}
            to model long-term growth.
          </p>
        </section>
      </div>
    </div>
  );
}
