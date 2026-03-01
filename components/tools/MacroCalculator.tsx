"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type InputMode = "manual" | "calculate";
type Gender = "male" | "female";

const PRESETS: { label: string; carb: number; protein: number; fat: number }[] = [
  { label: "Balanced", carb: 40, protein: 30, fat: 30 },
  { label: "Low-Carb", carb: 25, protein: 40, fat: 35 },
  { label: "High-Protein", carb: 30, protein: 40, fat: 30 },
  { label: "Keto", carb: 5, protein: 30, fat: 65 },
];

const ACTIVITIES = [
  { label: "Sedentary", multiplier: 1.2 },
  { label: "Lightly active", multiplier: 1.375 },
  { label: "Moderately active", multiplier: 1.55 },
  { label: "Very active", multiplier: 1.725 },
  { label: "Extremely active", multiplier: 1.9 },
];

export default function MacroCalculator() {
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [calories, setCalories] = useState("2000");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("77");
  const [activityIdx, setActivityIdx] = useState(2);
  const [presetIdx, setPresetIdx] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [customCarb, setCustomCarb] = useState("40");
  const [customProtein, setCustomProtein] = useState("30");
  const [customFat, setCustomFat] = useState("30");

  const effectiveCalories = useMemo(() => {
    if (inputMode === "manual") return parseFloat(calories) || 0;
    const a = parseInt(age) || 0;
    const h = parseFloat(heightCm) || 0;
    const w = parseFloat(weightKg) || 0;
    if (a <= 0 || h <= 0 || w <= 0) return 0;
    let bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    return Math.round(bmr * ACTIVITIES[activityIdx].multiplier);
  }, [inputMode, calories, gender, age, heightCm, weightKg, activityIdx]);

  const macros = useMemo(() => {
    if (effectiveCalories <= 0) return null;
    let c: number, p: number, f: number;
    if (customMode) {
      c = parseFloat(customCarb) || 0;
      p = parseFloat(customProtein) || 0;
      f = parseFloat(customFat) || 0;
    } else {
      const preset = PRESETS[presetIdx];
      c = preset.carb;
      p = preset.protein;
      f = preset.fat;
    }
    const total = c + p + f;
    if (total === 0) return null;
    // normalize
    const cn = c / total;
    const pn = p / total;
    const fn = f / total;

    const carbCal = effectiveCalories * cn;
    const proteinCal = effectiveCalories * pn;
    const fatCal = effectiveCalories * fn;

    return {
      carbGrams: Math.round(carbCal / 4),
      proteinGrams: Math.round(proteinCal / 4),
      fatGrams: Math.round(fatCal / 9),
      carbCal: Math.round(carbCal),
      proteinCal: Math.round(proteinCal),
      fatCal: Math.round(fatCal),
      carbPct: Math.round(cn * 100),
      proteinPct: Math.round(pn * 100),
      fatPct: Math.round(fn * 100),
    };
  }, [effectiveCalories, presetIdx, customMode, customCarb, customProtein, customFat]);

  return (
    <div className="space-y-6">
      {/* Input mode toggle */}
      <div className="flex gap-2">
        {(["manual", "calculate"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setInputMode(m)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              inputMode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {m === "manual" ? "Enter Calories Manually" : "Calculate from Stats"}
          </button>
        ))}
      </div>

      {/* Calorie inputs */}
      {inputMode === "manual" ? (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Daily Calorie Target</label>
          <input
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {g === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Age</label>
            <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
            <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Weight (kg)</label>
            <input type="number" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Activity Level</label>
            <select value={activityIdx} onChange={(e) => setActivityIdx(parseInt(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {ACTIVITIES.map((a, i) => (<option key={i} value={i}>{a.label}</option>))}
            </select>
          </div>
        </div>
      )}

      {effectiveCalories > 0 && inputMode === "calculate" && (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
          <span className="text-sm text-muted-foreground">Estimated TDEE: </span>
          <span className="text-sm font-semibold text-primary">{effectiveCalories.toLocaleString()} cal/day</span>
        </div>
      )}

      {/* Diet presets */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Diet Preset</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => { setPresetIdx(i); setCustomMode(false); }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !customMode && presetIdx === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p.label} ({p.carb}/{p.protein}/{p.fat})
            </button>
          ))}
          <button
            onClick={() => setCustomMode(true)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              customMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {customMode && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Carbs %</label>
            <input type="number" min="0" max="100" value={customCarb} onChange={(e) => setCustomCarb(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Protein %</label>
            <input type="number" min="0" max="100" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Fat %</label>
            <input type="number" min="0" max="100" value={customFat} onChange={(e) => setCustomFat(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
      )}

      {/* Results */}
      {macros && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Protein", grams: macros.proteinGrams, cal: macros.proteinCal, pct: macros.proteinPct, color: "bg-blue-500" },
              { label: "Carbs", grams: macros.carbGrams, cal: macros.carbCal, pct: macros.carbPct, color: "bg-amber-500" },
              { label: "Fat", grams: macros.fatGrams, cal: macros.fatCal, pct: macros.fatPct, color: "bg-rose-500" },
            ].map((m) => (
              <div key={m.label} className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-bold text-primary">{m.grams}g</p>
                <p className="text-xs text-muted-foreground">{m.cal} cal ({m.pct}%)</p>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex">
            <div className="bg-blue-500 transition-all" style={{ width: `${macros.proteinPct}%` }} title={`Protein ${macros.proteinPct}%`} />
            <div className="bg-amber-500 transition-all" style={{ width: `${macros.carbPct}%` }} title={`Carbs ${macros.carbPct}%`} />
            <div className="bg-rose-500 transition-all" style={{ width: `${macros.fatPct}%` }} title={`Fat ${macros.fatPct}%`} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Protein</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Carbs</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Fat</span>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">What Are Macronutrients?</h2>
          <p>
            Protein (4 cal/g) builds and repairs muscle, supports immune function, and promotes satiety.
            Carbohydrates (4 cal/g) are your body&apos;s primary energy source, especially important for
            high-intensity exercise. Fat (9 cal/g) is essential for hormone production, absorption of
            fat-soluble vitamins (A, D, E, K), and long-lasting satiety.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Choosing Your Macro Split</h2>
          <p>
            There is no single &quot;best&quot; macro split for everyone. General guidance: building muscle benefits
            from higher protein (30-35%), endurance sports from higher carbs (50-60%), and weight loss
            from higher protein to preserve muscle mass. The ketogenic diet aims for metabolic ketosis
            with under 50g of carbs per day. The best diet is ultimately the one you can maintain consistently.
          </p>
          <p className="mt-3">
            Use our{" "}
            <Link href="/calc/calorie" className="text-primary underline hover:no-underline">calorie calculator</Link>{" "}
            to determine your daily calorie target first, then distribute those calories here.
          </p>
        </section>
      </div>
    </div>
  );
}
