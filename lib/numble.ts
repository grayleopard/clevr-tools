// Seeded PRNG — mulberry32
export function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type NumbleDifficulty = "Easy" | "Medium" | "Hard";
export type NumbleMode = "daily" | "practice";

// Get UTC date string: "2026-03-01"
export function getUTCDateString(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().split("T")[0];
}

// Get daily seed from date
export function getDailySeed(dateStr?: string): number {
  const str = dateStr || getUTCDateString();
  const [year, month, day] = str.split("-").map(Number);
  return year * 10000 + month * 100 + day;
}

// Launch date for puzzle numbering
export const LAUNCH_DATE_STR = "2026-03-02";

export function getPuzzleNumber(dateStr?: string): number {
  const target = new Date((dateStr || getUTCDateString()) + "T00:00:00Z");
  const launch = new Date(LAUNCH_DATE_STR + "T00:00:00Z");
  return Math.max(
    1,
    Math.floor((target.getTime() - launch.getTime()) / 86400000) + 1
  );
}

const LARGE_NUMBERS = [25, 50, 75, 100];
const SMALL_POOL = [
  1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
];

export interface Step {
  a: number;
  op: "+" | "-" | "×" | "÷";
  b: number;
  result: number;
}

export interface DailyPuzzle {
  numbers: number[];
  target: number;
  optimalSteps: number; // minimum operations to reach target
  date: string;
  puzzleNumber: number;
  difficulty: NumbleDifficulty;
  seed: number;
  mode: NumbleMode;
}

// Solver — finds solution with fewest steps
export interface SolutionStep {
  a: number;
  op: string;
  b: number;
  result: number;
}

interface SolveResult {
  steps: SolutionStep[];
  found: boolean;
}

function applyOp(a: number, op: string, b: number): number | null {
  if (op === "+") return a + b;
  if (op === "-") {
    if (a - b <= 0) return null; // must be positive, no zero
    return a - b;
  }
  if (op === "×") return a * b;
  if (op === "÷") {
    if (b === 0 || a % b !== 0) return null;
    const r = a / b;
    if (r <= 0) return null;
    return r;
  }
  return null;
}

export function solveNumbers(numbers: number[], target: number): SolveResult {
  // Returns the solution with the fewest operations, or { found: false } if no solution
  let best: SolutionStep[] | null = null;

  function search(nums: number[], steps: SolutionStep[]): void {
    for (const n of nums) {
      if (n === target) {
        if (best === null || steps.length < best.length) {
          best = [...steps];
        }
        return;
      }
    }

    if (best !== null && steps.length >= best.length) return;

    const ops = ["+", "-", "×", "÷"];
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        for (const op of ops) {
          const result = applyOp(nums[i], op, nums[j]);
          if (result === null || result === 0) continue;
          const newNums = nums.filter((_, idx) => idx !== i && idx !== j);
          newNums.push(result);
          const step: SolutionStep = {
            a: nums[i],
            op,
            b: nums[j],
            result,
          };
          search(newNums, [...steps, step]);
        }
      }
    }
  }

  search(numbers, []);
  return best !== null
    ? { steps: best, found: true }
    : { found: false, steps: [] };
}

function computeDifficulty(
  numbers: number[],
  target: number,
  optimalSteps: number,
  attempts: number
): NumbleDifficulty {
  const nearestStart = numbers.reduce(
    (best, value) => Math.min(best, Math.abs(value - target)),
    Number.POSITIVE_INFINITY
  );
  const score =
    optimalSteps * 2 +
    (attempts >= 75 ? 3 : attempts >= 25 ? 2 : attempts >= 10 ? 1 : 0) +
    (nearestStart >= 120 ? 1 : 0);

  if (score >= 8) return "Hard";
  if (score >= 5) return "Medium";
  return "Easy";
}

function generatePuzzleFromSeed(
  seed: number,
  options: { date: string; puzzleNumber: number; mode: NumbleMode }
): DailyPuzzle {
  const rand = mulberry32(seed);

  const largeCopy = [...LARGE_NUMBERS];
  const large: number[] = [];
  for (let i = 0; i < 2; i++) {
    const idx = Math.floor(rand() * largeCopy.length);
    large.push(largeCopy.splice(idx, 1)[0]);
  }

  const smallCopy = [...SMALL_POOL];
  const small: number[] = [];
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(rand() * smallCopy.length);
    small.push(smallCopy.splice(idx, 1)[0]);
  }

  const numbers = [...large, ...small];
  const targetBase = 101 + Math.floor(rand() * 899);
  let target = targetBase;
  let solution = solveNumbers(numbers, target);
  let attempts = 0;

  while (!solution.found && attempts < 1800) {
    target = ((target - 101 + 1) % 899) + 101;
    solution = solveNumbers(numbers, target);
    attempts++;
  }

  if (!solution.found) {
    target = numbers[0] + numbers[1];
    if (target < 101 || target > 999) target = 101;
    solution = solveNumbers(numbers, target);
  }

  return {
    numbers,
    target,
    optimalSteps: solution.found ? solution.steps.length : 1,
    date: options.date,
    puzzleNumber: options.puzzleNumber,
    difficulty: computeDifficulty(
      numbers,
      target,
      solution.found ? solution.steps.length : 1,
      attempts
    ),
    seed,
    mode: options.mode,
  };
}

export function generateDailyPuzzle(dateStr?: string): DailyPuzzle {
  const date = dateStr || getUTCDateString();
  const seed = getDailySeed(date);
  return generatePuzzleFromSeed(seed, {
    date,
    puzzleNumber: getPuzzleNumber(date),
    mode: "daily",
  });
}

export function generatePracticePuzzle(seed = Date.now()): DailyPuzzle {
  const todaySeed = getDailySeed();
  let practiceSeed = Math.abs(Math.floor(seed));
  if (practiceSeed === todaySeed) practiceSeed += 97;
  return generatePuzzleFromSeed(practiceSeed, {
    date: `practice-${practiceSeed}`,
    puzzleNumber: 0,
    mode: "practice",
  });
}

// Time until next UTC midnight in seconds
export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
