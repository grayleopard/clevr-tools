export interface TypingSession {
  id: string;
  tool: string; // 'wpm-test' | 'typing-test' | 'typing-practice' | 'keyboard-tester' | 'race' | 'word-blitz' | 'code-challenge'
  mode: string; // '60s' | 'common-words' | 'javascript' | etc.
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  duration: number; // seconds
  timestamp: number; // Date.now()
  score?: number; // used by Word Blitz
}

const STORAGE_KEY = "clevr-typing-stats";
const MAX_SESSIONS = 100;

interface StorageData {
  sessions: TypingSession[];
  streak: { current: number; lastActiveDate: string };
  weakKeys: Record<
    string,
    { speed: number; accuracy: number; samples: number }
  >;
}

function readStorage(): StorageData {
  if (typeof window === "undefined")
    return {
      sessions: [],
      streak: { current: 0, lastActiveDate: "" },
      weakKeys: {},
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        sessions: [],
        streak: { current: 0, lastActiveDate: "" },
        weakKeys: {},
      };
    return JSON.parse(raw);
  } catch {
    return {
      sessions: [],
      streak: { current: 0, lastActiveDate: "" },
      weakKeys: {},
    };
  }
}

function writeStorage(data: StorageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail (private browsing, storage full, etc.)
  }
}

export function saveSession(session: TypingSession): void {
  const data = readStorage();
  data.sessions.unshift(session);
  if (data.sessions.length > MAX_SESSIONS) {
    data.sessions = data.sessions.slice(0, MAX_SESSIONS);
  }
  writeStorage(data);
}

export function getSessions(tool?: string, limit = 50): TypingSession[] {
  const data = readStorage();
  const filtered = tool
    ? data.sessions.filter((s) => s.tool === tool)
    : data.sessions;
  return filtered.slice(0, limit);
}

export function getPersonalBest(
  tool: string,
  mode: string
): TypingSession | null {
  const sessions = getSessions(tool);
  const filtered = sessions.filter((s) => s.mode === mode);
  if (filtered.length === 0) return null;
  return filtered.reduce((best, s) => (s.wpm > best.wpm ? s : best));
}

export function getStreak(): { current: number; lastActiveDate: string } {
  return readStorage().streak;
}

export function updateStreak(): void {
  const data = readStorage();
  const todayLocal = new Date();
  const localDateStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

  if (data.streak.lastActiveDate === localDateStr) {
    // Already updated today
  } else {
    const yesterday = new Date(todayLocal);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (data.streak.lastActiveDate === yStr) {
      data.streak.current += 1;
    } else {
      data.streak.current = 1;
    }
    data.streak.lastActiveDate = localDateStr;
  }
  writeStorage(data);
}

export function getWeakKeys(): Record<
  string,
  { speed: number; accuracy: number; samples: number }
> {
  return readStorage().weakKeys;
}

export function updateWeakKeys(
  keyData: Record<
    string,
    { correct: number; incorrect: number; avgSpeed: number }
  >
): void {
  const data = readStorage();
  for (const [key, stats] of Object.entries(keyData)) {
    const existing = data.weakKeys[key] || { speed: 0, accuracy: 0, samples: 0 };
    const total = existing.samples + stats.correct + stats.incorrect;
    if (total === 0) continue;
    const newAccuracy =
      (existing.accuracy * existing.samples +
        (stats.correct / (stats.correct + stats.incorrect)) *
          100 *
          (stats.correct + stats.incorrect)) /
      total;
    const newSpeed =
      (existing.speed * existing.samples +
        stats.avgSpeed * (stats.correct + stats.incorrect)) /
      total;
    data.weakKeys[key] = {
      speed: newSpeed,
      accuracy: newAccuracy,
      samples: total,
    };
  }
  writeStorage(data);
}

export function getTotalStats(): {
  totalTests: number;
  totalWords: number;
  totalTime: number;
  avgWpm: number;
  bestWpm: number;
} {
  const sessions = getSessions();
  if (sessions.length === 0)
    return { totalTests: 0, totalWords: 0, totalTime: 0, avgWpm: 0, bestWpm: 0 };
  const totalWords = sessions.reduce(
    (sum, s) => sum + Math.round(s.correctChars / 5),
    0
  );
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgWpm = Math.round(
    sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length
  );
  const bestWpm = Math.max(...sessions.map((s) => s.wpm));
  return { totalTests: sessions.length, totalWords, totalTime, avgWpm, bestWpm };
}
