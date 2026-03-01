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

const STATE_RATES: { name: string; rate: number }[] = [
  { name: "Alabama", rate: 4 },
  { name: "Alaska", rate: 0 },
  { name: "Arizona", rate: 5.6 },
  { name: "Arkansas", rate: 6.5 },
  { name: "California", rate: 7.25 },
  { name: "Colorado", rate: 2.9 },
  { name: "Connecticut", rate: 6.35 },
  { name: "Delaware", rate: 0 },
  { name: "Florida", rate: 6 },
  { name: "Georgia", rate: 4 },
  { name: "Hawaii", rate: 4 },
  { name: "Idaho", rate: 6 },
  { name: "Illinois", rate: 6.25 },
  { name: "Indiana", rate: 7 },
  { name: "Iowa", rate: 6 },
  { name: "Kansas", rate: 6.5 },
  { name: "Kentucky", rate: 6 },
  { name: "Louisiana", rate: 4.45 },
  { name: "Maine", rate: 5.5 },
  { name: "Maryland", rate: 6 },
  { name: "Massachusetts", rate: 6.25 },
  { name: "Michigan", rate: 6 },
  { name: "Minnesota", rate: 6.875 },
  { name: "Mississippi", rate: 7 },
  { name: "Missouri", rate: 4.225 },
  { name: "Montana", rate: 0 },
  { name: "Nebraska", rate: 5.5 },
  { name: "Nevada", rate: 6.85 },
  { name: "New Hampshire", rate: 0 },
  { name: "New Jersey", rate: 6.625 },
  { name: "New Mexico", rate: 4.875 },
  { name: "New York", rate: 4 },
  { name: "North Carolina", rate: 4.75 },
  { name: "North Dakota", rate: 5 },
  { name: "Ohio", rate: 5.75 },
  { name: "Oklahoma", rate: 4.5 },
  { name: "Oregon", rate: 0 },
  { name: "Pennsylvania", rate: 6 },
  { name: "Rhode Island", rate: 7 },
  { name: "South Carolina", rate: 6 },
  { name: "South Dakota", rate: 4.2 },
  { name: "Tennessee", rate: 7 },
  { name: "Texas", rate: 6.25 },
  { name: "Utah", rate: 6.1 },
  { name: "Vermont", rate: 6 },
  { name: "Virginia", rate: 5.3 },
  { name: "Washington", rate: 6.5 },
  { name: "West Virginia", rate: 6 },
  { name: "Wisconsin", rate: 5 },
  { name: "Wyoming", rate: 4 },
  { name: "D.C.", rate: 6 },
];

type Mode = "forward" | "reverse";

export default function SalesTaxCalculator() {
  const [mode, setMode] = useState<Mode>("forward");
  const [price, setPrice] = useState("100");
  const [taxRate, setTaxRate] = useState("8.25");

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const r = parseFloat(taxRate) || 0;
    if (p <= 0) return null;

    if (mode === "forward") {
      const tax = p * r / 100;
      const total = p + tax;
      return { preTax: p, tax, total };
    } else {
      const preTax = p / (1 + r / 100);
      const tax = p - preTax;
      return { preTax, tax, total: p };
    }
  }, [price, taxRate, mode]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {([
          { key: "forward" as Mode, label: "Price + Tax" },
          { key: "reverse" as Mode, label: "Total to Pre-Tax" },
        ]).map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === m.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {mode === "forward" ? "Price Before Tax ($)" : "Total Amount ($)"}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* State presets */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          State Tax Rate Presets
        </label>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) setTaxRate(e.target.value);
          }}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-sm"
        >
          <option value="">Select a state...</option>
          {STATE_RATES.map((s) => (
            <option key={s.name} value={s.rate.toString()}>
              {s.name} -- {s.rate}%
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          State rates only. Local taxes may apply.
        </p>
      </div>

      {result && (
        <>
          {/* Results */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-4">
              <span className="text-lg font-bold tabular-nums text-foreground">{fmt(result.preTax)}</span>
              <span className="text-xs text-muted-foreground">Pre-Tax Price</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-4">
              <span className="text-lg font-bold tabular-nums text-foreground">{fmt(result.tax)}</span>
              <span className="text-xs text-muted-foreground">Sales Tax</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 px-3 py-4">
              <span className="text-lg font-bold tabular-nums text-primary">{fmt(result.total)}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Sales Tax Rates by State (2025)</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">State</th>
                  <th className="text-left p-2 font-medium">State Sales Tax</th>
                  <th className="text-left p-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AL", "4%", ""],
                  ["AK", "0%", "No state tax; locals up to 9.5%"],
                  ["AZ", "5.6%", ""],
                  ["AR", "6.5%", ""],
                  ["CA", "7.25%", "Highest state rate"],
                  ["CO", "2.9%", ""],
                  ["CT", "6.35%", ""],
                  ["DE", "0%", "No sales tax"],
                  ["FL", "6%", ""],
                  ["GA", "4%", ""],
                  ["HI", "4%", "GET, not traditional sales tax"],
                  ["ID", "6%", ""],
                  ["IL", "6.25%", ""],
                  ["IN", "7%", ""],
                  ["IA", "6%", ""],
                  ["KS", "6.5%", ""],
                  ["KY", "6%", ""],
                  ["LA", "4.45%", ""],
                  ["ME", "5.5%", ""],
                  ["MD", "6%", ""],
                  ["MA", "6.25%", ""],
                  ["MI", "6%", ""],
                  ["MN", "6.875%", ""],
                  ["MS", "7%", ""],
                  ["MO", "4.225%", ""],
                  ["MT", "0%", "No sales tax"],
                  ["NE", "5.5%", ""],
                  ["NV", "6.85%", ""],
                  ["NH", "0%", "No sales tax"],
                  ["NJ", "6.625%", ""],
                  ["NM", "5%", ""],
                  ["NY", "4%", ""],
                  ["NC", "4.75%", ""],
                  ["ND", "5%", ""],
                  ["OH", "5.75%", ""],
                  ["OK", "4.5%", ""],
                  ["OR", "0%", "No sales tax"],
                  ["PA", "6%", ""],
                  ["RI", "7%", ""],
                  ["SC", "6%", ""],
                  ["SD", "4.5%", ""],
                  ["TN", "7%", ""],
                  ["TX", "6.25%", ""],
                  ["UT", "4.85%", ""],
                  ["VT", "6%", ""],
                  ["VA", "4.3%", ""],
                  ["WA", "6.5%", ""],
                  ["WV", "6%", ""],
                  ["WI", "5%", ""],
                  ["WY", "4%", ""],
                  ["DC", "6%", ""],
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
            Note: Local taxes (city/county) can add 0.5--5% on top of state rates. The total rate
            varies by purchase location.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Five States With No Sales Tax</h2>
          <p>
            Oregon, Montana, Delaware, New Hampshire, and Alaska have no statewide sales tax.
            Alaska allows local municipalities to impose sales taxes, so rates vary by city.
          </p>
          <p className="mt-3">
            Shopping across a state border to avoid sales tax is rarely worth the hassle unless the
            purchase is very large. A $10,000 purchase at 8% sales tax saves $800 if bought in a
            no-tax state -- but only if you&apos;re already near the border or shopping online.
          </p>
        </section>
      </div>
    </div>
  );
}
