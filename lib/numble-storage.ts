// All functions must guard with typeof window !== 'undefined'

export interface NumbleHistoryEntry {
  puzzleNumber: number;
  date: string;
  stars: 0 | 1 | 2 | 3;
  steps: number;
  optimal: number;
  target: number;
  solved: boolean;
  gaveUp: boolean;
}

export interface NumbleStats {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
  totalGames: number;
  totalStars: number;
  starDistribution: { 3: number; 2: number; 1: number; 0: number };
  history: NumbleHistoryEntry[];
}

export interface NumbleTodayState {
  puzzleNumber: number;
  date: string;
  steps: Array<{ a: number; op: string; b: number; result: number }>;
  completed: boolean;
  stars: 0 | 1 | 2 | 3 | null;
  gaveUp: boolean;
  bestResult: number | null; // closest result achieved
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
  totalStars: 0,
  starDistribution: { 3: 0, 2: 0, 1: 0, 0: 0 },
  history: [],
};

export function getStats(): NumbleStats {
  return read<NumbleStats>(STATS_KEY, defaultStats);
}

export function saveResult(
  entry: NumbleHistoryEntry,
  todayUTC: string
): void {
  const stats = getStats();

  // Update streak
  const yesterday = new Date(
    new Date(todayUTC + "T00:00:00Z").getTime() - 86400000
  )
    .toISOString()
    .split("T")[0];
  if (stats.lastPlayedDate === todayUTC) {
    // Already recorded today — don't double-count
  } else {
    if (stats.lastPlayedDate === yesterday) {
      stats.currentStreak++;
    } else if (stats.lastPlayedDate !== todayUTC) {
      stats.currentStreak = entry.stars > 0 ? 1 : 0;
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.lastPlayedDate = todayUTC;
    stats.totalGames++;
    stats.totalStars += entry.stars;
    stats.starDistribution[entry.stars]++;
    stats.history = [entry, ...stats.history].slice(0, 60);
  }

  write(STATS_KEY, stats);
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
