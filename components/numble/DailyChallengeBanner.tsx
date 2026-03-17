"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatCountdown,
  getSecondsUntilMidnight,
  getUTCDateString,
} from "@/lib/numble-utils";
import { getStats, getTodayState } from "@/lib/numble-storage";

interface DailyChallengeBannerProps {
  puzzleNumber: number;
  target: number;
  difficulty: string;
  todayDate: string;
}

function getInitialLocalState(todayDate: string) {
  const todayState = getTodayState();
  const stats = getStats();

  return {
    state:
      todayState &&
      todayState.date === todayDate &&
      (todayState.completed || todayState.gaveUp)
        ? ("completed" as const)
        : ("unplayed" as const),
    completedStars:
      todayState &&
      todayState.date === todayDate &&
      (todayState.completed || todayState.gaveUp)
        ? (todayState.stars || 0)
        : 0,
    streak: stats.currentStreak,
  };
}

export default function DailyChallengeBanner({
  puzzleNumber,
  target,
  difficulty,
  todayDate,
}: DailyChallengeBannerProps) {
  const initialRef = useState(() => getInitialLocalState(todayDate))[0];
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(getSecondsUntilMidnight())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getSecondsUntilMidnight()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔢</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Today&apos;s Numble</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Numble #{puzzleNumber}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Target: <span className="font-semibold text-foreground">{target}</span></span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">{difficulty}</span>
            <span>Next puzzle in {countdown}</span>
          </div>
          {initialRef.state === "completed" ? (
            <p className="text-sm text-muted-foreground">✅ Completed {initialRef.completedStars > 0 ? "★".repeat(initialRef.completedStars) : "☆☆☆"}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Same puzzle for everyone today. Solve it, keep your streak, then practice.</p>
          )}
          {initialRef.streak >= 2 ? <p className="text-xs text-muted-foreground">🔥 {initialRef.streak}-day streak</p> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/play/numble"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {initialRef.state === "completed" ? "View today’s result" : "Play today’s puzzle"}
          </Link>
          <Link
            href="/play/numble"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Practice mode
          </Link>
        </div>
      </div>
    </div>
  );
}
