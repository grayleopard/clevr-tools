/**
 * Same-tab file handoff for client-side tool navigation.
 *
 * Files cannot safely be serialized into a URL or storage. This intentionally
 * short-lived in-memory envelope binds a verified source file to one target
 * route, so another mounted tool cannot accidentally consume it.
 */

export type HandoffFileKind =
  | "png"
  | "jpg"
  | "gif"
  | "webp"
  | "pdf"
  | "docx";

export interface HandoffDestinationCapability {
  readonly acceptedKinds: readonly HandoffFileKind[];
  readonly byteLimit: number;
}

const MEBIBYTE = 1024 * 1024;

/**
 * This mirrors the direct picker contract for destinations reachable from the
 * Smart Converter. Keep it local to the handoff boundary, rather than letting
 * an unvalidated File bypass every destination picker.
 */
const HANDOFF_DESTINATION_CAPABILITIES: Readonly<Record<string, HandoffDestinationCapability>> = {
  "/compress/image": { acceptedKinds: ["png", "jpg", "webp"], byteLimit: 50 * MEBIBYTE },
  "/convert/png-to-jpg": { acceptedKinds: ["png"], byteLimit: 50 * MEBIBYTE },
  "/convert/png-to-webp": { acceptedKinds: ["png"], byteLimit: 50 * MEBIBYTE },
  "/convert/png-to-pdf": { acceptedKinds: ["png"], byteLimit: 50 * MEBIBYTE },
  "/tools/resize-image": { acceptedKinds: ["png", "jpg", "webp"], byteLimit: 50 * MEBIBYTE },
  "/files/image-cropper": { acceptedKinds: ["png", "jpg", "webp"], byteLimit: 50 * MEBIBYTE },
  "/convert/jpg-to-png": { acceptedKinds: ["jpg"], byteLimit: 50 * MEBIBYTE },
  "/convert/jpg-to-pdf": { acceptedKinds: ["jpg", "png", "webp"], byteLimit: 50 * MEBIBYTE },
  "/tools/gif-compressor": { acceptedKinds: ["gif"], byteLimit: 50 * MEBIBYTE },
  "/convert/webp-to-png": { acceptedKinds: ["webp"], byteLimit: 50 * MEBIBYTE },
  "/compress/pdf": { acceptedKinds: ["pdf"], byteLimit: 100 * MEBIBYTE },
  "/convert/pdf-to-jpg": { acceptedKinds: ["pdf"], byteLimit: 100 * MEBIBYTE },
  "/tools/merge-pdf": { acceptedKinds: ["pdf"], byteLimit: 100 * MEBIBYTE },
  "/tools/split-pdf": { acceptedKinds: ["pdf"], byteLimit: 100 * MEBIBYTE },
  "/tools/rotate-pdf": { acceptedKinds: ["pdf"], byteLimit: 100 * MEBIBYTE },
  "/convert/word-to-pdf": { acceptedKinds: ["docx"], byteLimit: 50 * MEBIBYTE },
};

export const DEFAULT_HANDOFF_TTL_MS = 30_000;

export interface PendingFileEnvelope {
  readonly file: File;
  readonly verifiedKind: HandoffFileKind | null;
  readonly targetRoute: string | null;
  readonly byteLimit: number | null;
  readonly operationId: string;
  readonly expiresAt: number;
}

export interface PendingFileOptions {
  readonly verifiedKind?: HandoffFileKind;
  readonly targetRoute?: string;
  readonly byteLimit?: number;
  readonly operationId?: string;
  readonly ttlMs?: number;
  /** Injectable clock for deterministic tests. */
  readonly now?: number;
}

export interface TakePendingFileOptions {
  readonly targetRoute?: string;
  readonly operationId?: string;
  /** Injectable clock for deterministic tests. */
  readonly now?: number;
}

let pendingFile: PendingFileEnvelope | null = null;
let operationCounter = 0;

export function createHandoffOperationId(): string {
  operationCounter += 1;
  return `handoff-${Date.now()}-${operationCounter}`;
}

export function getHandoffCapability(route: string): HandoffDestinationCapability | null {
  return HANDOFF_DESTINATION_CAPABILITIES[route] ?? null;
}

