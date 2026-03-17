// Lightweight numble utilities safe for client bundles.
// Heavy solver logic lives in lib/numble.ts (server-only).

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

// Get UTC date string: "2026-03-01"
export function getUTCDateString(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().split("T")[0];
}
