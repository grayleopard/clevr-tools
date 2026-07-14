"use client";

import { useState, useMemo } from "react";
import { TipJar } from "@/components/tool/TipJar";
import { CalculatorEmptyState } from "@/components/tool/CalculatorEmptyState";

const DISCOUNT_PRESETS = [10, 15, 20, 25, 30, 50, 75];

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DiscountCalculator() {
  const [original, setOriginal] = useState("");
  const [discount, setDiscount] = useState("");
  const [showDoubleDiscount, setShowDoubleDiscount] = useState(false);
  const [secondDiscount, setSecondDiscount] = useState("");
  const [reverseMode, setReverseMode] = useState(false);
  const [salePrice, setSalePrice] = useState("");

  const normalResult = useMemo(() => {
    const orig = parseFloat(original) || 0;
    const disc = Math.min(100, Math.max(0, parseFloat(discount) || 0));
    if (orig <= 0 || disc <= 0) {
      return { ok: false as const, emptyMessage: "Enter an original price and discount to see the sale price." };
    }

    const saleAmt = orig * (1 - disc / 100);
    const savings = orig - saleAmt;

    let doubleResult = null;
    if (showDoubleDiscount) {
      const disc2 = Math.min(100, Math.max(0, parseFloat(secondDiscount) || 0));
      if (disc2 > 0) {
        const after2 = saleAmt * (1 - disc2 / 100);
        const totalSavings = orig - after2;
        const effectiveDiscount = (totalSavings / orig) * 100;
        doubleResult = {
          after2,
          totalSavings,
          effectiveDiscount: Math.round(effectiveDiscount * 100) / 100,
        };
      }
    }

    return {
      ok: true as const,
      salePrice: saleAmt,
      savings,
      doubleResult,
    };
  }, [original, discount, showDoubleDiscount, secondDiscount]);

  const reverseResult = useMemo(() => {
    if (!reverseMode) return null;
    const orig = parseFloat(original) || 0;
    const sale = parseFloat(salePrice) || 0;
    if (orig <= 0 || sale <= 0) {
      return { ok: false as const, emptyMessage: "Enter the original and sale price to find the discount percentage." };
    }
    if (sale >= orig) {
      return { ok: false as const, emptyMessage: "The sale price isn't lower than the original price, so there's no discount to calculate." };
    }

    const discountPct = ((orig - sale) / orig) * 100;
    return {
      ok: true as const,
      discountPercent: Math.round(discountPct * 100) / 100,
      savings: orig - sale,
    };
  }, [reverseMode, original, salePrice]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setReverseMode(false)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !reverseMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Calculate Sale Price
        </button>
        <button
          onClick={() => setReverseMode(true)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            reverseMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Find Discount %
        </button>
      </div>

      {/* Original price (shared) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Original Price ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {!reverseMode ? (
        <>
          {/* Discount presets + input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Discount (%)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DISCOUNT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscount(pct.toString())}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    discount === pct.toString()
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Custom %"
              className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Double discount toggle */}
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showDoubleDiscount}
              onChange={(e) => setShowDoubleDiscount(e.target.checked)}
              className="rounded border-border"
            />
            Stacked discount (extra % off the sale price)
          </label>

          {showDoubleDiscount && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Second Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={secondDiscount}
                onChange={(e) => setSecondDiscount(e.target.value)}
                placeholder="e.g., 10"
                className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {/* Normal results */}
          {normalResult && !normalResult.ok && <CalculatorEmptyState message={normalResult.emptyMessage} />}

          {normalResult?.ok && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You save</span>
                <span className="text-xl font-semibold text-foreground tabular-nums">
                  {fmt(normalResult.savings)}
                </span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Sale Price
                </span>
                <span className="text-2xl font-bold text-foreground dark:text-emerald-500 tabular-nums">
                  {fmt(normalResult.salePrice)}
                </span>
              </div>

              {normalResult.doubleResult && (
                <>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      After second discount
                    </span>
                    <span className="text-xl font-semibold text-foreground dark:text-emerald-500 tabular-nums">
                      {fmt(normalResult.doubleResult.after2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total savings
                    </span>
                    <span className="text-sm text-foreground tabular-nums">
                      {fmt(normalResult.doubleResult.totalSavings)} (
                      {normalResult.doubleResult.effectiveDiscount}% effective)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Stacked discounts are applied sequentially, not added.{" "}
                    {discount}% + {secondDiscount}% is{" "}
                    {normalResult.doubleResult.effectiveDiscount}% off, not{" "}
                    {(parseFloat(discount) || 0) +
                      (parseFloat(secondDiscount) || 0)}
                    %.
                  </p>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Reverse mode */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Sale Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {reverseResult && !reverseResult.ok && <CalculatorEmptyState message={reverseResult.emptyMessage} />}

          {reverseResult?.ok && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Discount applied
                </span>
                <span className="text-2xl font-bold text-foreground dark:text-emerald-500 tabular-nums">
                  {reverseResult.discountPercent}% off
                </span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You saved</span>
                <span className="text-xl font-semibold text-foreground tabular-nums">
                  {fmt(reverseResult.savings)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <TipJar />
    </div>
  );
}
