"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatCountdown,
  getSecondsUntilMidnight,
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
    <div className="mb-8 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(230,232,234,0.96))] p-6 shadow-[var(--shadow-sm)] dark:bg-[linear-gradient(135deg,rgba(25,37,64,0.86),rgba(9,19,40,0.96))] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Today&apos;s Numble
            </span>
            {initialRef.streak >= 2 ? (
              <span className="rounded-full bg-card/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {initialRef.streak}-day streak
              </span>
            ) : null}
          </div>
          <h2 className="text-3xl font-black tracking-[-0.03em] text-foreground">Numble #{puzzleNumber}</h2>
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
            <span className="rounded-full bg-card/75 px-3 py-1.5">
              Target <span className="font-semibold text-foreground">{target}</span>
            </span>
            <span className="rounded-full bg-card/75 px-3 py-1.5">{difficulty}</span>
            <span className="rounded-full bg-card/75 px-3 py-1.5">Next puzzle in {countdown}</span>
          </div>
          {initialRef.state === "completed" ? (
            <p className="text-sm leading-7 text-muted-foreground">
              Completed {initialRef.completedStars > 0 ? "★".repeat(initialRef.completedStars) : "☆☆☆"}
            </p>
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              Same puzzle for everyone today. Solve it, keep your streak, then practice.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/play/numble"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,var(--primary-fixed),var(--primary))] px-5 py-3 text-sm font-semibold text-[var(--on-primary)] shadow-[var(--shadow-sm)] transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.98] dark:bg-[linear-gradient(135deg,var(--primary),var(--primary-dim))]"
          >
            {initialRef.state === "completed" ? "View today’s result" : "Play today’s puzzle"}
          </Link>
          <Link
            href="/play/numble"
            className="inline-flex items-center rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted/70"
          >
            Practice mode
          </Link>
        </div>
      </div>
    </div>
  );
}
