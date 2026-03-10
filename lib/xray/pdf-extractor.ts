// lib/xray/pdf-extractor.ts
//
// Uses pdf-parse@1.x which bundles its own pdfjs copy and runs entirely
// in-process with no web worker, no structuredClone, no module-path hashing.
// Works in Next.js serverless (Node.js runtime) without any bundler tricks.

import pdf from "pdf-parse";
import { FileFacts } from "./types";

interface ExtractionResult {
  text: string;
  fileFacts: FileFacts;
  metadata: {
    pageCount: number;
    author: string | null;
    creator: string | null;
    creationDate: string | null;
    modDate: string | null;
  };
}

const MAX_PAGES = 200;
const EXTRACTION_TIMEOUT_MS = 15_000;

/**
 * Extracts text content and metadata from a PDF buffer.
 * Runs entirely in memory — nothing written to disk.
 * Rejects PDFs over 200 pages and times out after 15 seconds.
 */
export async function extractPDF(buffer: Buffer): Promise<ExtractionResult> {
  const data = await Promise.race([
    pdf(buffer),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("PDF extraction timed out after 15 seconds")), EXTRACTION_TIMEOUT_MS)
    ),
  ]);

  if (data.numpages > MAX_PAGES) {
    throw new Error(`PDF has ${data.numpages} pages, exceeding the ${MAX_PAGES}-page limit`);
  }

  const pageCount = data.numpages;
  const text = data.text;
  const info = data.info || {};

  const fileFacts: FileFacts = {
    pageCount,
    fileSize: formatFileSize(buffer.length),
    createdDate: formatPDFDate(info.CreationDate),
    modifiedDate: formatPDFDate(info.ModDate),
    creatorApp: info.Creator || info.Producer || null,
    isEncrypted: false,
    hasFormFields: !!info.IsAcroFormPresent,
    imageCount: countImages(buffer),
    estimatedReadTime: estimateReadTime(text),
    pdfVersion: data.version || null,
    fontCount: 0,
  };

  return {
    text,
    fileFacts,
    metadata: {
      pageCount,
      author: info.Author || null,
      creator: info.Creator || null,
      creationDate: formatPDFDate(info.CreationDate),
      modDate: formatPDFDate(info.ModDate),
    },
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Parses PDF date strings (format: D:YYYYMMDDHHmmSS) into readable dates.
 */
function formatPDFDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const cleaned = dateStr.replace(/^D:/, "").replace(/['+]/g, "");
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    if (!year || !month || !day) return null;
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function estimateReadTime(text: string): string {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 250);
  if (minutes < 1) return "Less than 1 min";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

function countImages(buffer: Buffer): number {
  const bufferStr = buffer.toString("binary");
  return (bufferStr.match(/\/Subtype\s*\/Image/g) || []).length;
}

/**
 * Validates that a buffer is a PDF by checking the %PDF magic bytes.
 */
export function isValidPDF(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return buffer.slice(0, 5).toString("ascii").startsWith("%PDF-");
}
