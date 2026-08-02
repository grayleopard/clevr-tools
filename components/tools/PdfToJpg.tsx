"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { renderAllThumbnails, renderPageToJpgBlob } from "@/lib/pdf-utils";
import { Slider } from "@/components/ui/slider";
import { Download, Package, FileImage, RotateCcw } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";
import { TipJar } from "@/components/tool/TipJar";
import {
  trackSafeToolDuration,
  trackSafeToolEvent,
  trackSafeToolFailure,
} from "@/lib/analytics/safe-tool-events";

interface PageResult {
  blob: Blob;
  url: string;
  filename: string;
  size: number;
}

interface PdfEntry {
  file: File;
  pageCount: number;
  thumbnails: string[];
}

function revokePageResults(results: PageResult[]): void {
  results.forEach((result) => URL.revokeObjectURL(result.url));
}

function getPdfOutputStem(filename: string): string {
  const withoutExtension = filename.replace(/\.pdf$/i, "").trim();
  return withoutExtension && withoutExtension !== "." ? withoutExtension : "document";
}

function createJpgFilename(
  entry: PdfEntry,
  fileIndex: number,
  fileCount: number,
  pageIndex: number
): string {
  const fileDigits = String(Math.max(fileCount, 1)).length;
  const pageDigits = String(Math.max(entry.pageCount, 1)).length;
  const filePrefix =
    fileCount > 1 ? `${String(fileIndex + 1).padStart(fileDigits, "0")}-` : "";
  const pageNumber = String(pageIndex + 1).padStart(pageDigits, "0");
  return `${filePrefix}${getPdfOutputStem(entry.file.name)}-page-${pageNumber}.jpg`;
}

