"use client";

import { useState, useMemo } from "react";

type Method = "lmp" | "conception" | "ivf";
type IvfType = "3day" | "5day";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DueDateCalculator() {
  const [method, setMethod] = useState<Method>("lmp");
  const [dateStr, setDateStr] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [ivfType, setIvfType] = useState<IvfType>("5day");

  const result = useMemo(() => {
    if (!dateStr) return null;
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return null;

    let dueDate: Date;
    let gestationStart: Date;

    if (method === "lmp") {
      const cl = parseInt(cycleLength) || 28;
      const adjustment = cl - 28;
      dueDate = addDays(date, 280 + adjustment);
      gestationStart = date;
    } else if (method === "conception") {
      dueDate = addDays(date, 266);
      gestationStart = addDays(date, -14);
    } else {
      // IVF
      const daysToAdd = ivfType === "3day" ? 263 : 261;
      dueDate = addDays(date, daysToAdd);
      gestationStart = addDays(date, ivfType === "3day" ? -17 : -19);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysPregnant = diffDays(gestationStart, today);
    const weeksPregnant = Math.floor(daysPregnant / 7);
    const daysRemainder = daysPregnant % 7;

    let trimester: number;
    let trimesterLabel: string;
    let trimesterColor: string;
    if (weeksPregnant < 13) {
      trimester = 1;
      trimesterLabel = "First Trimester";
      trimesterColor = "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    } else if (weeksPregnant < 28) {
      trimester = 2;
      trimesterLabel = "Second Trimester";
      trimesterColor = "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
    } else {
      trimester = 3;
      trimesterLabel = "Third Trimester";
      trimesterColor = "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
    }

    const milestones = [
      { label: "End of 1st Trimester", date: addDays(gestationStart, 12 * 7), weeks: "~12 weeks" },
      { label: "Nuchal Translucency Screening", date: addDays(gestationStart, 11 * 7), weeks: "11-14 weeks" },
      { label: "Anatomy Scan", date: addDays(gestationStart, 20 * 7), weeks: "~20 weeks" },
      { label: "Viability Milestone", date: addDays(gestationStart, 24 * 7), weeks: "~24 weeks" },
      { label: "Full Term", date: addDays(gestationStart, 37 * 7), weeks: "37 weeks" },
      { label: "Due Date", date: dueDate, weeks: "40 weeks" },
    ];

    return {
      dueDate,
      weeksPregnant: daysPregnant >= 0 ? weeksPregnant : null,
      daysRemainder: daysPregnant >= 0 ? daysRemainder : null,
      trimester: daysPregnant >= 0 ? trimester : null,
      trimesterLabel: daysPregnant >= 0 ? trimesterLabel : null,
      trimesterColor,
      milestones,
      isPast: daysPregnant < 0,
    };
  }, [method, dateStr, cycleLength, ivfType]);

  return (
    <div className="space-y-6">
      {/* Method toggle */}
      <div className="flex gap-2">
        {(["lmp", "conception", "ivf"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              method === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {m === "lmp" ? "Last Period" : m === "conception" ? "Conception" : "IVF Transfer"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {method === "lmp" ? "First Day of Last Period" : method === "conception" ? "Conception Date" : "Transfer Date"}
          </label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        {method === "lmp" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Cycle Length (days)</label>
            <input
              type="number"
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}
        {method === "ivf" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Transfer Type</label>
            <div className="flex gap-2">
              {(["3day", "5day"] as const).map((t) => (
                <button key={t} onClick={() => setIvfType(t)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${ivfType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {t === "3day" ? "Day 3" : "Day 5"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Estimated Due Date</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{formatDate(result.dueDate)}</p>
          </div>

          {result.weeksPregnant !== null && !result.isPast && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {result.weeksPregnant}w {result.daysRemainder}d
                </span>
                <span className="text-xs text-muted-foreground">Weeks Pregnant</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${result.trimesterColor}`}>
                  {result.trimesterLabel}
                </span>
                <span className="text-xs text-muted-foreground mt-1">Current Trimester</span>
              </div>
            </div>
          )}

          {/* Milestones table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/10">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground">Milestone</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground">Timing</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {result.milestones.map((m, i) => (
                  <tr key={i} className="border-b border-border last:border-0 even:bg-muted/30">
                    <td className="px-4 py-2.5 text-foreground">{m.label}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{m.weeks}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{formatShortDate(m.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Due Dates Are Calculated</h2>
          <p>
            Naegele&apos;s Rule adds 280 days (40 weeks) to the first day of your last menstrual period.
            Only about 5% of babies are born exactly on their due date — most arrive within 2 weeks before
            or after. Ultrasound dating, especially before 12 weeks, is more accurate than menstrual dates
            alone.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Pregnancy Trimesters: What to Expect</h2>
          <p>
            First trimester (weeks 1-12): major organ development occurs, morning sickness is common, and
            miscarriage risk is highest. Second trimester (weeks 13-27): energy often returns, baby movements
            begin around 18-20 weeks, and the anatomy scan typically occurs at week 20. Third trimester
            (weeks 28-40): rapid growth, Braxton Hicks contractions may begin, and preparation for birth.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Factors That Affect Your Due Date</h2>
          <p>
            First-time mothers tend to go about 4 days past their due date on average. Multiple pregnancies
            (twins, triplets) typically arrive earlier. If your cycle is shorter or longer than 28 days,
            the calculator adjusts accordingly. Always follow your healthcare provider&apos;s guidance for the
            most accurate dating.
          </p>
        </section>
      </div>
    </div>
  );
}
