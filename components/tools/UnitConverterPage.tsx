"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy } from "lucide-react";
import { TipJar } from "@/components/tool/TipJar";
import { converterConfigs } from "@/lib/conversions";
import type { UnitConverterConfig } from "@/lib/conversions";
import { addToast } from "@/lib/toast";
import {
  DATA_SIZE_MODES,
  DEFAULT_DATA_SIZE_MODE,
  getCompatibleDataSizeSymbol,
  getDataSizeUnitsForMode,
  type DataSizeMode,
} from "@/lib/data-size";

function formatResult(value: number, significantDigits = 10): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs > 0 && abs < 1e-10)) {
    return value.toExponential(significantDigits - 1);
  }
  return parseFloat(value.toPrecision(significantDigits)).toLocaleString("en-US", {
    maximumSignificantDigits: significantDigits,
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
  const [dataSizeMode, setDataSizeMode] = useState<DataSizeMode>(DEFAULT_DATA_SIZE_MODE);
  const [significantDigits, setSignificantDigits] = useState(10);
  const isDataSize = configKey === "data";

  const visibleUnits = useMemo(() => {
    if (!isDataSize) return config.units;
    const visibleSymbols = new Set(
      getDataSizeUnitsForMode(dataSizeMode).map((unit) => unit.symbol)
    );
    return config.units.filter((unit) => visibleSymbols.has(unit.symbol));
  }, [config.units, dataSizeMode, isDataSize]);

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
    return formatResult(convert(v, fromUnitObj, toUnitObj), significantDigits);
  }, [fromValue, fromUnitObj, toUnitObj, convert, significantDigits]);

  const handleFromChange = (val: string) => {
    setFromValue(val);
    setActiveField("from");
  };

  const handleToChange = (val: string) => {
    setActiveField("to");
    // toValue is comma-grouped by formatResult() for readability — strip
    // grouping before parsing, since a user editing the field mid-value
    // (rather than clearing it first) will pass the commas straight through.
    const cleaned = val.replace(/,/g, "");
    const v = parseFloat(cleaned);
    if (isNaN(v) || cleaned === "") {
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

  const handleDataSizeModeChange = (mode: DataSizeMode) => {
    setDataSizeMode(mode);
    setFromUnit(getCompatibleDataSizeSymbol(fromUnit, mode));
    setToUnit(getCompatibleDataSizeSymbol(toUnit, mode));
    setActiveField("from");
  };

  const handleCopyResult = async () => {
    const value = activeField === "from" ? toValue : fromValue;
    const unit = activeField === "from" ? toUnitObj.symbol : fromUnitObj.symbol;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(`${value} ${unit}`);
      addToast("Result copied", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
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
        {isDataSize && (
          <fieldset className="mb-6 space-y-3">
            <legend className="text-sm font-semibold text-foreground">Unit system</legend>
            <div className="grid gap-2 sm:grid-cols-3" aria-label="Data size unit system">
              {DATA_SIZE_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={dataSizeMode === mode.id}
                  onClick={() => handleDataSizeModeChange(mode.id)}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    dataSizeMode === mode.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="block text-sm font-semibold">{mode.label}</span>
                  <span
                    className={`mt-0.5 block text-xs leading-5 ${
                      dataSizeMode === mode.id ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {mode.description}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* From */}
          <div className="flex-1 space-y-2">
            <label htmlFor="from-value" className="block text-sm font-medium text-foreground">From</label>
            <label htmlFor="from-unit" className="sr-only">From unit</label>
            <select
              id="from-unit"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {visibleUnits.map((u) => (
                <option key={u.symbol} value={u.symbol}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
            <input
              id="from-value"
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
            <label htmlFor="to-value" className="block text-sm font-medium text-foreground">To</label>
            <label htmlFor="to-unit" className="sr-only">To unit</label>
            <select
              id="to-unit"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {visibleUnits.map((u) => (
                <option key={u.symbol} value={u.symbol}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
            <input
              // formatResult() comma-groups values >= 1000 for readability
              // (e.g. "43,560.06") — a native type="number" input silently
              // renders blank for any value it can't parse as a numeric
              // literal, so the comma-grouped result never showed at all.
              // text + inputMode="decimal" keeps the numeric keyboard on
              // mobile while allowing the grouped display to actually render.
              id="to-value"
              type="text"
              inputMode="decimal"
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
          <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <p className="text-center text-sm text-muted-foreground tabular-nums" aria-live="polite">
              <span className="font-semibold text-primary">{fromValue} {fromUnitObj.symbol}</span>
              {" = "}
              <span className="font-semibold text-primary">{toValue} {toUnitObj.symbol}</span>
            </p>
            {isDataSize && (
              <button
                type="button"
                onClick={handleCopyResult}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Copy converted result"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy result
              </button>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {isDataSize && (
            <label className="flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground">
              Precision
              <select
                value={significantDigits}
                onChange={(event) => setSignificantDigits(Number(event.target.value))}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Result precision"
              >
                {[3, 4, 5, 6, 8, 10, 12, 15].map((digits) => (
                  <option key={digits} value={digits}>{digits} significant digits</option>
                ))}
              </select>
            </label>
          )}
          <button
            onClick={handleClear}
            className="min-h-11 rounded-lg px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                  {formatResult(row.to, significantDigits)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TipJar />

      {/* SEO content */}
      {seoContent && (
        <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
          {seoContent}
        </div>
      )}
    </div>
  );
}
