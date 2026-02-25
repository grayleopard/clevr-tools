"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowLeftRight, Copy } from "lucide-react";
import { addToast } from "@/lib/toast";

// ─── Unit definitions ───────────────────────────────────────────────────────

interface UnitDef {
  id: string;
  label: string;
  factor: number; // relative to base unit (ignored for temperature)
}

interface Category {
  id: string;
  label: string;
  units: UnitDef[];
  isTemperature?: boolean;
  defaultFrom: string;
  defaultTo: string;
}

const CATEGORIES: Category[] = [
  {
    id: "length",
    label: "Length",
    defaultFrom: "m",
    defaultTo: "ft",
    units: [
      { id: "mm", label: "Millimeters (mm)", factor: 0.001 },
      { id: "cm", label: "Centimeters (cm)", factor: 0.01 },
      { id: "m", label: "Meters (m)", factor: 1 },
      { id: "km", label: "Kilometers (km)", factor: 1000 },
      { id: "in", label: "Inches (in)", factor: 0.0254 },
      { id: "ft", label: "Feet (ft)", factor: 0.3048 },
      { id: "yd", label: "Yards (yd)", factor: 0.9144 },
      { id: "mi", label: "Miles (mi)", factor: 1609.344 },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    defaultFrom: "kg",
    defaultTo: "lb",
    units: [
      { id: "mg", label: "Milligrams (mg)", factor: 0.001 },
      { id: "g", label: "Grams (g)", factor: 1 },
      { id: "kg", label: "Kilograms (kg)", factor: 1000 },
      { id: "oz", label: "Ounces (oz)", factor: 28.3495 },
      { id: "lb", label: "Pounds (lb)", factor: 453.592 },
      { id: "ton", label: "Short Tons", factor: 907185 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    isTemperature: true,
    defaultFrom: "C",
    defaultTo: "F",
    units: [
      { id: "C", label: "Celsius (\u00B0C)", factor: 0 },
      { id: "F", label: "Fahrenheit (\u00B0F)", factor: 0 },
      { id: "K", label: "Kelvin (K)", factor: 0 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    defaultFrom: "l",
    defaultTo: "gal",
    units: [
      { id: "ml", label: "Milliliters (mL)", factor: 1 },
      { id: "l", label: "Liters (L)", factor: 1000 },
      { id: "floz", label: "Fluid Ounces (fl oz)", factor: 29.5735 },
      { id: "cup", label: "Cups", factor: 236.588 },
      { id: "pint", label: "Pints", factor: 473.176 },
      { id: "quart", label: "Quarts", factor: 946.353 },
      { id: "gal", label: "Gallons (gal)", factor: 3785.41 },
    ],
  },
  {
    id: "area",
    label: "Area",
    defaultFrom: "m2",
    defaultTo: "ft2",
    units: [
      { id: "mm2", label: "Square Millimeters (mm\u00B2)", factor: 0.000001 },
      { id: "cm2", label: "Square Centimeters (cm\u00B2)", factor: 0.0001 },
      { id: "m2", label: "Square Meters (m\u00B2)", factor: 1 },
      { id: "km2", label: "Square Kilometers (km\u00B2)", factor: 1e6 },
      { id: "in2", label: "Square Inches (in\u00B2)", factor: 0.00064516 },
      { id: "ft2", label: "Square Feet (ft\u00B2)", factor: 0.092903 },
      { id: "yd2", label: "Square Yards (yd\u00B2)", factor: 0.836127 },
      { id: "acre", label: "Acres", factor: 4046.86 },
      { id: "hectare", label: "Hectares (ha)", factor: 10000 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    defaultFrom: "kmh",
    defaultTo: "mph",
    units: [
      { id: "ms", label: "Meters/second (m/s)", factor: 1 },
      { id: "kmh", label: "Kilometers/hour (km/h)", factor: 1 / 3.6 },
      { id: "mph", label: "Miles/hour (mph)", factor: 0.44704 },
      { id: "knot", label: "Knots (kn)", factor: 0.514444 },
    ],
  },
  {
    id: "data",
    label: "Data",
    defaultFrom: "mb",
    defaultTo: "gb",
    units: [
      { id: "bit", label: "Bits (b)", factor: 0.125 },
      { id: "byte", label: "Bytes (B)", factor: 1 },
      { id: "kb", label: "Kilobytes (KB)", factor: 1024 },
      { id: "mb", label: "Megabytes (MB)", factor: 1048576 },
      { id: "gb", label: "Gigabytes (GB)", factor: 1073741824 },
      { id: "tb", label: "Terabytes (TB)", factor: 1099511627776 },
      { id: "pb", label: "Petabytes (PB)", factor: 1125899906842624 },
    ],
  },
];

// ─── Temperature conversion ─────────────────────────────────────────────────

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;

  // Convert to Celsius first
  let celsius: number;
  switch (from) {
    case "C":
      celsius = value;
      break;
    case "F":
      celsius = (value - 32) * (5 / 9);
      break;
    case "K":
      celsius = value - 273.15;
      break;
    default:
      return value;
  }

  // Convert from Celsius to target
  switch (to) {
    case "C":
      return celsius;
    case "F":
      return celsius * (9 / 5) + 32;
    case "K":
      return celsius + 273.15;
    default:
      return value;
  }
}

// ─── Formatting ─────────────────────────────────────────────────────────────

function formatValue(n: number): string {
  if (!isFinite(n)) return "";
  // Round to 10 decimal places to avoid floating point noise
  const rounded = Math.round(n * 1e10) / 1e10;
  return String(rounded);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function UnitConverter() {
  const [categoryId, setCategoryId] = useState("length");
  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId)!,
    [categoryId]
  );

  const [fromUnit, setFromUnit] = useState(category.defaultFrom);
  const [toUnit, setToUnit] = useState(category.defaultTo);
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const [lastEdited, setLastEdited] = useState<"from" | "to">("from");

  // Compute conversions
  const computeToValue = useCallback(
    (val: string, from: string, to: string, cat: Category): string => {
      const num = parseFloat(val);
      if (isNaN(num) || val === "") return "";
      if (cat.isTemperature) {
        return formatValue(convertTemperature(num, from, to));
      }
      const fromDef = cat.units.find((u) => u.id === from);
      const toDef = cat.units.find((u) => u.id === to);
      if (!fromDef || !toDef) return "";
      const base = num * fromDef.factor;
      return formatValue(base / toDef.factor);
    },
    []
  );

  const computeFromValue = useCallback(
    (val: string, from: string, to: string, cat: Category): string => {
      const num = parseFloat(val);
      if (isNaN(num) || val === "") return "";
      if (cat.isTemperature) {
        return formatValue(convertTemperature(num, to, from));
      }
      const fromDef = cat.units.find((u) => u.id === from);
      const toDef = cat.units.find((u) => u.id === to);
      if (!fromDef || !toDef) return "";
      const base = num * toDef.factor;
      return formatValue(base / fromDef.factor);
    },
    []
  );

  // When fromValue changes
  const handleFromChange = useCallback(
    (val: string) => {
      setFromValue(val);
      setLastEdited("from");
      setToValue(computeToValue(val, fromUnit, toUnit, category));
    },
    [fromUnit, toUnit, category, computeToValue]
  );

  // When toValue changes
  const handleToChange = useCallback(
    (val: string) => {
      setToValue(val);
      setLastEdited("to");
      setFromValue(computeFromValue(val, fromUnit, toUnit, category));
    },
    [fromUnit, toUnit, category, computeFromValue]
  );

  // When units change, recompute based on lastEdited
  const recompute = useCallback(
    (from: string, to: string, cat: Category) => {
      if (lastEdited === "from") {
        setToValue(computeToValue(fromValue, from, to, cat));
      } else {
        setFromValue(computeFromValue(toValue, from, to, cat));
      }
    },
    [lastEdited, fromValue, toValue, computeToValue, computeFromValue]
  );

  const handleFromUnitChange = useCallback(
    (unit: string) => {
      setFromUnit(unit);
      recompute(unit, toUnit, category);
    },
    [toUnit, category, recompute]
  );

  const handleToUnitChange = useCallback(
    (unit: string) => {
      setToUnit(unit);
      recompute(fromUnit, unit, category);
    },
    [fromUnit, category, recompute]
  );

  const handleSwap = useCallback(() => {
    const newFrom = toUnit;
    const newTo = fromUnit;
    setFromUnit(newFrom);
    setToUnit(newTo);
    // Swap values
    const oldFrom = fromValue;
    const oldTo = toValue;
    setFromValue(oldTo);
    setToValue(oldFrom);
    setLastEdited((prev) => (prev === "from" ? "to" : "from"));
  }, [fromUnit, toUnit, fromValue, toValue]);

  const handleCategoryChange = useCallback(
    (id: string) => {
      const cat = CATEGORIES.find((c) => c.id === id)!;
      setCategoryId(id);
      setFromUnit(cat.defaultFrom);
      setToUnit(cat.defaultTo);
      setFromValue("1");
      setLastEdited("from");
      setToValue(computeToValue("1", cat.defaultFrom, cat.defaultTo, cat));
    },
    [computeToValue]
  );

  // Initialize toValue on first render
  useMemo(() => {
    if (toValue === "" && fromValue === "1") {
      setToValue(computeToValue("1", fromUnit, toUnit, category));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Conversion formula for display
  const formulaDisplay = useMemo(() => {
    const result = computeToValue("1", fromUnit, toUnit, category);
    if (!result) return "";
    const fromLabel = category.units.find((u) => u.id === fromUnit)?.label ?? fromUnit;
    const toLabel = category.units.find((u) => u.id === toUnit)?.label ?? toUnit;
    return `1 ${fromLabel.split(" (")[0]} = ${result} ${toLabel.split(" (")[0]}`;
  }, [fromUnit, toUnit, category, computeToValue]);

  const handleCopyResult = useCallback(async () => {
    const val = lastEdited === "from" ? toValue : fromValue;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [lastEdited, toValue, fromValue]);

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors tabular-nums";
  const selectClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors cursor-pointer";

  return (
    <div className="space-y-5">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              categoryId === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* From */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
            <select
              value={fromUnit}
              onChange={(e) => handleFromUnitChange(e.target.value)}
              className={selectClass}
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:mt-6"
            title="Swap units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          {/* To */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <input
              type="number"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
            <select
              value={toUnit}
              onChange={(e) => handleToUnitChange(e.target.value)}
              className={selectClass}
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula + copy */}
        {formulaDisplay && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2">
            <span className="text-sm text-muted-foreground font-mono">
              {formulaDisplay}
            </span>
            <button
              onClick={handleCopyResult}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy result"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
