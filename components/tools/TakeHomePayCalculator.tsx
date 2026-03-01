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
  const brackets =
    filing === "mfj" ? MFJ_BRACKETS : filing === "hoh" ? HOH_BRACKETS : SINGLE_BRACKETS;
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
  rate: number; // effective flat rate (approximate for graduated states)
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

type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";
const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

export default function TakeHomePayCalculator() {
  const [grossSalary, setGrossSalary] = useState("75000");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateCode, setStateCode] = useState("TX");
  const [preTaxDeductions, setPreTaxDeductions] = useState("0");

  const result = useMemo(() => {
    const gross = parseFloat(grossSalary) || 0;
    if (gross <= 0) return null;

    const preTax = parseFloat(preTaxDeductions) || 0;
    const stdDeduction = STANDARD_DEDUCTIONS[filingStatus];
    const taxableIncome = Math.max(0, gross - stdDeduction - preTax);

    const federalTax = calcFederalTax(taxableIncome, filingStatus);
    const socialSecurity = Math.min(gross, 176100) * 0.062;
    const medicare = gross * 0.0145;

    const stateInfo = STATES.find((s) => s.code === stateCode);
    const stateTaxableIncome = Math.max(0, gross - preTax);
    const stateTax = stateTaxableIncome * (stateInfo?.rate ?? 0);

    const totalDeductions = federalTax + socialSecurity + medicare + stateTax + preTax;
    const annualNet = gross - totalDeductions;
    const periods = PAY_PERIODS[payFrequency];

    return {
      gross,
      federalTax,
      socialSecurity,
      medicare,
      stateTax,
      preTax,
      totalDeductions,
      annualNet,
      periods,
      perPeriodGross: gross / periods,
      perPeriodFederal: federalTax / periods,
      perPeriodSS: socialSecurity / periods,
      perPeriodMedicare: medicare / periods,
      perPeriodState: stateTax / periods,
      perPeriodPreTax: preTax / periods,
      perPeriodNet: annualNet / periods,
    };
  }, [grossSalary, payFrequency, filingStatus, stateCode, preTaxDeductions]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Annual Gross Salary ($)
          </label>
          <input
            type="number"
            min="0"
            value={grossSalary}
            onChange={(e) => setGrossSalary(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Pay Frequency
          </label>
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
          <label className="block text-sm font-medium text-foreground mb-1">
            Filing Status
          </label>
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
          <label className="block text-sm font-medium text-foreground mb-1">
            State
          </label>
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Pre-Tax Deductions ($/yr)
            <span className="ml-1 text-xs text-muted-foreground">(401k, etc.)</span>
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
          {/* Hero result */}
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Take-Home Pay per Paycheck</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {fmt(result.perPeriodNet)}
            </p>
          </div>

          {/* Per-paycheck breakdown */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-primary/10">
              <span className="text-xs font-medium text-foreground">Per Paycheck Breakdown</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 text-foreground">Gross Pay</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                    {fmt(result.perPeriodGross)}
                  </td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">Federal Income Tax</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    -{fmt(result.perPeriodFederal)}
                  </td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">State Income Tax</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    -{fmt(result.perPeriodState)}
                  </td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">Social Security (6.2%)</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    -{fmt(result.perPeriodSS)}
                  </td>
                </tr>
                <tr className="border-b border-border even:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">Medicare (1.45%)</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    -{fmt(result.perPeriodMedicare)}
                  </td>
                </tr>
                {result.preTax > 0 && (
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 text-muted-foreground">Pre-Tax Deductions</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      -{fmt(result.perPeriodPreTax)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Net Pay</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold text-primary">
                    {fmt(result.perPeriodNet)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Annual summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.gross)}</span>
              <span className="text-xs text-muted-foreground">Gross Annual</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.totalDeductions)}</span>
              <span className="text-xs text-muted-foreground">Total Deductions</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">{fmt(result.annualNet)}</span>
              <span className="text-xs text-muted-foreground">Annual Net</span>
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Understanding Your Paycheck Deductions</h2>
          <p>
            Every paycheck has several deductions taken out before you receive your money:
          </p>
          <p className="mt-3">
            Federal income tax is the largest deduction for most workers. The US uses a progressive
            bracket system -- you pay 10% on income up to $11,925, 12% on the next portion, and so on up
            to 37%. Only income within each bracket is taxed at that rate.
          </p>
          <p className="mt-3">
            Social Security tax is 6.2% of your gross wages, up to $176,100 (2025 wage base). Once you
            earn above this threshold, Social Security stops being withheld for the year.
          </p>
          <p className="mt-3">
            Medicare tax is 1.45% with no income cap. High earners (over $200K single / $250K married)
            pay an additional 0.9%.
          </p>
          <p className="mt-3">
            State income tax varies widely. Nine states have no income tax at all. Others range from
            flat rates (Pennsylvania at 3.07%) to progressive rates as high as 13.3% (California).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">States With No Income Tax</h2>
          <p>
            These states have no individual income tax on wages: Alaska, Florida, Nevada, South Dakota,
            Tennessee, Texas, Washington, Wyoming. New Hampshire taxes investment income but not wages.
          </p>
          <p className="mt-3">
            Living in a no-income-tax state can meaningfully increase your take-home pay. On a $75,000
            salary, someone in Texas keeps roughly $3,000--5,000 more per year compared to someone in a
            mid-rate state like North Carolina (4.5%).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Marginal vs. Effective Tax Rate</h2>
          <p>
            Your marginal rate is the rate on your last dollar of income. Your effective rate is what you
            actually pay as a percentage of total income -- always lower.
          </p>
          <p className="mt-3">
            Example: A single filer earning $75,000 in 2025 pays:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>10% on the first $11,925 = $1,193</li>
            <li>12% on $11,925--$48,475 = $4,386</li>
            <li>22% on $48,475--$75,000 = $5,835</li>
          </ul>
          <p className="mt-2">
            Total federal tax: ~$11,413 -- effective rate of ~15.2%, not 22%.
          </p>
          <p className="mt-3">
            You never take home less money by earning more. A raise always increases your net pay.
            Use our <Link href="/calc/salary" className="text-primary underline hover:no-underline">salary calculator</Link> to
            convert between hourly and annual figures.
          </p>
        </section>
      </div>
    </div>
  );
}
