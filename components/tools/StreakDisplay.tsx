"use client";

import { useEffect, useState } from "react";
import { getStreak, getTotalStats } from "@/lib/typing-stats";

export default function StreakDisplay() {
  const [data, setData] = useState<{
    streak: number;
    tests: number;
  } | null>(null);

  useEffect(() => {
    const streak = getStreak();
    const stats = getTotalStats();
    if (streak.current >= 2 && stats.totalTests >= 1) {
      setData({ streak: streak.current, tests: stats.totalTests });
    }
  }, []);

  if (!data) return null;

  return (
    <p className="text-sm text-muted-foreground mb-4">
      {"\uD83D\uDD25"} {data.streak} day streak &middot; {data.tests} tests
      completed
    </p>
  );
}
