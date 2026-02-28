"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Flag, Copy, Trash2 } from "lucide-react";
import { addToast } from "@/lib/toast";

interface Lap {
  lapTime: number;
  totalTime: number;
}

function formatDisplay(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const cs = Math.floor(ms / 10) % 100;
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

type Status = "idle" | "running" | "stopped";

export default function StopwatchTool() {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const elapsedAtPauseRef = useRef(0);
  const originalTitleRef = useRef("");

  useEffect(() => {
    originalTitleRef.current = document.title;
    return () => {
      document.title = originalTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (status === "running") {
      document.title = `${formatDisplay(elapsed)} — Stopwatch | clevr.tools`;
    } else if (status === "stopped" && elapsed > 0) {
      document.title = `${formatDisplay(elapsed)} — Stopped | clevr.tools`;
    } else {
      document.title = originalTitleRef.current;
    }
  }, [elapsed, status]);

  const tick = useCallback(function tickFrame() {
    setElapsed(Date.now() - startTimeRef.current + elapsedAtPauseRef.current);
    rafRef.current = requestAnimationFrame(tickFrame);
  }, []);

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now();
    setStatus("running");
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handleStop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    elapsedAtPauseRef.current = elapsed;
    setStatus("stopped");
  }, [elapsed]);

  const handleResume = useCallback(() => {
    startTimeRef.current = Date.now();
    setStatus("running");
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handleReset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setElapsed(0);
    setLaps([]);
    setStatus("idle");
    elapsedAtPauseRef.current = 0;
  }, []);

  const handleLap = useCallback(() => {
    const lastTotal = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
    setLaps((prev) => [
      ...prev,
      { lapTime: elapsed - lastTotal, totalTime: elapsed },
    ]);
  }, [elapsed, laps]);

  const handleCopyAll = useCallback(() => {
    if (laps.length === 0) return;
    const lines = laps.map(
      (l, i) =>
        `Lap ${i + 1}\t${formatDisplay(l.lapTime)}\t${formatDisplay(l.totalTime)}`
    );
    const header = "Lap\tLap Time\tTotal Time";
    navigator.clipboard
      .writeText([header, ...lines].join("\n"))
      .then(() => addToast("Laps copied to clipboard", "success"))
      .catch(() => addToast("Failed to copy", "error"));
  }, [laps]);

  const handleClearLaps = useCallback(() => {
    setLaps([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Find fastest/slowest lap
  const lapTimes = laps.map((l) => l.lapTime);
  const minLap = laps.length >= 3 ? Math.min(...lapTimes) : -1;
  const maxLap = laps.length >= 3 ? Math.max(...lapTimes) : -1;

  return (
    <div className="space-y-6">
      {/* Display */}
      <div className="text-center">
        <p className="text-6xl sm:text-8xl font-mono font-bold tabular-nums text-foreground dark:text-emerald-500">
          {formatDisplay(elapsed)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {status === "idle" && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="h-4 w-4" /> Start
          </button>
        )}
        {status === "running" && (
          <>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Pause className="h-4 w-4" /> Stop
            </button>
            <button
              onClick={handleLap}
              className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Flag className="h-4 w-4" /> Lap
            </button>
          </>
        )}
        {status === "stopped" && (
          <>
            <button
              onClick={handleResume}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="h-4 w-4" /> Resume
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Laps ({laps.length})
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" /> Copy All
              </button>
              <button
                onClick={handleClearLaps}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Lap
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Lap Time
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...laps].reverse().map((lap, idx) => {
                  const lapNum = laps.length - idx;
                  const isMin = lap.lapTime === minLap && minLap !== maxLap;
                  const isMax = lap.lapTime === maxLap && minLap !== maxLap;
                  return (
                    <tr
                      key={lapNum}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2 text-foreground">{lapNum}</td>
                      <td
                        className={`px-4 py-2 text-right font-mono tabular-nums ${
                          isMin
                            ? "text-green-600 dark:text-green-400"
                            : isMax
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                        }`}
                      >
                        {formatDisplay(lap.lapTime)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                        {formatDisplay(lap.totalTime)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
