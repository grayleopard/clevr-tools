"use client";

import { useEffect, useState } from "react";
import { getSessions, getWeakKeys, getPersonalBest } from "@/lib/typing-stats";
import type { TypingSession } from "@/lib/typing-stats";

interface Props {
  tool: "wpm-test" | "typing-practice";
  refreshTrigger?: number; // increment to force refresh after new test
}

export default function TypingHistory({ tool, refreshTrigger }: Props) {
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [stats, setStats] = useState<{
    totalTests: number;
    totalWords: number;
    totalTime: number;
    avgWpm: number;
    bestWpm: number;
  } | null>(null);
  const [weakKeys, setWeakKeys] = useState<
    Record<string, { speed: number; accuracy: number; samples: number }>
  >({});
  const [pb, setPb] = useState<TypingSession | null>(null);

  function loadData() {
    const allSessions = getSessions(tool, 10);
    setSessions(allSessions);
    if (allSessions.length > 0) {
      const fullSessions = getSessions(tool, 100);
      const avgWpm = Math.round(
        fullSessions.reduce((s, x) => s + x.wpm, 0) / fullSessions.length
      );
      const bestWpm = Math.max(...fullSessions.map((x) => x.wpm));
      const totalTime = fullSessions.reduce((s, x) => s + x.duration, 0);
      const totalWords = fullSessions.reduce(
        (s, x) => s + Math.round(x.correctChars / 5),
        0
      );
      setStats({
        totalTests: fullSessions.length,
        totalWords,
        totalTime,
        avgWpm,
        bestWpm,
      });
      // Find the overall personal best (max WPM session)
      const pbSession = fullSessions.reduce(
        (best, s) => (s.wpm > best.wpm ? s : best),
        fullSessions[0]
      );
      setPb(pbSession);
    } else {
      setStats(null);
      setPb(null);
    }
    if (tool === "typing-practice") {
      setWeakKeys(getWeakKeys());
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, tool]);

  function handleClear() {
    if (window.confirm("Clear all typing history? This cannot be undone.")) {
      try {
        localStorage.removeItem("clevr-typing-stats");
      } catch {
        // ignore
      }
      setSessions([]);
      setStats(null);
      setWeakKeys({});
      setPb(null);
    }
  }

  function formatRelativeTime(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  if (sessions.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-muted/20 px-4 py-4">
        <p className="text-sm text-muted-foreground text-center">
          {tool === "wpm-test"
            ? "Complete a test to see your history here."
            : "Complete a practice session to see your progress here."}
        </p>
      </div>
    );
  }

  const weakKeyList = Object.entries(weakKeys)
    .filter(([, v]) => v.samples >= 5)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 5);

  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border bg-primary/10 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {tool === "wpm-test" ? "Your History" : "Your Progress"}
        </span>
        <button
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="px-4 py-3 border-b border-border bg-muted/10 text-sm text-muted-foreground">
          {tool === "wpm-test" ? (
            <>
              <span className="font-medium text-foreground">
                {pb?.wpm} WPM
              </span>{" "}
              best &middot;{" "}
              <span className="font-medium text-foreground">
                {stats.avgWpm} WPM
              </span>{" "}
              avg &middot; {stats.totalTests} tests
            </>
          ) : (
            <>
              {stats.totalTests} sessions &middot;{" "}
              {Math.round(stats.totalTime / 60)} min total &middot;{" "}
              {stats.avgWpm} WPM avg
            </>
          )}
        </div>
      )}

      {/* Session list */}
      <div className="divide-y divide-border">
        {sessions.map((s) => {
          const isPb = s.id === pb?.id;
          return (
            <div
              key={s.id}
              className="px-4 py-2.5 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-foreground tabular-nums">
                  {s.wpm} WPM
                </span>
                <span className="text-muted-foreground">
                  {s.accuracy.toFixed(1)}%
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {s.mode}
                </span>
                {isPb && (
                  <span className="text-yellow-500 text-xs font-medium">
                    PB
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                {formatRelativeTime(s.timestamp)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Weak keys (practice only) */}
      {tool === "typing-practice" && weakKeyList.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/10">
          <span className="text-xs text-muted-foreground">Weak keys: </span>
          {weakKeyList.map(([key, keyStats]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 mr-2 text-xs"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-foreground">
                {key.toUpperCase()}
              </kbd>
              <span className="text-orange-600 dark:text-orange-400">
                {Math.round(keyStats.accuracy)}%
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
