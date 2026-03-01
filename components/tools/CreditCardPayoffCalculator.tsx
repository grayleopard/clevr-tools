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

function calcPayoff(balance: number, apr: number, monthlyPayment: number) {
  if (balance <= 0 || monthlyPayment <= 0) return null;
  const monthlyRate = apr / 100 / 12;
  const minInterest = balance * monthlyRate;
  if (monthlyPayment <= minInterest) return null; // will never pay off

  let remaining = balance;
  let totalInterest = 0;
  let months = 0;
  const MAX_MONTHS = 600;

  while (remaining > 0 && months < MAX_MONTHS) {
    const interest = remaining * monthlyRate;
    const principalPaid = Math.min(remaining, monthlyPayment - interest);
    remaining = Math.max(0, remaining - principalPaid);
    totalInterest += interest;
    months++;
  }

  return {
    months,
    totalInterest,
    totalPaid: balance + totalInterest,
  };
}

export default function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("22");
  const [monthlyPayment, setMonthlyPayment] = useState("200");

  const result = useMemo(() => {
    const bal = parseFloat(balance) || 0;
    const rate = parseFloat(apr) || 0;
    const pmt = parseFloat(monthlyPayment) || 0;
    return calcPayoff(bal, rate, pmt);
  }, [balance, apr, monthlyPayment]);

  const extras = useMemo(() => {
    const bal = parseFloat(balance) || 0;
    const rate = parseFloat(apr) || 0;
    const pmt = parseFloat(monthlyPayment) || 0;
    if (!result) return [];

    return [25, 50, 100].map((extra) => {
      const res = calcPayoff(bal, rate, pmt + extra);
      return {
        extra,
        result: res,
        monthsSaved: res ? result.months - res.months : 0,
        interestSaved: res ? result.totalInterest - res.totalInterest : 0,
      };
    });
  }, [balance, apr, monthlyPayment, result]);

  const formatMonths = (m: number) => {
    const years = Math.floor(m / 12);
    const months = m % 12;
    if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
    if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
    return `${years} yr${years !== 1 ? "s" : ""} ${months} mo`;
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Current Balance ($)
          </label>
          <input
            type="number"
            min="0"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            APR (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Monthly Payment ($)
          </label>
          <input
            type="number"
            min="0"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result ? (
        <>
          {/* Payoff time */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Time to Pay Off</p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground dark:text-emerald-500">
              {formatMonths(result.months)}
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(parseFloat(balance) || 0)}</span>
              <span className="text-xs text-muted-foreground">Balance</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalInterest)}</span>
              <span className="text-xs text-muted-foreground">Total Interest</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalPaid)}</span>
              <span className="text-xs text-muted-foreground">Total Paid</span>
            </div>
          </div>

          {/* What if you paid more */}
          {extras.length > 0 && extras[0].result && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/80">
                <span className="text-xs font-medium text-muted-foreground">
                  What If You Paid More?
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Extra/mo</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">New Payment</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Payoff Time</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Interest Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {extras.map((e) =>
                    e.result ? (
                      <tr key={e.extra} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-foreground">+{fmt(e.extra)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-foreground">
                          {fmt((parseFloat(monthlyPayment) || 0) + e.extra)}
                        </td>
                        <td className="px-3 py-2 text-right text-foreground">{formatMonths(e.result.months)}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {fmt(e.interestSaved)}
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        (parseFloat(balance) || 0) > 0 &&
        (parseFloat(monthlyPayment) || 0) > 0 && (
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-red-500">
              Monthly payment is too low to cover the interest. Increase your payment to make progress on the balance.
            </p>
          </div>
        )
      )}
    </div>
  );
}