async function isJpegBlob(blob: Blob): Promise<boolean> {
  if (blob.size < 4 || blob.type.toLowerCase() !== "image/jpeg") return false;
  const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export default function PdfToJpg() {
  const [quality, setQuality] = useState(85);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfEntries, setPdfEntries] = useState<PdfEntry[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>[]>([]);
  const [results, setResults] = useState<PageResult[]>([]);
  const [thumbProgress, setThumbProgress] = useState({ current: 0, total: 0 });
  const [convertProgress, setConvertProgress] = useState({ current: 0, total: 0 });
  const [downloaded, setDownloaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const arrayBuffersRef = useRef<ArrayBuffer[]>([]);
  const resultsRef = useRef<PageResult[]>([]);
  const inputRunRef = useRef(0);
  const conversionRunRef = useRef(0);

  const clearResults = useCallback(() => {
    revokePageResults(resultsRef.current);
    resultsRef.current = [];
    setResults([]);
  }, []);

  useEffect(() => {
    trackSafeToolEvent("pdf-to-jpg", "opened");
  }, []);

  useEffect(() => {
    return () => {
      inputRunRef.current += 1;
      conversionRunRef.current += 1;
      revokePageResults(resultsRef.current);
      resultsRef.current = [];
    };
  }, []);

  // Derived selection state
  const totalThumbPages = pdfEntries.reduce((s, e) => s + e.thumbnails.length, 0);
  const totalSelected = selectedPages.reduce((s, sp) => s + sp.size, 0);
  const allSelected = totalSelected === totalThumbPages && totalThumbPages > 0;

  const togglePage = useCallback((fileIdx: number, pageIdx: number) => {
    setSelectedPages((prev) => {
      const next = prev.map((s) => new Set(s));
      if (next[fileIdx]?.has(pageIdx)) {
        next[fileIdx].delete(pageIdx);
      } else {
        next[fileIdx]?.add(pageIdx);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedPages((prev) => prev.map(() => new Set<number>()));
    } else {
      setSelectedPages((prev) =>
        prev.map((_, fi) =>
          new Set<number>(Array.from({ length: pdfEntries[fi]?.thumbnails.length ?? 0 }, (_, i) => i))
        )
      );
    }
  }, [allSelected, pdfEntries]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const runId = ++inputRunRef.current;
    conversionRunRef.current += 1;

    clearResults();
    setIsLoadingThumbs(true);
    setIsConverting(false);
    setPdfEntries([]);
    setSelectedPages([]);
    setDownloaded(false);
    setThumbProgress({ current: 0, total: files.length });
    setConvertProgress({ current: 0, total: 0 });
    arrayBuffersRef.current = [];

    const entries: PdfEntry[] = [];
    const buffers: ArrayBuffer[] = [];
    let invalidCount = 0;

    try {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        if (runId !== inputRunRef.current) return;
        const file = files[fileIndex];

        try {
          const buffer = await file.arrayBuffer();
          const { PDFDocument } = await import("pdf-lib");
          const pdfDoc = await PDFDocument.load(buffer.slice(0), { updateMetadata: false });
          const pageCount = pdfDoc.getPageCount();
          if (pageCount < 1) throw new Error("PDF has no pages");

          const thumbnails = await renderAllThumbnails(buffer, 0.3);
          if (thumbnails.length !== pageCount) throw new Error("Incomplete PDF preview");
          if (runId !== inputRunRef.current) return;

          entries.push({ file, pageCount, thumbnails });
          // Only add a buffer after its matching PDF has fully validated. This
          // keeps conversion indices aligned when one selected file is invalid.
          buffers.push(buffer);
        } catch {
          invalidCount += 1;
        }

        if (runId === inputRunRef.current) {
          setThumbProgress({ current: fileIndex + 1, total: files.length });
        }
      }
    } finally {
      if (runId !== inputRunRef.current) return;

      arrayBuffersRef.current = buffers;
      setPdfEntries(entries);
      setSelectedPages(
        entries.map((entry) =>
          new Set<number>(Array.from({ length: entry.thumbnails.length }, (_, index) => index))
        )
      );
      setIsLoadingThumbs(false);

      if (entries.length > 0) trackSafeToolEvent("pdf-to-jpg", "valid_input");
      if (invalidCount > 0) {
        trackSafeToolFailure("pdf-to-jpg", "invalid_input");
        addToast(
          `${invalidCount} PDF${invalidCount === 1 ? " couldn't" : "s couldn't"} be read. Check for password protection or file damage.`,
          "error"
        );
      }
    }
  }, [clearResults]);

  useAutoLoadFile(handleFiles);

  const handleConvert = useCallback(async () => {
    if (pdfEntries.length === 0 || isConverting) return;
    let totalPages = 0;
    for (let fileIndex = 0; fileIndex < pdfEntries.length; fileIndex++) {
      totalPages += selectedPages[fileIndex]?.size ?? 0;
    }
    if (totalPages === 0) {
      addToast("Select at least one page to convert.", "info");
      return;
    }

    const runId = ++conversionRunRef.current;
    const startedAt = performance.now();
    clearResults();
    setIsConverting(true);
    setDownloaded(false);
    setConvertProgress({ current: 0, total: totalPages });
    trackSafeToolEvent("pdf-to-jpg", "started");

    const allResults: PageResult[] = [];
    let processedPages = 0;
    let failedPages = 0;
    let committed = false;

    try {
      for (let fileIndex = 0; fileIndex < pdfEntries.length; fileIndex++) {
        if (runId !== conversionRunRef.current) return;
        const entry = pdfEntries[fileIndex];
        const buffer = arrayBuffersRef.current[fileIndex];
        const indices = Array.from(selectedPages[fileIndex] ?? new Set<number>()).sort(
          (left, right) => left - right
        );

        if (!buffer) {
          failedPages += indices.length;
          processedPages += indices.length;
          setConvertProgress({ current: processedPages, total: totalPages });
          continue;
        }

        for (const pageIndex of indices) {
          try {
            const blob = await renderPageToJpgBlob(buffer, pageIndex, quality);
            if (!(await isJpegBlob(blob))) throw new Error("Invalid JPG output");
            const url = URL.createObjectURL(blob);
            if (runId !== conversionRunRef.current) {
              URL.revokeObjectURL(url);
              return;
            }

            allResults.push({
              blob,
              url,
              filename: createJpgFilename(entry, fileIndex, pdfEntries.length, pageIndex),
              size: blob.size,
            });
          } catch {
            failedPages += 1;
            if (runId !== conversionRunRef.current) return;
          } finally {
            processedPages += 1;
            if (runId === conversionRunRef.current) {
              setConvertProgress({ current: processedPages, total: totalPages });
            }
          }
        }
      }

      if (runId !== conversionRunRef.current) return;

      const duration = performance.now() - startedAt;
      if (failedPages > 0) trackSafeToolFailure("pdf-to-jpg", "rendering");
      if (allResults.length === 0) {
        addToast("No selected pages could be rendered. Try another PDF or select fewer pages.", "error");
        return;
      }

      resultsRef.current = allResults;
      setResults(allResults);
      trackSafeToolEvent("pdf-to-jpg", "succeeded");
      trackSafeToolDuration("pdf-to-jpg", duration);
      committed = true;

      if (failedPages > 0) {
        addToast(
          `${failedPages} selected page${failedPages === 1 ? " couldn't" : "s couldn't"} be rendered. The remaining JPGs are ready.`,
          "info"
        );
      }
    } catch {
      if (runId === conversionRunRef.current) {
        trackSafeToolFailure("pdf-to-jpg", "rendering");
        addToast("Conversion couldn't finish. Try another PDF or fewer selected pages.", "error");
      }
    } finally {
      if (!committed) revokePageResults(allResults);
      if (runId === conversionRunRef.current) setIsConverting(false);
    }
  }, [clearResults, isConverting, pdfEntries, quality, selectedPages]);

  const downloadAll = useCallback(async () => {
    if (results.length === 0) return;
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const result of results) zip.file(result.filename, result.blob);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      if (zipBlob.size === 0) throw new Error("Empty ZIP output");
      const url = URL.createObjectURL(zipBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "pdf-pages.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setDownloaded(true);
      trackSafeToolEvent("pdf-to-jpg", "download");
    } catch {
      trackSafeToolFailure("pdf-to-jpg", "download");
      addToast("Couldn't create the ZIP. Download the JPGs individually instead.", "error");
    }
  }, [results]);

  const markDownloaded = useCallback(() => {
    setDownloaded(true);
    trackSafeToolEvent("pdf-to-jpg", "download");
  }, []);

  const reset = useCallback(() => {
    const hadOutput = resultsRef.current.length > 0 || downloaded;
    inputRunRef.current += 1;
    conversionRunRef.current += 1;
    clearResults();
    setPdfEntries([]);
    setSelectedPages([]);
    setDownloaded(false);
    arrayBuffersRef.current = [];
    setResetKey((k) => k + 1);
    if (hadOutput) trackSafeToolEvent("pdf-to-jpg", "process_another");
  }, [clearResults, downloaded]);

  return (
    <div className="space-y-4">
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Converts selected PDF pages to JPG in your browser. Choose the pages you need, then download them individually or as a ZIP.
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoadingThumbs
          ? `Loading PDF pages: ${thumbProgress.current} of ${thumbProgress.total}`
          : isConverting
            ? `Rendering JPGs: ${convertProgress.current} of ${convertProgress.total}`
            : results.length > 0
              ? `${results.length} JPG image${results.length === 1 ? "" : "s"} ready to download`
              : ""}
      </p>

      {/* Drop zone */}
      <FileDropZone
        accept=".pdf"
        multiple
        maxSizeMB={100}
        onFiles={handleFiles}
        resetKey={resetKey}
        compact={pdfEntries.length > 0}
      />

      {/* Loading thumbnails */}
      {isLoadingThumbs && (
        <ProcessingIndicator label={`Loading pages… (${thumbProgress.current}/${thumbProgress.total})`} />
      )}

      {/* Quality + thumbnail selection + buttons */}
      {pdfEntries.length > 0 && !isLoadingThumbs && results.length === 0 && !isConverting && (
        <div className="space-y-4">
          {/* Quality slider — compact inline card */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium shrink-0">JPG Quality</label>
            <Slider
              min={50}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              aria-label="JPG quality"
              className="flex-1"
            />
            <span className="text-sm font-mono text-primary w-10 text-right shrink-0">{quality}%</span>
          </div>

          {/* Selectable thumbnail strip */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header: SELECT PAGES label + toggle + live counter */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/20 px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Pages
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  aria-pressed={allSelected}
                  className="text-xs text-[var(--clr-accent)] hover:underline"
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-[var(--clr-accent)]">{totalSelected}</span>
                {" "}of {totalThumbPages} selected
              </span>
            </div>

            <div className="p-4 space-y-4">
              {pdfEntries.map((entry, fi) => (
                <div key={fi} className="space-y-2">
                  {pdfEntries.length > 1 && (
                    <p className="text-sm font-semibold">
                      {truncateFilename(entry.file.name, 40)} — {entry.pageCount} pages
                    </p>
                  )}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {entry.thumbnails.map((thumb, pi) => {
                      const isSelected = selectedPages[fi]?.has(pi) ?? false;
                      return (
                        <button
                          key={pi}
                          type="button"
                          onClick={() => togglePage(fi, pi)}
                          aria-pressed={isSelected}
                          aria-label={`Page ${pi + 1}, ${isSelected ? "selected" : "not selected"}`}
                          className={`relative shrink-0 overflow-hidden rounded-md border-2 transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border-[var(--clr-accent)] shadow-[0_0_0_1px_var(--clr-accent),0_2px_8px_rgba(59,130,246,0.2)]"
                              : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt=""
                            className="block h-[96px] w-[72px] object-contain bg-white"
                          />
                          {/* Page number */}
                          <span
                            className={`absolute bottom-0.5 right-1 text-[9px] font-semibold ${
                              isSelected ? "text-[var(--clr-accent)]" : "text-[var(--text-tertiary)]"
                            }`}
                          >
                            {pi + 1}
                          </span>
                          {/* Checkmark badge */}
                          {isSelected && (
                            <div className="absolute top-1 right-1 h-[18px] w-[18px] rounded-full bg-[var(--clr-accent)] flex items-center justify-center shadow-sm">
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConvert}
            disabled={totalSelected === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileImage className="h-4 w-4" />
            Convert{totalSelected > 0
              ? ` ${totalSelected} page${totalSelected !== 1 ? "s" : ""}`
              : ""} to JPG
          </button>
        </div>
      )}

      {/* Converting progress */}
      {isConverting && (
        <ProcessingIndicator label={`Rendering page ${convertProgress.current} of ${convertProgress.total}…`} />
      )}

      {/* Results */}
      {results.length > 0 && !isConverting && (
        <div className="space-y-4">
          {/* Success banner */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/20" role="status" aria-live="polite">
            <FileImage className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {results.length} page{results.length !== 1 ? "s" : ""} converted to JPG successfully
            </p>
            {!downloaded ? (
              <button
                type="button"
                onClick={reset}
                className="ml-auto flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start over
              </button>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Output — {results.length} JPG image{results.length !== 1 ? "s" : ""}
              </p>
              {results.length > 1 && (
                <button
                  type="button"
                  onClick={downloadAll}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Package className="h-3.5 w-3.5" />
                  Download ZIP
                </button>
              )}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {results.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    download={r.filename}
                    onClick={markDownloaded}
                    aria-label={`Download JPG ${i + 1}`}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={r.filename} className="w-full object-contain bg-white" />
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-foreground">{r.filename}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(r.size)}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {results.length > 1 && (
            <button
              type="button"
              onClick={downloadAll}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Download all {results.length} pages as ZIP
            </button>
          )}
          <TipJar />
          {downloaded && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/20" role="status" aria-live="polite">
              <p className="text-sm text-green-700 dark:text-green-400">Downloaded! Need to convert another PDF?</p>
              <button type="button" onClick={reset} className="ml-auto min-h-11 text-xs font-medium text-green-700 underline dark:text-green-400">
                Start over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
