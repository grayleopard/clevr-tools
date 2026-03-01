"use client";

import { useState, useMemo, useCallback } from "react";

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
      <div className="text-center rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-1">Net Worth</p>
        <p
          className={`text-4xl sm:text-5xl font-bold ${
            result.netWorth >= 0
              ? "text-foreground dark:text-emerald-500"
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
    </div>
  );
}
