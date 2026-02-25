"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { addToast } from "@/lib/toast";

const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "25 min", seconds: 1500 },
  { label: "30 min", seconds: 1800 },
  { label: "1 hr", seconds: 3600 },
];

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

function playAlert() {
  try {
    const ctx = new AudioContext();
    [0, 0.3, 0.6].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + offset + 0.3
      );
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.3);
    });
  } catch {
    // Audio not available
  }
}

type Status = "idle" | "running" | "paused" | "done";

export default function TimerTool() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const initialRemainingRef = useRef(0);
  const originalTitleRef = useRef("");

  // Store original title
  useEffect(() => {
    originalTitleRef.current = document.title;
    return () => {
      document.title = originalTitleRef.current;
    };
  }, []);

  // Update document title
  useEffect(() => {
    if (status === "running" || status === "paused") {
      document.title = `${formatTime(remaining)} — Timer | clevr.tools`;
    } else if (status === "done") {
      document.title = "Time's Up! — Timer | clevr.tools";
    } else {
      document.title = originalTitleRef.current;
    }
  }, [remaining, status]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (secs: number) => {
      clearTimer();
      setTotalSeconds(secs);
      setRemaining(secs);
      setStatus("running");
      startTimeRef.current = Date.now();
      initialRemainingRef.current = secs;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        const left = initialRemainingRef.current - elapsed;
        if (left <= 0) {
          setRemaining(0);
          setStatus("done");
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          playAlert();
        } else {
          setRemaining(left);
        }
      }, 100);
    },
    [clearTimer]
  );

  const handlePreset = useCallback(
    (secs: number) => {
      startTimer(secs);
      addToast(`Timer set for ${formatTime(secs)}`, "success");
    },
    [startTimer]
  );

  const handleCustomStart = useCallback(() => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const total = h * 3600 + m * 60 + s;
    if (total <= 0) {
      addToast("Enter a time greater than zero", "info");
      return;
    }
    startTimer(total);
    addToast(`Timer set for ${formatTime(total)}`, "success");
  }, [hours, minutes, seconds, startTimer]);

  const handlePauseResume = useCallback(() => {
    if (status === "running") {
      clearTimer();
      setStatus("paused");
    } else if (status === "paused") {
      setStatus("running");
      startTimeRef.current = Date.now();
      initialRemainingRef.current = remaining;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        const left = initialRemainingRef.current - elapsed;
        if (left <= 0) {
          setRemaining(0);
          setStatus("done");
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          playAlert();
        } else {
          setRemaining(left);
        }
      }, 100);
    }
  }, [status, remaining, clearTimer]);

  const handleReset = useCallback(() => {
    clearTimer();
    setStatus("idle");
    setRemaining(0);
    setTotalSeconds(0);
  }, [clearTimer]);

  const handleDismiss = useCallback(() => {
    setStatus("idle");
    setRemaining(0);
    setTotalSeconds(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progressPercent =
    totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Done overlay */}
      {status === "done" && (
        <div className="rounded-xl border-2 border-primary bg-primary/10 dark:border-emerald-500 dark:bg-emerald-500/10 p-8 text-center space-y-4 animate-pulse">
          <p className="text-4xl sm:text-5xl font-bold text-primary dark:text-emerald-500">
            Time&apos;s Up!
          </p>
          <button
            onClick={handleDismiss}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {status === "idle" && (
        <>
          {/* Presets */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Quick presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => handlePreset(p.seconds)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom time */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Custom time
            </p>
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <span className="pb-2 text-muted-foreground">:</span>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Min
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <span className="pb-2 text-muted-foreground">:</span>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Sec
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="0"
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleCustomStart}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        </>
      )}

      {/* Timer display */}
      {status !== "idle" && status !== "done" && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-6xl sm:text-8xl font-mono font-bold tabular-nums text-foreground dark:text-emerald-500">
              {formatTime(remaining)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary dark:bg-emerald-500 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {status === "running" ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Resume
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
