"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { renderAllThumbnails, renderPageToJpgBlob } from "@/lib/pdf-utils";
import { Slider } from "@/components/ui/slider";
import { Download, Package, FileImage, RotateCcw } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";
import { FileXRayTrigger } from "@/components/xray/FileXRay";
import { TipJar } from "@/components/tool/TipJar";

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
    setIsLoadingThumbs(true);
    setPdfEntries([]);
    setSelectedPages([]);
    setResults([]);
    setDownloaded(false);
    setThumbProgress({ current: 0, total: files.length });

    const entries: PdfEntry[] = [];
    const buffers: ArrayBuffer[] = [];

    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi];
      try {
        const buf = await file.arrayBuffer();
        buffers.push(buf);
        const { PDFDocument } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.load(buf.slice(0));
        const pageCount = pdfDoc.getPageCount();
        const thumbnails = await renderAllThumbnails(buf, 0.3);
        entries.push({ file, pageCount, thumbnails });
        setThumbProgress({ current: fi + 1, total: files.length });
      } catch {
        addToast(`Failed to load ${file.name}`, "error");
      }
    }

    arrayBuffersRef.current = buffers;
    setPdfEntries(entries);
    // Start with all pages selected
    setSelectedPages(
      entries.map((e) => new Set<number>(Array.from({ length: e.thumbnails.length }, (_, i) => i)))
    );
    setIsLoadingThumbs(false);
  }, []);

  useAutoLoadFile(handleFiles);

  const handleConvert = useCallback(async () => {
    if (pdfEntries.length === 0) return;
    setIsConverting(true);
    setResults([]);

    const allResults: PageResult[] = [];
    let totalPages = 0;
    let processedPages = 0;

    for (let fi = 0; fi < pdfEntries.length; fi++) {
      const indices = Array.from(selectedPages[fi] ?? new Set<number>()).sort((a, b) => a - b);
      totalPages += indices.length;
    }
    setConvertProgress({ current: 0, total: totalPages });

    for (let fi = 0; fi < pdfEntries.length; fi++) {
      const entry = pdfEntries[fi];
      const buf = arrayBuffersRef.current[fi];
      const indices = Array.from(selectedPages[fi] ?? new Set<number>()).sort((a, b) => a - b);
      const baseName = entry.file.name.replace(/\.pdf$/i, "");

      for (const pageIdx of indices) {
        try {
          const blob = await renderPageToJpgBlob(buf, pageIdx, quality);
          const pageNum = pageIdx + 1;
          const suffix = pdfEntries.length > 1 ? `${baseName}-page-${pageNum}` : `page-${pageNum}`;
          const filename = pdfEntries.length > 1 ? `${suffix}.jpg` : `${baseName}-${suffix}.jpg`;
          allResults.push({
            blob,
            url: URL.createObjectURL(blob),
            filename,
            size: blob.size,
          });
          processedPages++;
          setConvertProgress({ current: processedPages, total: totalPages });
        } catch {
          addToast(`Failed to render page ${pageIdx + 1}`, "error");
          processedPages++;
          setConvertProgress({ current: processedPages, total: totalPages });
        }
      }
    }

    setResults(allResults);
    setIsConverting(false);
    if (allResults.length > 0) {
      addToast(`${allResults.length} page${allResults.length > 1 ? "s" : ""} converted to JPG`, "success");
    }
  }, [pdfEntries, selectedPages, quality]);

  const downloadAll = useCallback(async () => {
    if (results.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const r of results) zip.file(r.filename, r.blob);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pdf-pages.zip";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    addToast("Downloading…", "info", 1500);
  }, [results]);

  const reset = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setPdfEntries([]);
    setSelectedPages([]);
    setResults([]);
    setDownloaded(false);
    arrayBuffersRef.current = [];
    setResetKey((k) => k + 1);
  }, [results]);

  return (
    <div className="space-y-4">
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Renders each PDF page to a high-quality JPG using PDF.js. Click thumbnails to select which pages to convert.
      </div>

      {/* Drop zone */}
      <FileDropZone accept=".pdf" multiple maxSizeMB={100} onFiles={handleFiles} resetKey={resetKey} />

      {/* Loading thumbnails */}
      {isLoadingThumbs && (
        <ProcessingIndicator label={`Loading pages… (${thumbProgress.current}/${thumbProgress.total})`} />
      )}

      {/* Quality + thumbnail selection + buttons */}
      {pdfEntries.length > 0 && !isLoadingThumbs && results.length === 0 && !isConverting && (
        <div className="space-y-4">
          {/* Quality slider — compact inline card */}
          <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-4">
            <label className="text-sm font-medium shrink-0">JPG Quality</label>
            <Slider
              min={50}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              className="flex-1"
            />
            <span className="text-sm font-mono text-primary w-10 text-right shrink-0">{quality}%</span>
          </div>

          {/* Selectable thumbnail strip */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header: SELECT PAGES label + toggle + live counter */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Pages
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
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
                          className={`relative shrink-0 rounded-md overflow-hidden border-2 transition-all hover:-translate-y-px focus:outline-none ${
                            isSelected
                              ? "border-[var(--clr-accent)] shadow-[0_0_0_1px_var(--clr-accent),0_2px_8px_rgba(59,130,246,0.2)]"
                              : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={`Page ${pi + 1}`}
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

          {/* Action buttons + privacy note */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleConvert}
                disabled={totalSelected === 0}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileImage className="h-4 w-4" />
                Convert{totalSelected > 0
                  ? ` ${totalSelected} page${totalSelected !== 1 ? "s" : ""}`
                  : ""} to JPG
              </button>
              <FileXRayTrigger />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              Nothing is stored — your file is analyzed in memory only.
            </p>
          </div>
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
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/20">
            <FileImage className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {results.length} page{results.length !== 1 ? "s" : ""} converted to JPG successfully
            </p>
            <button
              onClick={reset}
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Output — {results.length} JPG image{results.length !== 1 ? "s" : ""}
              </p>
              {results.length > 1 && (
                <button
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
                    onClick={() => { setDownloaded(true); addToast("Downloading…", "info", 1500); }}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={r.filename} className="w-full object-contain bg-white" />
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-foreground">{r.filename}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(r.size)}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/80 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {results.length > 1 && (
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Download all {results.length} pages as ZIP
            </button>
          )}
          <TipJar />
          {downloaded && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/20">
              <p className="text-sm text-green-700 dark:text-green-400">Downloaded! Need to convert another PDF?</p>
              <button onClick={reset} className="ml-auto text-xs font-medium text-green-700 underline dark:text-green-400">
                Start over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
