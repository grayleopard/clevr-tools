"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TipJar } from "@/components/tool/TipJar";
import { CalculatorEmptyState } from "@/components/tool/CalculatorEmptyState";
import {
  CIRCUMFERENCE_FORMULAS,
  estimateCircumferenceBodyFat,
} from "@/lib/p1-remediation/body-fat";

type Gender = "male" | "female";
type Method = "navy" | "bmi";
type Unit = "imperial" | "metric";

export default function BodyFatCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [method, setMethod] = useState<Method>("navy");
  const [unit, setUnit] = useState<Unit>("imperial");

  // Navy method
  const [neckIn, setNeckIn] = useState("15");
  const [waistIn, setWaistIn] = useState("34");
  const [hipIn, setHipIn] = useState("38");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("10");
  const [neckCm, setNeckCm] = useState("38");
  const [waistCm, setWaistCm] = useState("86");
  const [hipCm, setHipCm] = useState("97");
  const [heightCm, setHeightCm] = useState("178");
  const [weightVal, setWeightVal] = useState("170");

  // BMI method
  const [age, setAge] = useState("30");
  const [bmiWeightVal, setBmiWeightVal] = useState("170");
  const [bmiHeightFt, setBmiHeightFt] = useState("5");
  const [bmiHeightIn, setBmiHeightIn] = useState("10");
  const [bmiHeightCm, setBmiHeightCm] = useState("178");

  const result = useMemo(() => {
    if (method === "navy") {
      let heightCmVal: number, neckCmVal: number, waistCmVal: number, hipCmVal: number;
      let weightKg: number;

      if (unit === "imperial") {
        const feet = parseFloat(heightFt);
        const inches = parseFloat(heightIn);
        if (!Number.isFinite(feet) || !Number.isFinite(inches) || feet < 0 || inches < 0 || inches >= 12) {
          return { ok: false as const, emptyMessage: "Enter height as feet plus 0 to 11.9 inches." };
        }
        heightCmVal = (feet * 12 + inches) * 2.54;
        neckCmVal = (parseFloat(neckIn) || 0) * 2.54;
        waistCmVal = (parseFloat(waistIn) || 0) * 2.54;
        hipCmVal = (parseFloat(hipIn) || 0) * 2.54;
        weightKg = (parseFloat(weightVal) || 0) * 0.453592;
      } else {
        heightCmVal = parseFloat(heightCm) || 0;
        neckCmVal = parseFloat(neckCm) || 0;
        waistCmVal = parseFloat(waistCm) || 0;
        hipCmVal = parseFloat(hipCm) || 0;
        weightKg = parseFloat(weightVal) || 0;
      }

      const estimate = estimateCircumferenceBodyFat({
        gender,
        heightCm: heightCmVal,
        neckCm: neckCmVal,
        waistCm: waistCmVal,
        hipCm: gender === "female" ? hipCmVal : undefined,
      });
      if (!estimate.ok) {
        return { ok: false as const, emptyMessage: estimate.error };
      }

      const bf = Math.round(estimate.bodyFatPercent * 10) / 10;
      let fatMass: number | null = null;
      let leanMass: number | null = null;
      if (Number.isFinite(weightKg) && weightKg > 0) {
        fatMass = Math.round(weightKg * bf / 100 * 10) / 10;
        leanMass = Math.round((weightKg - fatMass) * 10) / 10;
      }

      return { ok: true as const, bf, fatMass, leanMass, weightKg };
    } else {
      // BMI method
      const ageVal = Number(age);
      if (!Number.isFinite(ageVal) || ageVal <= 0 || ageVal > 120) {
        return { ok: false as const, emptyMessage: "Enter an age from 1 to 120." };
      }

      let heightM: number, weightKg: number;
      if (unit === "imperial") {
        const feet = parseFloat(bmiHeightFt);
        const inches = parseFloat(bmiHeightIn);
        if (!Number.isFinite(feet) || !Number.isFinite(inches) || feet < 0 || inches < 0 || inches >= 12) {
          return { ok: false as const, emptyMessage: "Enter height as feet plus 0 to 11.9 inches." };
        }
        const totalIn = feet * 12 + inches;
        heightM = totalIn * 0.0254;
        weightKg = (parseFloat(bmiWeightVal) || 0) * 0.453592;
      } else {
        heightM = (parseFloat(bmiHeightCm) || 0) / 100;
        weightKg = parseFloat(bmiWeightVal) || 0;
      }

      if (!Number.isFinite(heightM) || !Number.isFinite(weightKg) || heightM <= 0 || weightKg <= 0) {
        return { ok: false as const, emptyMessage: "Enter your age, height, and weight to estimate body fat." };
      }

      const bmi = weightKg / (heightM * heightM);
      const sexVal = gender === "male" ? 1 : 0;
      let bf = 1.20 * bmi + 0.23 * ageVal - 10.8 * sexVal - 5.4;
      if (!Number.isFinite(bf) || bf <= 0 || bf >= 100) {
        return { ok: false as const, emptyMessage: "These inputs produce a result outside the formula's physical range. Check each value." };
      }
      bf = Math.round(bf * 10) / 10;

      const fatMass = Math.round(weightKg * bf / 100 * 10) / 10;
      const leanMass = Math.round((weightKg - fatMass) * 10) / 10;

      return { ok: true as const, bf, fatMass, leanMass, weightKg };
    }
  }, [method, gender, unit, neckIn, waistIn, hipIn, heightFt, heightIn, neckCm, waistCm, hipCm, heightCm, weightVal, age, bmiWeightVal, bmiHeightFt, bmiHeightIn, bmiHeightCm]);

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-6">
      {/* Gender toggle */}
      <div className="flex gap-2">
        {(["male", "female"] as const).map((g) => (
          <button key={g} onClick={() => setGender(g)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {g === "male" ? "Male" : "Female"}
          </button>
        ))}
      </div>

      {/* Method toggle */}
      <div className="flex gap-2">
        {(["navy", "bmi"] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${method === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {m === "navy" ? "Legacy Circumference Estimate" : "BMI Estimate"}
          </button>
        ))}
      </div>

      {/* Unit toggle */}
      <div className="flex gap-2">
        {(["imperial", "metric"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {u === "imperial" ? "Imperial" : "Metric"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      {method === "navy" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {unit === "imperial" ? (
            <>
              <div>
                <label htmlFor="navy-height-ft" className="block text-sm font-medium text-foreground mb-1">Height</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input id="navy-height-ft" type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} aria-describedby="navy-height-ft-unit" className={inputClass} />
                    <span id="navy-height-ft-unit" className="text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="flex-1">
                    <input id="navy-height-in" type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} aria-describedby="navy-height-in-unit" className={inputClass} />
                    <span id="navy-height-in-unit" className="text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="navy-neck-in" className="block text-sm font-medium text-foreground mb-1">Neck (inches)</label>
                <input id="navy-neck-in" type="number" min="0" step="0.1" value={neckIn} onChange={(e) => setNeckIn(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="navy-waist-in" className="block text-sm font-medium text-foreground mb-1">Waist (inches)</label>
                <input id="navy-waist-in" type="number" min="0" step="0.1" value={waistIn} onChange={(e) => setWaistIn(e.target.value)} className={inputClass} />
              </div>
              {gender === "female" && (
                <div>
                  <label htmlFor="navy-hip-in" className="block text-sm font-medium text-foreground mb-1">Hip (inches)</label>
                  <input id="navy-hip-in" type="number" min="0" step="0.1" value={hipIn} onChange={(e) => setHipIn(e.target.value)} className={inputClass} />
                </div>
              )}
              <div>
                <label htmlFor="navy-weight-lbs" className="block text-sm font-medium text-foreground mb-1">Weight (lbs, optional)</label>
                <input id="navy-weight-lbs" type="number" min="0" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="navy-height-cm" className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
                <input id="navy-height-cm" type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="navy-neck-cm" className="block text-sm font-medium text-foreground mb-1">Neck (cm)</label>
                <input id="navy-neck-cm" type="number" min="0" step="0.1" value={neckCm} onChange={(e) => setNeckCm(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="navy-waist-cm" className="block text-sm font-medium text-foreground mb-1">Waist (cm)</label>
                <input id="navy-waist-cm" type="number" min="0" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} className={inputClass} />
              </div>
              {gender === "female" && (
                <div>
                  <label htmlFor="navy-hip-cm" className="block text-sm font-medium text-foreground mb-1">Hip (cm)</label>
                  <input id="navy-hip-cm" type="number" min="0" step="0.1" value={hipCm} onChange={(e) => setHipCm(e.target.value)} className={inputClass} />
                </div>
              )}
              <div>
                <label htmlFor="navy-weight-kg" className="block text-sm font-medium text-foreground mb-1">Weight (kg, optional)</label>
                <input id="navy-weight-kg" type="number" min="0" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bmi-age" className="block text-sm font-medium text-foreground mb-1">Age</label>
            <input id="bmi-age" type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
          </div>
          {unit === "imperial" ? (
            <>
              <div>
                <label htmlFor="bmi-height-ft" className="block text-sm font-medium text-foreground mb-1">Height</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input id="bmi-height-ft" type="number" min="0" value={bmiHeightFt} onChange={(e) => setBmiHeightFt(e.target.value)} aria-describedby="bmi-height-ft-unit" className={inputClass} />
                    <span id="bmi-height-ft-unit" className="text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="flex-1">
                    <input id="bmi-height-in" type="number" min="0" max="11" value={bmiHeightIn} onChange={(e) => setBmiHeightIn(e.target.value)} aria-describedby="bmi-height-in-unit" className={inputClass} />
                    <span id="bmi-height-in-unit" className="text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="bmi-weight-lbs" className="block text-sm font-medium text-foreground mb-1">Weight (lbs)</label>
                <input id="bmi-weight-lbs" type="number" min="0" value={bmiWeightVal} onChange={(e) => setBmiWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="bmi-height-cm" className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
                <input id="bmi-height-cm" type="number" min="0" value={bmiHeightCm} onChange={(e) => setBmiHeightCm(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bmi-weight-kg" className="block text-sm font-medium text-foreground mb-1">Weight (kg)</label>
                <input id="bmi-weight-kg" type="number" min="0" value={bmiWeightVal} onChange={(e) => setBmiWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          )}
        </div>
      )}

      {method === "navy" && (
        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <div>
            <p className="font-semibold text-foreground">Formula used</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
              {gender === "male" ? CIRCUMFERENCE_FORMULAS.male : CIRCUMFERENCE_FORMULAS.female}
            </p>
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {CIRCUMFERENCE_FORMULAS.conversion}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{CIRCUMFERENCE_FORMULAS.units}</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This implements the legacy Hodgdon-Beckett circumference equation as a screening estimate. It is not a
            medical measurement and is not the Navy&apos;s current official Body Composition Assessment. For an official
            assessment, follow the current Navy guide and its required tables and PRIMS process.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href="https://apps.dtic.mil/sti/tr/pdf/ADA143890.pdf"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline hover:no-underline"
            >
              Original male equation report
            </a>
            <a
              href="https://apps.dtic.mil/sti/tr/pdf/ADA146456.pdf"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline hover:no-underline"
            >
              Original female equation report
            </a>
          </div>
          <a
            href="https://www.mynavyhr.navy.mil/Portals/55/Support/Culture%20Resilience/Physical/Guide-4%20Body%20Composition%20Assessment.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-primary underline hover:no-underline"
          >
            Current Navy Body Composition Assessment Guide
          </a>
        </div>
      )}

      {/* Results */}
      {result && !result.ok && <CalculatorEmptyState message={result.emptyMessage} />}

      {result?.ok && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Estimated Body Fat</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary tabular-nums">{result.bf}%</p>
            <p className="mt-2 text-xs text-muted-foreground">Screening estimate only; individual error can be meaningful.</p>
          </div>

          {result.fatMass !== null && result.leanMass !== null && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {unit === "imperial" ? `${Math.round(result.fatMass / 0.453592)} lbs` : `${result.fatMass} kg`}
                </span>
                <span className="text-xs text-muted-foreground">Fat Mass</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {unit === "imperial" ? `${Math.round(result.leanMass / 0.453592)} lbs` : `${result.leanMass} kg`}
                </span>
                <span className="text-xs text-muted-foreground">Lean Mass</span>
              </div>
            </div>
          )}
        </>
      )}

      <TipJar />

      {/* Method notes */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to interpret this estimate</h2>
          <p>
            Tape and BMI equations estimate body composition from a few measurements; they do not directly measure
            body fat. Small differences in tape placement or tension can change the result. Use the same method and
            measurement technique when comparing changes over time, and do not use this number alone for medical,
            nutrition, or eligibility decisions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Current Navy assessments</h2>
          <p>
            The current official Navy process is defined by the current Body Composition Assessment Guide and can
            change independently of this educational estimator. Consult that guide and authorized personnel for an
            official result.
          </p>
          <p className="mt-3">
            For a simpler screening, use our{" "}
            <Link href="/calc/bmi" className="text-primary underline hover:no-underline">BMI calculator</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
