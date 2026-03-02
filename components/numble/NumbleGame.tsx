"use client";

import { useState, useEffect, useRef } from "react";
import {
  generateDailyPuzzle,
  solveNumbers,
  getSecondsUntilMidnight,
  formatCountdown,
  getUTCDateString,
} from "@/lib/numble";
import type { DailyPuzzle, SolutionStep } from "@/lib/numble";
import {
  getStats,
  saveResult,
  getTodayState,
  saveTodayState,
  getSettings,
  saveSettings,
  hasSeenHowToPlay,
  markHowToPlaySeen,
} from "@/lib/numble-storage";
import type {
  NumbleTodayState,
  NumbleSettings,
  NumbleStats,
} from "@/lib/numble-storage";

// ---- Helper: compute stars ----
function computeStars(
  playerSteps: number,
  optimalSteps: number,
  solved: boolean,
  bestResult: number,
  target: number
): 0 | 1 | 2 | 3 {
  if (solved) {
    if (playerSteps <= optimalSteps) return 3;
    if (playerSteps <= optimalSteps + 1) return 2;
    return 1;
  }
  // Not solved — check closeness
  const diff = Math.abs(bestResult - target);
  if (diff <= 10) return 1;
  return 0;
}

// ---- Confetti ----
function triggerConfetti() {
  const canvas = document.getElementById(
    "numble-confetti"
  ) as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotSpeed: number;
  }

  const colors = ["#1D4ED8", "#60A5FA", "#F59E0B", "#34D399", "#F87171"];
  const particles: Particle[] = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  let frame = 0;
  function animate() {
    if (!ctx || frame > 120) {
      canvas.style.display = "none";
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / 100);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}

// ---- Tile type ----
interface Tile {
  id: string;
  value: number;
  state: "available" | "used" | "result";
}

interface GameStep {
  a: number;
  op: string;
  b: number;
  result: number;
  tileIdA: string;
  tileIdB: string;
  resultTileId: string;
}

// ---- Sub-components ----

