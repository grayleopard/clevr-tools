"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Unit = "imperial" | "metric";
type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

const ACTIVITIES = [
  { label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { label: "Lightly active (1-3 days/week)", multiplier: 1.375 },
  { label: "Moderately active (3-5 days/week)", multiplier: 1.55 },
  { label: "Very active (6-7 days/week)", multiplier: 1.725 },
  { label: "Extremely active (athlete/physical job)", multiplier: 1.9 },
];

export default function CalorieCalculator() {
  const [unit, setUnit] = useState<Unit>("imperial");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("30");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("10");
  const [heightCm, setHeightCm] = useState("178");
  const [weightLbs, setWeightLbs] = useState("170");
  const [weightKg, setWeightKg] = useState("77");
  const [activityIdx, setActivityIdx] = useState(2);
  const [goal, setGoal] = useState<Goal>("maintain");

  const result = useMemo(() => {
    const ageVal = parseInt(age) || 0;
    if (ageVal <= 0) return null;

    let weightKgVal: number;
    let heightCmVal: number;

    if (unit === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      heightCmVal = (ft * 12 + inches) * 2.54;
      weightKgVal = (parseFloat(weightLbs) || 0) * 0.453592;
    } else {
      heightCmVal = parseFloat(heightCm) || 0;
      weightKgVal = parseFloat(weightKg) || 0;
    }

    if (heightCmVal <= 0 || weightKgVal <= 0) return null;

    // Mifflin-St Jeor
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weightKgVal + 6.25 * heightCmVal - 5 * ageVal + 5;
    } else {
      bmr = 10 * weightKgVal + 6.25 * heightCmVal - 5 * ageVal - 161;
    }

    const tdee = bmr * ACTIVITIES[activityIdx].multiplier;
    const lose = Math.round(tdee - 500);
    const maintain = Math.round(tdee);
    const gain = Math.round(tdee + 500);

    return { bmr: Math.round(bmr), tdee: maintain, lose, maintain, gain };
  }, [unit, gender, age, heightFt, heightIn, heightCm, weightLbs, weightKg, activityIdx]);

  const goalCalories = result
    ? goal === "lose"
      ? result.lose
      : goal === "gain"
        ? result.gain
        : result.maintain
    : 0;

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex gap-2">
        {(["imperial", "metric"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              unit === u
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {u === "imperial" ? "Imperial (ft/lbs)" : "Metric (cm/kg)"}
          </button>
        ))}
      </div>

      {/* Gender toggle */}
      <div className="flex gap-2">
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              gender === g
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {g === "male" ? "Male" : "Female"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Age</label>
          <input
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        {unit === "imperial" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Height</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <span className="text-xs text-muted-foreground">ft</span>
              </div>
              <div className="flex-1">
                <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <span className="text-xs text-muted-foreground">in</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
            <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        )}
        {unit === "imperial" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Weight (lbs)</label>
            <input type="number" min="0" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Weight (kg)</label>
            <input type="number" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Activity Level</label>
          <select
            value={activityIdx}
            onChange={(e) => setActivityIdx(parseInt(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ACTIVITIES.map((a, i) => (
              <option key={i} value={i}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Goal selection */}
      <div className="flex gap-2">
        {(["lose", "maintain", "gain"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGoal(g)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              goal === g
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {g === "lose" ? "Lose Weight" : g === "maintain" ? "Maintain" : "Gain Weight"}
          </button>
        ))}
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Daily Calories to {goal === "lose" ? "Lose Weight" : goal === "gain" ? "Gain Weight" : "Maintain Weight"}
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {goalCalories.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">calories/day</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Lose Weight", value: result.lose, desc: "-500 cal/day" },
              { label: "Maintain", value: result.maintain, desc: "TDEE" },
              { label: "Gain Weight", value: result.gain, desc: "+500 cal/day" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3"
              >
                <span className="text-sm font-semibold tabular-nums text-foreground">{item.value.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground/60">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
            <span className="text-sm text-muted-foreground">Basal Metabolic Rate (BMR): </span>
            <span className="text-sm font-semibold text-foreground">{result.bmr.toLocaleString()} cal/day</span>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Many Calories Do You Need Per Day?</h2>
          <p>
            Average guidelines suggest about 2,000 calories for women and 2,500 for men, but individual
            needs vary significantly based on body size, age, and activity level. Your Total Daily Energy
            Expenditure (TDEE) is a personalized estimate that accounts for your basal metabolic rate plus
            your daily activity.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">The Mifflin-St Jeor Equation</h2>
          <p>
            The Mifflin-St Jeor equation is considered the most accurate BMR formula available without
            lab testing. BMR represents the calories your body burns at complete rest — just to keep your
            organs functioning, blood circulating, and cells regenerating. Your TDEE then accounts for your
            actual daily activity using conservative multipliers. Most people overestimate their activity
            level, so when in doubt, choose one level lower.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Calorie Deficit and Weight Loss</h2>
          <p>
            A 500-calorie daily deficit leads to approximately 1 pound of weight loss per week (since
            3,500 calories equals roughly 1 pound of body fat). Don&apos;t go below 1,200 calories/day
            for women or 1,500 for men without medical supervision. Rapid weight loss often leads to
            muscle loss, not just fat loss.
          </p>
          <p className="mt-3">
            Once you know your calorie target, use our{" "}
            <Link href="/calc/macro" className="text-primary underline hover:no-underline">macro calculator</Link>{" "}
            to determine how to distribute those calories across protein, carbs, and fat.
          </p>
        </section>
      </div>
    </div>
  );
}