/**
 * Store a file for the next matching destination mount. Calling this with only
 * a File retains the legacy, untargeted behavior used by non-Smart-Converter
 * flows; Smart Converter handoffs must supply the envelope metadata.
 */
export function setPendingFile(file: File, options: PendingFileOptions = {}): PendingFileEnvelope {
  const now = options.now ?? Date.now();
  const targetRoute = options.targetRoute ?? null;
  const capability = targetRoute ? getHandoffCapability(targetRoute) : null;
  const requestedLimit = options.byteLimit ?? capability?.byteLimit ?? null;
  const byteLimit =
    requestedLimit === null
      ? null
      : Math.max(0, capability ? Math.min(requestedLimit, capability.byteLimit) : requestedLimit);
  const ttlMs = Math.max(0, options.ttlMs ?? DEFAULT_HANDOFF_TTL_MS);

  const envelope: PendingFileEnvelope = {
    file,
    verifiedKind: options.verifiedKind ?? null,
    targetRoute,
    byteLimit,
    operationId: options.operationId ?? createHandoffOperationId(),
    expiresAt: now + ttlMs,
  };

  pendingFile = envelope;
  return envelope;
}

export function isPendingFileEnvelopeValid(
  envelope: PendingFileEnvelope,
  options: TakePendingFileOptions = {}
): boolean {
  const now = options.now ?? Date.now();
  if (envelope.expiresAt <= now) return false;
  if (options.operationId && envelope.operationId !== options.operationId) return false;

  // Untargeted envelopes are kept only for pre-existing non-homepage flows.
  if (!envelope.targetRoute) return true;
  if (!options.targetRoute || options.targetRoute !== envelope.targetRoute) return false;

  const capability = getHandoffCapability(options.targetRoute);
  if (!capability || !envelope.verifiedKind || envelope.byteLimit === null) return false;
  if (!capability.acceptedKinds.includes(envelope.verifiedKind)) return false;
  if (envelope.byteLimit > capability.byteLimit) return false;
  if (envelope.file.size > envelope.byteLimit) return false;

  return true;
}

/**
 * Consume a complete envelope exactly once. A route, operation, size, type, or
 * expiry mismatch clears it rather than leaving a file available to a later
 * unrelated page.
 */
export function takePendingFileEnvelope(
  options: TakePendingFileOptions = {}
): PendingFileEnvelope | null {
  const envelope = pendingFile;
  pendingFile = null;
  if (!envelope || !isPendingFileEnvelopeValid(envelope, options)) return null;
  return envelope;
}

/** Consume the pending file and return only the File for existing destinations. */
export function takePendingFile(options: TakePendingFileOptions = {}): File | null {
  return takePendingFileEnvelope(options)?.file ?? null;
}

/** Clear a pending handoff, optionally only when it belongs to an operation. */
export function clearPendingFile(operationId?: string): void {
  if (!pendingFile) return;
  if (!operationId || pendingFile.operationId === operationId) {
    pendingFile = null;
  }
}

/** Read-only test and diagnostic helper; callers must never mutate the envelope. */
export function peekPendingFile(): PendingFileEnvelope | null {
  return pendingFile;
}

type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

export interface TransitionScheduler {
  setTimeout(callback: () => void, delayMs: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}

const defaultTransitionScheduler: TransitionScheduler = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle),
};

/**
 * A tiny cancelable timer owner for route transitions. It is deliberately
 * framework-agnostic so reset/unmount behavior can be tested without React.
 */
export function createCancelableTransition(
  scheduler: TransitionScheduler = defaultTransitionScheduler
) {
  let timer: TimerHandle | null = null;
  let generation = 0;

  const cancel = () => {
    generation += 1;
    if (timer !== null) scheduler.clearTimeout(timer);
    timer = null;
  };

  return {
    schedule(delayMs: number, callback: () => void): number {
      cancel();
      const scheduledGeneration = ++generation;
      timer = scheduler.setTimeout(() => {
        if (scheduledGeneration !== generation) return;
        timer = null;
        callback();
      }, Math.max(0, delayMs));
      return scheduledGeneration;
    },
    cancel,
    get isPending(): boolean {
      return timer !== null;
    },
  };
}
