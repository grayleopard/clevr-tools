"use client";

import { useState, useMemo } from "react";

type Mode = "wake" | "sleep";

function formatTime(hours: number, minutes: number): string {
  const h = ((hours % 24) + 24) % 24;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDuration(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function SleepCalculator() {
  const [mode, setMode] = useState<Mode>("wake");
  const [timeHour, setTimeHour] = useState("7");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("AM");
  const [fallAsleep, setFallAsleep] = useState(14);

  const results = useMemo(() => {
    const h = parseInt(timeHour) || 0;
    const m = parseInt(timeMinute) || 0;
    const hour24 = timePeriod === "PM" && h !== 12 ? h + 12 : timePeriod === "AM" && h === 12 ? 0 : h;
    const totalMinutes = hour24 * 60 + m;

    const cycleDuration = 90; // minutes
    const options = [];

    if (mode === "wake") {
      // Calculate bedtimes working backwards
      for (let cycles = 7; cycles >= 4; cycles--) {
        const sleepDuration = cycles * cycleDuration;
        const bedtimeMin = totalMinutes - sleepDuration - fallAsleep;
        const normalizedMin = ((bedtimeMin % 1440) + 1440) % 1440;
        const bedH = Math.floor(normalizedMin / 60);
        const bedM = normalizedMin % 60;
        options.push({
          time: formatTime(bedH, bedM),
          cycles,
          duration: formatDuration(sleepDuration),
          recommended: cycles >= 5 && cycles <= 6,
        });
      }
    } else {
      // Calculate wake times working forward
      for (let cycles = 4; cycles <= 7; cycles++) {
        const sleepDuration = cycles * cycleDuration;
        const wakeMin = totalMinutes + fallAsleep + sleepDuration;
        const normalizedMin = wakeMin % 1440;
        const wakeH = Math.floor(normalizedMin / 60);
        const wakeM = normalizedMin % 60;
        options.push({
          time: formatTime(wakeH, wakeM),
          cycles,
          duration: formatDuration(sleepDuration),
          recommended: cycles >= 5 && cycles <= 6,
        });
      }
    }

    return options;
  }, [mode, timeHour, timeMinute, timePeriod, fallAsleep]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["wake", "sleep"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {m === "wake" ? "I want to wake up at..." : "I\u2019m going to bed at..."}
          </button>
        ))}
      </div>

      {/* Time input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {mode === "wake" ? "Wake-up time" : "Bedtime"}
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            max="12"
            value={timeHour}
            onChange={(e) => setTimeHour(e.target.value)}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="text-foreground font-bold">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={timeMinute}
            onChange={(e) => setTimeMinute(e.target.value.padStart(2, "0").slice(-2))}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-1">
            {(["AM", "PM"] as const).map((p) => (
              <button key={p} onClick={() => setTimePeriod(p)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${timePeriod === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fall asleep time */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Time to fall asleep</label>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 14, 20, 30].map((min) => (
            <button
              key={min}
              onClick={() => setFallAsleep(min)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                fallAsleep === min ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {min} min
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          {mode === "wake" ? "Go to bed at one of these times:" : "Set your alarm for one of these times:"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {results.map((opt) => (
            <div
              key={opt.cycles}
              className={`rounded-xl border p-4 text-center ${
                opt.recommended
                  ? "border-l-4 border-l-primary/60 border-primary/30 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className={`text-xl font-bold ${opt.recommended ? "text-primary" : "text-foreground"}`}>
                {opt.time}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {opt.cycles} cycles = {opt.duration}
              </p>
              {opt.recommended && (
                <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Recommended
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Based on {fallAsleep} minutes to fall asleep. Each sleep cycle is approximately 90 minutes.
        </p>
      </div>

      {/* SEO Content */}
      <div className="mt-12 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Sleep Cycles and Why They Matter</h2>
          <p>
            A full sleep cycle lasts approximately 90 minutes and includes multiple stages: light sleep (N1, N2),
            deep sleep (N3, also called slow-wave sleep), and REM (rapid eye movement). Deep sleep is critical
            for physical recovery; REM sleep supports memory consolidation and emotional processing. Waking during
            deep sleep causes grogginess (sleep inertia), while waking at the end of a complete cycle helps you
            feel more refreshed.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">How Much Sleep Do You Need?</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-2 font-medium">Age Group</th>
                  <th className="text-left p-2 font-medium">Recommended Hours</th>
                  <th className="text-left p-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Adults (18-64)", "7-9 hours", "Most adults need at least 7"],
                  ["Older adults (65+)", "7-8 hours", "Sleep tends to lighten with age"],
                  ["Teenagers (14-17)", "8-10 hours", "Biological clock shifts later"],
                  ["School children (6-13)", "9-11 hours", "Critical for development"],
                  ["Toddlers (1-2 years)", "11-14 hours", "Including naps"],
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Tips for Better Sleep Quality</h2>
          <p>
            Keep a consistent sleep schedule, even on weekends. Keep your bedroom cool (65-68 F / 18-20 C) and
            dark. Avoid screens for 30-60 minutes before bed — blue light delays melatonin production. Limit
            caffeine after 2-3pm (caffeine half-life is 5-6 hours). Avoid large meals and alcohol close to
            bedtime. If you can&apos;t fall asleep in 20 minutes, get up and do something calm until you feel sleepy.
          </p>
        </section>
      </div>
    </div>
  );
}
