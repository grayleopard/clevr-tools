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
  balance: number;
}

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [downPaymentMode, setDownPaymentMode] = useState<"percent" | "amount">(
    "percent"
  );
  const [downPaymentAmount, setDownPaymentAmount] = useState("80000");
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState("6.5");
  const [propertyTax, setPropertyTax] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [pmiRate, setPmiRate] = useState("0.5");
  const [showAmortization, setShowAmortization] = useState(false);

  const result = useMemo(() => {
    const hp = parseFloat(homePrice) || 0;
    if (hp <= 0) return null;

    const downAmt =
      downPaymentMode === "percent"
        ? hp * ((parseFloat(downPaymentPercent) || 0) / 100)
        : parseFloat(downPaymentAmount) || 0;

    const downPct = (downAmt / hp) * 100;
    const principal = hp - downAmt;
    if (principal <= 0) return null;

    const annualRate = parseFloat(interestRate) || 0;
    const monthlyRate = annualRate / 100 / 12;
    const n = loanTerm * 12;

    let monthlyPI: number;
    if (monthlyRate === 0) {
      monthlyPI = principal / n;
    } else {
      monthlyPI =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);
    }

    const monthlyTax = (parseFloat(propertyTax) || 0) / 12;
    const monthlyInsurance = (parseFloat(insurance) || 0) / 12;
    const monthlyPMI =
      downPct < 20 ? (principal * ((parseFloat(pmiRate) || 0) / 100)) / 12 : 0;

    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;
    const totalInterest = monthlyPI * n - principal;
    const totalCost = principal + totalInterest;

    // Amortization schedule
    const schedule: AmortRow[] = [];
    let balance = principal;
    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPI - interestPayment;
      balance = Math.max(0, balance - principalPayment);
      schedule.push({
        month,
        payment: monthlyPI,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    return {
      principal,
      downAmt,
      downPct,
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      monthlyPMI,
      totalMonthly,
      totalInterest,
      totalCost,
      schedule,
    };
  }, [
    homePrice,
    downPaymentPercent,
    downPaymentMode,
    downPaymentAmount,
    loanTerm,
    interestRate,
    propertyTax,
    insurance,
    pmiRate,
  ]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Home Price ($)
          </label>
          <input
            type="number"
            min="0"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Down Payment
            <button
              onClick={() =>
                setDownPaymentMode((m) =>
                  m === "percent" ? "amount" : "percent"
                )
              }
              className="ml-2 text-xs text-primary hover:underline"
            >
              Switch to {downPaymentMode === "percent" ? "$" : "%"}
            </button>
          </label>
          {downPaymentMode === "percent" ? (
            <input
              type="number"
              min="0"
              max="100"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(e.target.value)}
              placeholder="20%"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          ) : (
            <input
              type="number"
              min="0"
              value={downPaymentAmount}
              onChange={(e) => setDownPaymentAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Loan Term
          </label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(parseInt(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {[10, 15, 20, 25, 30].map((y) => (
              <option key={y} value={y}>
                {y} years
              </option>
            ))}
          </select>
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
            Property Tax ($/year)
          </label>
          <input
            type="number"
            min="0"
            value={propertyTax}
            onChange={(e) => setPropertyTax(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Insurance ($/year)
          </label>
          <input
            type="number"
            min="0"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {result && result.downPct < 20 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              PMI Rate (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={pmiRate}
              onChange={(e) => setPmiRate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Monthly payment */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Monthly Payment
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground dark:text-emerald-500">
              {fmt(result.totalMonthly)}
            </p>
          </div>

          {/* Payment breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {fmt(result.monthlyPI)}
              </span>
              <span className="text-xs text-muted-foreground">P&I</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {fmt(result.monthlyTax)}
              </span>
              <span className="text-xs text-muted-foreground">Tax</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {fmt(result.monthlyInsurance)}
              </span>
              <span className="text-xs text-muted-foreground">Insurance</span>
            </div>
            {result.monthlyPMI > 0 && (
              <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {fmt(result.monthlyPMI)}
                </span>
                <span className="text-xs text-muted-foreground">PMI</span>
              </div>
            )}
          </div>

          {/* Loan summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">
                {fmt(result.principal)}
              </span>
              <span className="text-xs text-muted-foreground">Loan Amount</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">
                {fmt(result.totalInterest)}
              </span>
              <span className="text-xs text-muted-foreground">
                Total Interest
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">
                {fmt(result.totalCost)}
              </span>
              <span className="text-xs text-muted-foreground">Total Cost</span>
            </div>
          </div>

          {/* Amortization toggle */}
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {showAmortization
              ? "Hide Amortization Schedule"
              : "Show Amortization Schedule"}
          </button>

          {showAmortization && (
            <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Year
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Principal
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Interest
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: loanTerm }, (_, yearIdx) => {
                    const yearRows = result.schedule.slice(
                      yearIdx * 12,
                      (yearIdx + 1) * 12
                    );
                    const yearPayment = yearRows.reduce(
                      (s, r) => s + r.payment,
                      0
                    );
                    const yearPrincipal = yearRows.reduce(
                      (s, r) => s + r.principal,
                      0
                    );
                    const yearInterest = yearRows.reduce(
                      (s, r) => s + r.interest,
                      0
                    );
                    const endBalance =
                      yearRows[yearRows.length - 1]?.balance ?? 0;

                    return (
                      <tr
                        key={yearIdx}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-2 text-foreground">
                          {yearIdx + 1}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-foreground">
                          {fmt(yearPayment)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-foreground">
                          {fmt(yearPrincipal)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {fmt(yearInterest)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {fmt(Math.max(0, endBalance))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
