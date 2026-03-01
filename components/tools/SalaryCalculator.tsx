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
                : "bg-muted text-muted-foreground hover:bg-muted/80"
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
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">
              {payType === "hourly" ? "Annual Salary" : "Hourly Rate"}
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {fmt(payType === "hourly" ? result.annual : result.hourly)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/10">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground">
                    Period
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border last:border-0 even:bg-muted/30"
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

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Convert Hourly Wages to Annual Salary</h2>
          <p>
            The standard formula is: Annual Salary = Hourly Rate &times; Hours Per Week &times; Weeks Per Year.
            Most employers assume 40 hours per week and 52 weeks per year, giving 2,080 working hours
            annually. So $25/hour &times; 2,080 = $52,000/year.
          </p>
          <p className="mt-3">
            Keep in mind this is your gross (pre-tax) salary. Your actual take-home pay will be lower
            after federal income tax, state income tax, and FICA deductions. Use our{" "}
            <Link href="/calc/take-home-pay" className="text-primary underline hover:no-underline">take-home pay calculator</Link>{" "}
            to estimate your net paycheck.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Quick Salary Reference Table</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Hourly</th>
                  <th className="text-left p-2 font-medium">Weekly</th>
                  <th className="text-left p-2 font-medium">Bi-Weekly</th>
                  <th className="text-left p-2 font-medium">Monthly</th>
                  <th className="text-left p-2 font-medium">Annual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["$15", "$600", "$1,200", "$2,600", "$31,200"],
                  ["$20", "$800", "$1,600", "$3,467", "$41,600"],
                  ["$25", "$1,000", "$2,000", "$4,333", "$52,000"],
                  ["$30", "$1,200", "$2,400", "$5,200", "$62,400"],
                  ["$40", "$1,600", "$3,200", "$6,933", "$83,200"],
                  ["$50", "$2,000", "$4,000", "$8,667", "$104,000"],
                  ["$75", "$3,000", "$6,000", "$13,000", "$156,000"],
                  ["$100", "$4,000", "$8,000", "$17,333", "$208,000"],
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
          <p className="mt-2 text-xs">These assume 40 hours/week, 52 weeks/year.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Part-Time and Non-Standard Schedules</h2>
          <p>
            The 40-hour week assumption doesn&apos;t fit everyone. A part-time worker at 20 hours/week earning
            $25/hour makes $26,000/year, not $52,000. Contract workers may work more than 52 weeks or take
            unpaid time off. Use the calculator above and adjust the hours and weeks fields to match your
            actual schedule.
          </p>
        </section>
      </div>
    </div>
  );
}
