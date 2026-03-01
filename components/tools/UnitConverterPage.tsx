"use client";

import { useState, useMemo, useCallback } from "react";
import { converterConfigs } from "@/lib/conversions";
import type { UnitConverterConfig } from "@/lib/conversions";

function formatResult(value: number): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs > 0 && abs < 1e-10)) {
    return value.toExponential(6);
  }
  return parseFloat(value.toPrecision(10)).toLocaleString("en-US", {
    maximumSignificantDigits: 10,
    useGrouping: true,
  });
}

export default function UnitConverterPage({
  configKey,
  defaultFrom,
  defaultTo,
  seoContent,
}: {
  configKey: string;
  defaultFrom?: string;
  defaultTo?: string;
  seoContent?: React.ReactNode;
}) {
  const config: UnitConverterConfig = converterConfigs[configKey] ?? converterConfigs.length;
  const effectiveDefaultFrom = defaultFrom ?? config.defaultFromUnit;
  const effectiveDefaultTo = defaultTo ?? config.defaultToUnit;

  const [fromUnit, setFromUnit] = useState(effectiveDefaultFrom);
  const [toUnit, setToUnit] = useState(effectiveDefaultTo);
  const [fromValue, setFromValue] = useState("1");
  const [activeField, setActiveField] = useState<"from" | "to">("from");

  const fromUnitObj = config.units.find((u) => u.symbol === fromUnit) ?? config.units[0];
  const toUnitObj = config.units.find((u) => u.symbol === toUnit) ?? config.units[1];

  const convert = useCallback(
    (value: number, from: { toBase: (v: number) => number }, to: { fromBase: (v: number) => number }) => {
      const base = from.toBase(value);
      return to.fromBase(base);
    },
    []
  );

  const toValue = useMemo(() => {
    const v = parseFloat(fromValue);
    if (isNaN(v)) return "";
    return formatResult(convert(v, fromUnitObj, toUnitObj));
  }, [fromValue, fromUnitObj, toUnitObj, convert]);

  const handleFromChange = (val: string) => {
    setFromValue(val);
    setActiveField("from");
  };

  const handleToChange = (val: string) => {
    setActiveField("to");
    const v = parseFloat(val);
    if (isNaN(v) || val === "") {
      setFromValue("");
      return;
    }
    const result = convert(v, toUnitObj, fromUnitObj);
    setFromValue(String(parseFloat(result.toPrecision(10))));
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleClear = () => {
    setFromValue("1");
    setActiveField("from");
  };

  // Generate reference table values
  const referenceRows = useMemo(() => {
    const baseValues = [1, 2, 5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 500, 1000];
    return baseValues.map((val) => ({
      from: val,
      to: convert(val, fromUnitObj, toUnitObj),
    }));
  }, [fromUnitObj, toUnitObj, convert]);

  return (
    <div className="space-y-6">
      {/* Converter UI */}
      <div className="rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* From */}
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-foreground">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {config.units.map((u) => (
                <option key={u.symbol} value={u.symbol}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              onFocus={() => setActiveField("from")}
              className="w-full rounded-lg border border-border bg-background px-3 py-3 text-lg font-semibold text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter value"
            />
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center sm:pb-1">
            <button
              onClick={handleSwap}
              className="rounded-full border border-border bg-background p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Swap units"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3L4 7l4 4" />
                <path d="M4 7h16" />
                <path d="m16 21 4-4-4-4" />
                <path d="M20 17H4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-foreground">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {config.units.map((u) => (
                <option key={u.symbol} value={u.symbol}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              onFocus={() => setActiveField("to")}
              className="w-full rounded-lg border border-border bg-background px-3 py-3 text-lg font-semibold text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Result"
              readOnly={activeField === "from"}
            />
          </div>
        </div>

        {/* Result summary */}
        {fromValue && toValue && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{fromValue} {fromUnitObj.symbol}</span>
            {" = "}
            <span className="font-semibold text-primary">{toValue} {toUnitObj.symbol}</span>
          </p>
        )}

        <div className="mt-3 flex justify-center">
          <button
            onClick={handleClear}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Quick reference table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-primary/10">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground">
                {fromUnitObj.label} ({fromUnitObj.symbol})
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-foreground">
                {toUnitObj.label} ({toUnitObj.symbol})
              </th>
            </tr>
          </thead>
          <tbody>
            {referenceRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 even:bg-muted/30"
              >
                <td className="px-4 py-2 text-foreground tabular-nums">
                  {row.from.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-medium text-foreground">
                  {formatResult(row.to)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEO content */}
      {seoContent && (
        <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
          {seoContent}
        </div>
      )}
    </div>
  );
}