function ResultsPanel({
  puzzle,
  steps,
  stars,
  gameStatus,
  optimalSolution,
  countdownSec,
  streak,
  onShare,
  copied,
}: {
  puzzle: DailyPuzzle;
  steps: GameStep[];
  stars: 0 | 1 | 2 | 3 | null;
  gameStatus: "won" | "gave-up";
  optimalSolution: SolutionStep[] | null;
  countdownSec: number;
  streak: number;
  onShare: () => void;
  copied: boolean;
}) {
  const starCount = stars ?? 0;

  return (
    <div className="space-y-6 text-center">
      {/* Stars */}
      <div>
        <div className="text-4xl mb-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`inline-block transition-all duration-500 ${
                s <= starCount ? "scale-110" : "opacity-20 grayscale"
              }`}
              style={{ animationDelay: `${s * 150}ms` }}
            >
              {"\u2b50"}
            </span>
          ))}
        </div>
        <p className="text-lg font-semibold text-[var(--text-primary)]">
          {gameStatus === "won" ? (
            starCount === 3 ? (
              "Perfect!"
            ) : starCount === 2 ? (
              "Great job!"
            ) : (
              "Solved!"
            )
          ) : (
            "Better luck tomorrow!"
          )}
        </p>
        {gameStatus === "won" && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {steps.length === puzzle.optimalSteps
              ? `${steps.length} steps (Optimal!)`
              : `${steps.length} steps (Optimal: ${puzzle.optimalSteps})`}
          </p>
        )}
        {streak >= 2 && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {"\ud83d\udd25"} {streak}-day streak
          </p>
        )}
      </div>

      {/* Your solution */}
      <div className="space-y-2 text-left">
        <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">
          Your Solution
        </div>
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-[var(--bg-surface)] rounded-lg px-4 py-2 text-sm font-mono"
          >
            <span className="text-[var(--text-secondary)]">{step.a}</span>
            <span className="text-blue-400 mx-2">{step.op}</span>
            <span className="text-[var(--text-secondary)]">{step.b}</span>
            <span className="text-[var(--text-tertiary)] mx-2">=</span>
            <span
              className={`font-bold ${step.result === puzzle.target ? "text-green-400" : "text-[var(--text-primary)]"}`}
            >
              {step.result}
            </span>
            {step.result === puzzle.target && (
              <span className="ml-2">{"\ud83c\udfaf"}</span>
            )}
          </div>
        ))}
      </div>

      {/* Optimal solution (gave up) */}
      {gameStatus === "gave-up" && optimalSolution && optimalSolution.length > 0 && (
        <div className="space-y-2 text-left">
          <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">
            Optimal Solution ({optimalSolution.length} steps)
          </div>
          {optimalSolution.map((step, i) => (
            <div
              key={i}
              className="bg-[var(--bg-surface)] rounded-lg px-4 py-2 text-sm font-mono border border-[var(--border-default)] animate-in fade-in slide-in-from-top-2 duration-300"
              style={{ animationDelay: `${i * 200}ms`, animationFillMode: "backwards" }}
            >
              <span className="text-[var(--text-secondary)]">{step.a}</span>
              <span className="text-amber-400 mx-2">{step.op}</span>
              <span className="text-[var(--text-secondary)]">{step.b}</span>
              <span className="text-[var(--text-tertiary)] mx-2">=</span>
              <span
                className={`font-bold ${step.result === puzzle.target ? "text-green-400" : "text-[var(--text-secondary)]"}`}
              >
                {step.result}
              </span>
              {step.result === puzzle.target && (
                <span className="ml-2">{"\ud83c\udfaf"}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share + countdown */}
      <div className="space-y-4">
        <button
          onClick={onShare}
          className="w-full py-3 rounded-xl bg-[var(--clr-accent)] hover:bg-[var(--clr-accent-hover)] text-white font-semibold text-sm transition-colors"
        >
          {copied ? "Copied!" : "Share Results"}
        </button>
        <div className="text-sm text-[var(--text-tertiary)]">
          Next puzzle in{" "}
          <span className="font-mono text-[var(--text-secondary)]">
            {formatCountdown(countdownSec)}
          </span>
        </div>
      </div>
    </div>
  );
}

function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">How to Play</h2>

        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Goal</h3>
            <p>
              Combine the 6 given numbers to reach the target using addition,
              subtraction, multiplication, and division.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Rules</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Each number can only be used once</li>
              <li>You don&apos;t have to use all numbers</li>
              <li>Only whole, positive numbers are allowed (no fractions or zero)</li>
              <li>Division must be exact (no remainders)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">How to Play</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Tap a number tile to select it</li>
              <li>Tap an operator (+, -, x, /)</li>
              <li>Tap a second number tile to complete the operation</li>
              <li>The result becomes a new tile you can use</li>
              <li>Keep going until you reach the target!</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Scoring</h3>
            <div className="space-y-1">
              <p>
                <span>{"\u2b50\u2b50\u2b50"}</span> — Solved in the fewest
                possible steps
              </p>
              <p>
                <span>{"\u2b50\u2b50"}</span> — Solved within 1 step of optimal
              </p>
              <p>
                <span>{"\u2b50"}</span> — Solved (or within 10 of target)
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Daily Challenge</h3>
            <p>
              A new puzzle is released every day at midnight UTC. Everyone gets
              the same puzzle. Build your streak!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[var(--clr-accent)] hover:bg-[var(--clr-accent-hover)] text-white font-semibold text-sm transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

function StatsModal({
  stats,
  onClose,
}: {
  stats: NumbleStats;
  onClose: () => void;
}) {
  const maxDistCount = Math.max(
    1,
    stats.starDistribution[3],
    stats.starDistribution[2],
    stats.starDistribution[1],
    stats.starDistribution[0]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Statistics</h2>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Played", value: stats.totalGames },
            { label: "Streak", value: stats.currentStreak },
            { label: "Max", value: stats.maxStreak },
            {
              label: "Avg Stars",
              value:
                stats.totalGames > 0
                  ? (stats.totalStars / stats.totalGames).toFixed(1)
                  : "-",
            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Star distribution */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">
            Star Distribution
          </div>
          {([3, 2, 1, 0] as const).map((starLevel) => (
            <div key={starLevel} className="flex items-center gap-2">
              <span className="text-sm w-16 text-[var(--text-secondary)]">
                {starLevel > 0
                  ? "\u2b50".repeat(starLevel)
                  : "0 stars"}
              </span>
              <div className="flex-1 bg-[var(--bg-surface)] rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    starLevel === 3
                      ? "bg-amber-500"
                      : starLevel === 2
                        ? "bg-blue-500"
                        : starLevel === 1
                          ? "bg-gray-500"
                          : "bg-gray-700"
                  }`}
                  style={{
                    width: `${(stats.starDistribution[starLevel] / maxDistCount) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)] w-6 text-right">
                {stats.starDistribution[starLevel]}
              </span>
            </div>
          ))}
        </div>

        {/* Recent history */}
        {stats.history.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">
              Recent Games
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {stats.history.slice(0, 10).map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm bg-[var(--bg-surface)] rounded-lg px-3 py-2"
                >
                  <span className="text-[var(--text-secondary)]">
                    #{entry.puzzleNumber}
                  </span>
                  <span className="text-[var(--text-tertiary)]">{entry.target}</span>
                  <span>
                    {entry.solved
                      ? `${entry.steps} steps`
                      : entry.gaveUp
                        ? "Gave up"
                        : "Incomplete"}
                  </span>
                  <span>
                    {entry.stars > 0
                      ? "\u2b50".repeat(entry.stars)
                      : "\u2014"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: NumbleSettings;
  onSave: (s: NumbleSettings) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<NumbleSettings>({ ...settings });

  function toggle(key: keyof NumbleSettings) {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-6 space-y-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>

        <div className="space-y-4">
          {[
            {
              key: "colorblindMode" as const,
              label: "Colorblind Mode",
              desc: "Use patterns instead of colors",
            },
            {
              key: "soundEnabled" as const,
              label: "Sound Effects",
              desc: "Play sounds on actions",
            },
            {
              key: "hardMode" as const,
              label: "Hard Mode",
              desc: "Must use all 6 numbers",
            },
          ].map((opt) => (
            <div
              key={opt.key}
              className="flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {opt.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">{opt.desc}</div>
              </div>
              <button
                onClick={() => toggle(opt.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  local[opt.key] ? "bg-[var(--clr-accent)]" : "bg-[var(--bg-surface)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    local[opt.key] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(local)}
            className="flex-1 py-3 rounded-xl bg-[var(--clr-accent)] hover:bg-[var(--clr-accent-hover)] text-white font-semibold text-sm transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Game Component ----

export default function NumbleGame() {
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedOp, setSelectedOp] = useState<
    "+" | "-" | "\u00d7" | "\u00f7" | null
  >(null);
  const [steps, setSteps] = useState<GameStep[]>([]);

  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "gave-up">(
    "playing"
  );
  const [stars, setStars] = useState<0 | 1 | 2 | 3 | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [optimalSolution, setOptimalSolution] = useState<
    SolutionStep[] | null
  >(null);
  const [countdownSec, setCountdownSec] = useState(0);
  const [settings, setSettingsState] = useState<NumbleSettings>({
    colorblindMode: false,
    soundEnabled: false,
    hardMode: false,
  });
  const [stats, setStats] = useState<NumbleStats>({
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: "",
    totalGames: 0,
    totalStars: 0,
    starDistribution: { 3: 0, 2: 0, 1: 0, 0: 0 },
    history: [],
  });
  const [closestResult, setClosestResult] = useState<number | null>(null);
  const [isDeadEnd, setIsDeadEnd] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const resetConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [giveUpConfirmActive, setGiveUpConfirmActive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Error flash
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Check if any valid operations exist among available numbers
  function hasValidOperations(availableValues: number[]): boolean {
    if (availableValues.length < 2) return false;
    for (let i = 0; i < availableValues.length; i++) {
      for (let j = 0; j < availableValues.length; j++) {
        if (i === j) continue;
        const a = availableValues[i];
        const b = availableValues[j];
        // Addition: always valid
        if (a + b > 0) return true;
        // Subtraction: valid if a - b > 0
        if (a - b > 0) return true;
        // Multiplication: always valid
        if (a * b > 0) return true;
        // Division: valid if exact (no remainder) and positive
        if (b !== 0 && a % b === 0 && a / b > 0) return true;
      }
    }
    return false;
  }

  // Dead-end detection: runs after tiles change
  useEffect(() => {
    if (gameStatus !== "playing" || !puzzle || tiles.length === 0) return;

    const availableTiles = tiles.filter((t) => t.state === "available");
    const availableValues = availableTiles.map((t) => t.value);

    // Only check after at least one step has been made
    if (steps.length === 0) return;

    // Condition 1: single number remaining, not target
    if (availableValues.length === 1 && availableValues[0] !== puzzle.target) {
      setIsDeadEnd(true);
      return;
    }

    // Condition 2: 2+ numbers but no valid operations exist
    if (availableValues.length >= 2 && !hasValidOperations(availableValues)) {
      setIsDeadEnd(true);
      return;
    }

    setIsDeadEnd(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, gameStatus]);

  // Countdown timer
  useEffect(() => {
    setCountdownSec(getSecondsUntilMidnight());
    const interval = setInterval(() => {
      setCountdownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize puzzle and restore state
  useEffect(() => {
    const todayStr = getUTCDateString();
    const p = generateDailyPuzzle(todayStr);
    setPuzzle(p);

    // Pre-compute optimal solution (in background, won't block)
    setTimeout(() => {
      const sol = solveNumbers(p.numbers, p.target);
      if (sol.found) setOptimalSolution(sol.steps);
    }, 100);

    // Load settings
    setSettingsState(getSettings());

    // Check how-to-play
    if (!hasSeenHowToPlay()) {
      setShowHowToPlay(true);
    }

    // Compute initial closest result from starting numbers
    const initialClosest = p.numbers.reduce((best, n) =>
      Math.abs(n - p.target) < Math.abs(best - p.target) ? n : best
    , p.numbers[0]);

    // Restore today's state
    const todayState = getTodayState();
    if (todayState && todayState.date === todayStr) {
      if (todayState.completed || todayState.gaveUp) {
        // Already played — show results
        setGameStatus(todayState.gaveUp ? "gave-up" : "won");
        setStars(todayState.stars);
        initTiles(p.numbers, todayState.steps);
        const restoredSteps = todayState.steps.map((s, i) => ({
          ...s,
          tileIdA: `orig-${i}-a`,
          tileIdB: `orig-${i}-b`,
          resultTileId: `result-${i}`,
        }));
        setSteps(restoredSteps);
        // Restore closestResult from all results + initial numbers
        let bestClosest = initialClosest;
        for (const s of todayState.steps) {
          if (Math.abs(s.result - p.target) < Math.abs(bestClosest - p.target)) {
            bestClosest = s.result;
          }
        }
        setClosestResult(bestClosest);
      } else if (todayState.steps.length > 0) {
        // In progress — restore
        initTiles(p.numbers, todayState.steps);
        const restoredSteps = todayState.steps.map((s, i) => ({
          ...s,
          tileIdA: `orig-${i}-a`,
          tileIdB: `orig-${i}-b`,
          resultTileId: `result-${i}`,
        }));
        setSteps(restoredSteps);
        // Restore closestResult from all results + initial numbers
        let bestClosest = initialClosest;
        for (const s of todayState.steps) {
          if (Math.abs(s.result - p.target) < Math.abs(bestClosest - p.target)) {
            bestClosest = s.result;
          }
        }
        setClosestResult(bestClosest);
      } else {
        initTiles(p.numbers, []);
        setClosestResult(initialClosest);
      }
    } else {
      initTiles(p.numbers, []);
      setClosestResult(initialClosest);
    }

    setStats(getStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initTiles(
    numbers: number[],
    existingSteps: Array<{
      a: number;
      op: string;
      b: number;
      result: number;
    }>
  ) {
    let currentTiles: Tile[] = numbers.map((n, i) => ({
      id: `orig-${i}`,
      value: n,
      state: "available" as const,
    }));

    for (let i = 0; i < existingSteps.length; i++) {
      const step = existingSteps[i];
      const usedA = currentTiles.find(
        (t) => t.state === "available" && t.value === step.a
      );
      const usedB = currentTiles.find(
        (t) =>
          t.state === "available" && t.id !== usedA?.id && t.value === step.b
      );
      if (usedA)
        currentTiles = currentTiles.map((t) =>
          t.id === usedA.id ? { ...t, state: "used" as const } : t
        );
      if (usedB)
        currentTiles = currentTiles.map((t) =>
          t.id === usedB.id ? { ...t, state: "used" as const } : t
        );
      currentTiles.push({
        id: `result-${i}`,
        value: step.result,
        state: "available",
      });
    }
    setTiles(currentTiles);
  }

  // ---- Interaction ----

  function handleTileClick(tileId: string) {
    if (gameStatus !== "playing") return;
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || tile.state !== "available") return;

    if (!selectedTileId) {
      setSelectedTileId(tileId);
      setSelectedOp(null);
    } else if (selectedTileId === tileId) {
      setSelectedTileId(null);
      setSelectedOp(null);
    } else if (selectedTileId && !selectedOp) {
      setSelectedTileId(tileId);
    } else if (selectedTileId && selectedOp) {
      performOperation(selectedTileId, selectedOp, tileId);
    }
  }

  function handleOpClick(op: "+" | "-" | "\u00d7" | "\u00f7") {
    if (gameStatus !== "playing" || !selectedTileId) return;
    setSelectedOp(op);
  }

  function performOperation(
    tileIdA: string,
    op: "+" | "-" | "\u00d7" | "\u00f7",
    tileIdB: string
  ) {
    const tileA = tiles.find((t) => t.id === tileIdA);
    const tileB = tiles.find((t) => t.id === tileIdB);
    if (!tileA || !tileB || !puzzle) return;

    const a = tileA.value;
    const b = tileB.value;

    let result: number | null = null;
    let errorMessage: string | null = null;

    if (op === "+") result = a + b;
    else if (op === "-") {
      if (a - b <= 0)
        errorMessage =
          a === b ? "Result can\u2019t be zero" : "Result must be positive";
      else result = a - b;
    } else if (op === "\u00d7") result = a * b;
    else if (op === "\u00f7") {
      if (b === 0) errorMessage = "Can\u2019t divide by zero";
      else if (a % b !== 0) errorMessage = "Must divide evenly";
      else if (a / b <= 0) errorMessage = "Result must be positive";
      else result = a / b;
    }

    if (errorMessage) {
      setErrorMsg(errorMessage);
      setSelectedTileId(null);
      setSelectedOp(null);
      return;
    }

    if (result === null) return;

    const resultTileId = `result-${steps.length}`;

    const newTiles = tiles.map((t) => {
      if (t.id === tileIdA || t.id === tileIdB)
        return { ...t, state: "used" as const };
      return t;
    });
    newTiles.push({ id: resultTileId, value: result, state: "available" });
    setTiles(newTiles);

    const newStep: GameStep = {
      a,
      op,
      b,
      result,
      tileIdA,
      tileIdB,
      resultTileId,
    };
    const newSteps = [...steps, newStep];
    setSteps(newSteps);

    setSelectedTileId(null);
    setSelectedOp(null);

    // Update closest result tracking
    if (
      closestResult === null ||
      Math.abs(result - puzzle.target) < Math.abs(closestResult - puzzle.target)
    ) {
      setClosestResult(result);
    }

    const todayStr = getUTCDateString();
    const todayState: NumbleTodayState = {
      puzzleNumber: puzzle.puzzleNumber,
      date: todayStr,
      steps: newSteps.map((s) => ({
        a: s.a,
        op: s.op,
        b: s.b,
        result: s.result,
      })),
      completed: result === puzzle.target,
      stars: null,
      gaveUp: false,
      bestResult: result,
    };

    if (result === puzzle.target) {
      const earnedStars = computeStars(
        newSteps.length,
        puzzle.optimalSteps,
        true,
        result,
        puzzle.target
      );
      setStars(earnedStars);
      setGameStatus("won");
      todayState.stars = earnedStars;
      saveTodayState(todayState);

      const entry = {
        puzzleNumber: puzzle.puzzleNumber,
        date: todayStr,
        stars: earnedStars,
        steps: newSteps.length,
        optimal: puzzle.optimalSteps,
        target: puzzle.target,
        solved: true,
        gaveUp: false,
      };
      saveResult(entry, todayStr);
      setStats(getStats());

      setTimeout(triggerConfetti, 100);
    } else {
      saveTodayState(todayState);
    }
  }

  function handleUndo() {
    if (steps.length === 0 || gameStatus !== "playing") return;
    const lastStep = steps[steps.length - 1];

    const newTiles = tiles
      .filter((t) => t.id !== lastStep.resultTileId)
      .map((t) => {
        if (t.id === lastStep.tileIdA || t.id === lastStep.tileIdB) {
          return { ...t, state: "available" as const };
        }
        return t;
      });
    setTiles(newTiles);

    const newSteps = steps.slice(0, -1);
    setSteps(newSteps);
    setSelectedTileId(null);
    setSelectedOp(null);
    setIsDeadEnd(false);

    if (puzzle) {
      const todayState: NumbleTodayState = {
        puzzleNumber: puzzle.puzzleNumber,
        date: getUTCDateString(),
        steps: newSteps.map((s) => ({
          a: s.a,
          op: s.op,
          b: s.b,
          result: s.result,
        })),
        completed: false,
        stars: null,
        gaveUp: false,
        bestResult: null,
      };
      saveTodayState(todayState);
    }
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetConfirmTimerRef.current)
        clearTimeout(resetConfirmTimerRef.current);
      resetConfirmTimerRef.current = setTimeout(
        () => setResetConfirm(false),
        5000
      );
      return;
    }
    if (resetConfirmTimerRef.current)
      clearTimeout(resetConfirmTimerRef.current);
    setResetConfirm(false);
    if (!puzzle) return;
    initTiles(puzzle.numbers, []);
    setSteps([]);
    setSelectedTileId(null);
    setSelectedOp(null);
    setIsDeadEnd(false);
    // Reset closestResult to initial closest from starting numbers
    const initialClosest = puzzle.numbers.reduce((best, n) =>
      Math.abs(n - puzzle.target) < Math.abs(best - puzzle.target) ? n : best
    , puzzle.numbers[0]);
    setClosestResult(initialClosest);
    const todayState: NumbleTodayState = {
      puzzleNumber: puzzle.puzzleNumber,
      date: getUTCDateString(),
      steps: [],
      completed: false,
      stars: null,
      gaveUp: false,
      bestResult: null,
    };
    saveTodayState(todayState);
  }

  function handleGiveUp() {
    if (!giveUpConfirmActive) {
      setGiveUpConfirmActive(true);
      return;
    }
    if (!puzzle) return;

    const allResults = steps.map((s) => s.result);
    const bestResult =
      allResults.length > 0
        ? allResults.reduce((best, r) =>
            Math.abs(r - puzzle.target) < Math.abs(best - puzzle.target)
              ? r
              : best
          , allResults[0])
        : 0;

    const earnedStars = computeStars(
      steps.length,
      puzzle.optimalSteps,
      false,
      bestResult,
      puzzle.target
    );
    setStars(earnedStars);
    setGameStatus("gave-up");
    setGiveUpConfirmActive(false);

    const todayStr = getUTCDateString();
    const todayState: NumbleTodayState = {
      puzzleNumber: puzzle.puzzleNumber,
      date: todayStr,
      steps: steps.map((s) => ({
        a: s.a,
        op: s.op,
        b: s.b,
        result: s.result,
      })),
      completed: false,
      stars: earnedStars,
      gaveUp: true,
      bestResult,
    };
    saveTodayState(todayState);

    const entry = {
      puzzleNumber: puzzle.puzzleNumber,
      date: todayStr,
      stars: earnedStars,
      steps: steps.length,
      optimal: puzzle.optimalSteps,
      target: puzzle.target,
      solved: false,
      gaveUp: true,
    };
    saveResult(entry, todayStr);
    setStats(getStats());
  }

  // ---- Share ----
  function buildShareText(): string {
    if (!puzzle) return "";
    const starsStr =
      stars !== null ? "\u2b50".repeat(stars) : "";
    const statusEmoji = gameStatus === "won" ? "\ud83c\udfaf" : "\u274c";

    const gridRows: string[] = [];
    let availableCount = puzzle.numbers.length; // starts at 6

    for (let si = 0; si < steps.length; si++) {
      const row = [];
      const usedInStep = 2;
      for (let i = 0; i < availableCount; i++) {
        row.push(i < usedInStep ? "\ud83d\udfe6" : "\u2b1c");
      }
      gridRows.push(row.join(""));
      availableCount = availableCount - 2 + 1;
    }
    gridRows.push(statusEmoji);

    const stepLabel =
      steps.length === puzzle.optimalSteps
        ? `${steps.length} steps (Optimal!)`
        : `${steps.length} steps`;
    const streakStr =
      stats.currentStreak >= 2
        ? `\n\ud83d\udd25 ${stats.currentStreak}-day streak`
        : "";

    const lastResult = steps.length > 0 ? steps[steps.length - 1].result : 0;

    return `\ud83d\udd22 Numble #${puzzle.puzzleNumber} ${starsStr}\n${
      gameStatus === "won"
        ? `\ud83c\udfaf ${stepLabel}`
        : `\ud83d\udccf ${Math.abs(lastResult - puzzle.target)} away`
    }${streakStr}\n\n${gridRows.join("\n")}\n\nclevr.tools/play/numble`;
  }

  function handleShare() {
    const text = buildShareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  if (!puzzle)
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Confetti canvas */}
      <canvas
        id="numble-confetti"
        className="fixed inset-0 pointer-events-none z-50"
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">NUMBLE</h1>
          <p className="text-xs text-[var(--text-tertiary)]">
            #{puzzle.puzzleNumber} &middot;{" "}
            {new Date(puzzle.date + "T00:00:00Z").toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(true)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            title="Stats"
          >
            {"\ud83d\udcca"}
          </button>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            title="How to Play"
          >
            {"\u2753"}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            title="Settings"
          >
            {"\u2699\ufe0f"}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Streak badge */}
        {stats.currentStreak >= 2 && (
          <div className="text-center">
            <span className="text-sm text-[var(--text-secondary)]">
              {"\ud83d\udd25"} {stats.currentStreak}-day streak
            </span>
          </div>
        )}

        {/* Target */}
        <div className="text-center">
          <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest mb-1">
            Target
          </div>
          <div
            className={`text-8xl font-bold leading-none ${gameStatus === "won" ? "text-primary animate-pulse" : "text-[var(--text-primary)]"}`}
            style={
              gameStatus === "won"
                ? { textShadow: "0 0 40px rgba(29, 78, 216, 0.6)" }
                : {}
            }
          >
            {puzzle.target}
          </div>
        </div>

        {gameStatus === "playing" ? (
          <>
            {/* Number tiles */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {tiles
                .filter((t) => t.state !== "used")
                .map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile.id)}
                    disabled={tile.state === "used"}
                    className={`h-16 rounded-xl text-2xl font-bold transition-all duration-150 ${
                      tile.state === "used"
                        ? "opacity-20 cursor-not-allowed bg-[var(--bg-elevated)] border border-[var(--border-default)]"
                        : selectedTileId === tile.id
                          ? "bg-[var(--bg-elevated)] border-2 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20 scale-105"
                          : tile.state === "result"
                            ? "bg-[var(--bg-elevated)] border border-blue-500/30 text-[var(--text-primary)] hover:border-blue-400 hover:scale-105"
                            : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:scale-105"
                    }`}
                  >
                    {tile.value}
                  </button>
                ))}
            </div>

            {/* Operator buttons */}
            <div
              className={`flex justify-center gap-3 transition-opacity duration-200 ${!selectedTileId ? "opacity-40" : "opacity-100"}`}
            >
              {(
                ["+", "-", "\u00d7", "\u00f7"] as (
                  | "+"
                  | "-"
                  | "\u00d7"
                  | "\u00f7"
                )[]
              ).map((op) => (
                <button
                  key={op}
                  onClick={() => handleOpClick(op)}
                  disabled={!selectedTileId}
                  className={`w-14 h-14 rounded-xl text-2xl font-bold transition-all ${
                    selectedOp === op
                      ? "bg-[var(--clr-accent)] border-2 border-blue-400 text-white scale-110"
                      : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="text-center text-sm text-red-400 animate-in fade-in duration-200">
                {errorMsg}
              </div>
            )}

            {/* Steps list */}
            {steps.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">
                  Steps
                </div>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="bg-[var(--bg-surface)] rounded-lg px-4 py-2 text-sm font-mono animate-in slide-in-from-top-2 duration-200"
                  >
                    <span className="text-[var(--text-secondary)]">{step.a}</span>
                    <span className="text-blue-400 mx-2">{step.op}</span>
                    <span className="text-[var(--text-secondary)]">{step.b}</span>
                    <span className="text-[var(--text-tertiary)] mx-2">=</span>
                    <span
                      className={`font-bold ${step.result === puzzle.target ? "text-green-400" : "text-[var(--text-primary)]"}`}
                    >
                      {step.result}
                    </span>
                    {step.result === puzzle.target && (
                      <span className="ml-2">{"\ud83c\udfaf"}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Dead-end prompt */}
            {isDeadEnd && closestResult !== null && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                  {tiles.filter((t) => t.state === "available").length === 1
                    ? "\ud83d\ude05 No more moves!"
                    : "\ud83d\ude05 Stuck! No valid operations remaining."}
                </p>
                <p className="text-amber-800 dark:text-amber-300 text-sm mt-1">
                  You reached {closestResult} ({Math.abs(closestResult - puzzle.target)} away from {puzzle.target})
                  {Math.abs(closestResult - puzzle.target) <= 5
                    ? " Almost there! Try a different path."
                    : Math.abs(closestResult - puzzle.target) <= 10
                      ? " So close!"
                      : ""}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleUndo}
                    className="flex-1 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors"
                  >
                    {"\u21a9"} Undo Last Step
                  </button>
                  <button
                    onClick={() => {
                      setIsDeadEnd(false);
                      // Trigger reset with confirmation bypass
                      if (!puzzle) return;
                      if (resetConfirmTimerRef.current)
                        clearTimeout(resetConfirmTimerRef.current);
                      setResetConfirm(false);
                      initTiles(puzzle.numbers, []);
                      setSteps([]);
                      setSelectedTileId(null);
                      setSelectedOp(null);
                      const resetClosest = puzzle.numbers.reduce((best, n) =>
                        Math.abs(n - puzzle.target) < Math.abs(best - puzzle.target) ? n : best
                      , puzzle.numbers[0]);
                      setClosestResult(resetClosest);
                      const todayState: NumbleTodayState = {
                        puzzleNumber: puzzle.puzzleNumber,
                        date: getUTCDateString(),
                        steps: [],
                        completed: false,
                        stars: null,
                        gaveUp: false,
                        bestResult: null,
                      };
                      saveTodayState(todayState);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors"
                  >
                    {"\ud83d\udd04"} Reset
                  </button>
                  <button
                    onClick={() => {
                      setIsDeadEnd(false);
                      // Trigger give up directly (bypass confirmation)
                      if (!puzzle) return;
                      const allResults = steps.map((s) => s.result);
                      const bestResult =
                        allResults.length > 0
                          ? allResults.reduce((best, r) =>
                              Math.abs(r - puzzle.target) < Math.abs(best - puzzle.target)
                                ? r
                                : best
                            , allResults[0])
                          : 0;
                      const earnedStars = computeStars(
                        steps.length,
                        puzzle.optimalSteps,
                        false,
                        bestResult,
                        puzzle.target
                      );
                      setStars(earnedStars);
                      setGameStatus("gave-up");
                      setGiveUpConfirmActive(false);

                      const todayStr = getUTCDateString();
                      const giveUpState: NumbleTodayState = {
                        puzzleNumber: puzzle.puzzleNumber,
                        date: todayStr,
                        steps: steps.map((s) => ({
                          a: s.a,
                          op: s.op,
                          b: s.b,
                          result: s.result,
                        })),
                        completed: false,
                        stars: earnedStars,
                        gaveUp: true,
                        bestResult,
                      };
                      saveTodayState(giveUpState);

                      const entry = {
                        puzzleNumber: puzzle.puzzleNumber,
                        date: todayStr,
                        stars: earnedStars,
                        steps: steps.length,
                        optimal: puzzle.optimalSteps,
                        target: puzzle.target,
                        solved: false,
                        gaveUp: true,
                      };
                      saveResult(entry, todayStr);
                      setStats(getStats());
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors"
                  >
                    Show Solution
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={steps.length === 0}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {"\u21a9"} Undo
                </button>
                <button
                  onClick={handleReset}
                  disabled={steps.length === 0}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    resetConfirm
                      ? "bg-red-900/50 border-red-500 text-red-300"
                      : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  {resetConfirm ? "Confirm Reset?" : "\u21ba Reset"}
                </button>
              </div>

              <div>
                {!giveUpConfirmActive ? (
                  <button
                    onClick={() => setGiveUpConfirmActive(true)}
                    className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    Give up?
                  </button>
                ) : (
                  <div className="flex gap-2 items-center text-xs">
                    <span className="text-[var(--text-tertiary)]">Show solution?</span>
                    <button
                      onClick={handleGiveUp}
                      className="text-red-400 hover:text-red-300"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setGiveUpConfirmActive(false)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results screen */
          <ResultsPanel
            puzzle={puzzle}
            steps={steps}
            stars={stars}
            gameStatus={gameStatus}
            optimalSolution={
              gameStatus === "gave-up" ? optimalSolution || [] : null
            }
            countdownSec={countdownSec}
            streak={stats.currentStreak}
            onShare={handleShare}
            copied={copied}
          />
        )}
      </div>

      {/* Modals */}
      {showHowToPlay && (
        <HowToPlayModal
          onClose={() => {
            setShowHowToPlay(false);
            markHowToPlaySeen();
          }}
        />
      )}
      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => {
            setSettingsState(s);
            saveSettings(s);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
