"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type FilingStatus = "single" | "mfj" | "hoh";
type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 15000,
  mfj: 30000,
  hoh: 22500,
};

const SINGLE_BRACKETS: [number, number][] = [
  [11925, 0.10],
  [48475, 0.12],
  [103350, 0.22],
  [197300, 0.24],
  [250525, 0.32],
  [626350, 0.35],
  [Infinity, 0.37],
];

const MFJ_BRACKETS: [number, number][] = [
  [23850, 0.10],
  [96950, 0.12],
  [206700, 0.22],
  [394600, 0.24],
  [501050, 0.32],
  [1252700, 0.35],
  [Infinity, 0.37],
];

const HOH_BRACKETS: [number, number][] = [
  [17000, 0.10],
  [64850, 0.12],
  [103350, 0.22],
  [197300, 0.24],
  [250525, 0.32],
  [626350, 0.35],
  [Infinity, 0.37],
];

function calcFederalTax(taxableIncome: number, filing: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = filing === "mfj" ? MFJ_BRACKETS : filing === "hoh" ? HOH_BRACKETS : SINGLE_BRACKETS;
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of brackets) {
    const taxable = Math.min(taxableIncome, limit) - prev;
    if (taxable <= 0) break;
    tax += taxable * rate;
    prev = limit;
  }
  return tax;
}

interface StateInfo {
  name: string;
  code: string;
  rate: number;
}

const STATES: StateInfo[] = [
  { name: "Alabama", code: "AL", rate: 0.05 },
  { name: "Alaska", code: "AK", rate: 0 },
  { name: "Arizona", code: "AZ", rate: 0.025 },
  { name: "Arkansas", code: "AR", rate: 0.044 },
  { name: "California", code: "CA", rate: 0.08 },
  { name: "Colorado", code: "CO", rate: 0.044 },
  { name: "Connecticut", code: "CT", rate: 0.0599 },
  { name: "Delaware", code: "DE", rate: 0.066 },
  { name: "Florida", code: "FL", rate: 0 },
  { name: "Georgia", code: "GA", rate: 0.0549 },
  { name: "Hawaii", code: "HI", rate: 0.08 },
  { name: "Idaho", code: "ID", rate: 0.058 },
  { name: "Illinois", code: "IL", rate: 0.0495 },
  { name: "Indiana", code: "IN", rate: 0.0305 },
  { name: "Iowa", code: "IA", rate: 0.038 },
  { name: "Kansas", code: "KS", rate: 0.057 },
  { name: "Kentucky", code: "KY", rate: 0.04 },
  { name: "Louisiana", code: "LA", rate: 0.0425 },
  { name: "Maine", code: "ME", rate: 0.0715 },
  { name: "Maryland", code: "MD", rate: 0.0575 },
  { name: "Massachusetts", code: "MA", rate: 0.05 },
  { name: "Michigan", code: "MI", rate: 0.0425 },
  { name: "Minnesota", code: "MN", rate: 0.0785 },
  { name: "Mississippi", code: "MS", rate: 0.047 },
  { name: "Missouri", code: "MO", rate: 0.0495 },
  { name: "Montana", code: "MT", rate: 0.0575 },
  { name: "Nebraska", code: "NE", rate: 0.0564 },
  { name: "Nevada", code: "NV", rate: 0 },
  { name: "New Hampshire", code: "NH", rate: 0 },
  { name: "New Jersey", code: "NJ", rate: 0.065 },
  { name: "New Mexico", code: "NM", rate: 0.049 },
  { name: "New York", code: "NY", rate: 0.065 },
  { name: "North Carolina", code: "NC", rate: 0.045 },
  { name: "North Dakota", code: "ND", rate: 0.02 },
  { name: "Ohio", code: "OH", rate: 0.035 },
  { name: "Oklahoma", code: "OK", rate: 0.0475 },
  { name: "Oregon", code: "OR", rate: 0.08 },
  { name: "Pennsylvania", code: "PA", rate: 0.0307 },
  { name: "Rhode Island", code: "RI", rate: 0.0599 },
  { name: "South Carolina", code: "SC", rate: 0.064 },
  { name: "South Dakota", code: "SD", rate: 0 },
  { name: "Tennessee", code: "TN", rate: 0 },
  { name: "Texas", code: "TX", rate: 0 },
  { name: "Utah", code: "UT", rate: 0.0465 },
  { name: "Vermont", code: "VT", rate: 0.0675 },
  { name: "Virginia", code: "VA", rate: 0.0575 },
  { name: "Washington", code: "WA", rate: 0 },
  { name: "West Virginia", code: "WV", rate: 0.0512 },
  { name: "Wisconsin", code: "WI", rate: 0.065 },
  { name: "Wyoming", code: "WY", rate: 0 },
  { name: "District of Columbia", code: "DC", rate: 0.065 },
];

const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

