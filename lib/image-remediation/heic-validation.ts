export const HEIC_CONVERSION_TIMEOUT_MS = 15_000;

export type HeicConversionErrorCode =
  | "invalid-input"
  | "timeout"
  | "unsupported-browser"
  | "decoder-failed"
  | "invalid-output";

const HEIF_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "heif",
  "mif1",
  "msf1",
]);

const ERROR_MESSAGES: Record<HeicConversionErrorCode, string> = {
  "invalid-input":
    "This file does not contain a valid HEIC or HEIF image. Choose the original photo and try again.",
  timeout:
    "This browser's local HEIC decoder did not finish within 15 seconds. Try another current browser or export the photo as JPG on your device.",
  "unsupported-browser":
    "This browser cannot run the local HEIC decoder. Try another current browser or export the photo as JPG on your device.",
  "decoder-failed":
    "This browser could not decode this HEIC variant. Try another current browser or export the original photo as JPG on your device.",
  "invalid-output":
    "The local decoder did not create a valid JPG, so no file was downloaded. Try another browser or photo.",
};

export class HeicConversionError extends Error {
  readonly code: HeicConversionErrorCode;

  constructor(code: HeicConversionErrorCode, cause?: unknown) {
    super(ERROR_MESSAGES[code], cause === undefined ? undefined : { cause });
    this.name = "HeicConversionError";
    this.code = code;
  }
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000 +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  );
}

/** Validate the ISO-BMFF `ftyp` box and a HEIC/HEIF-compatible brand. */
export function hasHeicFileSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 12 || ascii(bytes, 4, 8) !== "ftyp") return false;

  const declaredBoxSize = readUint32(bytes, 0);
  if (declaredBoxSize !== 0 && declaredBoxSize < 12) return false;

  const boxEnd = Math.min(bytes.length, declaredBoxSize || bytes.length);
  for (let offset = 8; offset + 4 <= boxEnd; offset += 4) {
    if (HEIF_BRANDS.has(ascii(bytes, offset, offset + 4).toLowerCase())) return true;
  }
  return false;
}

export async function assertHeicInput(file: Blob): Promise<void> {
  const header = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  if (!hasHeicFileSignature(header)) throw new HeicConversionError("invalid-input");
}

export async function normalizeValidatedJpeg(blob: Blob): Promise<Blob> {
  const header = new Uint8Array(await blob.slice(0, 3).arrayBuffer());
  if (
    blob.size < 4 ||
    header[0] !== 0xff ||
    header[1] !== 0xd8 ||
    header[2] !== 0xff
  ) {
    throw new HeicConversionError("invalid-output");
  }
  return blob.type === "image/jpeg" ? blob : blob.slice(0, blob.size, "image/jpeg");
}

export async function withHeicTimeout<T>(
  operation: Promise<T>,
  timeoutMs = HEIC_CONVERSION_TIMEOUT_MS
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new HeicConversionError("timeout")),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export function normalizeHeicConversionError(error: unknown): HeicConversionError {
  if (error instanceof HeicConversionError) return error;

  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/worker|canvas|blob|filereader|not supported in your browser/i.test(message)) {
    return new HeicConversionError("unsupported-browser", error);
  }
  return new HeicConversionError("decoder-failed", error);
}

export function getHeicConversionErrorMessage(error: unknown): string {
  return normalizeHeicConversionError(error).message;
}
