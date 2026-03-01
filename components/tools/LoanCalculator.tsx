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
  balance: number;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("25000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTermYears, setLoanTermYears] = useState("5");
  const [showAllRows, setShowAllRows] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseFloat(loanTermYears) || 0;
    if (P <= 0 || years <= 0) return null;

    const r = annualRate / 100 / 12;
    const n = Math.round(years * 12);

    let monthlyPayment: number;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const schedule: AmortRow[] = [];
    let balance = P;
    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - P;

    return { monthlyPayment, totalPaid, totalInterest, schedule, n };
  }, [loanAmount, interestRate, loanTermYears]);

  const visibleRows = result
    ? showAllRows
      ? result.schedule
      : result.schedule.slice(0, 12)
    : [];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Loan Amount ($)
          </label>
          <input
            type="number"
            min="0"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Interest Rate (%)
          </label>
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
          <label className="block text-sm font-medium text-foreground mb-1">
            Loan Term (years)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
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
              {fmt(result.monthlyPayment)}
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(parseFloat(loanAmount) || 0)}</span>
              <span className="text-xs text-muted-foreground">Loan Amount</span>
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

          {/* Amortization schedule */}
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
                : `Show All ${result.n} Months`}
            </button>
          )}
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Loan Payments Are Calculated</h2>
          <p>
            The monthly payment formula is: M = P &times; [r(1+r)^n] / [(1+r)^n - 1]
          </p>
          <p className="mt-3">
            Where P is the principal, r is the monthly interest rate (annual rate / 12), and n is the
            total number of payments. This formula ensures the loan is exactly paid off with the final
            payment.
          </p>
          <p className="mt-3">
            In the early months of a loan, most of each payment goes toward interest. As the balance
            decreases, more of each payment reduces the principal. This is called amortization. Use our{" "}
            <Link href="/calc/amortization" className="text-primary underline hover:no-underline">amortization calculator</Link>{" "}
            to see the full month-by-month breakdown.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Interest Rate Affects Your Payment</h2>
          <p>On a $300,000 loan over 30 years:</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Interest Rate</th>
                  <th className="text-left p-2 font-medium">Monthly Payment</th>
                  <th className="text-left p-2 font-medium">Total Interest Paid</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["5%", "$1,610", "$279,767"],
                  ["6%", "$1,799", "$347,515"],
                  ["7%", "$1,996", "$418,527"],
                  ["8%", "$2,201", "$492,467"],
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
            Each 1% increase in rate adds roughly $190--$200/month and $70,000--$75,000 in total interest.
            This is why rate shopping matters -- even a 0.25% difference saves meaningful money over time.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Tips for Getting a Lower Interest Rate</h2>
          <p>
            A higher credit score is the single biggest factor. Lenders offer their best rates to borrowers
            with scores above 740--760. Even improving from 680 to 720 can save half a percentage point.
          </p>
          <p className="mt-3">
            Shop at least three lenders. Rates vary more than most borrowers realize, even for the same
            loan amount and credit profile. Pre-approval applications within a 45-day window count as one
            inquiry for credit scoring purposes.
          </p>
          <p className="mt-3">
            Consider paying points. One discount point costs 1% of the loan amount and typically reduces
            the rate by 0.25%. Do the math: if you plan to stay in the home long enough, it pays for itself.
          </p>
        </section>
      </div>
    </div>
  );
}
