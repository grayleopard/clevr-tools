"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Mode = "pace" | "time" | "distance";
type DistUnit = "miles" | "km";

const RACE_PRESETS = [
  { label: "5K", miles: 3.10686, km: 5 },
  { label: "10K", miles: 6.21371, km: 10 },
  { label: "Half Marathon", miles: 13.1094, km: 21.0975 },
  { label: "Marathon", miles: 26.2188, km: 42.195 },
];

function formatPace(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return "--:--";
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return "0:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PaceCalculator() {
  const [mode, setMode] = useState<Mode>("pace");
  const [distUnit, setDistUnit] = useState<DistUnit>("miles");

  // Distance inputs
  const [distance, setDistance] = useState("3.1");

  // Time inputs
  const [timeH, setTimeH] = useState("0");
  const [timeM, setTimeM] = useState("25");
  const [timeS, setTimeS] = useState("0");

  // Pace inputs
  const [paceM, setPaceM] = useState("8");
  const [paceS, setPaceS] = useState("0");

  const applyPreset = (preset: typeof RACE_PRESETS[number]) => {
    const d = distUnit === "miles" ? preset.miles : preset.km;
    setDistance(d.toFixed(2));
  };

  const result = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const totalTimeSec = (parseInt(timeH) || 0) * 3600 + (parseInt(timeM) || 0) * 60 + (parseInt(timeS) || 0);
    const paceSec = (parseInt(paceM) || 0) * 60 + (parseInt(paceS) || 0);

    if (mode === "pace") {
      // Know distance + time, calculate pace
      if (dist <= 0 || totalTimeSec <= 0) return null;
      const pacePerUnit = totalTimeSec / dist;
      const speed = dist / (totalTimeSec / 3600);
      // Convert pace to other unit
      const convFactor = distUnit === "miles" ? 1.60934 : 1 / 1.60934;
      const altPace = pacePerUnit / convFactor;
      return {
        type: "pace" as const,
        pace: pacePerUnit,
        altPace,
        speed,
        distance: dist,
        totalTimeSec,
      };
    } else if (mode === "time") {
      // Know distance + pace, calculate time
      if (dist <= 0 || paceSec <= 0) return null;
      const total = dist * paceSec;
      const speed = dist / (total / 3600);
      return {
        type: "time" as const,
        totalTimeSec: total,
        speed,
        distance: dist,
        pace: paceSec,
      };
    } else {
      // Know pace + time, calculate distance
      if (paceSec <= 0 || totalTimeSec <= 0) return null;
      const d = totalTimeSec / paceSec;
      const speed = d / (totalTimeSec / 3600);
      return {
        type: "distance" as const,
        distance: d,
        speed,
        totalTimeSec,
        pace: paceSec,
      };
    }
  }, [mode, distance, timeH, timeM, timeS, paceM, paceS, distUnit]);

  // Splits
  const splits = useMemo(() => {
    if (!result) return [];
    const dist = result.distance;
    const pace = result.type === "pace" ? result.pace : result.pace;
    const maxSplits = Math.min(Math.ceil(dist), 50);
    const arr = [];
    for (let i = 1; i <= maxSplits; i++) {
      arr.push({ mile: i, time: formatTime(i * pace) });
    }
    return arr;
  }, [result]);

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["pace", "time", "distance"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {m === "pace" ? "Calculate Pace" : m === "time" ? "Calculate Time" : "Calculate Distance"}
          </button>
        ))}
      </div>

      {/* Unit toggle */}
      <div className="flex gap-2">
        {(["miles", "km"] as const).map((u) => (
          <button key={u} onClick={() => setDistUnit(u)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${distUnit === u ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {u === "miles" ? "Miles" : "Kilometers"}
          </button>
        ))}
      </div>

      {/* Race presets */}
      {mode !== "distance" && (
        <div className="flex flex-wrap gap-2">
          {RACE_PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)} className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        {mode !== "distance" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Distance ({distUnit})</label>
            <input type="number" min="0" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} />
          </div>
        )}
        {mode !== "time" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Time</label>
            <div className="flex gap-1 items-center">
              <input type="number" min="0" value={timeH} onChange={(e) => setTimeH(e.target.value)} className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="H" />
              <span className="text-foreground font-bold">:</span>
              <input type="number" min="0" max="59" value={timeM} onChange={(e) => setTimeM(e.target.value)} className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="M" />
              <span className="text-foreground font-bold">:</span>
              <input type="number" min="0" max="59" value={timeS} onChange={(e) => setTimeS(e.target.value)} className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="S" />
            </div>
          </div>
        )}
        {mode !== "pace" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Pace (per {distUnit === "miles" ? "mile" : "km"})</label>
            <div className="flex gap-1 items-center">
              <input type="number" min="0" value={paceM} onChange={(e) => setPaceM(e.target.value)} className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="min" />
              <span className="text-foreground font-bold">:</span>
              <input type="number" min="0" max="59" value={paceS} onChange={(e) => setPaceS(e.target.value)} className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="sec" />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="text-center rounded-xl border border-border border-l-4 border-l-primary/60 bg-primary/5 p-6">
            {result.type === "pace" && (
              <>
                <p className="text-sm text-muted-foreground mb-1">Pace per {distUnit === "miles" ? "mile" : "km"}</p>
                <p className="text-4xl sm:text-5xl font-bold text-primary">{formatPace(result.pace)}</p>
                <p className="text-sm text-muted-foreground mt-2">{result.speed.toFixed(1)} {distUnit === "miles" ? "mph" : "km/h"}</p>
              </>
            )}
            {result.type === "time" && (
              <>
                <p className="text-sm text-muted-foreground mb-1">Finish Time</p>
                <p className="text-4xl sm:text-5xl font-bold text-primary">{formatTime(result.totalTimeSec)}</p>
                <p className="text-sm text-muted-foreground mt-2">{result.speed.toFixed(1)} {distUnit === "miles" ? "mph" : "km/h"}</p>
              </>
            )}
            {result.type === "distance" && (
              <>
                <p className="text-sm text-muted-foreground mb-1">Distance</p>
                <p className="text-4xl sm:text-5xl font-bold text-primary">{result.distance.toFixed(2)} {distUnit}</p>
                <p className="text-sm text-muted-foreground mt-2">{result.speed.toFixed(1)} {distUnit === "miles" ? "mph" : "km/h"}</p>
              </>
            )}
          </div>

          {/* Splits */}
          {splits.length > 0 && splits.length <= 30 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-primary/10">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground">{distUnit === "miles" ? "Mile" : "KM"}</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-foreground">Cumulative Time</th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map((s) => (
                    <tr key={s.mile} className="border-b border-border last:border-0 even:bg-muted/30">
                      <td className="px-4 py-2 text-foreground">{s.mile}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium text-foreground">{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Common Race Finish Time Paces</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Distance</th>
                  <th className="text-left p-2 font-medium">Finish Time</th>
                  <th className="text-right p-2 font-medium">Pace/mi</th>
                  <th className="text-right p-2 font-medium">Pace/km</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["5K", "20:00", "6:26", "4:00"],
                  ["5K", "25:00", "8:03", "5:00"],
                  ["5K", "30:00", "9:39", "6:00"],
                  ["10K", "40:00", "6:26", "4:00"],
                  ["10K", "50:00", "8:03", "5:00"],
                  ["10K", "60:00", "9:39", "6:00"],
                  ["Half", "1:30:00", "6:52", "4:16"],
                  ["Half", "2:00:00", "9:09", "5:41"],
                  ["Marathon", "3:00:00", "6:52", "4:16"],
                  ["Marathon", "3:30:00", "8:01", "4:59"],
                  ["Marathon", "4:00:00", "9:09", "5:41"],
                  ["Marathon", "4:30:00", "10:18", "6:24"],
                  ["Marathon", "5:00:00", "11:27", "7:07"],
                ].map((row, i) => (
                  <tr key={i} className="even:bg-muted/30">
                    <td className="p-2">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                    <td className="p-2 text-right tabular-nums">{row[2]}</td>
                    <td className="p-2 text-right tabular-nums">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How to Improve Your Pace</h2>
          <p>
            Interval training (alternating fast and slow segments) builds speed and aerobic capacity. Tempo runs
            at a &quot;comfortably hard&quot; pace for 20-40 minutes develop lactate threshold. Most pace improvement
            comes from simply running more consistently. Follow the 10% rule: don&apos;t increase weekly mileage
            more than 10% week-over-week to prevent injury.
          </p>
          <p className="mt-3">
            Track calories burned during your runs with our{" "}
            <Link href="/calc/calories-burned" className="text-primary underline hover:no-underline">calories burned calculator</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
