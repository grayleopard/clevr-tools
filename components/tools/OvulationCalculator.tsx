"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

export default function OvulationCalculator() {
  const [dateStr, setDateStr] = useState("");
  const [cycleLength, setCycleLength] = useState("28");

  const result = useMemo(() => {
    if (!dateStr) return null;
    const startDate = new Date(dateStr + "T00:00:00");
    if (isNaN(startDate.getTime())) return null;
    const cl = parseInt(cycleLength) || 28;
    if (cl < 21 || cl > 35) return null;

    const cycles = [];
    let periodStart = new Date(startDate);

    for (let i = 0; i < 3; i++) {
      const ovulationDay = addDays(periodStart, cl - 14);
      const fertileStart = addDays(ovulationDay, -5);
      const fertileEnd = ovulationDay;
      const nextPeriod = addDays(periodStart, cl);

      cycles.push({
        cycle: i + 1,
        periodStart: new Date(periodStart),
        fertileStart,
        ovulationDay,
        fertileEnd,
        nextPeriod,
      });

      periodStart = nextPeriod;
    }

    const nextOvulation = cycles[0].ovulationDay;
    const fertileWindowStart = cycles[0].fertileStart;
    const fertileWindowEnd = cycles[0].fertileEnd;
    const nextPeriod = cycles[0].nextPeriod;

    return { nextOvulation, fertileWindowStart, fertileWindowEnd, nextPeriod, cycles };
  }, [dateStr, cycleLength]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">First Day of Last Period</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
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
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            <p className="text-sm text-muted-foreground mb-1">Estimated Ovulation Date</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{formatDate(result.nextOvulation)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatShort(result.fertileWindowStart)} - {formatShort(result.fertileWindowEnd)}
              </span>
              <span className="text-xs text-muted-foreground">Fertile Window</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatDate(result.nextPeriod).split(",")[0]}, {formatShort(result.nextPeriod)}
              </span>
              <span className="text-xs text-muted-foreground">Next Period</span>
            </div>
          </div>

          {/* Cycle table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/10">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground">Cycle</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground">Period Start</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground">Fertile Window</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-foreground">Ovulation</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-foreground">Next Period</th>
                </tr>
              </thead>
              <tbody>
                {result.cycles.map((c) => (
                  <tr key={c.cycle} className="border-b border-border last:border-0 even:bg-muted/30">
                    <td className="px-3 py-2.5 text-foreground">{c.cycle}</td>
                    <td className="px-3 py-2.5 tabular-nums text-foreground">{formatShort(c.periodStart)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-foreground">{formatShort(c.fertileStart)} - {formatShort(c.fertileEnd)}</td>
                    <td className="px-3 py-2.5 tabular-nums font-medium text-primary">{formatShort(c.ovulationDay)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">{formatShort(c.nextPeriod)}</td>
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Understanding Your Fertile Window</h2>
          <p>
            An egg is viable for only 12-24 hours after ovulation. However, sperm can survive in the
            reproductive tract for up to 5 days. This means intercourse in the 5 days before ovulation
            can still result in fertilization. The combined &quot;fertile window&quot; is approximately 6 days.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Signs of Ovulation</h2>
          <p>
            Physical signs include cervical mucus becoming clear and slippery (egg-white consistency).
            Basal body temperature rises slightly (0.2-0.5 F) after ovulation. Some women feel mild
            one-sided pelvic pain (mittelschmerz). An LH surge (detected by ovulation predictor kits)
            occurs 24-36 hours before ovulation.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Irregular Cycles</h2>
          <p>
            This calculator assumes regular cycles. Irregular cycles (varying by more than 7-9 days)
            make ovulation prediction less reliable. PCOS, stress, weight changes, and thyroid issues
            can cause irregular cycles. Track your cycles over several months for a better baseline.
            If trying to conceive, use our{" "}
            <Link href="/calc/due-date" className="text-primary underline hover:no-underline">due date calculator</Link>{" "}
            once you have a positive test.
          </p>
        </section>
      </div>
    </div>
  );
}
