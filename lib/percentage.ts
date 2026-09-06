export type PercentageMode = "percent-of" | "is-what-percent" | "percent-change";
export interface PercentageResult { result: string; formula: string; error?: string }

export function calculatePercentage(mode: PercentageMode, first: string, second: string): PercentageResult {
  const empty = { result: "", formula: "" };
  if (!first.trim() || !second.trim()) return empty;
  const x = Number(first), y = Number(second);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { ...empty, error: "Enter finite numbers." };
  if (mode === "is-what-percent" && y === 0) return { ...empty, error: "The whole must be greater or less than zero." };
  if (mode === "percent-change" && x <= 0) return { ...empty, error: "Use a positive original value to calculate percentage change." };
  const value = mode === "percent-of" ? (x / 100) * y : mode === "is-what-percent" ? (x / y) * 100 : ((y - x) / x) * 100;
  if (!Number.isFinite(value)) return { ...empty, error: "These values produce a result that is too large. Try smaller numbers." };
  const display = String(Number(Math.abs(value).toPrecision(10)));
  const signed = `${value < 0 ? "−" : ""}${display}`;
  if (mode === "percent-of") return { result: signed, formula: `(${x} ÷ 100) × ${y} = ${signed}` };
  if (mode === "is-what-percent") return { result: `${signed}%`, formula: `(${x} ÷ ${y}) × 100 = ${signed}%` };
  return {
    result: value === 0 ? "0% — no change" : `${display}% ${value > 0 ? "increase" : "decrease"}`,
    formula: `((${y} − ${x}) ÷ ${x}) × 100 = ${signed}%`,
  };
}
