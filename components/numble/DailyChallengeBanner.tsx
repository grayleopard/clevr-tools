"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUTCDateString,
  formatCountdown,
  getSecondsUntilMidnight,
  getPuzzleNumber,
} from "@/lib/numble";
import { getTodayState, getStats } from "@/lib/numble-storage";

export default function DailyChallengeBanner() {
  const [state, setState] = useState<"loading" | "unplayed" | "completed">(
    "loading"
  );
  const [completedStars, setCompletedStars] = useState<number>(0);
  const [streak, setStreak] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [puzzleNumber, setPuzzleNumber] = useState(1);

  useEffect(() => {
    const today = getUTCDateString();
    setPuzzleNumber(getPuzzleNumber(today));
    const todayState = getTodayState();
    const stats = getStats();
    setStreak(stats.currentStreak);

    if (
      todayState &&
      todayState.date === today &&
      (todayState.completed || todayState.gaveUp)
    ) {
      setState("completed");
      setCompletedStars(todayState.stars || 0);
    } else {
      setState("unplayed");
    }

    // Countdown
    setCountdown(formatCountdown(getSecondsUntilMidnight()));
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getSecondsUntilMidnight()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (state === "loading") return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{"\ud83d\udd22"}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Daily Challenge
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Numble #{puzzleNumber}
          </h2>
          {state === "completed" ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              {"\u2705"} Completed{" "}
              {completedStars > 0
                ? "\u2b50".repeat(completedStars)
                : ""}{" "}
              &middot; Next in {countdown}
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mt-0.5">
                Reach the target number
              </p>
              {streak >= 2 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {"\ud83d\udd25"} {streak}-day streak
                </p>
              )}
            </>
          )}
        </div>
        {state === "unplayed" && (
          <Link
            href="/play/numble"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Play Today&apos;s Puzzle &rarr;
          </Link>
        )}
        {state === "completed" && (
          <Link
            href="/play/numble"
            className="px-5 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
          >
            View Results
          </Link>
        )}
      </div>
    </div>
  );
}
