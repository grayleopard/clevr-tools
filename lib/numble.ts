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
  op: "+" | "-" | "\u00d7" | "\u00f7";
  b: number;
  result: number;
}

export interface DailyPuzzle {
  numbers: number[];
  target: number;
  optimalSteps: number; // minimum operations to reach target
  date: string;
  puzzleNumber: number;
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
  if (op === "\u00d7") return a * b;
  if (op === "\u00f7") {
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
    // Check if any current number is the target
    for (const n of nums) {
      if (n === target) {
        if (best === null || steps.length < best.length) {
          best = [...steps];
        }
        return;
      }
    }
    // Prune: if we already have a solution with fewer steps, don't go deeper
    if (best !== null && steps.length >= best.length) return;

    const ops = ["+", "-", "\u00d7", "\u00f7"];
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        for (const op of ops) {
          const result = applyOp(nums[i], op, nums[j]);
          if (result === null || result === 0) continue;
          // Build new number set
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

export function generateDailyPuzzle(dateStr?: string): DailyPuzzle {
  const date = dateStr || getUTCDateString();
  const seed = getDailySeed(date);
  const rand = mulberry32(seed);

  // Pick 2 large numbers (no duplicates)
  const largeCopy = [...LARGE_NUMBERS];
  const large: number[] = [];
  for (let i = 0; i < 2; i++) {
    const idx = Math.floor(rand() * largeCopy.length);
    large.push(largeCopy.splice(idx, 1)[0]);
  }

  // Pick 4 small numbers (with duplicates from pool of 2 copies each)
  const smallCopy = [...SMALL_POOL];
  const small: number[] = [];
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(rand() * smallCopy.length);
    small.push(smallCopy.splice(idx, 1)[0]);
  }

  const numbers = [...large, ...small];

  // Find a solvable target between 101-999
  const targetBase = 101 + Math.floor(rand() * 899); // 101-999
  let target = targetBase;
  let solution = solveNumbers(numbers, target);
  let attempts = 0;

  while (!solution.found && attempts < 1800) {
    target = ((target - 101 + 1) % 899) + 101; // cycle through 101-999
    solution = solveNumbers(numbers, target);
    attempts++;
  }

  // Fallback: if still no solution found (extremely rare), use a simple computed target
  if (!solution.found) {
    target = numbers[0] + numbers[1];
    if (target < 101 || target > 999) target = 101;
    solution = solveNumbers(numbers, target);
  }

  return {
    numbers,
    target,
    optimalSteps: solution.found ? solution.steps.length : 1,
    date,
    puzzleNumber: getPuzzleNumber(date),
  };
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
