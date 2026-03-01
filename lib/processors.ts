/**
 * Shared client-side file processing functions.
 * All functions run entirely in the browser — no server uploads.
 * Used by both the individual tool components and SmartConverter.
 */

export type ImageOutputFormat = "original" | "jpeg" | "webp";

/** Compress an image using browser-image-compression */
export async function compressImage(
  file: File,
  quality = 80,
  outputFormat: ImageOutputFormat = "original"
): Promise<{ blob: Blob; ext: string; mimeType: string }> {
  const { default: imageCompression } = await import("browser-image-compression");

  const mimeType =
    outputFormat === "jpeg"
      ? "image/jpeg"
      : outputFormat === "webp"
      ? "image/webp"
      : file.type;

  const compressed = await imageCompression(file, {
    maxSizeMB: 100,
    initialQuality: quality / 100,
    useWebWorker: true,
    fileType: mimeType,
  });

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
  fillColor?: string
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2D context");
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      outputMime,
      quality !== undefined ? quality / 100 : undefined
    );
  });
}

/** Convert any image to JPG — fills white background for transparent sources */
export function toJpg(file: File, quality = 90): Promise<Blob> {
  return convertViaCanvas(file, "image/jpeg", quality, "#ffffff");
}

/** Convert any image to PNG (lossless, no background fill) */
export function toPng(file: File): Promise<Blob> {
  return convertViaCanvas(file, "image/png");
}

/** Convert any image to WebP at the specified quality */
export function toWebp(file: File, quality = 85): Promise<Blob> {
  return convertViaCanvas(file, "image/webp", quality);
}

/** Convert HEIC/HEIF to JPG using heic2any (dynamic import for SSR safety) */
export async function heicToJpg(file: File, quality = 90): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: quality / 100,
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
