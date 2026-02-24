/**
 * Shared PDF utilities: pdfjs worker setup and thumbnail rendering.
 * Only used in "use client" components — never runs server-side.
 */

let workerConfigured = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    workerConfigured = true;
  }
  return pdfjs;
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
  const doc = await pdfjs.getDocument({ data: copy }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
  doc.destroy();
  return dataUrl;
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
  const doc = await pdfjs.getDocument({ data: copy }).promise;
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
    thumbnails.push(canvas.toDataURL("image/jpeg", 0.6));
    onProgress?.(i + 1, count);
  }

  doc.destroy();
  return thumbnails;
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
  const doc = await pdfjs.getDocument({ data: copy }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality / 100
    )
  );
  doc.destroy();
  return blob;
}

/** Parse a page range string like "1-3, 5, 7-9" into 0-based page indices. */
export function parsePageRange(input: string, maxPages: number): number[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || trimmed === "all") {
    return Array.from({ length: maxPages }, (_, i) => i);
  }

  const set = new Set<number>();
  for (const part of trimmed.split(",")) {
    const t = part.trim();
    const rangeMatch = t.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, parseInt(rangeMatch[1]));
      const end = Math.min(maxPages, parseInt(rangeMatch[2]));
      for (let i = start; i <= end; i++) set.add(i - 1);
    } else {
      const n = parseInt(t);
      if (!isNaN(n) && n >= 1 && n <= maxPages) set.add(n - 1);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}
