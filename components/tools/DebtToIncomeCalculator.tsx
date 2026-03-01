"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface DebtItem {
  id: number;
  label: string;
  amount: string;
}

let nextId = 1;

function getRating(dti: number): { label: string; color: string; description: string } {
  if (dti <= 20) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400", description: "Very manageable debt level" };
  if (dti <= 36) return { label: "Good", color: "text-emerald-600 dark:text-emerald-400", description: "Within most lender guidelines" };
  if (dti <= 43) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400", description: "May qualify for some loans" };
  if (dti <= 50) return { label: "High", color: "text-orange-600 dark:text-orange-400", description: "Difficult to qualify for new credit" };
  return { label: "Very High", color: "text-red-600 dark:text-red-400", description: "Significant financial stress" };
}

export default function DebtToIncomeCalculator() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState("6000");
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: nextId++, label: "Rent / Mortgage", amount: "1500" },
    { id: nextId++, label: "Car Payment", amount: "400" },
    { id: nextId++, label: "Student Loans", amount: "300" },
  ]);

  const addDebt = useCallback(() => {
    setDebts((prev) => [...prev, { id: nextId++, label: "", amount: "" }]);
  }, []);

  const removeDebt = useCallback((id: number) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateDebt = useCallback((id: number, field: "label" | "amount", value: string) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }, []);

  const result = useMemo(() => {
    const income = parseFloat(grossMonthlyIncome) || 0;
    if (income <= 0) return null;

    const totalDebt = debts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const dti = (totalDebt / income) * 100;
    const rating = getRating(dti);

    return { totalDebt, dti, rating, income };
  }, [grossMonthlyIncome, debts]);

  return (
    <div className="space-y-6">
      {/* Income */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Gross Monthly Income ($)
        </label>
        <input
          type="number"
          min="0"
          value={grossMonthlyIncome}
          onChange={(e) => setGrossMonthlyIncome(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-sm"
        />
      </div>

      {/* Debts */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Monthly Debt Payments
        </label>
        <div className="space-y-2">
          {debts.map((debt) => (
            <div key={debt.id} className="flex gap-2">
              <input
                type="text"
                placeholder="Description"
                value={debt.label}
                onChange={(e) => updateDebt(debt.id, "label", e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={debt.amount}
                onChange={(e) => updateDebt(debt.id, "amount", e.target.value)}
                className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => removeDebt(debt.id)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                X
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addDebt}
          className="mt-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          + Add Debt
        </button>
      </div>

      {result && (
        <>
          {/* DTI result */}
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Debt-to-Income Ratio</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {result.dti.toFixed(1)}%
            </p>
            <p className={`text-sm font-medium mt-2 ${result.rating.color}`}>
              {result.rating.label} -- {result.rating.description}
            </p>
          </div>

          {/* Visual bar */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>0%</span>
              <span>20%</span>
              <span>36%</span>
              <span>43%</span>
              <span>50%+</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, result.dti * 2)}%`,
                  background:
                    result.dti <= 36
                      ? "var(--color-emerald-500, #10b981)"
                      : result.dti <= 43
                      ? "var(--color-yellow-500, #eab308)"
                      : "var(--color-red-500, #ef4444)",
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalDebt)}</span>
              <span className="text-xs text-muted-foreground">Total Monthly Debt</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.income - result.totalDebt)}</span>
              <span className="text-xs text-muted-foreground">Remaining Income</span>
            </div>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">What Lenders Actually Look For</h2>
          <p>Mortgage lenders use two DTI ratios:</p>
          <p className="mt-3">
            <strong className="text-foreground">Front-end ratio:</strong> housing costs (mortgage, taxes, insurance) as a percentage of gross income.
            Most conventional loans want this below 28%.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Back-end ratio:</strong> all monthly debt payments as a percentage of gross income. The standard
            threshold is 43% for conventional loans, though some lenders go up to 50% for FHA loans
            with compensating factors (large down payment, high credit score).
          </p>
          <p className="mt-3">
            For the best mortgage rates and approval odds, target below 36% total DTI. The 28/36 rule
            is the classic guideline: keep housing under 28%, total debt under 36%.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Lower Your DTI</h2>
          <p>There are only two levers: reduce monthly debt payments or increase monthly income.</p>
          <p className="mt-3">
            <strong className="text-foreground">Reducing debt:</strong> Paying off a car loan or credit card before applying for a mortgage can
            meaningfully lower your DTI. Use the{" "}
            <Link href="/calc/loan" className="text-primary underline hover:no-underline">loan calculator</Link>{" "}
            to model what an extra payment per month would do to your payoff timeline.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Increasing income:</strong> A second income stream, raise, or new job with higher pay directly
            improves your DTI. Lenders typically want to see 2+ years of consistent income in the
            same field for new employment.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">What won&apos;t lower DTI:</strong> Making extra payments on a mortgage that&apos;s already included in your
            debt calculation. You&apos;d need to pay it off entirely to remove it from the back-end ratio.
          </p>
        </section>
      </div>
    </div>
  );
}
