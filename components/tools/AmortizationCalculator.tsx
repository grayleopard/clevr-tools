"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TipJar } from "@/components/tool/TipJar";
import { CalculatorEmptyState } from "@/components/tool/CalculatorEmptyState";
import { calculateFixedRateAmortization } from "@/lib/p1-remediation/finance";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
    const n = Math.round(years * 12);
    const calculation = calculateFixedRateAmortization(
      P,
      annualRate,
      n,
      extra
    );
    if (!calculation) {
      return { ok: false as const, emptyMessage: "Enter a loan amount and term to see your amortization schedule." };
    }

    return {
      ok: true as const,
      basePayment: calculation.basePayment,
      baseTotalPaid: calculation.totalWithoutExtra,
      baseTotalInterest: calculation.interestWithoutExtra,
      extraPayment: extra,
      scheduledPayment: calculation.basePayment + extra,
      totalPaidWith: calculation.totalWithExtra,
      totalInterestWith: calculation.interestWithExtra,
      interestSaved: calculation.interestSaved,
      monthsSaved: calculation.monthsSaved,
      schedule: calculation.schedule,
      originalMonths: calculation.originalMonths,
      actualMonths: calculation.actualMonths,
      finalPayment: calculation.schedule.at(-1)?.payment ?? 0,
    };
  }, [loanAmount, interestRate, loanTermYears, extraPayment]);

  const visibleRows = result?.ok
    ? showAllRows
      ? result.schedule
      : result.schedule.slice(0, 12)
    : [];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="loan-amount" className="block text-sm font-medium text-foreground mb-1">Loan Amount ($)</label>
          <input
            id="loan-amount"
            type="number"
            min="0"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="interest-rate" className="block text-sm font-medium text-foreground mb-1">Interest Rate (%)</label>
          <input
            id="interest-rate"
            type="number"
            min="0"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="loan-term-years" className="block text-sm font-medium text-foreground mb-1">Loan Term (years)</label>
          <input
            id="loan-term-years"
            type="number"
            min="1"
            max="50"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="extra-monthly-payment" className="block text-sm font-medium text-foreground mb-1">Extra Monthly Payment ($)</label>
          <input
            id="extra-monthly-payment"
            type="number"
            min="0"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && !result.ok && <CalculatorEmptyState message={result.emptyMessage} />}

      {result?.ok && (
        <>
          <section
            aria-labelledby="amortization-summary-heading"
            className="rounded-xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Payment plan summary</p>
              <h2 id="amortization-summary-heading" className="mt-2 text-xl font-bold tracking-tight text-foreground">
                See the cost and payoff impact of extra payments
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {result.extraPayment > 0
                  ? `${fmt(result.extraPayment)} extra each month shortens the payoff timeline by ${result.monthsSaved} months.`
                  : "Compare the base plan with an accelerated payoff by adding an extra monthly payment above."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-muted/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Base plan</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                  {fmt(result.basePayment)} <span className="text-sm font-medium text-muted-foreground">/ month</span>
                </p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Payoff</dt>
                    <dd className="font-medium tabular-nums text-foreground">Month {result.originalMonths}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Total interest</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(result.baseTotalInterest)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Total paid</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(result.baseTotalPaid)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg bg-primary/5 p-5 ring-1 ring-primary/15">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {result.extraPayment > 0 ? "With extra payment" : "Selected plan"}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-primary">
                  {fmt(result.scheduledPayment)} <span className="text-sm font-medium text-muted-foreground">/ month</span>
                </p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Payoff</dt>
                    <dd className="font-medium tabular-nums text-foreground">Month {result.actualMonths} of {result.originalMonths}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Total interest</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(result.totalInterestWith)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Total paid</dt>
                    <dd className="font-medium tabular-nums text-foreground">{fmt(result.totalPaidWith)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Interest saved</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-300">
                  {result.interestSaved > 0 ? `${fmt(result.interestSaved)} saved` : "No reduction"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Compared with the base plan</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Final payment</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{fmt(result.finalPayment)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Due in month {result.actualMonths}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Time saved</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{result.monthsSaved > 0 ? `${result.monthsSaved} months` : "None"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Calendar date needs a start date</p>
              </div>
            </div>

            <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              Assumption: monthly values use full-precision math and the final payment is adjusted to clear the remaining balance; lender statements may differ slightly when payments are rounded to cents.
            </p>
          </section>

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

      <TipJar />

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
            The schedule above calculates that split for every month using your loan amount, rate,
            term, and extra payment. Compare the first and final rows to see how the interest share
            falls as the remaining principal declines.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Power of Extra Payments</h2>
          <p>
            Add an amount in the &quot;Extra Monthly Payment&quot; field to compare the selected plan
            with the base schedule. The summary reports the calculated interest and time saved for
            those inputs rather than relying on a generic example.
          </p>
          <p className="mt-3">
            The key insight: extra payments reduce the balance faster, which means less interest
            accrues each month, which means future payments pay down principal even faster — a
            compounding benefit that works in your favor. See also our{" "}
            <Link href="/calc/loan" className="text-primary underline hover:no-underline">loan calculator</Link>{" "}
            for a simpler view of your base payment.
          </p>
        </section>
      </div>
    </div>
  );
}
