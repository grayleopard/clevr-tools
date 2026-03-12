/**
 * Shared client-side file processing functions.
 * All functions run entirely in the browser — no server uploads.
 * Used by both the individual tool components and SmartConverter.
 */

import { normalizeCanvasQuality, qualityToPercent } from "@/lib/image-quality";

export type ImageOutputFormat = "original" | "jpeg" | "webp";
interface CanvasExportOptions {
  fillColor?: string;
  opaque?: boolean;
}

/** Compress an image using browser-image-compression */
export async function compressImage(
  file: File,
  quality = 80,
  outputFormat: ImageOutputFormat = "original"
): Promise<{ blob: Blob; ext: string; mimeType: string }> {
  const { default: imageCompression } = await import("browser-image-compression");
  const qualityPercent = qualityToPercent(quality);

  const mimeType =
    outputFormat === "jpeg"
      ? "image/jpeg"
      : outputFormat === "webp"
      ? "image/webp"
      : file.type;

  const runCompression = (requestedQuality: number) =>
    imageCompression(file, {
      maxSizeMB: 100,
      initialQuality: normalizeCanvasQuality(requestedQuality),
      useWebWorker: true,
      fileType: mimeType,
    });

  let compressed = await runCompression(quality);

  if (outputFormat === "webp" && compressed.size > file.size && qualityPercent > 5) {
    const adjustedQuality = Math.max(
      Math.round(qualityPercent * (file.size / compressed.size)),
      5
    );
    compressed = await runCompression(adjustedQuality);
  }

  const ext =
    outputFormat === "jpeg"
      ? "jpg"
      : outputFormat === "webp"
      ? "webp"
      : (file.name.split(".").pop() ?? "jpg");

  return { blob: compressed, ext, mimeType };
}

/**
 * Convert any image file to a target MIME type using the Canvas API.
 * Pass `fillColor` (e.g. '#ffffff') to fill transparent areas before export.
 */
export async function convertViaCanvas(
  file: File,
  outputMime: "image/jpeg" | "image/png" | "image/webp",
  quality?: number,
  options: CanvasExportOptions = {}
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { alpha: !options.opaque });
  if (!ctx) throw new Error("Could not get canvas 2D context");
  if (options.fillColor || options.opaque) {
    ctx.fillStyle = options.fillColor ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      outputMime,
      normalizeCanvasQuality(quality)
    );
  });
}

/** Convert any image to JPG — fills white background for transparent sources */
export function toJpg(file: File, quality = 90): Promise<Blob> {
  return convertViaCanvas(file, "image/jpeg", quality, {
    fillColor: "#ffffff",
    opaque: true,
  });
}

/** Convert any image to PNG (lossless, no background fill unless source is opaque) */
export function toPng(file: File, options: { opaque?: boolean } = {}): Promise<Blob> {
  return convertViaCanvas(file, "image/png", undefined, {
    fillColor: options.opaque ? "#ffffff" : undefined,
    opaque: options.opaque,
  });
}

/** Convert any image to WebP at the specified quality */
export async function toWebp(file: File, quality = 85): Promise<Blob> {
  const opaqueSource = /^image\/jpe?g$/i.test(file.type);
  const blob = await convertViaCanvas(file, "image/webp", quality, {
    fillColor: opaqueSource ? "#ffffff" : undefined,
    opaque: opaqueSource,
  });
  // Guard: canvas WebP encoding of pre-compressed JPEGs can produce larger
  // output. If that happens, re-encode at a proportionally lower quality so
  // the result is always ≤ the original size.
  if (blob.size > file.size && quality > 5) {
    const targetQuality = Math.max(Math.round(quality * (file.size / blob.size)), 5);
    return convertViaCanvas(file, "image/webp", targetQuality);
  }
  return blob;
}

/** Convert HEIC/HEIF to JPG using heic2any (dynamic import for SSR safety) */
export async function heicToJpg(file: File, quality = 90): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: normalizeCanvasQuality(quality),
  });
  return Array.isArray(result) ? result[0] : result;
}

/** Compress a PDF by stripping metadata and enabling object streams */
export async function compressPdf(file: File): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");
  const compressed = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
  return new Blob([compressed.buffer.slice(0) as ArrayBuffer], {
    type: "application/pdf",
  });
}
