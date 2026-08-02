export type StaticRasterFormat = "jpeg" | "png" | "webp";
export type DetectedRasterFormat = StaticRasterFormat | "gif" | "unknown";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function matches(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

/** Detect the formats that browser Canvas can reliably export from magic bytes. */
export function detectRasterFormatFromBytes(bytes: Uint8Array): DetectedRasterFormat {
  if (bytes.length >= 3 && matches(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (bytes.length >= PNG_SIGNATURE.length && matches(bytes, PNG_SIGNATURE)) return "png";

  if (bytes.length >= 6) {
    const gifSignature = ascii(bytes, 0, 6);
    if (gifSignature === "GIF87a" || gifSignature === "GIF89a") return "gif";
  }

  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return "unknown";
}

export async function detectRasterBlobFormat(blob: Blob): Promise<DetectedRasterFormat> {
  const header = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  return detectRasterFormatFromBytes(header);
}

export function isStaticRasterFormat(
  format: DetectedRasterFormat
): format is StaticRasterFormat {
  return format === "jpeg" || format === "png" || format === "webp";
}

export function rasterMimeType(format: StaticRasterFormat): string {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
  }
}

export function rasterExtension(format: StaticRasterFormat): string {
  return format === "jpeg" ? "jpg" : format;
}

export function isGifFile(
  file: Pick<File, "name" | "type">,
  detectedFormat?: DetectedRasterFormat
): boolean {
  return (
    detectedFormat === "gif" ||
    file.type.toLowerCase() === "image/gif" ||
    /\.gif$/i.test(file.name)
  );
}
