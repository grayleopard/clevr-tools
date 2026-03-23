"use client";

import { useState, useRef, useEffect } from "react";
import { saveSession, updateStreak, getPersonalBest } from "@/lib/typing-stats";
import { TipJar } from "@/components/tool/TipJar";
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

  // Keep refs in sync
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // Reset when duration changes (and we're idle)
  useEffect(() => {
    if (status === "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting timer state when game status changes
      setTimeLeft(duration);
      setClicks(0);
      clicksRef.current = 0;
    }
  }, [duration, status]);

  function startTest() {
    // Load previous best before starting
    const pb = getPersonalBest("cps-test", `${duration}s`);
    setPreviousBest(pb ? pb.wpm : null); // CPS stored in wpm field

    setStatus("running");
    setIsFocused(true);
    setTimeLeft(durationRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function endTest() {
    const totalClicks = clicksRef.current;
    const dur = durationRef.current;
    const cps = Math.round((totalClicks / dur) * 10) / 10; // 1 decimal

    setStatus("done");
    setIsFocused(false);
    setResult({ cps, clicks: totalClicks, duration: dur });

    // Check for personal best
    const pb = getPersonalBest("cps-test", `${dur}s`);
    const isNew = !pb || cps > pb.wpm;
    setIsNewPB(isNew);

    // Save session - store CPS in wpm field, total clicks in correctChars
    saveSession({
      id: crypto.randomUUID(),
      tool: "cps-test",
      mode: `${dur}s`,
      wpm: cps,
      accuracy: 100,
      correctChars: totalClicks,
      incorrectChars: 0,
      totalChars: totalClicks,
      duration: dur,
      timestamp: Date.now(),
    });
    updateStreak();
    setHistoryRefresh(prev => prev + 1);
  }

  function handleClick(e: React.MouseEvent) {
    // Only count left clicks
    if (e.button !== 0) return;

    // Visual feedback ripple
    setRipple(true);
    setTimeout(() => setRipple(false), 100);

    if (status === "idle") {
      clicksRef.current = 1;
      setClicks(1);
      startTest();
      return;
    }

    if (status === "running") {
      clicksRef.current++;
      setClicks(clicksRef.current);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault(); // prevent double-tap zoom and scroll

    if (status === "idle") {
      clicksRef.current = 1;
      setClicks(1);
      startTest();
      return;
    }

    if (status === "running") {
      clicksRef.current++;
      setClicks(clicksRef.current);
      setRipple(true);
      setTimeout(() => setRipple(false), 100);
    }
  }

  function resetTest() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle");
    setClicks(0);
    clicksRef.current = 0;
    setTimeLeft(duration);
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

  const cps = status === "running" && timeLeft > 0
    ? Math.round((clicks / Math.max(1, duration - timeLeft + 1)) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Duration selector — dims during test */}
      <div className={`flex flex-wrap gap-2 transition-opacity duration-300 ${isFocused ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
        {([1, 5, 10, 30, 60] as Duration[]).map(d => (
          <button
            key={d}
            onClick={() => { setDuration(d); resetTest(); }}
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
        <div
          onMouseDown={handleClick}
          onTouchStart={handleTouchStart}
          onContextMenu={e => e.preventDefault()}
          className={`relative rounded-xl cursor-pointer select-none min-h-64 md:min-h-80 flex flex-col items-center justify-center transition-colors duration-100 ${
            ripple ? "bg-zone-raised" : "bg-zone"
          } border border-zone-border`}
          style={{ WebkitUserSelect: "none", userSelect: "none" } as React.CSSProperties}
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
                  <div className="text-5xl font-bold text-zone-text">{clicks}</div>
                  <div className="text-sm text-zone-muted mt-1">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-zone-text">{timeLeft}</div>
                  <div className="text-sm text-zone-muted mt-1">Seconds</div>
                </div>
              </div>
              <p className="text-zone-dim text-sm">{cps} CPS</p>
              <p className="text-zone-dim text-sm">Keep clicking!</p>
            </div>
          )}
        </div>
      ) : (
        /* Results */
        <div className="rounded-xl bg-zone p-8 text-center">
          <p className="text-sm text-zone-muted mb-1">CPS</p>
          <div className="text-7xl font-bold text-primary mb-2">{result?.cps}</div>
          <p className="text-zone-muted text-sm mb-4">clicks per second</p>

          {isNewPB && (
            <div className="text-yellow-400 font-medium mb-3">New Personal Best!</div>
          )}
          {!isNewPB && previousBest !== null && (
            <p className="text-zone-dim text-sm mb-3">Previous best: {previousBest} CPS</p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
            <div className="rounded-xl border border-zone-border bg-zone-raised py-3">
              <div className="text-lg font-semibold text-zone-text">{result?.clicks}</div>
              <div className="text-xs text-zone-muted">Total Clicks</div>
            </div>
            <div className="rounded-xl border border-zone-border bg-zone-raised py-3">
              <div className="text-lg font-semibold text-zone-text">{result?.duration}s</div>
              <div className="text-xs text-zone-muted">Duration</div>
            </div>
            <div className="rounded-xl border border-zone-border bg-zone-raised py-3">
              <div className="text-lg font-semibold text-zone-text">{result ? getRating(result.cps) : ""}</div>
              <div className="text-xs text-zone-muted">Rating</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={resetTest} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
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
