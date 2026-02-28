"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { renderPageThumbnail, renderAllThumbnails, renderPageToJpgBlob, parsePageRange } from "@/lib/pdf-utils";
import { Slider } from "@/components/ui/slider";
import { Download, Package, FileImage, RotateCcw } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";

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
  const [pageRange, setPageRange] = useState("all");
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfEntries, setPdfEntries] = useState<PdfEntry[]>([]);
  const [results, setResults] = useState<PageResult[]>([]);
  const [thumbProgress, setThumbProgress] = useState({ current: 0, total: 0 });
  const [convertProgress, setConvertProgress] = useState({ current: 0, total: 0 });
  const [downloaded, setDownloaded] = useState(false);
  const arrayBuffersRef = useRef<ArrayBuffer[]>([]);

  const handleFiles = useCallback(async (files: File[]) => {
    setIsLoadingThumbs(true);
    setPdfEntries([]);
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

    // Count total pages first
    for (let fi = 0; fi < pdfEntries.length; fi++) {
      const indices = parsePageRange(pageRange, pdfEntries[fi].pageCount);
      totalPages += indices.length;
    }
    setConvertProgress({ current: 0, total: totalPages });

    for (let fi = 0; fi < pdfEntries.length; fi++) {
      const entry = pdfEntries[fi];
      const buf = arrayBuffersRef.current[fi];
      const indices = parsePageRange(pageRange, entry.pageCount);
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
  }, [pdfEntries, pageRange, quality]);

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
    setResults([]);
    setDownloaded(false);
    arrayBuffersRef.current = [];
  }, [results]);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Renders each PDF page to a high-quality JPG using PDF.js. Select a page range and quality before converting.
      </div>

      {/* Drop zone */}
      <FileDropZone accept=".pdf" multiple maxSizeMB={100} onFiles={handleFiles} />

      {/* Options */}
      {pdfEntries.length > 0 && !isConverting && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">JPG Quality</label>
              <span className="text-sm font-mono text-primary">{quality}%</span>
            </div>
            <Slider min={50} max={100} step={1} value={[quality]} onValueChange={([v]) => setQuality(v)} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Page Range</label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="all · 1-3 · 1,3,5 · 2-4,7"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Examples: <code className="bg-muted px-1 rounded">all</code> · <code className="bg-muted px-1 rounded">1-5</code> · <code className="bg-muted px-1 rounded">1,3,7</code> · <code className="bg-muted px-1 rounded">1-3,5,8-10</code>
            </p>
          </div>
        </div>
      )}

      {/* Thumbnails grid */}
      {isLoadingThumbs && (
        <ProcessingIndicator label={`Loading pages… (${thumbProgress.current}/${thumbProgress.total})`} />
      )}

      {pdfEntries.length > 0 && !isLoadingThumbs && results.length === 0 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Input — {pdfEntries.reduce((s, e) => s + e.pageCount, 0)} page{pdfEntries.reduce((s, e) => s + e.pageCount, 0) !== 1 ? "s" : ""} loaded
              </p>
            </div>
            <div className="p-4 space-y-4">
              {pdfEntries.map((entry, fi) => (
                <div key={fi} className="space-y-3">
                  {pdfEntries.length > 1 && (
                    <p className="text-sm font-semibold">{truncateFilename(entry.file.name, 40)} — {entry.pageCount} pages</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {entry.thumbnails.map((thumb, pi) => (
                      <div key={pi} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={`Page ${pi + 1}`} className="w-full rounded-md border border-border object-contain bg-white" />
                        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">{pi + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleConvert}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <FileImage className="h-4 w-4" />
            Convert to JPG
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
