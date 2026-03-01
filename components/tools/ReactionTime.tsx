"use client";

import { useState, useRef, useEffect } from "react";
import { saveSession, updateStreak, getSessions } from "@/lib/typing-stats";
import TypingHistory from "./TypingHistory";

const TOTAL_ROUNDS = 5;

type RoundState = "idle" | "waiting" | "ready" | "too-early" | "showing-result";
type TestState = "idle" | "testing" | "done";

function getRating(ms: number): string {
  if (ms < 150) return "Incredible";
  if (ms < 200) return "Excellent";
  if (ms < 250) return "Fast";
  if (ms < 300) return "Average";
  if (ms < 350) return "Below Average";
  if (ms < 450) return "Slow";
  return "Sleepy";
}

export default function ReactionTime() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [roundState, setRoundState] = useState<RoundState>("idle");
  const [currentRound, setCurrentRound] = useState(0);
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [result, setResult] = useState<{ avg: number; times: number[]; best: number; worst: number } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [copied, setCopied] = useState(false);

  const greenTimestampRef = useRef<number>(0);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showingResultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (showingResultTimerRef.current) clearTimeout(showingResultTimerRef.current);
    };
  }, []);

  function startTest() {
    // Load previous best (for reaction time, LOWER is better)
    const sessions = getSessions("reaction-time", 100);
    if (sessions.length > 0) {
      const bestSession = sessions.reduce((best, s) => s.wpm < best.wpm ? s : best);
      setPreviousBest(bestSession.wpm);
    } else {
      setPreviousBest(null);
    }

    setTestState("testing");
    setCurrentRound(1);
    setRoundTimes([]);
    startRound();
  }

  function startRound() {
    setRoundState("waiting");
    setLastReactionTime(null);

    const delay = 1500 + Math.random() * 3500;
    delayTimerRef.current = setTimeout(() => {
      greenTimestampRef.current = performance.now();
      setRoundState("ready");
    }, delay);
  }

  function handleAreaClick() {
    if (testState === "idle") {
      startTest();
      return;
    }

    if (testState === "done") {
      resetTest();
      return;
    }

    // testState === "testing"
    if (roundState === "waiting") {
      // Too early!
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      setRoundState("too-early");
      return;
    }

    if (roundState === "too-early") {
      // Restart this round
      startRound();
      return;
    }

    if (roundState === "ready") {
      const reactionTime = Math.round(performance.now() - greenTimestampRef.current);
      setLastReactionTime(reactionTime);
      setRoundState("showing-result");

      const newTimes = [...roundTimes, reactionTime];
      setRoundTimes(newTimes);

      if (newTimes.length >= TOTAL_ROUNDS) {
        // All rounds done — show final results after brief pause
        showingResultTimerRef.current = setTimeout(() => {
          finishTest(newTimes);
        }, 1500);
      } else {
        // Auto-advance to next round
        showingResultTimerRef.current = setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          startRound();
        }, 1500);
      }
    }

    if (roundState === "showing-result") {
      // Skip the auto-advance, go to next round immediately
      if (showingResultTimerRef.current) clearTimeout(showingResultTimerRef.current);
      if (roundTimes.length >= TOTAL_ROUNDS) {
        finishTest(roundTimes);
      } else {
        setCurrentRound(prev => prev + 1);
        startRound();
      }
    }
  }

  function finishTest(times: number[]) {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const best = Math.min(...times);
    const worst = Math.max(...times);

    setResult({ avg, times, best, worst });
    setTestState("done");
    setRoundState("idle");

    // Check personal best (lower is better)
    const sessions = getSessions("reaction-time", 100);
    const isNew = sessions.length === 0 || avg < Math.min(...sessions.map(s => s.wpm));
    setIsNewPB(isNew);

    saveSession({
      id: crypto.randomUUID(),
      tool: "reaction-time",
      mode: "5-round",
      wpm: avg,           // average ms stored here
      accuracy: 100,
      correctChars: best, // best round ms
      incorrectChars: worst, // worst round ms
      totalChars: TOTAL_ROUNDS,
      duration: Math.round(times.reduce((a, b) => a + b, 0) / 1000),
      timestamp: Date.now(),
    });
    updateStreak();
    setHistoryRefresh(prev => prev + 1);
  }

  function resetTest() {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    if (showingResultTimerRef.current) clearTimeout(showingResultTimerRef.current);
    setTestState("idle");
    setRoundState("idle");
    setCurrentRound(0);
    setRoundTimes([]);
    setLastReactionTime(null);
    setResult(null);
    setIsNewPB(false);
  }

  function handleShare() {
    if (!result) return;
    const text = `My average reaction time is ${result.avg} ms (${getRating(result.avg)}) on clevr.tools/type/reaction-time — test yours!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  // Determine click area appearance
  const getAreaStyle = () => {
    if (testState === "idle") return { bg: "bg-gray-900 border border-gray-700", text: "text-gray-400", label: "Click to start", sublabel: "5 rounds \u00B7 Click when the screen turns green" };
    if (roundState === "waiting") return { bg: "bg-red-500", text: "text-white", label: "Wait for green...", sublabel: "" };
    if (roundState === "ready") return { bg: "bg-green-500", text: "text-white", label: "CLICK NOW!", sublabel: "" };
    if (roundState === "too-early") return { bg: "bg-amber-500", text: "text-white", label: "Too early!", sublabel: "Click to try again" };
    if (roundState === "showing-result") return { bg: "bg-primary/20 border border-primary/30", text: "text-foreground", label: `${lastReactionTime} ms`, sublabel: getRating(lastReactionTime || 0) };
    if (testState === "done") return { bg: "bg-gray-900 border border-gray-700", text: "text-gray-400", label: "Click to play again", sublabel: "" };
    return { bg: "bg-gray-900 border border-gray-700", text: "text-gray-400", label: "", sublabel: "" };
  };

  const areaStyle = getAreaStyle();

  return (
    <div className="space-y-6">
      {/* Round progress (shown during testing) */}
      {testState === "testing" && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Round {currentRound} of {TOTAL_ROUNDS}</p>
          {roundTimes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {roundTimes.map((t, i) => (
                <span key={i} className="text-sm text-muted-foreground">
                  Round {i + 1}: <span className="font-medium text-foreground">{t} ms</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color area */}
      {testState !== "done" ? (
        <div
          onClick={handleAreaClick}
          className={`rounded-xl cursor-pointer select-none min-h-64 md:min-h-80 flex flex-col items-center justify-center transition-colors duration-100 ${areaStyle.bg}`}
          style={{ WebkitUserSelect: "none", userSelect: "none" } as React.CSSProperties}
        >
          <p className={`text-3xl font-bold ${areaStyle.text}`}>{areaStyle.label}</p>
          {areaStyle.sublabel && (
            <p className={`text-base mt-2 ${areaStyle.text} opacity-80`}>{areaStyle.sublabel}</p>
          )}
        </div>
      ) : (
        /* Results screen */
        <div className="rounded-xl bg-gray-900 p-8 text-center">
          <p className="text-sm text-gray-400 mb-1">Average Reaction Time</p>
          <div className="text-7xl font-bold text-primary mb-1">{result?.avg}</div>
          <p className="text-gray-400 text-sm mb-2">milliseconds</p>
          <p className="text-lg font-medium text-white mb-4">{result ? getRating(result.avg) : ""}</p>

          {isNewPB && (
            <div className="text-yellow-400 font-medium mb-3">New Personal Best!</div>
          )}
          {!isNewPB && previousBest !== null && (
            <p className="text-gray-500 text-sm mb-3">Previous best: {previousBest} ms</p>
          )}

          {/* Round breakdown */}
          <div className="mb-6 max-w-xs mx-auto">
            {result?.times.map((t, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-gray-800 text-sm">
                <span className="text-gray-400">Round {i + 1}</span>
                <span className="text-white font-medium">{t} ms</span>
              </div>
            ))}
            {result && (
              <div className="flex justify-between pt-2 text-sm">
                <span className="text-gray-400">Best: {result.best} ms &middot; Worst: {result.worst} ms</span>
              </div>
            )}
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

      {/* History */}
      <TypingHistory tool="reaction-time" refreshTrigger={historyRefresh} />
    </div>
  );
}
