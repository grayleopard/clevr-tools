"use client";

import type { ReactNode } from "react";

/**
 * Replaces "results silently vanish" across calculators. Two distinct
 * situations share this component but read differently through copy alone,
 * not color — neither is an error:
 *  - not-yet-valid: nothing (or nothing usable) has been entered yet. A
 *    plain description of what to enter.
 *  - contradictory: real numbers were entered but they don't resolve to a
 *    sensible answer (down payment covers the full price, etc). A
 *    plain-language, ideally helpful, explanation — not a complaint.
 * message accepts a ReactNode (not just a string) so a message can include
 * an inline link, e.g. pointing to a calculator better suited to the input.
 */
export function CalculatorEmptyState({ message }: { message: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
