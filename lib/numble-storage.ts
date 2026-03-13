// All functions must guard with typeof window !== 'undefined'

import type { NumbleDifficulty } from "@/lib/numble";

export type NumbleAchievementId =
  | "perfect-streak-3"
  | "exact-solves-10"
  | "hard-optimal"
  | "no-large-numbers";

export interface NumbleAchievement {
  id: NumbleAchievementId;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface NumbleHistoryEntry {
  puzzleNumber: number;
  date: string;
  stars: 0 | 1 | 2 | 3;
  steps: number;
  optimal: number;
  target: number;
  solved: boolean;
  gaveUp: boolean;
  difficulty: NumbleDifficulty;
  usedLargeNumbers: boolean;
  stepsOverOptimal: number | null;
}

export interface NumbleStats {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
  totalGames: number;
  solvedGames: number;
  totalStars: number;
  exactSolves: number;
  totalStepDelta: number;
  perfectSolveStreak: number;
  maxPerfectSolveStreak: number;
  starDistribution: { 3: number; 2: number; 1: number; 0: number };
  history: NumbleHistoryEntry[];
  bestSolve: NumbleHistoryEntry | null;
  hardestPuzzleSolved: NumbleHistoryEntry | null;
  achievements: NumbleAchievement[];
}

export interface NumbleTodayState {
  puzzleNumber: number;
  date: string;
  steps: Array<{ a: number; op: string; b: number; result: number }>;
  completed: boolean;
  stars: 0 | 1 | 2 | 3 | null;
  gaveUp: boolean;
  bestResult: number | null;
}

export interface NumbleSettings {
  colorblindMode: boolean;
  soundEnabled: boolean;
  hardMode: boolean;
}

const STATS_KEY = "numble_stats";
const TODAY_KEY = "numble_today";
const SETTINGS_KEY = "numble_settings";
const HOW_TO_PLAY_KEY = "numble_how_to_play_shown";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable
  }
}

const defaultStats: NumbleStats = {
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: "",
  totalGames: 0,
  solvedGames: 0,
  totalStars: 0,
  exactSolves: 0,
  totalStepDelta: 0,
  perfectSolveStreak: 0,
  maxPerfectSolveStreak: 0,
  starDistribution: { 3: 0, 2: 0, 1: 0, 0: 0 },
  history: [],
  bestSolve: null,
  hardestPuzzleSolved: null,
  achievements: [],
};

function normalizeStats(raw: Partial<NumbleStats> | null | undefined): NumbleStats {
  return {
    ...defaultStats,
    ...raw,
    starDistribution: {
      ...defaultStats.starDistribution,
      ...(raw?.starDistribution ?? {}),
    },
    history: raw?.history ?? [],
    bestSolve: raw?.bestSolve ?? null,
    hardestPuzzleSolved: raw?.hardestPuzzleSolved ?? null,
    achievements: raw?.achievements ?? [],
  };
}

export function getStats(): NumbleStats {
  return normalizeStats(read<Partial<NumbleStats>>(STATS_KEY, defaultStats));
}

function hasAchievement(stats: NumbleStats, id: NumbleAchievementId): boolean {
  return stats.achievements.some((achievement) => achievement.id === id);
}

function maybeUnlockAchievement(
  stats: NumbleStats,
  unlocked: NumbleAchievement[],
  achievement: Omit<NumbleAchievement, "unlockedAt">,
  todayUTC: string
): void {
  if (hasAchievement(stats, achievement.id)) return;
  const record = { ...achievement, unlockedAt: todayUTC };
  stats.achievements = [record, ...stats.achievements];
  unlocked.push(record);
}

const difficultyRank: Record<NumbleDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export function saveResult(
  entry: NumbleHistoryEntry,
  todayUTC: string
): NumbleAchievement[] {
  const stats = getStats();
  const unlocked: NumbleAchievement[] = [];

  const yesterday = new Date(
    new Date(todayUTC + "T00:00:00Z").getTime() - 86400000
  )
    .toISOString()
    .split("T")[0];

  if (stats.lastPlayedDate === todayUTC) {
    return [];
  }

  if (stats.lastPlayedDate === yesterday) {
    stats.currentStreak++;
  } else {
    stats.currentStreak = entry.stars > 0 ? 1 : 0;
  }

  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayedDate = todayUTC;
  stats.totalGames++;
  stats.totalStars += entry.stars;
  stats.starDistribution[entry.stars]++;
  stats.history = [entry, ...stats.history].slice(0, 60);

  if (entry.solved) {
    stats.solvedGames++;
    stats.exactSolves++;
    if (entry.stepsOverOptimal !== null) {
      stats.totalStepDelta += entry.stepsOverOptimal;
    }

    if (
      !stats.bestSolve ||
      (entry.stepsOverOptimal ?? Number.POSITIVE_INFINITY) <
        (stats.bestSolve.stepsOverOptimal ?? Number.POSITIVE_INFINITY) ||
      ((entry.stepsOverOptimal ?? Number.POSITIVE_INFINITY) ===
        (stats.bestSolve.stepsOverOptimal ?? Number.POSITIVE_INFINITY) &&
        entry.steps < stats.bestSolve.steps)
    ) {
      stats.bestSolve = entry;
    }

    if (
      !stats.hardestPuzzleSolved ||
      difficultyRank[entry.difficulty] > difficultyRank[stats.hardestPuzzleSolved.difficulty]
    ) {
      stats.hardestPuzzleSolved = entry;
    }
  }

  if (entry.solved && entry.stars === 3) {
    stats.perfectSolveStreak++;
  } else {
    stats.perfectSolveStreak = 0;
  }
  stats.maxPerfectSolveStreak = Math.max(
    stats.maxPerfectSolveStreak,
    stats.perfectSolveStreak
  );

  if (stats.perfectSolveStreak >= 3) {
    maybeUnlockAchievement(
      stats,
      unlocked,
      {
        id: "perfect-streak-3",
        title: "On Fire",
        description: "3 perfect solves in a row",
      },
      todayUTC
    );
  }

  if (stats.exactSolves >= 10) {
    maybeUnlockAchievement(
      stats,
      unlocked,
      {
        id: "exact-solves-10",
        title: "Exacting",
        description: "10 exact solves",
      },
      todayUTC
    );
  }

  if (entry.solved && entry.difficulty === "Hard" && entry.stars === 3) {
    maybeUnlockAchievement(
      stats,
      unlocked,
      {
        id: "hard-optimal",
        title: "Sharp Solver",
        description: "Solved a hard puzzle optimally",
      },
      todayUTC
    );
  }

  if (entry.solved && !entry.usedLargeNumbers) {
    maybeUnlockAchievement(
      stats,
      unlocked,
      {
        id: "no-large-numbers",
        title: "Small Ball",
        description: "Solved without using large numbers",
      },
      todayUTC
    );
  }

  write(STATS_KEY, stats);
  return unlocked;
}

export function getTodayState(): NumbleTodayState | null {
  return read<NumbleTodayState | null>(TODAY_KEY, null);
}

export function saveTodayState(state: NumbleTodayState): void {
  write(TODAY_KEY, state);
}

export function getSettings(): NumbleSettings {
  return read<NumbleSettings>(SETTINGS_KEY, {
    colorblindMode: false,
    soundEnabled: false,
    hardMode: false,
  });
}

export function saveSettings(settings: NumbleSettings): void {
  write(SETTINGS_KEY, settings);
}

export function hasSeenHowToPlay(): boolean {
  return read<boolean>(HOW_TO_PLAY_KEY, false);
}

export function markHowToPlaySeen(): void {
  write(HOW_TO_PLAY_KEY, true);
}
