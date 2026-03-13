"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  formatCountdown,
  generateDailyPuzzle,
  generatePracticePuzzle,
  getSecondsUntilMidnight,
  getUTCDateString,
  solveNumbers,
} from "@/lib/numble";
import type {
  DailyPuzzle,
  NumbleDifficulty,
  NumbleMode,
  SolutionStep,
} from "@/lib/numble";
import {
  getSettings,
  getStats,
  getTodayState,
  hasSeenHowToPlay,
  markHowToPlaySeen,
  saveResult,
  saveSettings,
  saveTodayState,
} from "@/lib/numble-storage";
import type {
  NumbleAchievement,
  NumbleSettings,
  NumbleStats,
  NumbleTodayState,
} from "@/lib/numble-storage";
import {
  buildNumbleShareText,
  downloadNumbleShareCard,
} from "@/lib/numble-share";

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

  const diff = Math.abs(bestResult - target);
  if (diff <= 10) return 1;
  return 0;
}

function triggerConfetti() {
  const canvas = document.getElementById("numble-confetti") as HTMLCanvasElement;
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

interface Tile {
  id: string;
  value: number;
  state: "available" | "used" | "result";
}

interface SerializedGameStep {
  a: number;
  op: string;
  b: number;
  result: number;
}

interface GameStep extends SerializedGameStep {
  tileIdA: string;
  tileIdB: string;
  resultTileId: string;
}

function serializeSteps(steps: GameStep[]): SerializedGameStep[] {
  return steps.map(({ a, op, b, result }) => ({ a, op, b, result }));
}

function getInitialClosest(puzzle: DailyPuzzle): number {
  return puzzle.numbers.reduce((best, value) =>
    Math.abs(value - puzzle.target) < Math.abs(best - puzzle.target) ? value : best
  , puzzle.numbers[0]);
}

function replaySteps(numbers: number[], serializedSteps: SerializedGameStep[]) {
  let currentTiles: Tile[] = numbers.map((value, index) => ({
    id: `orig-${index}`,
    value,
    state: "available",
  }));

  const restoredSteps: GameStep[] = [];

  serializedSteps.forEach((step, index) => {
    const tileA = currentTiles.find(
      (tile) => tile.state === "available" && tile.value === step.a
    );
    const tileB = currentTiles.find(
      (tile) => tile.state === "available" && tile.id !== tileA?.id && tile.value === step.b
    );

    if (!tileA || !tileB) return;

    const resultTileId = `result-${index}`;
    currentTiles = currentTiles.map((tile) => {
      if (tile.id === tileA.id || tile.id === tileB.id) {
        return { ...tile, state: "used" as const };
      }
      return tile;
    });
    currentTiles.push({ id: resultTileId, value: step.result, state: "available" });
    restoredSteps.push({
      ...step,
      tileIdA: tileA.id,
      tileIdB: tileB.id,
      resultTileId,
    });
  });

  return { tiles: currentTiles, steps: restoredSteps };
}

function hasValidOperations(values: number[]): boolean {
  if (values.length < 2) return false;
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length; j++) {
      if (i === j) continue;
      const a = values[i];
      const b = values[j];
      if (a + b > 0) return true;
      if (a - b > 0) return true;
      if (a * b > 0) return true;
      if (b !== 0 && a % b === 0 && a / b > 0) return true;
    }
  }
  return false;
}

function formatModeTitle(mode: NumbleMode, puzzle: DailyPuzzle): string {
  return mode === "daily" ? `Numble #${puzzle.puzzleNumber}` : "Practice Puzzle";
}

function getDifficultyTone(difficulty: NumbleDifficulty) {
  if (difficulty === "Hard") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (difficulty === "Medium") return "bg-amber-500/15 text-amber-100 border-amber-400/30";
  return "bg-emerald-500/15 text-emerald-100 border-emerald-400/30";
}

function computeHintTileIds(
  tiles: Tile[],
  hintStep: SolutionStep | null
): Set<string> {
  if (!hintStep) return new Set();
  const counts = new Map<number, number>();
  counts.set(hintStep.a, (counts.get(hintStep.a) ?? 0) + 1);
  counts.set(hintStep.b, (counts.get(hintStep.b) ?? 0) + 1);
  const selected = new Set<string>();

  tiles.forEach((tile) => {
    if (tile.state !== "available") return;
    const remaining = counts.get(tile.value) ?? 0;
    if (remaining > 0) {
      counts.set(tile.value, remaining - 1);
      selected.add(tile.id);
    }
  });

  return selected;
}

function isLargeNumber(value: number): boolean {
  return value === 25 || value === 50 || value === 75 || value === 100;
}

