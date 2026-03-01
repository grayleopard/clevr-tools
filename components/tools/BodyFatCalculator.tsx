"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Gender = "male" | "female";
type Method = "navy" | "bmi";
type Unit = "imperial" | "metric";

const CATEGORIES_MALE = [
  { label: "Essential Fat", min: 0, max: 5 },
  { label: "Athletes", min: 6, max: 13 },
  { label: "Fitness", min: 14, max: 17 },
  { label: "Average", min: 18, max: 24 },
  { label: "Obese", min: 25, max: 100 },
];

const CATEGORIES_FEMALE = [
  { label: "Essential Fat", min: 0, max: 13 },
  { label: "Athletes", min: 14, max: 20 },
  { label: "Fitness", min: 21, max: 24 },
  { label: "Average", min: 25, max: 31 },
  { label: "Obese", min: 32, max: 100 },
];

function getCategory(bf: number, gender: Gender) {
  const cats = gender === "male" ? CATEGORIES_MALE : CATEGORIES_FEMALE;
  for (const cat of cats) {
    if (bf <= cat.max) return cat.label;
  }
  return "Obese";
}

function getCategoryColor(label: string) {
  switch (label) {
    case "Essential Fat": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    case "Athletes": return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
    case "Fitness": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "Average": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
    case "Obese": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    default: return "bg-muted text-muted-foreground";
  }
}

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
        heightCmVal = ((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54;
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

      if (heightCmVal <= 0 || neckCmVal <= 0 || waistCmVal <= 0) return null;
      if (gender === "female" && hipCmVal <= 0) return null;

      let bf: number;
      if (gender === "male") {
        const diff = waistCmVal - neckCmVal;
        if (diff <= 0) return null;
        bf = 86.010 * Math.log10(diff) - 70.041 * Math.log10(heightCmVal) + 36.76;
      } else {
        const sum = waistCmVal + hipCmVal - neckCmVal;
        if (sum <= 0) return null;
        bf = 163.205 * Math.log10(sum) - 97.684 * Math.log10(heightCmVal) - 78.387;
      }

      bf = Math.round(bf * 10) / 10;
      if (bf < 0) bf = 0;

      const category = getCategory(bf, gender);
      let fatMass: number | null = null;
      let leanMass: number | null = null;
      if (weightKg > 0) {
        fatMass = Math.round(weightKg * bf / 100 * 10) / 10;
        leanMass = Math.round((weightKg - fatMass) * 10) / 10;
      }

      return { bf, category, fatMass, leanMass, weightKg };
    } else {
      // BMI method
      const ageVal = parseInt(age) || 0;
      if (ageVal <= 0) return null;

      let heightM: number, weightKg: number;
      if (unit === "imperial") {
        const totalIn = (parseFloat(bmiHeightFt) || 0) * 12 + (parseFloat(bmiHeightIn) || 0);
        heightM = totalIn * 0.0254;
        weightKg = (parseFloat(bmiWeightVal) || 0) * 0.453592;
      } else {
        heightM = (parseFloat(bmiHeightCm) || 0) / 100;
        weightKg = parseFloat(bmiWeightVal) || 0;
      }

      if (heightM <= 0 || weightKg <= 0) return null;

      const bmi = weightKg / (heightM * heightM);
      const sexVal = gender === "male" ? 1 : 0;
      let bf = 1.20 * bmi + 0.23 * ageVal - 10.8 * sexVal - 5.4;
      bf = Math.round(bf * 10) / 10;
      if (bf < 0) bf = 0;

      const category = getCategory(bf, gender);
      const fatMass = Math.round(weightKg * bf / 100 * 10) / 10;
      const leanMass = Math.round((weightKg - fatMass) * 10) / 10;

      return { bf, category, fatMass, leanMass, weightKg };
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
            {m === "navy" ? "Navy Method (Tape)" : "BMI Estimate"}
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
                <label className="block text-sm font-medium text-foreground mb-1">Height</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className={inputClass} />
                    <span className="text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="flex-1">
                    <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className={inputClass} />
                    <span className="text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Neck (inches)</label>
                <input type="number" min="0" step="0.1" value={neckIn} onChange={(e) => setNeckIn(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Waist (inches)</label>
                <input type="number" min="0" step="0.1" value={waistIn} onChange={(e) => setWaistIn(e.target.value)} className={inputClass} />
              </div>
              {gender === "female" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Hip (inches)</label>
                  <input type="number" min="0" step="0.1" value={hipIn} onChange={(e) => setHipIn(e.target.value)} className={inputClass} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Weight (lbs, optional)</label>
                <input type="number" min="0" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
                <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Neck (cm)</label>
                <input type="number" min="0" step="0.1" value={neckCm} onChange={(e) => setNeckCm(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Waist (cm)</label>
                <input type="number" min="0" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} className={inputClass} />
              </div>
              {gender === "female" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Hip (cm)</label>
                  <input type="number" min="0" step="0.1" value={hipCm} onChange={(e) => setHipCm(e.target.value)} className={inputClass} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Weight (kg, optional)</label>
                <input type="number" min="0" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Age</label>
            <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
          </div>
          {unit === "imperial" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Height</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="number" min="0" value={bmiHeightFt} onChange={(e) => setBmiHeightFt(e.target.value)} className={inputClass} />
                    <span className="text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="flex-1">
                    <input type="number" min="0" max="11" value={bmiHeightIn} onChange={(e) => setBmiHeightIn(e.target.value)} className={inputClass} />
                    <span className="text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Weight (lbs)</label>
                <input type="number" min="0" value={bmiWeightVal} onChange={(e) => setBmiWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
                <input type="number" min="0" value={bmiHeightCm} onChange={(e) => setBmiHeightCm(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Weight (kg)</label>
                <input type="number" min="0" value={bmiWeightVal} onChange={(e) => setBmiWeightVal(e.target.value)} className={inputClass} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Estimated Body Fat</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">{result.bf}%</p>
            <span className={`inline-block mt-2 rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(result.category)}`}>
              {result.category}
            </span>
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

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Body Fat Percentage Ranges by Category</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-left p-2 font-medium">Men</th>
                  <th className="text-left p-2 font-medium">Women</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Essential Fat", "2-5%", "10-13%"],
                  ["Athletes", "6-13%", "14-20%"],
                  ["Fitness", "14-17%", "21-24%"],
                  ["Average", "18-24%", "25-31%"],
                  ["Obese", "25%+", "32%+"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    {row.map((cell, j) => (<td key={j} className="p-2">{cell}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Navy Method vs. Other Measurement Methods</h2>
          <p>
            DEXA scan is the gold standard with approximately 1% error, but requires a medical facility. Hydrostatic
            weighing (water displacement) is very accurate but involves being submerged in water. Skinfold calipers
            offer moderate accuracy with a trained measurer. The Navy method (tape measure) gives a good estimate
            with 3-4% accuracy and is free to do at home. BMI-based estimates are the least accurate as they ignore
            body composition entirely.
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
