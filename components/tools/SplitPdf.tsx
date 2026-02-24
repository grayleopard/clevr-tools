"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { renderAllThumbnails, parsePageRange } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Download, Package, RotateCcw, CheckSquare, Square } from "lucide-react";
import { formatBytes } from "@/lib/utils";

type SplitMode = "all" | "range" | "specific";

interface PageResult {
  blob: Blob;
  url: string;
  filename: string;
  size: number;
  pageNum: number;
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [mode, setMode] = useState<SplitMode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [results, setResults] = useState<PageResult[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setIsLoading(true);
    setFile(f);
    setResults([]);
    setDownloaded(false);
    setSelectedPages(new Set());
    try {
      const buf = await f.arrayBuffer();
      arrayBufferRef.current = buf;
      const pdfDoc = await PDFDocument.load(buf.slice(0));
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      const thumbs = await renderAllThumbnails(buf, 0.3);
      setThumbnails(thumbs);
    } catch {
      addToast("Failed to load PDF", "error");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useAutoLoadFile(handleFiles);

  const togglePage = useCallback((index: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleSplit = useCallback(async () => {
    if (!file || !arrayBufferRef.current) return;
    setIsSplitting(true);
    setResults([]);

    try {
      const buf = arrayBufferRef.current;
      const srcDoc = await PDFDocument.load(buf.slice(0));
      const baseName = file.name.replace(/\.pdf$/i, "");

      let pageIndices: number[];
      if (mode === "all") {
        pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      } else if (mode === "range") {
        pageIndices = parsePageRange(rangeInput, pageCount);
        if (pageIndices.length === 0) {
          addToast("No valid pages in range", "error");
          setIsSplitting(false);
          return;
        }
      } else {
        pageIndices = Array.from(selectedPages).sort((a, b) => a - b);
        if (pageIndices.length === 0) {
          addToast("Select at least one page", "info");
          setIsSplitting(false);
          return;
        }
      }

      const pageResults: PageResult[] = [];
      for (const idx of pageIndices) {
        const newDoc = await PDFDocument.create();
        const [copied] = await newDoc.copyPages(srcDoc, [idx]);
        newDoc.addPage(copied);
        const bytes = await newDoc.save();
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const pageNum = idx + 1;
        pageResults.push({
          blob,
          url: URL.createObjectURL(blob),
          filename: `${baseName}-page-${pageNum}.pdf`,
          size: blob.size,
          pageNum,
        });
      }

      setResults(pageResults);
      addToast(`${pageResults.length} page${pageResults.length > 1 ? "s" : ""} extracted`, "success");
    } catch (err) {
      console.error(err);
      addToast("Split failed. Please try again.", "error");
    } finally {
      setIsSplitting(false);
    }
  }, [file, mode, pageCount, rangeInput, selectedPages]);

  const downloadAll = useCallback(async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    for (const r of results) zip.file(r.filename, r.blob);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, "")}-pages.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    addToast("Downloading…", "info", 1500);
  }, [results, file]);

  const reset = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFile(null);
    setPageCount(0);
    setThumbnails([]);
    setResults([]);
    setDownloaded(false);
    setSelectedPages(new Set());
    arrayBufferRef.current = null;
  }, [results]);

  const rangePageCount = mode === "range" && rangeInput ? parsePageRange(rangeInput, pageCount).length : 0;

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <FileDropZone accept=".pdf" multiple={false} maxSizeMB={100} onFiles={handleFiles} />

      {isLoading && <ProcessingIndicator label="Loading PDF pages…" />}

      {file && thumbnails.length > 0 && !isLoading && results.length === 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{file.name}</span>
            <span>·</span>
            <span>{pageCount} pages</span>
            <span>·</span>
            <span>{formatBytes(file.size)}</span>
          </div>

          {/* Mode selector */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <label className="text-sm font-medium">Split mode</label>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "all", label: "All pages (one per PDF)" },
                { id: "range", label: "Page range" },
                { id: "specific", label: "Select specific pages" },
              ] as { id: SplitMode; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${mode === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === "range" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder={`e.g. 1-3, 5, 7-${Math.min(9, pageCount)}`}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                />
                {rangePageCount > 0 && (
                  <p className="text-xs text-muted-foreground">{rangePageCount} page{rangePageCount > 1 ? "s" : ""} selected</p>
                )}
              </div>
            )}
          </div>

          {/* Page thumbnail grid (for specific mode — all modes show thumbnails) */}
          <div className="space-y-3">
            {mode === "specific" && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">{selectedPages.size} page{selectedPages.size !== 1 ? "s" : ""} selected — click to toggle</p>
                <button
                  onClick={() => setSelectedPages(selectedPages.size === pageCount ? new Set() : new Set(Array.from({ length: pageCount }, (_, i) => i)))}
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  {selectedPages.size === pageCount ? <Square className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
                  {selectedPages.size === pageCount ? "Deselect all" : "Select all"}
                </button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {thumbnails.map((thumb, i) => {
                const isSelected = mode === "specific" && selectedPages.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => mode === "specific" && togglePage(i)}
                    className={`relative rounded-md overflow-hidden border-2 transition-all ${
                      mode === "specific"
                        ? isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-primary/40 cursor-pointer"
                        : "border-transparent cursor-default"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={`Page ${i + 1}`} className="w-full object-contain bg-white" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">{i + 1}</span>
                    {isSelected && (
                      <div className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                        <CheckSquare className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSplit}
            disabled={isSplitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            Split PDF
          </button>
        </div>
      )}

      {isSplitting && <ProcessingIndicator label="Splitting PDF…" />}

      {results.length > 0 && !isSplitting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{results.length} page PDF{results.length > 1 ? "s" : ""} created</h2>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <a
                key={i}
                href={r.url}
                download={r.filename}
                onClick={() => { setDownloaded(true); addToast("Downloading…", "info", 1500); }}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {r.pageNum}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{r.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(r.size)}</p>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
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
          {downloaded && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/20">
              <p className="text-sm text-green-700 dark:text-green-400">Downloaded!</p>
              <button onClick={reset} className="ml-auto text-xs font-medium text-green-700 underline dark:text-green-400">Start over</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
