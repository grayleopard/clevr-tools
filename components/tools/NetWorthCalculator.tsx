"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

interface LineItem {
  id: number;
  label: string;
  amount: string;
}

let nextId = 1;

export default function NetWorthCalculator() {
  const [assets, setAssets] = useState<LineItem[]>([
    { id: nextId++, label: "Checking / Savings", amount: "15000" },
    { id: nextId++, label: "Retirement Accounts", amount: "80000" },
    { id: nextId++, label: "Investments", amount: "25000" },
    { id: nextId++, label: "Home Value", amount: "350000" },
    { id: nextId++, label: "Vehicle", amount: "20000" },
  ]);

  const [liabilities, setLiabilities] = useState<LineItem[]>([
    { id: nextId++, label: "Mortgage", amount: "280000" },
    { id: nextId++, label: "Car Loan", amount: "12000" },
    { id: nextId++, label: "Student Loans", amount: "25000" },
    { id: nextId++, label: "Credit Cards", amount: "3000" },
  ]);

  const addItem = useCallback((type: "asset" | "liability") => {
    const item = { id: nextId++, label: "", amount: "" };
    if (type === "asset") setAssets((prev) => [...prev, item]);
    else setLiabilities((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((type: "asset" | "liability", id: number) => {
    if (type === "asset") setAssets((prev) => prev.filter((i) => i.id !== id));
    else setLiabilities((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback(
    (type: "asset" | "liability", id: number, field: "label" | "amount", value: string) => {
      const setter = type === "asset" ? setAssets : setLiabilities;
      setter((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    },
    []
  );

  const result = useMemo(() => {
    const totalAssets = assets.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
  }, [assets, liabilities]);

  const renderItems = (items: LineItem[], type: "asset" | "liability") => (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex gap-2">
          <input
            type="text"
            placeholder="Description"
            value={item.label}
            onChange={(e) => updateItem(type, item.id, "label", e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={item.amount}
            onChange={(e) => updateItem(type, item.id, "amount", e.target.value)}
            className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => removeItem(type, item.id)}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            X
          </button>
        </div>
      ))}
      <button
        onClick={() => addItem(type)}
        className="rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        + Add {type === "asset" ? "Asset" : "Liability"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Net Worth Result */}
      <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
        <p className="text-sm text-muted-foreground mb-1">Net Worth</p>
        <p
          className={`text-4xl sm:text-5xl font-bold ${
            result.netWorth >= 0
              ? "text-primary"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {fmt(result.netWorth)}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(result.totalAssets)}</span>
          <span className="text-xs text-muted-foreground">Total Assets</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">{fmt(result.totalLiabilities)}</span>
          <span className="text-xs text-muted-foreground">Total Liabilities</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Assets (What You Own)</h3>
          {renderItems(assets, "asset")}
        </div>

        {/* Liabilities */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Liabilities (What You Owe)</h3>
          {renderItems(liabilities, "liability")}
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Net Worth Benchmarks by Age</h2>
          <p>Federal Reserve data shows median (midpoint) net worth by age:</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Age Group</th>
                  <th className="text-left p-2 font-medium">Median Net Worth</th>
                  <th className="text-left p-2 font-medium">Mean Net Worth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Under 35", "$39,000", "$183,000"],
                  ["35-44", "$135,000", "$550,000"],
                  ["45-54", "$247,000", "$975,000"],
                  ["55-64", "$364,000", "$1,567,000"],
                  ["65-74", "$410,000", "$1,795,000"],
                  ["75+", "$335,000", "$1,624,000"],
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
            The gap between median and mean reflects wealth concentration at the top. Median is more
            representative of a &quot;typical&quot; household. Don&apos;t let benchmarks discourage you -- the goal is
            steady progress over time.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Levers of Net Worth Growth</h2>
          <p>
            <strong className="text-foreground">Grow assets:</strong> Max out tax-advantaged accounts (401k, IRA, HSA) before taxable accounts.
            Contribute enough to get any employer 401k match -- that&apos;s an immediate 50--100% return.
            Use our{" "}
            <Link href="/calc/retirement" className="text-primary underline hover:no-underline">retirement calculator</Link>{" "}
            and{" "}
            <Link href="/calc/investment-return" className="text-primary underline hover:no-underline">investment return calculator</Link>{" "}
            to project asset growth over time.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Reduce liabilities:</strong> Prioritize high-interest debt (credit cards, personal loans).
            Low-interest debt (mortgages, student loans at below 4%) is lower priority -- your money
            likely grows faster invested than it saves in interest.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">Avoid lifestyle inflation:</strong> Each raise or windfall can either increase your savings rate or
            increase your spending. Keeping lifestyle expenses stable while income grows is one of the
            most reliable paths to building net worth.
          </p>
        </section>
      </div>
    </div>
  );
}
