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
  yearStart: number;
  yearContributions: number;
  yearInterest: number;
  balance: number;
}

function simulate(
  P: number,
  monthlyPMT: number,
  annualRate: number,
  years: number
): YearData[] {
  const monthlyRate = annualRate / 100 / 12;
  let balance = P;
  const yearData: YearData[] = [];

  for (let year = 1; year <= years; year++) {
    const yearStart = balance;
    let yearContributions = 0;
    let yearInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interest = balance * monthlyRate;
      balance += interest + monthlyPMT;
      yearContributions += monthlyPMT;
      yearInterest += interest;
    }

    yearData.push({ year, yearStart, yearContributions, yearInterest, balance });
  }

  return yearData;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [annualRate, setAnnualRate] = useState("7");
  const [years, setYears] = useState("10");
  const [showTable, setShowTable] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const rate = parseFloat(annualRate) || 0;
    const yrs = parseInt(years) || 0;

    if (yrs <= 0) return null;

    const yearData = simulate(p, pmt, rate, yrs);
    const finalBalance = yearData[yearData.length - 1]?.balance ?? p;
    const totalContributions = p + pmt * yrs * 12;
    const totalInterest = finalBalance - totalContributions;

    return { yearData, finalBalance, totalContributions, totalInterest };
  }, [principal, monthlyContribution, annualRate, years]);

  // SVG chart
  const chartHeight = 200;
  const chartWidth = 600;

  const chartData = useMemo(() => {
    if (!result || result.yearData.length === 0) return null;

    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const maxBalance = result.finalBalance;
    if (maxBalance <= 0) return null;

    const points = result.yearData.map((d, i) => {
      const x = ((i + 1) / result.yearData.length) * chartWidth;
      const balanceY = chartHeight - (d.balance / maxBalance) * chartHeight;
      const contribTotal = p + pmt * (i + 1) * 12;
      const contribY = chartHeight - (contribTotal / maxBalance) * chartHeight;
      return { x, balanceY, contribY };
    });

    // Build SVG paths
    const balancePath = `M0,${chartHeight} L0,${chartHeight} ${points.map((p) => `L${p.x},${p.balanceY}`).join(" ")} L${chartWidth},${chartHeight} Z`;
    const contribPath = `M0,${chartHeight} L0,${chartHeight} ${points.map((p) => `L${p.x},${p.contribY}`).join(" ")} L${chartWidth},${chartHeight} Z`;

    return { points, balancePath, contribPath };
  }, [result, principal, monthlyContribution]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            min="0"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            min="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Annual Return Rate (%)
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
            Years
          </label>
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
              <span className="text-xs text-muted-foreground">
                Final Balance
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-4">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-foreground">
                {fmt(result.totalContributions)}
              </span>
              <span className="text-xs text-muted-foreground">
                Total Contributions
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-4">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-foreground dark:text-emerald-500">
                {fmt(result.totalInterest)}
              </span>
              <span className="text-xs text-muted-foreground">
                Interest Earned
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          {chartData && (
            <div className="rounded-xl border border-border bg-card p-4">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-48"
                preserveAspectRatio="none"
              >
                {/* Balance area */}
                <path
                  d={chartData.balancePath}
                  className="fill-emerald-500/20 dark:fill-emerald-500/30"
                />
                {/* Contributions area */}
                <path
                  d={chartData.contribPath}
                  className="fill-primary/30 dark:fill-blue-500/30"
                />
              </svg>
              <div className="flex justify-center gap-6 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary/30 dark:bg-blue-500/30" />
                  Contributions
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/20 dark:bg-emerald-500/30" />
                  Interest
                </span>
              </div>
            </div>
          )}

          {/* Table toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {showTable
              ? "Hide Year-by-Year Table"
              : "Show Year-by-Year Table"}
          </button>

          {showTable && (
            <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Year
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Starting
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Contributions
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Interest
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Ending
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearData.map((d) => (
                    <tr
                      key={d.year}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-3 py-2 text-foreground">{d.year}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">
                        {fmt(d.yearStart)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">
                        {fmt(d.yearContributions)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {fmt(d.yearInterest)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                        {fmt(d.balance)}
                      </td>
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
