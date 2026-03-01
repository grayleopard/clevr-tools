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

export default function CarPaymentCalculator() {
  const [carPrice, setCarPrice] = useState("30000");
  const [downPayment, setDownPayment] = useState("3000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTermMonths, setLoanTermMonths] = useState("60");

  const result = useMemo(() => {
    const price = parseFloat(carPrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseInt(loanTermMonths) || 0;
    if (price <= 0 || months <= 0) return null;

    const principal = Math.max(0, price - down);
    if (principal <= 0) return null;

    const r = rate / 100 / 12;
    let monthlyPayment: number;
    if (r === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    }

    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;
    const totalCost = totalPaid + down;

    return { principal, monthlyPayment, totalPaid, totalInterest, totalCost };
  }, [carPrice, downPayment, interestRate, loanTermMonths]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Car Price ($)</label>
          <input
            type="number"
            min="0"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Down Payment ($)</label>
          <input
            type="number"
            min="0"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
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
          <label className="block text-sm font-medium text-foreground mb-1">Loan Term (months)</label>
          <select
            value={loanTermMonths}
            onChange={(e) => setLoanTermMonths(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {[24, 36, 48, 60, 72, 84].map((m) => (
              <option key={m} value={m}>
                {m} months ({m / 12} years)
              </option>
            ))}
          </select>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.principal)}</span>
              <span className="text-xs text-muted-foreground">Loan Amount</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalInterest)}</span>
              <span className="text-xs text-muted-foreground">Total Interest</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalPaid)}</span>
              <span className="text-xs text-muted-foreground">Total Loan Paid</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalCost)}</span>
              <span className="text-xs text-muted-foreground">Total Cost</span>
            </div>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Much Car Can You Afford?</h2>
          <p>The 20/4/10 rule is a practical guideline:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Put at least 20% down</li>
            <li>Finance for no more than 4 years</li>
            <li>Keep total car costs (payment + insurance + gas + maintenance) under 10% of gross monthly income</li>
          </ul>
          <p className="mt-3">
            On a $60,000 gross annual salary ($5,000/month), that means total car costs under $500/month.
            If insurance and gas cost $250/month, your max payment would be $250.
          </p>
          <p className="mt-3">
            This rule is conservative -- many people spend more and manage fine. But stretching too far on
            a car (a depreciating asset) limits money available for savings and investments.
          </p>
          <p className="mt-3">
            For a more detailed calculation including trade-in value, sales tax, and payment comparisons
            across different loan terms, see our{" "}
            <Link href="/calc/auto-loan" className="text-primary underline hover:no-underline">auto loan calculator</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
