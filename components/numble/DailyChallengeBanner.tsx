"use client";

import { useEffect, useLayoutEffect, useState } from "react";
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

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState("--:--:--");

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    setCountdown(formatCountdown(getSecondsUntilMidnight()));

    const interval = setInterval(() => {
      setCountdown(formatCountdown(getSecondsUntilMidnight()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8 overflow-hidden rounded-[1.75rem] bg-zone p-6 shadow-[var(--shadow-sm)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Today&apos;s Numble
            </span>
            {initialRef.streak >= 2 ? (
              <span className="rounded-full bg-zone-raised px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zone-muted">
                {initialRef.streak}-day streak
              </span>
            ) : null}
          </div>
          <h2 className="text-3xl font-black tracking-[-0.03em] text-zone-text">Numble #{puzzleNumber}</h2>
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-zone-muted font-mono">
            <span className="rounded-full bg-zone-raised px-3 py-1.5">
              Target <span className="font-semibold text-zone-text">{target}</span>
            </span>
            <span className="rounded-full bg-zone-raised px-3 py-1.5">{difficulty}</span>
            <span className="rounded-full bg-zone-raised px-3 py-1.5">
              Next puzzle in{" "}
              {mounted ? (
                countdown
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-block h-[1em] w-[8ch] animate-pulse rounded bg-zone-dim/40 align-middle"
                  />
                  <span className="sr-only">loading</span>
                </>
              )}
            </span>
          </div>
          {initialRef.state === "completed" ? (
            <p className="text-sm leading-7 text-zone-muted">
              Completed {initialRef.completedStars > 0 ? "★".repeat(initialRef.completedStars) : "☆☆☆"}
            </p>
          ) : (
            <p className="text-sm leading-7 text-zone-muted">
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
            className="inline-flex items-center rounded-xl border border-zone-border bg-zone-raised px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-zone-raised/70"
          >
            Practice mode
          </Link>
        </div>
      </div>
    </div>
  );
}
