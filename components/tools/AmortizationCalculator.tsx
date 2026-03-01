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

interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPmt: number;
  balance: number;
}

export default function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTermYears, setLoanTermYears] = useState("30");
  const [extraPayment, setExtraPayment] = useState("0");
  const [showAllRows, setShowAllRows] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseFloat(loanTermYears) || 0;
    const extra = parseFloat(extraPayment) || 0;
    if (P <= 0 || years <= 0) return null;

    const r = annualRate / 100 / 12;
    const n = Math.round(years * 12);

    let basePayment: number;
    if (r === 0) {
      basePayment = P / n;
    } else {
      basePayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    // Without extra payments
    const totalWithout = basePayment * n;
    const interestWithout = totalWithout - P;

    // With extra payments
    const schedule: AmortRow[] = [];
    let balance = P;
    let totalInterestWith = 0;
    let totalPaidWith = 0;
    let month = 0;

    while (balance > 0 && month < n + 120) {
      month++;
      const interestPayment = balance * r;
      let principalPayment = basePayment - interestPayment;
      let actualExtra = Math.min(extra, balance - principalPayment);
      if (principalPayment > balance) {
        principalPayment = balance;
        actualExtra = 0;
      }
      balance = Math.max(0, balance - principalPayment - actualExtra);
      totalInterestWith += interestPayment;
      totalPaidWith += basePayment + actualExtra;

      schedule.push({
        month,
        payment: basePayment + actualExtra,
        principal: principalPayment + actualExtra,
        interest: interestPayment,
        extraPmt: actualExtra,
        balance,
      });

      if (balance <= 0) break;
    }

    const interestSaved = interestWithout - totalInterestWith;
    const monthsSaved = n - month;

    return {
      basePayment,
      totalWithout,
      interestWithout,
      totalPaidWith,
      totalInterestWith,
      interestSaved,
      monthsSaved,
      schedule,
      originalMonths: n,
      actualMonths: month,
    };
  }, [loanAmount, interestRate, loanTermYears, extraPayment]);

  const visibleRows = result
    ? showAllRows
      ? result.schedule
      : result.schedule.slice(0, 12)
    : [];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loan Amount ($)</label>
          <input
            type="number"
            min="0"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Interest Rate (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loan Term (years)</label>
          <input
            type="number"
            min="1"
            max="50"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Extra Monthly Payment ($)</label>
          <input
            type="number"
            min="0"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Monthly payment */}
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {fmt(result.basePayment + (parseFloat(extraPayment) || 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {fmt(result.basePayment)} base{(parseFloat(extraPayment) || 0) > 0 && ` + ${fmt(parseFloat(extraPayment) || 0)} extra`}
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalInterestWith)}</span>
              <span className="text-xs text-muted-foreground">Total Interest</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalPaidWith)}</span>
              <span className="text-xs text-muted-foreground">Total Paid</span>
            </div>
            {result.interestSaved > 0 && (
              <>
                <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(result.interestSaved)}</span>
                  <span className="text-xs text-muted-foreground">Interest Saved</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{result.monthsSaved} mo</span>
                  <span className="text-xs text-muted-foreground">Time Saved</span>
                </div>
              </>
            )}
          </div>

          {/* Amortization table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-primary/10 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-foreground">Month</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Payment</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Principal</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Interest</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-b border-border last:border-0 even:bg-muted/30">
                      <td className="px-3 py-2 text-foreground">{row.month}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.payment)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row.principal)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(row.interest)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(Math.max(0, row.balance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.schedule.length > 12 && (
            <button
              onClick={() => setShowAllRows(!showAllRows)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {showAllRows
                ? "Show First 12 Months"
                : `Show All ${result.actualMonths} Months`}
            </button>
          )}
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Amortization Works</h2>
          <p>
            Every payment on a fixed-rate amortizing loan is the same dollar amount, but the split
            between principal and interest changes over time. Early payments are mostly interest;
            later payments are mostly principal.
          </p>
          <p className="mt-3">
            Example: On a $300,000, 30-year mortgage at 7%, your monthly payment is $1,996.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Month 1: $1,750 goes to interest, $246 to principal</li>
            <li>Month 180 (year 15): $1,340 to interest, $656 to principal</li>
            <li>Month 360 (final): $12 to interest, $1,984 to principal</li>
          </ul>
          <p className="mt-3">
            By year 15, you&apos;ve paid approximately 45% of your total lifetime interest but reduced
            your principal by only about 20%. This front-loading of interest is why extra early
            payments save so much money.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Power of Extra Payments</h2>
          <p>On a $300,000, 30-year, 7% mortgage (monthly payment: $1,996):</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Extra Monthly Payment</th>
                  <th className="text-left p-2 font-medium">Interest Saved</th>
                  <th className="text-left p-2 font-medium">Years Saved</th>
                  <th className="text-left p-2 font-medium">Payoff Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["$0 (baseline)", "--", "--", "30 years"],
                  ["$100/month", "~$47,000", "~3 years", "~27 years"],
                  ["$200/month", "~$89,000", "~6 years", "~24 years"],
                  ["$500/month", "~$175,000", "~12 years", "~18 years"],
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
            Even $100 extra per month saves meaningful money over the life of the loan. Use the
            &quot;Extra Monthly Payment&quot; field in the calculator above to see your specific numbers.
          </p>
          <p className="mt-3">
            The key insight: extra payments reduce the balance faster, which means less interest
            accrues each month, which means future payments pay down principal even faster -- a
            compounding benefit that works in your favor. See also our{" "}
            <Link href="/calc/loan" className="text-primary underline hover:no-underline">loan calculator</Link>{" "}
            for a simpler view of your base payment.
          </p>
        </section>
      </div>
    </div>
  );
}
