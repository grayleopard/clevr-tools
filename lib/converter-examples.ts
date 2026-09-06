import { converterConfigs } from "./conversions";

export interface ConverterExample { value: number; from: string; to: string; mode?: "si" | "iec" | "all" }

// Fixed examples from observed search tasks. They use the calculator's own
// conversion factors and stay on one canonical page per tool.
export const converterExamples: Record<string, readonly ConverterExample[]> = {
  data: [
    { value: 4.7, from: "GB", to: "MB", mode: "si" },
    { value: 4000, from: "MB", to: "GB", mode: "si" },
    { value: 1, from: "GiB", to: "MB", mode: "all" },
  ],
  speed: [
    { value: 113, from: "km/h", to: "mph" },
    { value: 97, from: "km/h", to: "mph" },
    { value: 60, from: "mph", to: "km/h" },
  ],
  weight: [
    { value: 75, from: "kg", to: "lb" },
    { value: 1, from: "lb", to: "oz" },
    { value: 1, from: "st", to: "lb" },
  ],
};

export function exampleResult(configKey: string, example: ConverterExample): string {
  const config = converterConfigs[configKey];
  const from = config.units.find((unit) => unit.symbol === example.from)!;
  const to = config.units.find((unit) => unit.symbol === example.to)!;
  return to.fromBase(from.toBase(example.value)).toLocaleString("en-US", { maximumFractionDigits: 5 });
}

export function parseConverterInput(value: string): number | null {
  const normalized = value.trim();
  if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
