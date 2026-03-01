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
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground dark:text-emerald-500">
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
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Month</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Payment</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Principal</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Interest</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.month} className="border-b border-border last:border-0">
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
    </div>
  );
}
