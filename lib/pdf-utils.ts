/**
 * Shared PDF utilities: pdfjs worker setup and thumbnail rendering.
 * Only used in "use client" components — never runs server-side.
 */

import { normalizeCanvasQuality } from "@/lib/image-quality";
import { parsePageRange as parsePageRangeImpl } from "@/lib/parse-page-range.mjs";

let workerConfigured = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    workerConfigured = true;
  }
  return pdfjs;
}

async function destroyPdfResource(resource: { destroy?: () => unknown } | null): Promise<void> {
  try {
    await resource?.destroy?.();
  } catch {
    // Destruction can race PDF.js cancellation. The original operation error
    // is more useful than a cleanup error.
  }
}

/**
 * Render a single PDF page to a JPEG data URL (for thumbnails).
 * pageIndex is 0-based.
 */
export async function renderPageThumbnail(
  data: ArrayBuffer,
  pageIndex: number,
  scale = 0.4
): Promise<string> {
  const pdfjs = await getPdfJs();
  // Copy buffer to avoid detached ArrayBuffer issues
  const copy = data.slice(0);
  const loadingTask = pdfjs.getDocument({ data: copy });
  let didLoadDocument = false;

  try {
    const doc = await loadingTask.promise;
    didLoadDocument = true;
    try {
      const page = await doc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      return canvas.toDataURL("image/jpeg", normalizeCanvasQuality(0.6));
    } finally {
      await destroyPdfResource(doc);
    }
  } catch (error) {
    if (!didLoadDocument) await destroyPdfResource(loadingTask);
    throw error;
  }
}

/**
 * Render all pages of a PDF to JPEG thumbnails. Returns an array of data URLs.
 */
export async function renderAllThumbnails(
  data: ArrayBuffer,
  scale = 0.35,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const pdfjs = await getPdfJs();
  const copy = data.slice(0);
  const loadingTask = pdfjs.getDocument({ data: copy });
  let didLoadDocument = false;

  try {
    const doc = await loadingTask.promise;
    didLoadDocument = true;
    try {
      const count = doc.numPages;
      const thumbnails: string[] = [];

      for (let i = 0; i < count; i++) {
        const page = await doc.getPage(i + 1);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        thumbnails.push(canvas.toDataURL("image/jpeg", normalizeCanvasQuality(0.6)));
        onProgress?.(i + 1, count);
      }

      return thumbnails;
    } finally {
      await destroyPdfResource(doc);
    }
  } catch (error) {
    if (!didLoadDocument) await destroyPdfResource(loadingTask);
    throw error;
  }
}

/**
 * Render a single PDF page to a high-quality JPEG Blob.
 * pageIndex is 0-based.
 */
export async function renderPageToJpgBlob(
  data: ArrayBuffer,
  pageIndex: number,
  quality: number, // 0–100
  scale = 2.0
): Promise<Blob> {
  const pdfjs = await getPdfJs();
  const copy = data.slice(0);
  const loadingTask = pdfjs.getDocument({ data: copy });
  let didLoadDocument = false;

  try {
    const doc = await loadingTask.promise;
    didLoadDocument = true;
    try {
      const page = await doc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      return await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/jpeg",
          normalizeCanvasQuality(quality)
        )
      );
    } finally {
      await destroyPdfResource(doc);
    }
  } catch (error) {
    if (!didLoadDocument) await destroyPdfResource(loadingTask);
    throw error;
  }
}

/** Parse a page range string like "1-3, 5, 7-9" into 0-based page indices. */
export function parsePageRange(input: string, maxPages: number): number[] {
  return parsePageRangeImpl(input, maxPages);
}
