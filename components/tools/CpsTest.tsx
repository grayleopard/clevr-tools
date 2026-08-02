"use client";

import { useState, useRef, useEffect } from "react";
import { saveSession, updateStreak, getPersonalBest } from "@/lib/typing-stats";
import { TipJar } from "@/components/tool/TipJar";
import {
  elapsedMilliseconds,
  hasElapsed,
  monotonicNow,
  ratePerSecond,
  remainingMilliseconds,
} from "@/lib/p1-remediation/monotonic-timing";
import StreakDisplay from "./StreakDisplay";
import TypingHistory from "./TypingHistory";

type Duration = 1 | 5 | 10 | 30 | 60;

const RATINGS = [
  { min: 0, label: "Beginner" },
  { min: 3, label: "Below Average" },
  { min: 5, label: "Average" },
  { min: 7, label: "Fast" },
  { min: 9, label: "Very Fast" },
  { min: 11, label: "Pro" },
  { min: 13, label: "Extreme" },
  { min: 15, label: "Inhuman" },
];

function getRating(cps: number): string {
  let rating = "Beginner";
  for (const r of RATINGS) {
    if (cps >= r.min) rating = r.label;
  }
  return rating;
}

export default function CpsTest() {
  const [duration, setDuration] = useState<Duration>(5);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<{ cps: number; clicks: number; duration: number } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ripple, setRipple] = useState(false); // for click visual feedback

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clicksRef = useRef(0);
  const durationRef = useRef(duration);
  const statusRef = useRef<"idle" | "running" | "done">("idle");
  const startTimeRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => { durationRef.current = duration; }, [duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      statusRef.current = "done";
    };
  }, []);

  function startTest(startedAt: number) {
    if (statusRef.current !== "idle") return;
    // Load previous best before starting
    const nominalDuration = durationRef.current;
    const pb = getPersonalBest("cps-test", `${nominalDuration}s`);
    setPreviousBest(pb ? pb.wpm : null); // CPS stored in wpm field

    startTimeRef.current = startedAt;
    statusRef.current = "running";
    setStatus("running");
    setIsFocused(true);
    setTimeLeft(nominalDuration);
    setElapsedMs(0);

    timerRef.current = setInterval(() => {
      const tickedAt = monotonicNow();
      const elapsed = elapsedMilliseconds(startTimeRef.current, tickedAt);
      const remaining = remainingMilliseconds(
        startTimeRef.current,
        durationRef.current * 1000,
        tickedAt
      );
      setElapsedMs(elapsed);
      setTimeLeft(Math.ceil(remaining / 100) / 10);
      if (hasElapsed(startTimeRef.current, durationRef.current * 1000, tickedAt)) {
        endTest(tickedAt);
      }
    }, 50);
  }

  function endTest(endedAt = monotonicNow()) {
    if (statusRef.current !== "running" || startTimeRef.current < 0) return;
    statusRef.current = "done";
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const totalClicks = clicksRef.current;
    const nominalDuration = durationRef.current;
    const actualElapsedMs = Math.max(
      1,
      elapsedMilliseconds(startTimeRef.current, endedAt)
    );
    const actualDuration = Math.round((actualElapsedMs / 1000) * 100) / 100;
    // Derive the displayed rate from the same two-decimal duration shown to
    // the user so the visible figures remain arithmetically consistent.
    const cps = Math.round(ratePerSecond(totalClicks, actualDuration * 1000) * 10) / 10;

    setStatus("done");
    setIsFocused(false);
    setTimeLeft(0);
    setElapsedMs(actualElapsedMs);
    setResult({ cps, clicks: totalClicks, duration: actualDuration });

    // Check for personal best
    const pb = getPersonalBest("cps-test", `${nominalDuration}s`);
    const isNew = !pb || cps > pb.wpm;
    setIsNewPB(isNew);

    // Save session - store CPS in wpm field, total clicks in correctChars
    saveSession({
      id: crypto.randomUUID(),
      tool: "cps-test",
      mode: `${nominalDuration}s`,
      wpm: cps,
      accuracy: 100,
      correctChars: totalClicks,
      incorrectChars: 0,
      totalChars: totalClicks,
      duration: Math.max(1, Math.round(actualElapsedMs / 1000)),
      timestamp: Date.now(),
    });
    updateStreak();
    setHistoryRefresh(prev => prev + 1);
  }

  function handleActivation() {
    // Visual feedback ripple
    setRipple(true);
    setTimeout(() => setRipple(false), 100);

    const activatedAt = monotonicNow();
    if (statusRef.current === "idle") {
      clicksRef.current = 1;
      setClicks(1);
      startTest(activatedAt);
      return;
    }

    if (statusRef.current === "running") {
      if (
        hasElapsed(
          startTimeRef.current,
          durationRef.current * 1000,
          activatedAt
        )
      ) {
        endTest(activatedAt);
        return;
      }
      clicksRef.current++;
      setClicks(clicksRef.current);
    }
  }

  function resetTest(nextDuration: Duration = duration) {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    statusRef.current = "idle";
    startTimeRef.current = -1;
    durationRef.current = nextDuration;
    setStatus("idle");
    setClicks(0);
    clicksRef.current = 0;
    setTimeLeft(nextDuration);
    setElapsedMs(0);
    setIsFocused(false);
    setResult(null);
    setIsNewPB(false);
  }

  function handleShare() {
    if (!result) return;
    const text = `I clicked ${result.cps} CPS (${result.clicks} clicks in ${result.duration}s) on clevr.tools/type/cps-test — can you beat it?`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const cps = status === "running" && elapsedMs > 0
    ? Math.round(ratePerSecond(clicks, elapsedMs) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Duration selector — dims during test */}
      <div className={`flex flex-wrap gap-2 transition-opacity duration-300 ${isFocused ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
        {([1, 5, 10, 30, 60] as Duration[]).map(d => (
          <button
            key={d}
            onClick={() => { setDuration(d); resetTest(d); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              duration === d
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >{d}s</button>
        ))}
      </div>

      {/* Click area or results */}
      {status !== "done" ? (
        <button
          type="button"
          onClick={handleActivation}
          onContextMenu={e => e.preventDefault()}
          aria-label={status === "idle" ? "Start CPS test" : "Register click"}
          className={`relative w-full rounded-xl cursor-pointer select-none touch-manipulation min-h-64 md:min-h-80 flex flex-col items-center justify-center transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            ripple ? "bg-zone-raised" : "bg-zone"
          } border border-zone-border`}
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          {status === "idle" ? (
            <div className="text-center pointer-events-none">
              <p className="text-2xl font-medium text-zone-muted">Click here to start!</p>
              <p className="text-sm text-zone-dim mt-2">First click starts the timer</p>
            </div>
          ) : (
            <div className="text-center pointer-events-none space-y-4">
              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                  <div className="text-5xl font-bold text-zone-text tabular-nums">{clicks}</div>
                  <div className="text-sm text-zone-muted mt-1">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-zone-text tabular-nums">{timeLeft}</div>
                  <div className="text-sm text-zone-muted mt-1">Seconds</div>
                </div>
              </div>
              <p className="text-zone-dim text-sm tabular-nums">{cps} CPS</p>
              <p className="text-zone-dim text-sm">Keep clicking!</p>
            </div>
          )}
        </button>
      ) : (
        /* Results */
        <div className="rounded-xl bg-zone p-8 text-center">
          <p className="text-sm text-zone-muted mb-1">CPS</p>
          <div className="text-7xl font-bold text-primary mb-2 tabular-nums">{result?.cps}</div>
          <p className="text-zone-muted text-sm mb-4">clicks per second</p>

          {isNewPB && (
            <div className="text-yellow-400 font-medium mb-3">New Personal Best!</div>
          )}
          {!isNewPB && previousBest !== null && (
            <p className="text-zone-dim text-sm mb-3 tabular-nums">Previous best: {previousBest} CPS</p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
            <div className="rounded-xl border border-zone-border bg-zone-raised py-3">
              <div className="text-lg font-semibold text-zone-text tabular-nums">{result?.clicks}</div>
              <div className="text-xs text-zone-muted">Total Clicks</div>
            </div>
            <div className="rounded-xl border border-zone-border bg-zone-raised py-3">
              <div className="text-lg font-semibold text-zone-text tabular-nums">{result?.duration.toFixed(2)}s</div>
              <div className="text-xs text-zone-muted">Actual Duration</div>
            </div>
            <div className="rounded-xl border border-zone-border bg-zone-raised py-3">
              <div className="text-lg font-semibold text-zone-text">{result ? getRating(result.cps) : ""}</div>
              <div className="text-xs text-zone-muted">Rating</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => resetTest()} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
              Try Again
            </button>
            <button onClick={handleShare} className="px-6 py-2.5 rounded-lg bg-muted text-foreground font-medium text-sm">
              {copied ? "Copied!" : "Share Result"}
            </button>
          </div>
        </div>
      )}

      <TipJar />

      {/* History */}
      <TypingHistory tool="cps-test" refreshTrigger={historyRefresh} />
    </div>
  );
}
