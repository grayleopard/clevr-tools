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
    let cumContributions = P;

    for (let y = 1; y <= yrs; y++) {
      const startBalance = balance;
      let yearEarnings = 0;
      for (let m = 1; m <= 12; m++) {
        const interest = balance * r;
        balance += interest + PMT;
        yearEarnings += interest;
      }
      cumContributions += PMT * 12;
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
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-4">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-foreground dark:text-emerald-500">
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
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-foreground dark:text-emerald-500">
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
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Year</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Starting</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Contributions</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Earnings</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Ending</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearData.map((d) => (
                    <tr key={d.year} className="border-b border-border last:border-0">
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
    </div>
  );
}
