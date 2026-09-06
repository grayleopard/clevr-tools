"use client";

export const MEASURED_CALCULATORS = ["data", "speed", "weight", "percentage"] as const;
export type CalculatorEvent = "started" | "succeeded" | "copy";

/** Never send input values, results, units, query strings or other user content. */
export function trackCalculatorEvent(tool: string, event: CalculatorEvent): void {
  if (!(MEASURED_CALCULATORS as readonly string[]).includes(tool)) return;
  if (!["started", "succeeded", "copy"].includes(event)) return;
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: unknown }).gtag;
  if (typeof gtag === "function") {
    gtag("event", `calculator_${event}`, { tool });
  }
}
