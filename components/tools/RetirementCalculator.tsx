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

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [inflationRate, setInflationRate] = useState("3");
  const [showTable, setShowTable] = useState(false);

  const result = useMemo(() => {
    const age = parseInt(currentAge) || 0;
    const retAge = parseInt(retirementAge) || 0;
    const PV = parseFloat(currentSavings) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const rate = parseFloat(annualReturn) || 0;
    const inflation = parseFloat(inflationRate) || 0;

    const yearsToRetirement = retAge - age;
    if (yearsToRetirement <= 0) return null;

    const r = rate / 100 / 12;
    const n = yearsToRetirement * 12;

    // Project year by year
    const yearData: { year: number; age: number; balance: number; contributions: number; interest: number }[] = [];
    let balance = PV;
    let totalContributions = PV;

    for (let y = 1; y <= yearsToRetirement; y++) {
      let yearInterest = 0;
      for (let m = 1; m <= 12; m++) {
        const interest = balance * r;
        balance += interest + PMT;
        yearInterest += interest;
      }
      totalContributions += PMT * 12;
      yearData.push({
        year: y,
        age: age + y,
        balance,
        contributions: totalContributions,
        interest: yearInterest,
      });
    }

    const nominalValue = balance;
    const realValue = nominalValue / Math.pow(1 + inflation / 100, yearsToRetirement);
    const monthlyIncome4Percent = nominalValue * 0.04 / 12;
    const realMonthlyIncome = realValue * 0.04 / 12;
    const totalContributionsCalc = PV + PMT * n;
    const totalEarnings = nominalValue - totalContributionsCalc;

    return {
      nominalValue,
      realValue,
      monthlyIncome4Percent,
      realMonthlyIncome,
      totalContributionsCalc,
      totalEarnings,
      yearsToRetirement,
      yearData,
    };
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, inflationRate]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Current Age</label>
          <input
            type="number"
            min="18"
            max="100"
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Retirement Age</label>
          <input
            type="number"
            min="18"
            max="100"
            value={retirementAge}
            onChange={(e) => setRetirementAge(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
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
          <label className="block text-sm font-medium text-foreground mb-1">Inflation Rate (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={inflationRate}
            onChange={(e) => setInflationRate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Hero */}
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Projected Savings at Age {parseInt(retirementAge) || 0}
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {fmt(result.nominalValue)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {fmt(result.realValue)} in today&apos;s dollars
            </p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(result.totalContributionsCalc)}</span>
              <span className="text-xs text-muted-foreground">Total Invested</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-primary">{fmt(result.totalEarnings)}</span>
              <span className="text-xs text-muted-foreground">Investment Gains</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(result.monthlyIncome4Percent)}</span>
              <span className="text-xs text-muted-foreground">Monthly Income (4%)</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(result.realMonthlyIncome)}</span>
              <span className="text-xs text-muted-foreground">Real Monthly (4%)</span>
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-foreground">Age</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Contributions</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Year Interest</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearData.map((d) => (
                    <tr key={d.year} className="border-b border-border last:border-0 even:bg-muted/30">
                      <td className="px-3 py-2 text-foreground">{d.age}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(d.contributions)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(d.interest)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">{fmt(d.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            The 4% rule is a guideline suggesting you can withdraw 4% of your savings annually in retirement. This is an estimate, not financial advice.
          </p>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Much Should You Save for Retirement?</h2>
          <p>Fidelity&apos;s benchmarks (based on maintaining your current lifestyle in retirement):</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Age</th>
                  <th className="text-left p-2 font-medium">Savings Target</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["30", "1x your annual salary"],
                  ["40", "3x your annual salary"],
                  ["50", "6x your annual salary"],
                  ["60", "8x your annual salary"],
                  ["67", "10x your annual salary"],
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
            These are targets, not minimums. Your actual need depends on your expected expenses, Social
            Security benefits, any pension income, and how early you want to retire.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Why Starting Early Matters More Than Saving More</h2>
          <p>
            Consider two people, both earning $70,000/year and saving $500/month at 7% annual returns:
          </p>
          <p className="mt-3">
            Person A starts at age 25 and stops at 65 (40 years): ends with ~$1.32M
          </p>
          <p className="mt-1">
            Person B starts at age 35 and stops at 65 (30 years): ends with ~$606K
          </p>
          <p className="mt-3">
            Person A contributed only $60,000 more over their lifetime but ends up with $714,000 more.
            That&apos;s the power of compound growth over time. Use our{" "}
            <Link href="/calc/investment-return" className="text-primary underline hover:no-underline">investment return calculator</Link>{" "}
            to model your own scenario.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The 4% Rule</h2>
          <p>
            The 4% rule, from the Trinity Study, suggests you can withdraw 4% of your portfolio in your
            first year of retirement and adjust for inflation each year, with historically high probability
            of not running out of money over 30 years.
          </p>
          <p className="mt-3">
            For example: a $1M portfolio would generate $40,000/year in initial withdrawals, or about
            $3,333/month. The calculator above uses this rule to estimate your monthly retirement income.
          </p>
          <p className="mt-3">
            Some planners now suggest 3--3.5% for longer retirements or low-yield environments. The 4%
            figure is a useful starting benchmark, not a guarantee.
          </p>
        </section>
      </div>
    </div>
  );
}
