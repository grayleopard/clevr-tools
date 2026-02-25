"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipForward, RotateCcw, Settings } from "lucide-react";
import { addToast } from "@/lib/toast";

type SessionType = "focus" | "short-break" | "long-break";
type Status = "idle" | "running" | "paused" | "done";

interface PomodoroSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakAfter: number;
  sound: boolean;
  autoStart: boolean;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakAfter: 4,
  sound: true,
  autoStart: false,
};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(m)}:${pad(sec)}`;
}

function playPomodoroAlert() {
  try {
    const ctx = new AudioContext();
    const notes = [440, 880, 440];
    notes.forEach((freq, i) => {
      const offset = i * 0.25;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + offset + 0.25
      );
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.25);
    });
  } catch {
    // Audio not available
  }
}

export default function PomodoroTool() {
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [status, setStatus] = useState<Status>("idle");
  const [remaining, setRemaining] = useState(25 * 60);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusMinutesToday, setFocusMinutesToday] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const initialRemainingRef = useRef(0);
  const originalTitleRef = useRef("");

  const getSessionDuration = useCallback(
    (type: SessionType) => {
      switch (type) {
        case "focus":
          return settings.focus * 60;
        case "short-break":
          return settings.shortBreak * 60;
        case "long-break":
          return settings.longBreak * 60;
      }
    },
    [settings]
  );

  useEffect(() => {
    originalTitleRef.current = document.title;
    return () => {
      document.title = originalTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (status === "running" || status === "paused") {
      const icon = sessionType === "focus" ? "\uD83C\uDF45" : "\u2615";
      document.title = `${icon} ${formatTime(remaining)} — Pomodoro | clevr.tools`;
    } else {
      document.title = originalTitleRef.current;
    }
  }, [remaining, status, sessionType]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(
    (secs: number) => {
      clearTimer();
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
        } else {
          setRemaining(left);
        }
      }, 100);
    },
    [clearTimer]
  );

  // Handle session complete
  useEffect(() => {
    if (status !== "done") return;
    if (settings.sound) playPomodoroAlert();

    if (sessionType === "focus") {
      const newCompleted = completedFocus + 1;
      setCompletedFocus(newCompleted);
      setFocusMinutesToday((prev) => prev + settings.focus);

      if (newCompleted % settings.longBreakAfter === 0) {
        setSessionType("long-break");
        setRemaining(settings.longBreak * 60);
        if (settings.autoStart) {
          startCountdown(settings.longBreak * 60);
          setSessionType("long-break");
        }
      } else {
        setSessionType("short-break");
        setRemaining(settings.shortBreak * 60);
        if (settings.autoStart) {
          startCountdown(settings.shortBreak * 60);
          setSessionType("short-break");
        }
      }
    } else {
      setSessionType("focus");
      setRemaining(settings.focus * 60);
      if (settings.autoStart) {
        startCountdown(settings.focus * 60);
        setSessionType("focus");
      }
    }

    if (!settings.autoStart) {
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === "done"]);

  const handleStart = useCallback(() => {
    const dur = getSessionDuration(sessionType);
    startCountdown(dur);
    addToast(
      `${sessionType === "focus" ? "Focus" : sessionType === "short-break" ? "Short break" : "Long break"} started`,
      "success"
    );
  }, [sessionType, getSessionDuration, startCountdown]);

  const handlePauseResume = useCallback(() => {
    if (status === "running") {
      clearTimer();
      setStatus("paused");
    } else if (status === "paused") {
      startTimeRef.current = Date.now();
      initialRemainingRef.current = remaining;
      setStatus("running");
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
        } else {
          setRemaining(left);
        }
      }, 100);
    }
  }, [status, remaining, clearTimer]);

  const handleSkip = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setStatus("done");
  }, [clearTimer]);

  const handleReset = useCallback(() => {
    clearTimer();
    setSessionType("focus");
    setStatus("idle");
    setRemaining(settings.focus * 60);
    setCompletedFocus(0);
  }, [clearTimer, settings.focus]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalDuration = getSessionDuration(sessionType);
  const progressPercent =
    totalDuration > 0 ? (remaining / totalDuration) * 100 : 0;

  const sessionLabel =
    sessionType === "focus"
      ? "Focus"
      : sessionType === "short-break"
        ? "Short Break"
        : "Long Break";

  return (
    <div className="space-y-6">
      {/* Session type */}
      <div className="text-center">
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium ${
            sessionType === "focus"
              ? "bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-500"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {sessionLabel}
        </span>
      </div>

      {/* Session tracker dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: settings.longBreakAfter }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${
              i < completedFocus % settings.longBreakAfter
                ? "bg-primary dark:bg-emerald-500"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Time display */}
      <div className="text-center">
        <p className="text-6xl sm:text-8xl font-mono font-bold tabular-nums text-foreground dark:text-emerald-500">
          {formatTime(remaining)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            sessionType === "focus"
              ? "bg-primary dark:bg-emerald-500"
              : "bg-blue-500 dark:bg-blue-400"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {status === "idle" && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="h-4 w-4" /> Start {sessionLabel}
          </button>
        )}
        {(status === "running" || status === "paused") && (
          <>
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
              onClick={handleSkip}
              className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <SkipForward className="h-4 w-4" /> Skip
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Focus sessions today: {completedFocus} ({focusMinutesToday} minutes)
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </span>
          <span className="text-muted-foreground">
            {settingsOpen ? "\u25B2" : "\u25BC"}
          </span>
        </button>

        {settingsOpen && (
          <div className="border-t border-border px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Focus (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.focus}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 25;
                    setSettings((s) => ({ ...s, focus: v }));
                    if (status === "idle" && sessionType === "focus")
                      setRemaining(v * 60);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Short Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.shortBreak}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      shortBreak: parseInt(e.target.value) || 5,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Long Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreak}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      longBreak: parseInt(e.target.value) || 15,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Long Break After
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakAfter}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      longBreakAfter: parseInt(e.target.value) || 4,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, sound: e.target.checked }))
                  }
                  className="rounded border-border"
                />
                Sound alerts
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, autoStart: e.target.checked }))
                  }
                  className="rounded border-border"
                />
                Auto-start next session
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