export default function PaycheckCalculator() {
  const [grossPayPerPeriod, setGrossPayPerPeriod] = useState("3000");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateCode, setStateCode] = useState("TX");
  const [preTaxDeductions, setPreTaxDeductions] = useState("0");

  const result = useMemo(() => {
    const grossPer = parseFloat(grossPayPerPeriod) || 0;
    if (grossPer <= 0) return null;

    const periods = PAY_PERIODS[payFrequency];
    const grossAnnual = grossPer * periods;
    const preTax = parseFloat(preTaxDeductions) || 0;
    const annualPreTax = preTax * periods;

    const stdDeduction = STANDARD_DEDUCTIONS[filingStatus];
    const taxableIncome = Math.max(0, grossAnnual - stdDeduction - annualPreTax);
    const federalTax = calcFederalTax(taxableIncome, filingStatus);
    const socialSecurity = Math.min(grossAnnual, 176100) * 0.062;
    const medicare = grossAnnual * 0.0145;

    const stateInfo = STATES.find((s) => s.code === stateCode);
    const stateTaxableIncome = Math.max(0, grossAnnual - annualPreTax);
    const stateTax = stateTaxableIncome * (stateInfo?.rate ?? 0);

    const perFederal = federalTax / periods;
    const perSS = socialSecurity / periods;
    const perMedicare = medicare / periods;
    const perState = stateTax / periods;
    const totalDeductions = perFederal + perSS + perMedicare + perState + preTax;
    const netPay = grossPer - totalDeductions;

    return {
      grossPer,
      perFederal,
      perSS,
      perMedicare,
      perState,
      preTax,
      totalDeductions,
      netPay,
      grossAnnual,
      annualNet: netPay * periods,
    };
  }, [grossPayPerPeriod, payFrequency, filingStatus, stateCode, preTaxDeductions]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Gross Pay per Period ($)</label>
          <input
            type="number"
            min="0"
            value={grossPayPerPeriod}
            onChange={(e) => setGrossPayPerPeriod(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Pay Frequency</label>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="weekly">Weekly (52/yr)</option>
            <option value="biweekly">Bi-Weekly (26/yr)</option>
            <option value="semimonthly">Semi-Monthly (24/yr)</option>
            <option value="monthly">Monthly (12/yr)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Filing Status</label>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="single">Single</option>
            <option value="mfj">Married Filing Jointly</option>
            <option value="hoh">Head of Household</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">State</label>
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Pre-Tax Deductions ($/period)
          </label>
          <input
            type="number"
            min="0"
            value={preTaxDeductions}
            onChange={(e) => setPreTaxDeductions(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result && (
        <>
          {/* Net pay */}
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Net Pay per Paycheck</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {fmt(result.netPay)}
            </p>
          </div>

          {/* Deductions table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-primary/10">
              <span className="text-xs font-medium text-foreground">Paycheck Breakdown</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 text-foreground">Gross Pay</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{fmt(result.grossPer)}</td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">Federal Income Tax</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">-{fmt(result.perFederal)}</td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">State Income Tax</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">-{fmt(result.perState)}</td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">Social Security (6.2%)</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">-{fmt(result.perSS)}</td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">Medicare (1.45%)</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">-{fmt(result.perMedicare)}</td>
                </tr>
                {result.preTax > 0 && (
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 text-muted-foreground">Pre-Tax Deductions</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">-{fmt(result.preTax)}</td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Net Pay</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold text-primary">{fmt(result.netPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Annual */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.grossAnnual)}</span>
              <span className="text-xs text-muted-foreground">Gross Annual</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.annualNet)}</span>
              <span className="text-xs text-muted-foreground">Net Annual</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            State taxes are estimates based on approximate effective rates. Consult a tax professional for exact calculations.
          </p>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Why Your Paycheck Is Less Than You Expect</h2>
          <p>A concrete example: $75,000 salary, single filer, no dependents, living in Texas (no state tax):</p>
          <p className="mt-3">
            Annual gross: $75,000<br />
            Bi-weekly gross (/26): $2,885
          </p>
          <p className="mt-3">Deductions per paycheck:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Federal income tax: ~$497 (effective ~17.2% annual)</li>
            <li>Social Security (6.2%): $179</li>
            <li>Medicare (1.45%): $42</li>
            <li>Total deductions: ~$718</li>
          </ul>
          <p className="mt-3">
            Net paycheck: ~$2,167
          </p>
          <p className="mt-3">
            That&apos;s a 25% reduction from gross. Someone earning $75K &quot;grosses&quot; $2,885 per paycheck but
            takes home $2,167. For the annual view and state tax breakdowns, see our{" "}
            <Link href="/calc/take-home-pay" className="text-primary underline hover:no-underline">take-home pay calculator</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Adjusting Your Withholding</h2>
          <p>
            If you consistently get a large tax refund, you&apos;re giving the government an interest-free
            loan. If you owe money each year, you may face underpayment penalties. The IRS W-4 form
            controls your withholding -- claiming more allowances reduces withholding (more take-home
            pay but a smaller refund or potential underpayment), while claiming fewer increases withholding.
          </p>
          <p className="mt-3">
            Use the IRS withholding estimator at irs.gov/W4app to find the right number for your
            situation. Life changes like marriage, a new job, or a major income change warrant a W-4 review.
          </p>
        </section>
      </div>
    </div>
  );
}
