"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Gender = "male" | "female";
type Unit = "imperial" | "metric";
type Frame = "small" | "medium" | "large";

function fmtKg(kg: number, unit: Unit): string {
  if (unit === "imperial") return `${Math.round(kg / 0.453592)} lbs`;
  return `${Math.round(kg * 10) / 10} kg`;
}

export default function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<Unit>("imperial");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("10");
  const [heightCm, setHeightCm] = useState("178");
  const [frame, setFrame] = useState<Frame>("medium");

  const result = useMemo(() => {
    let heightInches: number;
    let heightM: number;

    if (unit === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      heightInches = ft * 12 + inches;
      heightM = heightInches * 0.0254;
    } else {
      heightM = (parseFloat(heightCm) || 0) / 100;
      heightInches = heightM / 0.0254;
    }

    if (heightInches <= 60 || heightM <= 0) return null;

    const over60 = heightInches - 60;
    const isMale = gender === "male";

    // Formulas give weight in kg
    const devine = isMale ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
    const robinson = isMale ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
    const miller = isMale ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;
    const hamwi = isMale ? 48 + 2.7 * over60 : 45.5 + 2.2 * over60;

    // BMI range
    const bmiMin = 18.5 * heightM * heightM;
    const bmiMax = 24.9 * heightM * heightM;

    // Frame adjustment
    const frameMultiplier = frame === "small" ? 0.9 : frame === "large" ? 1.1 : 1.0;

    return {
      devine: devine * frameMultiplier,
      robinson: robinson * frameMultiplier,
      miller: miller * frameMultiplier,
      hamwi: hamwi * frameMultiplier,
      bmiMin,
      bmiMax,
      frameMultiplier,
    };
  }, [gender, unit, heightFt, heightIn, heightCm, frame]);

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

      {/* Unit toggle */}
      <div className="flex gap-2">
        {(["imperial", "metric"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {u === "imperial" ? "Imperial (ft/in)" : "Metric (cm)"}
          </button>
        ))}
      </div>

      {/* Height input */}
      {unit === "imperial" ? (
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
      ) : (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
          <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputClass} />
        </div>
      )}

      {/* Frame size */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Frame Size (optional)</label>
        <div className="flex gap-2">
          {(["small", "medium", "large"] as const).map((f) => (
            <button key={f} onClick={() => setFrame(f)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${frame === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Healthy BMI Range (18.5 - 24.9)</p>
            <p className="text-3xl sm:text-4xl font-bold text-primary">
              {fmtKg(result.bmiMin, unit)} - {fmtKg(result.bmiMax, unit)}
            </p>
          </div>

          {/* Formula comparison table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/10">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground">Formula</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-foreground">Ideal Weight</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Devine (1974)", value: result.devine },
                  { label: "Robinson (1983)", value: result.robinson },
                  { label: "Miller (1983)", value: result.miller },
                  { label: "Hamwi (1964)", value: result.hamwi },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0 even:bg-muted/30">
                    <td className="px-4 py-2.5 text-foreground">{row.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                      {fmtKg(row.value, unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {frame !== "medium" && (
            <p className="text-xs text-muted-foreground text-center">
              Results adjusted {frame === "small" ? "-10%" : "+10%"} for {frame} frame size.
            </p>
          )}
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Why &quot;Ideal Weight&quot; Differs by Formula</h2>
          <p>
            These formulas were developed in the 1960s-70s for estimating medication dosing, not for defining
            health. They were based on specific populations and don&apos;t account for modern body composition
            knowledge. The BMI range (18.5-24.9) provides a more broadly applicable estimate. For more
            nuanced assessments, try our{" "}
            <Link href="/calc/bmi" className="text-primary underline hover:no-underline">BMI calculator</Link>{" "}
            and{" "}
            <Link href="/calc/body-fat" className="text-primary underline hover:no-underline">body fat calculator</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">A Better Way to Think About Weight</h2>
          <p>
            Weight is just one metric. Body composition (the ratio of fat to muscle), energy levels, lab values
            (blood pressure, cholesterol, blood sugar), and functional fitness are better indicators of health
            than a number on a scale. Focus on how you feel and perform rather than chasing a specific number.
          </p>
        </section>
      </div>
    </div>
  );
}