function buildGameSnapshot(
  puzzle: DailyPuzzle,
  restoredState?: NumbleTodayState | null
): {
  tiles: Tile[];
  steps: GameStep[];
  gameStatus: "playing" | "won" | "gave-up";
  stars: 0 | 1 | 2 | 3 | null;
  closestResult: number;
} {
  const initialClosest = getInitialClosest(puzzle);

  if (
    restoredState &&
    restoredState.date === getUTCDateString() &&
    restoredState.steps.length > 0
  ) {
    const replayed = replaySteps(puzzle.numbers, restoredState.steps);
    const bestClosest = restoredState.steps.reduce(
      (best, step) =>
        Math.abs(step.result - puzzle.target) < Math.abs(best - puzzle.target)
          ? step.result
          : best,
      initialClosest
    );

    return {
      tiles: replayed.tiles,
      steps: replayed.steps,
      gameStatus: restoredState.completed || restoredState.gaveUp
        ? (restoredState.gaveUp ? "gave-up" : "won")
        : ("playing" as const),
      stars: restoredState.completed || restoredState.gaveUp
        ? restoredState.stars
        : null,
      closestResult: restoredState.bestResult ?? bestClosest,
    };
  }

  return {
    tiles: replaySteps(puzzle.numbers, []).tiles,
    steps: [] as GameStep[],
    gameStatus: "playing" as const,
    stars: null,
    closestResult: initialClosest,
  };
}

function createInitialSession() {
  const today = getUTCDateString();
  const puzzle = generateDailyPuzzle(today);
  const restoredState = getTodayState();

  return {
    mode: "daily" as const,
    puzzle,
    settings: getSettings(),
    stats: getStats(),
    showTutorial: !hasSeenHowToPlay(),
    countdownSec: getSecondsUntilMidnight(),
    ...buildGameSnapshot(
      puzzle,
      restoredState && restoredState.date === today ? restoredState : null
    ),
  };
}

function TutorialModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Combine numbers",
      body: "Start by picking two numbers you want to use together.",
      demo: "25 + 16 = 41",
    },
    {
      title: "Use simple operations",
      body: "You can add, subtract, multiply, or divide. Division must be exact.",
      demo: "+   −   ×   ÷",
    },
    {
      title: "Reach the target",
      body: "Every result becomes a new number tile. Keep chaining until you hit the target.",
      demo: "Target → 421",
    },
    {
      title: "Quick solved example",
      body: "A clean opening can unlock the whole puzzle. You do not have to use all 6 numbers.",
      demo: "75 × 5 = 375\n375 + 46 = 421",
    },
  ];

  const active = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[var(--text-tertiary)]">
          <span>Quick tutorial</span>
          <span>{step + 1} / {steps.length}</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{active.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{active.body}</p>
        <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-5 text-center">
          <pre className="whitespace-pre-wrap font-mono text-xl font-semibold text-blue-100">{active.demo}</pre>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${index === step ? "bg-blue-400" : "bg-white/20"}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep((prev) => prev - 1)}
                className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)]"
              >
                Back
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((prev) => prev + 1)}
                className="rounded-xl bg-[var(--clr-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--clr-accent-hover)]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-xl bg-[var(--clr-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--clr-accent-hover)]"
              >
                Start playing
              </button>
            )}
          </div>
        </div>
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
  const solveRate = stats.totalGames > 0
    ? Math.round((stats.solvedGames / stats.totalGames) * 100)
    : 0;
  const averageStars = stats.totalGames > 0
    ? (stats.totalStars / stats.totalGames).toFixed(1)
    : "0.0";
  const averageStepDelta = stats.solvedGames > 0
    ? (stats.totalStepDelta / stats.solvedGames).toFixed(1)
    : "0.0";
  const maxDistCount = Math.max(
    1,
    stats.starDistribution[3],
    stats.starDistribution[2],
    stats.starDistribution[1],
    stats.starDistribution[0]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Numble stats</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Played", value: stats.totalGames },
            { label: "Solve rate", value: `${solveRate}%` },
            { label: "Avg stars", value: averageStars },
            { label: "Avg over optimal", value: averageStepDelta },
            { label: "Current streak", value: stats.currentStreak },
            { label: "Best streak", value: stats.maxStreak },
            { label: "Exact solves", value: stats.exactSolves },
            { label: "Perfect streak", value: stats.maxPerfectSolveStreak },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{item.value}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-[var(--text-tertiary)]">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Star distribution</div>
              {([3, 2, 1, 0] as const).map((starLevel) => (
                <div key={starLevel} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-[var(--text-secondary)]">
                    {starLevel > 0 ? "★".repeat(starLevel) : "0 stars"}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--bg-surface)]">
                    <div
                      className={`h-full rounded-full ${
                        starLevel === 3 ? "bg-amber-400" : starLevel === 2 ? "bg-blue-400" : starLevel === 1 ? "bg-slate-400" : "bg-slate-600"
                      }`}
                      style={{ width: `${(stats.starDistribution[starLevel] / maxDistCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm text-[var(--text-secondary)]">{stats.starDistribution[starLevel]}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Best solve</div>
                {stats.bestSolve ? (
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">
                    <div className="font-semibold text-[var(--text-primary)]">#{stats.bestSolve.puzzleNumber}</div>
                    <div>{stats.bestSolve.steps} steps · optimal {stats.bestSolve.optimal}</div>
                    <div>{stats.bestSolve.difficulty}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">Solve a puzzle to set this.</div>
                )}
              </div>
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Hardest solved</div>
                {stats.hardestPuzzleSolved ? (
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">
                    <div className="font-semibold text-[var(--text-primary)]">{stats.hardestPuzzleSolved.difficulty}</div>
                    <div>Target {stats.hardestPuzzleSolved.target}</div>
                    <div>#{stats.hardestPuzzleSolved.puzzleNumber}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">No solved puzzle yet.</div>
                )}
              </div>
            </div>

            {stats.history.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Recent games</div>
                <div className="space-y-2">
                  {stats.history.slice(0, 8).map((entry) => (
                    <div key={`${entry.date}-${entry.puzzleNumber}`} className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">#{entry.puzzleNumber}</div>
                        <div>{entry.target} · {entry.difficulty}</div>
                      </div>
                      <div className="text-right">
                        <div>{entry.solved ? `${entry.steps} steps` : entry.gaveUp ? "Gave up" : "Incomplete"}</div>
                        <div>{entry.stars > 0 ? "★".repeat(entry.stars) : "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Achievements</div>
            {stats.achievements.length > 0 ? (
              stats.achievements.map((achievement) => (
                <div key={achievement.id} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <div className="font-semibold text-emerald-100">{achievement.title}</div>
                  <div className="mt-1 text-sm text-emerald-50/85">{achievement.description}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)]">
                Keep solving to unlock local achievements.
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[var(--bg-surface)] py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-base)]"
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
  onSave: (settings: NumbleSettings) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<NumbleSettings>({ ...settings });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>
        <div className="mt-5 space-y-4">
          {[
            {
              key: "colorblindMode" as const,
              label: "Colorblind mode",
              description: "Use stronger emphasis on selection states.",
            },
            {
              key: "soundEnabled" as const,
              label: "Sound effects",
              description: "Play subtle feedback sounds.",
            },
            {
              key: "hardMode" as const,
              label: "Hard mode",
              description: "Require using all 6 numbers for the solve.",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div>
                <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">{item.description}</div>
              </div>
              <button
                onClick={() => setLocal((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${local[item.key] ? "bg-[var(--clr-accent)]" : "bg-[var(--bg-base)]"}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${local[item.key] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[var(--bg-surface)] py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-base)]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(local)}
            className="flex-1 rounded-xl bg-[var(--clr-accent)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--clr-accent-hover)]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AchievementRail({ achievements }: { achievements: NumbleAchievement[] }) {
  if (achievements.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm shadow-lg backdrop-blur"
        >
          <div className="font-semibold text-emerald-100">Achievement unlocked</div>
          <div className="text-emerald-50">{achievement.title}</div>
        </div>
      ))}
    </div>
  );
}

function ResultsPanel({
  puzzle,
  mode,
  steps,
  stars,
  gameStatus,
  optimalSolution,
  countdownSec,
  stats,
  copied,
  challengeCopied,
  onShare,
  onChallenge,
  onPractice,
  onDownloadCard,
}: {
  puzzle: DailyPuzzle;
  mode: NumbleMode;
  steps: GameStep[];
  stars: 0 | 1 | 2 | 3 | null;
  gameStatus: "won" | "gave-up";
  optimalSolution: SolutionStep[] | null;
  countdownSec: number;
  stats: NumbleStats;
  copied: boolean;
  challengeCopied: boolean;
  onShare: () => void;
  onChallenge: () => void;
  onPractice: () => void;
  onDownloadCard: () => void;
}) {
  const starCount = stars ?? 0;
  const stepsDelta = steps.length - puzzle.optimalSteps;
  const solvedExactly = gameStatus === "won" && stepsDelta === 0;
  const summaryText =
    gameStatus === "won"
      ? solvedExactly
        ? "Perfect solve."
        : stepsDelta === 1
          ? "So close. Optimal was one step shorter."
          : `Optimal was ${puzzle.optimalSteps} steps.`
      : `Closest solve would have been ${puzzle.optimalSteps} steps.`;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-tertiary)]">{formatModeTitle(mode, puzzle)}</div>
            <div className="mt-2 text-5xl font-bold text-[var(--text-primary)]">{puzzle.target}</div>
            <div className="mt-3 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className={`rounded-full border px-3 py-1 ${getDifficultyTone(puzzle.difficulty)}`}>{puzzle.difficulty}</span>
              {mode === "daily" ? <span>Next puzzle in {formatCountdown(countdownSec)}</span> : <span>Practice mode</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl text-amber-300">{starCount > 0 ? "★".repeat(starCount) : "☆☆☆"}</div>
            <div className="mt-2 text-sm text-[var(--text-secondary)]">{gameStatus === "won" ? "Solved" : "Result summary"}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[var(--bg-surface)] p-4">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Your result</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{gameStatus === "won" ? "Solved" : "Gave up"}</div>
            <div className="text-sm text-[var(--text-secondary)]">{steps.length} steps</div>
          </div>
          <div className="rounded-2xl bg-[var(--bg-surface)] p-4">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Optimal</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{puzzle.optimalSteps} steps</div>
            <div className="text-sm text-[var(--text-secondary)]">{summaryText}</div>
          </div>
          <div className="rounded-2xl bg-[var(--bg-surface)] p-4">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Current streak</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{stats.currentStreak}</div>
            <div className="text-sm text-[var(--text-secondary)]">Best {stats.maxStreak}</div>
          </div>
          <div className="rounded-2xl bg-[var(--bg-surface)] p-4">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Solve rate</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {stats.totalGames > 0 ? Math.round((stats.solvedGames / stats.totalGames) * 100) : 0}%
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Average stars {stats.totalGames > 0 ? (stats.totalStars / stats.totalGames).toFixed(1) : "0.0"}</div>
          </div>
        </div>

        {gameStatus === "gave-up" && optimalSolution && optimalSolution.length > 0 ? (
          <div className="mt-6 space-y-2">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Optimal opening</div>
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)]">
              <div className="font-mono text-base text-[var(--text-primary)]">
                {optimalSolution[0].a} {optimalSolution[0].op} {optimalSolution[0].b} = {optimalSolution[0].result}
              </div>
              <div className="mt-2">Review the first step, then try another puzzle while the pattern is fresh.</div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={onShare}
            className="rounded-xl bg-[var(--clr-accent)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--clr-accent-hover)]"
          >
            {copied ? "Copied share text" : "Share result"}
          </button>
          <button
            onClick={onChallenge}
            className="rounded-xl border border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface)]"
          >
            {challengeCopied ? "Challenge copied" : "Challenge friends"}
          </button>
          <button
            onClick={onPractice}
            className="rounded-xl border border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface)]"
          >
            Practice another puzzle
          </button>
          <button
            onClick={onDownloadCard}
            className="rounded-xl border border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface)]"
          >
            Download share image
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Your solution</div>
        {steps.map((step, index) => (
          <div key={`${step.resultTileId}-${index}`} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 font-mono text-sm text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">{step.a}</span>
            <span className="mx-2 text-blue-400">{step.op}</span>
            <span className="text-[var(--text-secondary)]">{step.b}</span>
            <span className="mx-2 text-[var(--text-tertiary)]">=</span>
            <span className={step.result === puzzle.target ? "font-bold text-green-400" : "font-bold"}>{step.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NumbleGame() {
  const initialSession = useMemo(() => createInitialSession(), []);

  const [mode, setMode] = useState<NumbleMode>(initialSession.mode);
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(initialSession.puzzle);
  const [tiles, setTiles] = useState<Tile[]>(initialSession.tiles);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedOp, setSelectedOp] = useState<"+" | "-" | "×" | "÷" | null>(null);
  const [steps, setSteps] = useState<GameStep[]>(initialSession.steps);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "gave-up">(
    initialSession.gameStatus
  );
  const [stars, setStars] = useState<0 | 1 | 2 | 3 | null>(initialSession.stars);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(initialSession.showTutorial);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [optimalSolution, setOptimalSolution] = useState<SolutionStep[] | null>(null);
  const [countdownSec, setCountdownSec] = useState(initialSession.countdownSec);
  const [settings, setSettingsState] = useState<NumbleSettings>(
    initialSession.settings
  );
  const [stats, setStats] = useState<NumbleStats>(initialSession.stats);
  const [closestResult, setClosestResult] = useState<number | null>(
    initialSession.closestResult
  );
  const [resetConfirm, setResetConfirm] = useState(false);
  const [giveUpConfirmActive, setGiveUpConfirmActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<NumbleAchievement[]>([]);
  const resetConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achievementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hydratePuzzle = useCallback((nextPuzzle: DailyPuzzle, restoredState?: NumbleTodayState | null) => {
    setPuzzle(nextPuzzle);
    setOptimalSolution(null);
    setSelectedTileId(null);
    setSelectedOp(null);
    setErrorMsg(null);
    setHintLevel(0);
    setCopied(false);
    setChallengeCopied(false);
    setUnlockedAchievements([]);
    setGiveUpConfirmActive(false);
    setResetConfirm(false);
    const snapshot = buildGameSnapshot(nextPuzzle, restoredState);
    setTiles(snapshot.tiles);
    setSteps(snapshot.steps);
    setClosestResult(snapshot.closestResult);
    setGameStatus(snapshot.gameStatus);
    setStars(snapshot.stars);
  }, []);

  const loadDailyGame = useCallback(() => {
    const today = getUTCDateString();
    const nextPuzzle = generateDailyPuzzle(today);
    const restoredState = getTodayState();
    setMode("daily");
    hydratePuzzle(nextPuzzle, restoredState && restoredState.date === today ? restoredState : null);
  }, [hydratePuzzle]);

  const startPracticeGame = useCallback(() => {
    const nextPuzzle = generatePracticePuzzle(Date.now());
    setMode("practice");
    hydratePuzzle(nextPuzzle, null);
  }, [hydratePuzzle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSec(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!puzzle) return;
    const timer = setTimeout(() => {
      const solution = solveNumbers(puzzle.numbers, puzzle.target);
      setOptimalSolution(solution.found ? solution.steps : []);
    }, 40);
    return () => clearTimeout(timer);
  }, [puzzle]);

  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 2200);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  useEffect(() => {
    if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
    if (unlockedAchievements.length === 0) return;
    achievementTimerRef.current = setTimeout(() => {
      setUnlockedAchievements([]);
    }, 3200);
    return () => {
      if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
    };
  }, [unlockedAchievements]);

  const isDeadEnd = useMemo(() => {
    if (gameStatus !== "playing" || !puzzle || steps.length === 0) return false;
    const availableValues = tiles
      .filter((tile) => tile.state === "available")
      .map((tile) => tile.value);

    if (availableValues.length === 1 && availableValues[0] !== puzzle.target) {
      return true;
    }
    if (availableValues.length >= 2 && !hasValidOperations(availableValues)) {
      return true;
    }

    return false;
  }, [gameStatus, puzzle, steps.length, tiles]);

  const persistDailyState = useCallback((nextSteps: GameStep[], completed: boolean, nextStars: 0 | 1 | 2 | 3 | null, gaveUp: boolean, bestResult: number | null) => {
    if (!puzzle || mode !== "daily") return;
    saveTodayState({
      puzzleNumber: puzzle.puzzleNumber,
      date: getUTCDateString(),
      steps: serializeSteps(nextSteps),
      completed,
      stars: nextStars,
      gaveUp,
      bestResult,
    });
  }, [mode, puzzle]);

  const finishGame = useCallback((status: "won" | "gave-up", bestResult: number) => {
    if (!puzzle) return;
    const earnedStars = computeStars(
      steps.length,
      puzzle.optimalSteps,
      status === "won",
      bestResult,
      puzzle.target
    );
    setStars(earnedStars);
    setGameStatus(status);

    if (mode === "daily") {
      persistDailyState(steps, status === "won", earnedStars, status === "gave-up", bestResult);
      const unlocked = saveResult(
        {
          puzzleNumber: puzzle.puzzleNumber,
          date: getUTCDateString(),
          stars: earnedStars,
          steps: steps.length,
          optimal: puzzle.optimalSteps,
          target: puzzle.target,
          solved: status === "won",
          gaveUp: status === "gave-up",
          difficulty: puzzle.difficulty,
          usedLargeNumbers: steps.some((step) => isLargeNumber(step.a) || isLargeNumber(step.b)),
          stepsOverOptimal: status === "won" ? steps.length - puzzle.optimalSteps : null,
        },
        getUTCDateString()
      );
      setStats(getStats());
      if (unlocked.length > 0) {
        setUnlockedAchievements(unlocked);
      }
    }

    if (status === "won") {
      setTimeout(triggerConfetti, 100);
    }
  }, [mode, persistDailyState, puzzle, steps]);

  const handleTileClick = useCallback((tileId: string) => {
    if (gameStatus !== "playing") return;
    const tile = tiles.find((entry) => entry.id === tileId);
    if (!tile || tile.state !== "available") return;

    if (!selectedTileId) {
      setSelectedTileId(tileId);
      setSelectedOp(null);
      return;
    }

    if (selectedTileId === tileId) {
      setSelectedTileId(null);
      setSelectedOp(null);
      return;
    }

    if (selectedTileId && !selectedOp) {
      setSelectedTileId(tileId);
      return;
    }

    if (selectedTileId && selectedOp) {
      const tileA = tiles.find((entry) => entry.id === selectedTileId);
      const tileB = tile;
      if (!tileA || !puzzle) return;

      const a = tileA.value;
      const b = tileB.value;
      let result: number | null = null;
      let message: string | null = null;

      if (selectedOp === "+") result = a + b;
      else if (selectedOp === "-") {
        if (a - b <= 0) message = a === b ? "Result can’t be zero" : "Result must be positive";
        else result = a - b;
      } else if (selectedOp === "×") result = a * b;
      else if (selectedOp === "÷") {
        if (b === 0) message = "Can’t divide by zero";
        else if (a % b !== 0) message = "Must divide evenly";
        else if (a / b <= 0) message = "Result must be positive";
        else result = a / b;
      }

      if (message) {
        setErrorMsg(message);
        setSelectedTileId(null);
        setSelectedOp(null);
        return;
      }

      if (result === null) return;
      const resultTileId = `result-${steps.length}`;
      const nextTiles = tiles.map((entry) => {
        if (entry.id === tileA.id || entry.id === tileB.id) {
          return { ...entry, state: "used" as const };
        }
        return entry;
      });
      nextTiles.push({ id: resultTileId, value: result, state: "available" });
      const nextStep: GameStep = {
        a,
        op: selectedOp,
        b,
        result,
        tileIdA: tileA.id,
        tileIdB: tileB.id,
        resultTileId,
      };
      const nextSteps = [...steps, nextStep];
      const nextClosest = closestResult === null || Math.abs(result - puzzle.target) < Math.abs(closestResult - puzzle.target)
        ? result
        : closestResult;

      setTiles(nextTiles);
      setSteps(nextSteps);
      setClosestResult(nextClosest);
      setSelectedTileId(null);
      setSelectedOp(null);

      if (result === puzzle.target) {
        const earnedStars = computeStars(nextSteps.length, puzzle.optimalSteps, true, result, puzzle.target);
        setStars(earnedStars);
        setGameStatus("won");
        if (mode === "daily") {
          persistDailyState(nextSteps, true, earnedStars, false, result);
          const unlocked = saveResult(
            {
              puzzleNumber: puzzle.puzzleNumber,
              date: getUTCDateString(),
              stars: earnedStars,
              steps: nextSteps.length,
              optimal: puzzle.optimalSteps,
              target: puzzle.target,
              solved: true,
              gaveUp: false,
              difficulty: puzzle.difficulty,
              usedLargeNumbers: nextSteps.some((step) => isLargeNumber(step.a) || isLargeNumber(step.b)),
              stepsOverOptimal: nextSteps.length - puzzle.optimalSteps,
            },
            getUTCDateString()
          );
          setStats(getStats());
          if (unlocked.length > 0) setUnlockedAchievements(unlocked);
        }
        setTimeout(triggerConfetti, 100);
      } else if (mode === "daily") {
        persistDailyState(nextSteps, false, null, false, nextClosest);
      }
    }
  }, [closestResult, gameStatus, mode, persistDailyState, puzzle, selectedOp, selectedTileId, steps, tiles]);

  const handleUndo = useCallback(() => {
    if (steps.length === 0 || gameStatus !== "playing") return;
    const lastStep = steps[steps.length - 1];
    const nextTiles = tiles
      .filter((tile) => tile.id !== lastStep.resultTileId)
      .map((tile) => {
        if (tile.id === lastStep.tileIdA || tile.id === lastStep.tileIdB) {
          return { ...tile, state: "available" as const };
        }
        return tile;
      });
    const nextSteps = steps.slice(0, -1);
    setTiles(nextTiles);
    setSteps(nextSteps);
    setSelectedTileId(null);
    setSelectedOp(null);
    if (puzzle) {
      const best = nextSteps.length > 0
        ? nextSteps.reduce((closest, step) => Math.abs(step.result - puzzle.target) < Math.abs(closest - puzzle.target) ? step.result : closest, getInitialClosest(puzzle))
        : getInitialClosest(puzzle);
      setClosestResult(best);
      if (mode === "daily") {
        persistDailyState(nextSteps, false, null, false, best);
      }
    }
  }, [gameStatus, mode, persistDailyState, puzzle, steps, tiles]);

  const handleReset = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetConfirmTimerRef.current) clearTimeout(resetConfirmTimerRef.current);
      resetConfirmTimerRef.current = setTimeout(() => setResetConfirm(false), 5000);
      return;
    }
    if (resetConfirmTimerRef.current) clearTimeout(resetConfirmTimerRef.current);
    setResetConfirm(false);
    if (!puzzle) return;
    hydratePuzzle(puzzle, null);
    if (mode === "daily") {
      persistDailyState([], false, null, false, null);
    }
  }, [hydratePuzzle, mode, persistDailyState, puzzle, resetConfirm]);

  const handleGiveUp = useCallback(() => {
    if (!puzzle) return;
    if (!giveUpConfirmActive) {
      setGiveUpConfirmActive(true);
      return;
    }
    const bestResult = closestResult ?? getInitialClosest(puzzle);
    finishGame("gave-up", bestResult);
    setGiveUpConfirmActive(false);
  }, [closestResult, finishGame, giveUpConfirmActive, puzzle]);

  const handleShare = useCallback(() => {
    if (!puzzle) return;
    const text = buildNumbleShareText({
      puzzle,
      stars,
      steps: steps.length,
      optimalSteps: puzzle.optimalSteps,
      status: gameStatus === "playing" ? "gave-up" : gameStatus,
      streak: stats.currentStreak,
      mode,
      closestDiff: closestResult !== null ? Math.abs(closestResult - puzzle.target) : null,
    });

    if (navigator.share) {
      navigator.share({ text }).catch(async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [closestResult, gameStatus, mode, puzzle, stars, stats.currentStreak, steps.length]);

  const handleChallenge = useCallback(() => {
    if (!puzzle) return;
    const text = buildNumbleShareText({
      puzzle,
      stars,
      steps: steps.length,
      optimalSteps: puzzle.optimalSteps,
      status: gameStatus === "playing" ? "gave-up" : gameStatus,
      streak: stats.currentStreak,
      mode,
      closestDiff: closestResult !== null ? Math.abs(closestResult - puzzle.target) : null,
    });
    navigator.clipboard.writeText(text).then(() => {
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 1800);
    });
  }, [closestResult, gameStatus, mode, puzzle, stars, stats.currentStreak, steps.length]);

  const handleDownloadCard = useCallback(() => {
    if (!puzzle) return;
    void downloadNumbleShareCard({
      puzzle,
      stars,
      steps: steps.length,
      optimalSteps: puzzle.optimalSteps,
      status: gameStatus === "playing" ? "gave-up" : gameStatus,
      mode,
      streak: stats.currentStreak,
      closestDiff: closestResult !== null ? Math.abs(closestResult - puzzle.target) : null,
    });
  }, [closestResult, gameStatus, mode, puzzle, stars, stats.currentStreak, steps.length]);

  const hintStep = optimalSolution && optimalSolution.length > 0 ? optimalSolution[0] : null;
  const hintTileIds = useMemo(() => computeHintTileIds(tiles, hintStep), [tiles, hintStep]);
  const nextHintText = useMemo(() => {
    if (!hintStep || hintLevel === 0) return null;
    if (hintLevel === 1) return `Try pairing ${hintStep.a} and ${hintStep.b}.`;
    if (hintLevel === 2) return `The opening operator is ${hintStep.op}.`;
    return `Opening step: ${hintStep.a} ${hintStep.op} ${hintStep.b} = ${hintStep.result}`;
  }, [hintLevel, hintStep]);

  const closestDiff = puzzle && closestResult !== null ? Math.abs(closestResult - puzzle.target) : null;
  const nearMissMessage = useMemo(() => {
    if (!puzzle || closestDiff === null || closestDiff > 10 || gameStatus !== "playing" || steps.length === 0) return null;
    if (closestDiff <= 3) return `Only ${closestDiff} away from target. Still possible to reach 2 stars.`;
    return `Only ${closestDiff} away from target. A finish within 10 still keeps you in star range.`;
  }, [closestDiff, gameStatus, puzzle, steps.length]);

  if (!puzzle) {
    return <div className="flex h-64 items-center justify-center text-[var(--text-secondary)]">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <canvas id="numble-confetti" className="pointer-events-none fixed inset-0 z-50" style={{ display: "none" }} />

      <div className="border-b border-[var(--border-default)] px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">NUMBLE</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <span>{formatModeTitle(mode, puzzle)}</span>
              {mode === "daily" ? <span>· {new Date(puzzle.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</span> : null}
              <span>· Next puzzle in {formatCountdown(countdownSec)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowStats(true)} className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" title="Stats">📊</button>
            <button onClick={() => setShowTutorial(true)} className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" title="Tutorial">❓</button>
            <button onClick={() => setShowSettings(true)} className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" title="Settings">⚙️</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--text-tertiary)]">Mode</div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={loadDailyGame}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${mode === "daily" ? "bg-[var(--clr-accent)] text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]"}`}
              >
                Play Daily
              </button>
              <button
                onClick={startPracticeGame}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${mode === "practice" ? "bg-[var(--clr-accent)] text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]"}`}
              >
                Practice Puzzle
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className={`rounded-full border px-3 py-1 ${getDifficultyTone(puzzle.difficulty)}`}>Difficulty: {puzzle.difficulty}</span>
            {stats.currentStreak >= 2 ? <span>🔥 {stats.currentStreak}-day streak</span> : null}
          </div>
        </div>

        {gameStatus === "playing" ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Target</div>
              <div className="mt-3 text-7xl font-bold leading-none text-[var(--text-primary)] sm:text-8xl">{puzzle.target}</div>
              <div className="mt-3 text-sm text-[var(--text-secondary)]">
                {mode === "daily" ? "Daily puzzle" : "Practice does not affect your streak or stats"}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {tiles.filter((tile) => tile.state !== "used").map((tile) => {
                    const isHinted = hintLevel >= 1 && hintTileIds.has(tile.id);
                    return (
                      <button
                        key={tile.id}
                        onClick={() => handleTileClick(tile.id)}
                        className={`h-16 rounded-xl text-2xl font-bold transition-all duration-150 ${
                          selectedTileId === tile.id
                            ? "scale-105 border-2 border-blue-500 bg-[var(--bg-elevated)] shadow-lg shadow-blue-500/20"
                            : tile.state === "result"
                              ? "border border-blue-500/30 bg-[var(--bg-elevated)] hover:scale-105"
                              : "border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:scale-105"
                        } ${isHinted ? "ring-2 ring-amber-400/60 ring-offset-2 ring-offset-[var(--bg-base)]" : ""}`}
                      >
                        {tile.value}
                      </button>
                    );
                  })}
                </div>

                <div className={`flex justify-center gap-3 transition-opacity ${selectedTileId ? "opacity-100" : "opacity-45"}`}>
                  {(["+", "-", "×", "÷"] as const).map((op) => (
                    <button
                      key={op}
                      onClick={() => selectedTileId && setSelectedOp(op)}
                      disabled={!selectedTileId}
                      className={`h-14 w-14 rounded-xl text-2xl font-bold transition-all ${selectedOp === op ? "scale-110 border-2 border-blue-400 bg-[var(--clr-accent)] text-white" : "border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`}
                    >
                      {op}
                    </button>
                  ))}
                </div>

                {errorMsg ? <div className="text-center text-sm text-red-400">{errorMsg}</div> : null}

                {nearMissMessage ? (
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-50">
                    {nearMissMessage}
                  </div>
                ) : null}

                {hintStep ? (
                  <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Hints</div>
                        <div className="mt-2 text-sm text-[var(--text-secondary)]">
                          {nextHintText ?? "Need a nudge? Reveal a pair, then the operator, then the opening step."}
                        </div>
                      </div>
                      <button
                        onClick={() => setHintLevel((prev) => Math.min(prev + 1, 3))}
                        disabled={hintLevel >= 3}
                        className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {hintLevel === 0 ? "Hint 1" : hintLevel === 1 ? "Hint 2" : hintLevel === 2 ? "Hint 3" : "All hints shown"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {steps.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Steps</div>
                    {steps.map((step, index) => (
                      <div key={`${step.resultTileId}-${index}`} className="rounded-xl bg-[var(--bg-surface)] px-4 py-3 font-mono text-sm text-[var(--text-primary)]">
                        <span className="text-[var(--text-secondary)]">{step.a}</span>
                        <span className="mx-2 text-blue-400">{step.op}</span>
                        <span className="text-[var(--text-secondary)]">{step.b}</span>
                        <span className="mx-2 text-[var(--text-tertiary)]">=</span>
                        <span className={step.result === puzzle.target ? "font-bold text-green-400" : "font-bold"}>{step.result}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {isDeadEnd && closestResult !== null ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-50">
                    <div className="font-semibold">No clean moves left.</div>
                    <div className="mt-1">You got to {closestResult}, which is {Math.abs(closestResult - puzzle.target)} away from {puzzle.target}.</div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Performance</div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
                      <div className="text-xs text-[var(--text-tertiary)]">Closest</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{closestResult ?? "—"}</div>
                    </div>
                    <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
                      <div className="text-xs text-[var(--text-tertiary)]">Optimal</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{puzzle.optimalSteps} steps</div>
                    </div>
                    <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
                      <div className="text-xs text-[var(--text-tertiary)]">Solve rate</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{stats.totalGames > 0 ? Math.round((stats.solvedGames / stats.totalGames) * 100) : 0}%</div>
                    </div>
                    <div className="rounded-2xl bg-[var(--bg-surface)] p-3">
                      <div className="text-xs text-[var(--text-tertiary)]">Best streak</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{stats.maxStreak}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleUndo}
                    disabled={steps.length === 0}
                    className="w-full rounded-xl border border-[var(--border-default)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↩ Undo last step
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={steps.length === 0}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${resetConfirm ? "border-red-500 bg-red-500/15 text-red-200" : "border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}`}
                  >
                    {resetConfirm ? "Confirm reset" : "Reset puzzle"}
                  </button>
                  <button
                    onClick={handleGiveUp}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors ${giveUpConfirmActive ? "bg-red-500 text-white" : "border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}`}
                  >
                    {giveUpConfirmActive ? "Confirm give up" : "Show solution"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ResultsPanel
            puzzle={puzzle}
            mode={mode}
            steps={steps}
            stars={stars}
            gameStatus={gameStatus}
            optimalSolution={gameStatus === "gave-up" ? optimalSolution : null}
            countdownSec={countdownSec}
            stats={stats}
            copied={copied}
            challengeCopied={challengeCopied}
            onShare={handleShare}
            onChallenge={handleChallenge}
            onPractice={startPracticeGame}
            onDownloadCard={handleDownloadCard}
          />
        )}
      </div>

      {showTutorial ? (
        <TutorialModal
          onClose={() => {
            setShowTutorial(false);
            markHowToPlaySeen();
          }}
        />
      ) : null}
      {showStats ? <StatsModal stats={stats} onClose={() => setShowStats(false)} /> : null}
      {showSettings ? (
        <SettingsModal
          settings={settings}
          onSave={(nextSettings) => {
            setSettingsState(nextSettings);
            saveSettings(nextSettings);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      ) : null}
      <AchievementRail achievements={unlockedAchievements} />
    </div>
  );
}
