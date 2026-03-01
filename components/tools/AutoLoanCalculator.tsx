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

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84];

function calcMonthly(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function AutoLoanCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [tradeIn, setTradeIn] = useState("0");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState(60);

  const result = useMemo(() => {
    const price = parseFloat(vehiclePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const trade = parseFloat(tradeIn) || 0;
    const rate = parseFloat(interestRate) || 0;
    if (price <= 0) return null;

    const principal = Math.max(0, price - down - trade);
    if (principal <= 0) return null;

    const monthlyPayment = calcMonthly(principal, rate, loanTerm);
    const totalPaid = monthlyPayment * loanTerm;
    const totalInterest = totalPaid - principal;

    // Term comparison
    const comparison = TERM_OPTIONS.map((months) => {
      const mp = calcMonthly(principal, rate, months);
      const tp = mp * months;
      const ti = tp - principal;
      return { months, monthlyPayment: mp, totalPaid: tp, totalInterest: ti };
    });

    return { principal, monthlyPayment, totalPaid, totalInterest, comparison };
  }, [vehiclePrice, downPayment, tradeIn, interestRate, loanTerm]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Vehicle Price ($)
          </label>
          <input
            type="number"
            min="0"
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Down Payment ($)
          </label>
          <input
            type="number"
            min="0"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Trade-In Value ($)
          </label>
          <input
            type="number"
            min="0"
            value={tradeIn}
            onChange={(e) => setTradeIn(e.target.value)}
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
      </div>

      {/* Term selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Loan Term (months)
        </label>
        <div className="flex flex-wrap gap-2">
          {TERM_OPTIONS.map((months) => (
            <button
              key={months}
              onClick={() => setLoanTerm(months)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                loanTerm === months
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {months} mo
            </button>
          ))}
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
              <span className="text-sm font-semibold text-foreground">{fmt(result.principal)}</span>
              <span className="text-xs text-muted-foreground">Loan Amount</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalInterest)}</span>
              <span className="text-xs text-muted-foreground">Total Interest</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalPaid)}</span>
              <span className="text-xs text-muted-foreground">Total Cost</span>
            </div>
          </div>

          {/* Term comparison */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-primary/10">
              <span className="text-xs font-medium text-foreground">Term Comparison</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/10">
                  <th className="px-3 py-2 text-left text-xs font-medium text-foreground">Term</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Monthly</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Total Interest</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-foreground">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((c) => (
                  <tr
                    key={c.months}
                    className={`border-b border-border last:border-0 even:bg-muted/30 ${
                      c.months === loanTerm ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-foreground">
                      {c.months} mo
                      {c.months === loanTerm && (
                        <span className="ml-1.5 text-xs text-primary font-medium">selected</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(c.monthlyPayment)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(c.totalInterest)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmt(c.totalPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">What&apos;s a Good Interest Rate for a Car Loan?</h2>
          <p>
            Auto loan rates depend heavily on your credit score and the loan term. General ranges:
          </p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Credit Tier</th>
                  <th className="text-left p-2 font-medium">Credit Score</th>
                  <th className="text-left p-2 font-medium">Typical Rate Range</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Excellent", "720+", "4% - 6%"],
                  ["Good", "690-719", "6% - 8%"],
                  ["Fair", "630-689", "8% - 12%"],
                  ["Poor", "Below 630", "12% - 20%+"],
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
            These are approximations -- rates vary by lender, whether the car is new or used, and current
            market conditions. Credit unions often offer lower rates than dealerships. Getting pre-approved
            before visiting a dealer gives you negotiating power.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Loan Term Affects Total Cost</h2>
          <p>On a $35,000 vehicle at 6.5% interest:</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Term</th>
                  <th className="text-left p-2 font-medium">Monthly Payment</th>
                  <th className="text-left p-2 font-medium">Total Interest</th>
                  <th className="text-left p-2 font-medium">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["36 months", "$1,072", "$3,586", "$38,586"],
                  ["48 months", "$831", "$4,870", "$39,870"],
                  ["60 months", "$685", "$6,098", "$41,098"],
                  ["72 months", "$589", "$7,382", "$42,382"],
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
            Choosing 72 months instead of 36 cuts your payment by $483/month but costs $3,796 more in
            interest. More importantly, long-term loans increase the risk of being &quot;underwater&quot; -- owing
            more than the car is worth as it depreciates.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Case for a Down Payment</h2>
          <p>
            Making a down payment reduces your loan amount, which means lower monthly payments and less
            total interest. It also protects against depreciation -- new cars lose 15--20% of their value
            in the first year. With no down payment, you may owe more than the car is worth within months.
          </p>
          <p className="mt-3">
            A common guideline: put 20% down on a new car, 10% on a used car. Even if you finance the
            trade-in, factor in the net equity you&apos;re receiving.
          </p>
        </section>
      </div>
    </div>
  );
}
