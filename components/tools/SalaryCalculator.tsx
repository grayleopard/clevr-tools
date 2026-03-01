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

export default function SalaryCalculator() {
  const [amount, setAmount] = useState("25");
  const [payType, setPayType] = useState<"hourly" | "annual">("hourly");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");

  const result = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const hpw = parseFloat(hoursPerWeek) || 0;
    const wpy = parseFloat(weeksPerYear) || 0;
    if (amt <= 0 || hpw <= 0 || wpy <= 0) return null;

    let hourly: number;
    let annual: number;

    if (payType === "hourly") {
      hourly = amt;
      annual = amt * hpw * wpy;
    } else {
      annual = amt;
      hourly = amt / (hpw * wpy);
    }

    const daily = hourly * hpw / 5;
    const weekly = hourly * hpw;
    const biweekly = weekly * 2;
    const semiMonthly = annual / 24;
    const monthly = annual / 12;

    return { hourly, daily, weekly, biweekly, semiMonthly, monthly, annual };
  }, [amount, payType, hoursPerWeek, weeksPerYear]);

  const rows = result
    ? [
        { label: "Hourly", value: result.hourly },
        { label: "Daily", value: result.daily },
        { label: "Weekly", value: result.weekly },
        { label: "Bi-Weekly", value: result.biweekly },
        { label: "Semi-Monthly", value: result.semiMonthly },
        { label: "Monthly", value: result.monthly },
        { label: "Annual", value: result.annual },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Pay type toggle */}
      <div className="flex gap-2">
        {(["hourly", "annual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPayType(t)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              payType === t
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {t === "hourly" ? "Hourly" : "Annual"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {payType === "hourly" ? "Hourly Rate ($)" : "Annual Salary ($)"}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Hours per Week
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Weeks per Year
          </label>
          <input
            type="number"
            min="1"
            max="52"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">
              {payType === "hourly" ? "Annual Salary" : "Hourly Rate"}
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-foreground dark:text-emerald-500">
              {fmt(payType === "hourly" ? result.annual : result.hourly)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/80">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    Period
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2.5 text-foreground">{row.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                      {fmt(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
