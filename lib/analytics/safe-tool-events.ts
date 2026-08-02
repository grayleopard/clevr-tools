"use client";

/**
 * A deliberately small analytics surface for local file tools. These helpers
 * only emit an allowlisted event name plus non-content operational metadata.
 * Do not add filenames, file contents, clipboard state, exception messages,
 * or arbitrary properties here.
 */
export const FLAGSHIP_TOOL_SLUGS = [
  "image-compressor",
  "pdf-to-jpg",
  "merge-pdf",
] as const;

export type FlagshipToolSlug = (typeof FLAGSHIP_TOOL_SLUGS)[number];

export const SAFE_TOOL_EVENTS = [
  "opened",
  "valid_input",
  "started",
  "succeeded",
  "download",
  "process_another",
] as const;

export type SafeToolEvent = (typeof SAFE_TOOL_EVENTS)[number];

export const SAFE_FAILURE_CATEGORIES = [
  "invalid_input",
  "processing",
  "rendering",
  "download",
] as const;

export type SafeFailureCategory = (typeof SAFE_FAILURE_CATEGORIES)[number];

type Gtag = (command: "event", eventName: string, params: Record<string, string | number>) => void;

function getGtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as Window & { gtag?: unknown }).gtag;
  return typeof candidate === "function" ? (candidate as Gtag) : null;
}

function send(eventName: string, params: Record<string, string | number>): void {
  getGtag()?.("event", eventName, params);
}

/** Emit an allowlisted, content-free lifecycle event for a flagship tool. */
export function trackSafeToolEvent(tool: FlagshipToolSlug, event: SafeToolEvent): void {
  send(`tool_${event}`, { tool });
}

/** Emit an allowlisted failure category without forwarding an exception. */
export function trackSafeToolFailure(
  tool: FlagshipToolSlug,
  failureCategory: SafeFailureCategory
): void {
  send("tool_failed", { tool, failure_category: failureCategory });
}

/** Emit a bounded processing duration without any input-derived metadata. */
export function trackSafeToolDuration(tool: FlagshipToolSlug, durationMs: number): void {
  const boundedDuration = Math.min(Math.max(Math.round(durationMs), 0), 600_000);
  send("tool_duration", { tool, duration_ms: boundedDuration });
}
