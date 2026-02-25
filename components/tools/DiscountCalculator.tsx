"use client";

import { useState, useMemo } from "react";

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
    const disc = parseFloat(discount) || 0;
    if (orig <= 0 || disc <= 0) return null;

    const saleAmt = orig * (1 - disc / 100);
    const savings = orig - saleAmt;

    let doubleResult = null;
    if (showDoubleDiscount) {
      const disc2 = parseFloat(secondDiscount) || 0;
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
      salePrice: saleAmt,
      savings,
      doubleResult,
    };
  }, [original, discount, showDoubleDiscount, secondDiscount]);

  const reverseResult = useMemo(() => {
    if (!reverseMode) return null;
    const orig = parseFloat(original) || 0;
    const sale = parseFloat(salePrice) || 0;
    if (orig <= 0 || sale <= 0 || sale >= orig) return null;

    const discountPct = ((orig - sale) / orig) * 100;
    return {
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
          {normalResult && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You save</span>
                <span className="text-xl font-semibold text-foreground">
                  {fmt(normalResult.savings)}
                </span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Sale Price
                </span>
                <span className="text-2xl font-bold text-foreground dark:text-emerald-500">
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
                    <span className="text-xl font-semibold text-foreground dark:text-emerald-500">
                      {fmt(normalResult.doubleResult.after2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total savings
                    </span>
                    <span className="text-sm text-foreground">
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

          {reverseResult && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Discount applied
                </span>
                <span className="text-2xl font-bold text-foreground dark:text-emerald-500">
                  {reverseResult.discountPercent}% off
                </span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You saved</span>
                <span className="text-xl font-semibold text-foreground">
                  {fmt(reverseResult.savings)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
