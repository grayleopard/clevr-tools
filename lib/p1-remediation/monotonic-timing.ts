export function monotonicNow(): number {
  if (typeof performance !== "undefined" && Number.isFinite(performance.now())) {
    return performance.now();
  }
  return Date.now();
}

export function elapsedMilliseconds(startMs: number, nowMs: number): number {
  if (!Number.isFinite(startMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, nowMs - startMs);
}

export function remainingMilliseconds(
  startMs: number,
  durationMs: number,
  nowMs: number
): number {
  return Math.max(0, durationMs - elapsedMilliseconds(startMs, nowMs));
}

export function hasElapsed(
  startMs: number,
  durationMs: number,
  nowMs: number
): boolean {
  return elapsedMilliseconds(startMs, nowMs) >= Math.max(0, durationMs);
}

export function ratePerSecond(count: number, elapsedMs: number): number {
  if (count <= 0 || elapsedMs <= 0) return 0;
  return count / (elapsedMs / 1_000);
}
