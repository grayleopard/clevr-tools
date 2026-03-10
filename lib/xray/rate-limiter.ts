// lib/xray/rate-limiter.ts
// In-memory rate limiter: 5 free X-Rays/month per hashed IP.
// Resets automatically each calendar month.

import crypto from "node:crypto";

const store = new Map<string, { count: number; yearMonth: string }>();
const FREE_LIMIT = 5;

function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function getMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

export function checkRateLimit(
  ip: string
): { allowed: boolean; used: number; limit: number } {
  const key = hashIP(ip);
  const currentMonth = getMonth();
  const entry = store.get(key);

  if (!entry || entry.yearMonth !== currentMonth) {
    return { allowed: true, used: 0, limit: FREE_LIMIT };
  }

  return {
    allowed: entry.count < FREE_LIMIT,
    used: entry.count,
    limit: FREE_LIMIT,
  };
}

export function incrementUsage(ip: string): void {
  const key = hashIP(ip);
  const currentMonth = getMonth();
  const entry = store.get(key);

  if (!entry || entry.yearMonth !== currentMonth) {
    store.set(key, { count: 1, yearMonth: currentMonth });
  } else {
    store.set(key, { count: entry.count + 1, yearMonth: currentMonth });
  }
}
