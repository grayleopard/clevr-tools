"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Unit = "imperial" | "metric";

interface BmiCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  darkColor: string;
}

const CATEGORIES: BmiCategory[] = [
  { label: "Underweight", min: 0, max: 18.5, color: "text-blue-600", darkColor: "dark:text-blue-400" },
  { label: "Normal", min: 18.5, max: 25, color: "text-green-600", darkColor: "dark:text-green-400" },
  { label: "Overweight", min: 25, max: 30, color: "text-yellow-600", darkColor: "dark:text-yellow-400" },
  { label: "Obese I", min: 30, max: 35, color: "text-orange-600", darkColor: "dark:text-orange-400" },
  { label: "Obese II", min: 35, max: 40, color: "text-red-600", darkColor: "dark:text-red-400" },
  { label: "Obese III", min: 40, max: 100, color: "text-red-800", darkColor: "dark:text-red-300" },
];

function getCategory(bmi: number): BmiCategory {
  for (const cat of CATEGORIES) {
    if (bmi < cat.max) return cat;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState<Unit>("imperial");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("10");
  const [weightLbs, setWeightLbs] = useState("170");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("77");

  const result = useMemo(() => {
    let heightM: number;
    let weightKgVal: number;

    if (unit === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const totalIn = ft * 12 + inches;
      if (totalIn <= 0) return null;
      heightM = totalIn * 0.0254;
      weightKgVal = (parseFloat(weightLbs) || 0) * 0.453592;
    } else {
      heightM = ((parseFloat(heightCm) || 0)) / 100;
      weightKgVal = parseFloat(weightKg) || 0;
    }

    if (heightM <= 0 || weightKgVal <= 0) return null;

    const bmi = weightKgVal / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;
    const category = getCategory(bmiRounded);

    const minKg = 18.5 * heightM * heightM;
    const maxKg = 24.9 * heightM * heightM;

    let healthyRange: string;
    if (unit === "imperial") {
      const minLbs = Math.round(minKg / 0.453592);
      const maxLbs = Math.round(maxKg / 0.453592);
      healthyRange = `${minLbs} - ${maxLbs} lbs`;
    } else {
      healthyRange = `${Math.round(minKg * 10) / 10} - ${Math.round(maxKg * 10) / 10} kg`;
    }

    // Scale position (clamped 15-40 range)
    const position = Math.max(0, Math.min(100, ((bmiRounded - 15) / 25) * 100));

    return { bmi: bmiRounded, category, healthyRange, position };
  }, [unit, heightFt, heightIn, weightLbs, heightCm, weightKg]);

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setUnit("imperial")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            unit === "imperial"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Imperial (ft/lbs)
        </button>
        <button
          onClick={() => setUnit("metric")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            unit === "metric"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Metric (cm/kg)
        </button>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        {unit === "imperial" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Height
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground">ft</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground">in</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                min="0"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="0"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </>
        )}
      </div>

      {result && (
        <>
          {/* BMI result card with blue accent */}
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              {result.bmi}
            </p>
            <span
              className={`inline-block mt-2 rounded-full px-3 py-1 text-sm font-medium ${
                result.category.label === "Normal"
                  ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {result.category.label}
            </span>
          </div>

          {/* BMI scale bar */}
          <div className="space-y-2">
            <div className="relative h-4 w-full rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-blue-400" />
                <div className="flex-1 bg-green-400" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-orange-400" />
                <div className="flex-1 bg-red-400" />
                <div className="flex-1 bg-red-700" />
              </div>
              <div
                className="absolute top-0 h-full w-1 bg-foreground dark:bg-white rounded"
                style={{ left: `${result.position}%`, transform: "translateX(-50%)" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
            </div>
          </div>

          {/* Healthy range */}
          <div className="rounded-xl border border-border bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Healthy weight range for your height
            </p>
            <p className="text-lg font-semibold text-primary mt-1">
              {result.healthyRange}
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            BMI is a general screening tool and not a diagnostic measure. It
            does not account for muscle mass, bone density, age, sex, or
            ethnicity. Athletes and muscular individuals may have a high BMI
            despite being healthy. Consult a healthcare professional for
            personalized health assessment.
          </p>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">BMI Categories and What They Mean</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">BMI Range</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-left p-2 font-medium">Health Risk</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Below 18.5", "Underweight", "Increased risk of nutritional deficiency, osteoporosis"],
                  ["18.5\u201324.9", "Normal weight", "Lowest risk for weight-related health conditions"],
                  ["25.0\u201329.9", "Overweight", "Elevated risk for cardiovascular disease, type 2 diabetes"],
                  ["30.0\u201334.9", "Obesity Class I", "High risk for multiple chronic conditions"],
                  ["35.0\u201339.9", "Obesity Class II", "Very high risk"],
                  ["40+", "Obesity Class III", "Extremely high risk"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    {row.map((cell, j) => (
                      <td key={j} className="p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">BMI Limitations</h2>
          <p>
            BMI doesn&apos;t distinguish muscle from fat. A highly muscular person (bodybuilder, athlete)
            may have an &quot;overweight&quot; or &quot;obese&quot; BMI while having very low body fat. Conversely, someone
            with a &quot;normal&quot; BMI can have high body fat and low muscle (called &quot;normal weight obesity&quot;).
          </p>
          <p className="mt-3">
            BMI also doesn&apos;t account for fat distribution — abdominal fat carries higher health risk
            than fat stored elsewhere. Use our{" "}
            <Link href="/calc/body-fat" className="text-primary underline hover:no-underline">body fat calculator</Link>{" "}
            for a more detailed estimate. BMI is a screening tool, not a diagnostic one. Always consult a
            healthcare provider for medical advice.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">BMI vs. Other Measures</h2>
          <p>
            For a more comprehensive picture of your body composition, consider using our{" "}
            <Link href="/calc/body-fat" className="text-primary underline hover:no-underline">body fat calculator</Link>{" "}
            which estimates body fat percentage using the Navy method or BMI-based formula. Our{" "}
            <Link href="/calc/ideal-weight" className="text-primary underline hover:no-underline">ideal weight calculator</Link>{" "}
            compares multiple medical formulas (Devine, Robinson, Miller, Hamwi) to give you a range of estimates.
          </p>
        </section>
      </div>
    </div>
  );
}
