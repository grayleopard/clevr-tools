"use client";

import { TipJar } from "@/components/tool/TipJar";

export default function TakeHomePayCalculator() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-6">
        <p className="text-lg font-semibold text-foreground">Take-home pay estimates are temporarily unavailable</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A dependable estimate must apply the current federal withholding method, your Form W-4 elections,
          Social Security and Medicare rules, and the applicable state and local rules. The prior calculator used
          broad state-rate approximations and did not model enough of those inputs, so its results have been removed.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For a current federal estimate, use recent pay stubs with the official IRS Tax Withholding Estimator. For
          state, local, benefit, and employer-specific deductions, compare the estimate with your payroll department
          or current pay statement.
        </p>
        <a
          href="https://www.irs.gov/individuals/tax-withholding-estimator"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Open the IRS Tax Withholding Estimator
        </a>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Do not use an informal estimate to file a return, change withholding, or make a financial commitment.
      </p>

      <TipJar />
    </div>
  );
}
