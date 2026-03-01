"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Unit = "imperial" | "metric";

const ACTIVITIES = [
  { label: "Walking (3.5 mph)", met: 4.3 },
  { label: "Jogging (5 mph)", met: 7.0 },
  { label: "Running (6 mph)", met: 9.8 },
  { label: "Running (8 mph)", met: 13.8 },
  { label: "Cycling (moderate)", met: 8.0 },
  { label: "Cycling (vigorous)", met: 12.0 },
  { label: "Swimming (moderate)", met: 7.0 },
  { label: "Yoga", met: 3.0 },
  { label: "Pilates", met: 3.0 },
  { label: "Weight Training (moderate)", met: 3.5 },
  { label: "Weight Training (vigorous)", met: 6.0 },
  { label: "HIIT", met: 8.0 },
  { label: "CrossFit", met: 8.0 },
  { label: "Elliptical", met: 5.0 },
  { label: "Stair Climbing", met: 9.0 },
  { label: "Jump Rope", met: 12.3 },
  { label: "Rowing Machine", met: 7.0 },
  { label: "Dancing", met: 5.5 },
  { label: "Zumba", met: 6.0 },
  { label: "Hiking", met: 6.0 },
  { label: "Tennis (singles)", met: 7.3 },
  { label: "Basketball", met: 6.5 },
  { label: "Soccer", met: 7.0 },
  { label: "Volleyball", met: 4.0 },
  { label: "Golf (walking)", met: 4.8 },
  { label: "Gardening", met: 3.8 },
  { label: "House Cleaning", met: 3.3 },
  { label: "Grocery Shopping", met: 2.3 },
  { label: "Sex", met: 1.8 },
];

export default function CaloriesBurnedCalculator() {
  const [unit, setUnit] = useState<Unit>("imperial");
  const [weightVal, setWeightVal] = useState("170");
  const [activityIdx, setActivityIdx] = useState(0);
  const [duration, setDuration] = useState("30");

  const result = useMemo(() => {
    const durationMin = parseFloat(duration) || 0;
    if (durationMin <= 0) return null;

    let weightKg: number;
    if (unit === "imperial") {
      weightKg = (parseFloat(weightVal) || 0) * 0.453592;
    } else {
      weightKg = parseFloat(weightVal) || 0;
    }
    if (weightKg <= 0) return null;

    const activity = ACTIVITIES[activityIdx];
    const durationHours = durationMin / 60;
    const totalCalories = Math.round(activity.met * weightKg * durationHours);
    const caloriesPerMin = Math.round(totalCalories / durationMin * 10) / 10;

    // Fun comparisons
    const pizzaSlices = Math.round(totalCalories / 285 * 10) / 10;
    const walkMinutes = Math.round(totalCalories / (4.3 * weightKg / 60));

    return { totalCalories, caloriesPerMin, pizzaSlices, walkMinutes, activityName: activity.label };
  }, [unit, weightVal, activityIdx, duration]);

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex gap-2">
        {(["imperial", "metric"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {u === "imperial" ? "Pounds (lbs)" : "Kilograms (kg)"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Weight ({unit === "imperial" ? "lbs" : "kg"})</label>
          <input
            type="number"
            min="0"
            value={weightVal}
            onChange={(e) => setWeightVal(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Activity</label>
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Calories Burned</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">{result.totalCalories.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">{result.caloriesPerMin} cal/min</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{result.pizzaSlices} slices</span>
              <span className="text-xs text-muted-foreground">Pizza equivalent (285 cal/slice)</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">{result.walkMinutes} min</span>
              <span className="text-xs text-muted-foreground">Walking equivalent (3.5 mph)</span>
            </div>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How MET Values Work</h2>
          <p>
            MET (Metabolic Equivalent of Task) measures exercise intensity relative to resting. 1 MET equals
            your resting metabolic rate (approximately 1 calorie per kilogram per hour). Running at 6 mph
            (9.8 MET) burns about 10 times more calories than sitting. These are averages — actual calorie
            burn varies by fitness level, body composition, and individual metabolism.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Calorie Burn Comparison</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Activity</th>
                  <th className="text-right p-2 font-medium">Cal/hr (150 lb person)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Sleeping", "~50"],
                  ["Walking (3.5 mph)", "~290"],
                  ["Yoga", "~200"],
                  ["Cycling (moderate)", "~545"],
                  ["Swimming", "~475"],
                  ["Running (6 mph)", "~670"],
                  ["Jump Rope", "~840"],
                  ["Running (8 mph)", "~940"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2 text-right tabular-nums">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Weight Loss Through Exercise</h2>
          <p>
            Burning 3,500 extra calories through exercise equals approximately 1 pound of fat. Running 5 miles
            burns roughly 500 calories, so 7 runs would theoretically burn 1 pound. Diet changes typically have
            more impact than exercise alone, but combining both is most effective. Track your daily needs with
            our{" "}
            <Link href="/calc/calorie" className="text-primary underline hover:no-underline">calorie (TDEE) calculator</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
