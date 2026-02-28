"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { renderAllThumbnails } from "@/lib/pdf-utils";

import { RotateCw } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface PageState {
  thumbnail: string;
  additionalRotation: number; // 0, 90, 180, 270 (added on top of existing PDF rotation)
}

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageState[]>([]);
  const [existingRotations, setExistingRotations] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setIsLoading(true);
    setFile(f);
    setPages([]);
    setResultUrl(null);
    setDownloaded(false);
    try {
      const buf = await f.arrayBuffer();
      arrayBufferRef.current = buf;

      // Get existing rotations from pdf-lib
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(buf.slice(0));
      const existing = pdfDoc.getPages().map((p) => p.getRotation().angle);
      setExistingRotations(existing);

      // Render thumbnails with pdfjs (respects existing rotations)
      const thumbs = await renderAllThumbnails(buf, 0.35);
      setPages(thumbs.map((thumbnail) => ({ thumbnail, additionalRotation: 0 })));
    } catch {
      addToast("Failed to load PDF", "error");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useAutoLoadFile(handleFiles);

  const rotatePage = useCallback((index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        additionalRotation: (copy[index].additionalRotation + 90) % 360,
      };
      return copy;
    });
    setResultUrl(null);
  }, []);

  const rotateAll = useCallback((angle: 90 | 180 | 270) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        additionalRotation: (p.additionalRotation + angle) % 360,
      }))
    );
    setResultUrl(null);
  }, []);

  const resetRotations = useCallback(() => {
    setPages((prev) => prev.map((p) => ({ ...p, additionalRotation: 0 })));
    setResultUrl(null);
  }, []);

  const handleApply = useCallback(async () => {
    if (!file || !arrayBufferRef.current || pages.length === 0) return;
    setIsProcessing(true);
    try {
      const buf = arrayBufferRef.current;
      const { PDFDocument, degrees } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(buf.slice(0));
      const pdfPages = pdfDoc.getPages();

      pdfPages.forEach((page, i) => {
        const existing = existingRotations[i] ?? 0;
        const additional = pages[i]?.additionalRotation ?? 0;
        const totalRotation = (existing + additional) % 360;
        page.setRotation(degrees(totalRotation));
      });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);

      const rotatedCount = pages.filter((p) => p.additionalRotation !== 0).length;
      addToast(`${rotatedCount} page${rotatedCount !== 1 ? "s" : ""} rotated`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to apply rotations", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [file, pages, existingRotations, resultUrl]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPages([]);
    setExistingRotations([]);
    setResultUrl(null);
    setResultSize(0);
    setDownloaded(false);
    arrayBufferRef.current = null;
  }, [resultUrl]);

  const outputFilename = file ? file.name.replace(/\.pdf$/i, "-rotated.pdf") : "rotated.pdf";
  const hasRotations = pages.some((p) => p.additionalRotation !== 0);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <FileDropZone accept=".pdf" multiple={false} maxSizeMB={100} onFiles={handleFiles} />

      {isLoading && <ProcessingIndicator label="Loading PDF pages…" />}

      {pages.length > 0 && !isLoading && !downloaded && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{file?.name}</span>
            <span>·</span>
            <span>{pages.length} pages</span>
            <span>·</span>
            <span>{formatBytes(file?.size ?? 0)}</span>
          </div>

          {/* Bulk rotation controls */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">Rotate all pages:</span>
            <button
              onClick={() => rotateAll(90)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" /> 90° CW
            </button>
            <button
              onClick={() => rotateAll(180)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              180°
            </button>
            <button
              onClick={() => rotateAll(270)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5 -scale-x-100" /> 90° CCW
            </button>
            {hasRotations && (
              <button
                onClick={resetRotations}
                className="text-xs text-muted-foreground underline hover:text-foreground ml-auto"
              >
                Reset all
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Click any page to rotate it 90° clockwise. Current angle shown on each page.</p>

          {/* Page grid */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {pages.map((page, i) => (
              <button
                key={i}
                onClick={() => rotatePage(i)}
                className="group relative flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-2 transition-all hover:border-primary/40 hover:bg-primary/5"
                title={`Click to rotate page ${i + 1} 90° CW`}
              >
                <div
                  className="w-full overflow-hidden rounded-md bg-white"
                  style={{
                    transform: `rotate(${page.additionalRotation}deg)`,
                    transformOrigin: "center",
                    transition: "transform 0.2s ease",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.thumbnail} alt={`Page ${i + 1}`} className="w-full object-contain" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">{i + 1}</span>
                  {page.additionalRotation !== 0 && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                      {page.additionalRotation}°
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                  <RotateCw className="h-3 w-3 text-primary" />
                </div>
              </button>
            ))}
          </div>

          {/* Apply button */}
          {resultUrl === null && (
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              Apply Rotations &amp; Save PDF
            </button>
          )}

          {isProcessing && <ProcessingIndicator label="Applying rotations…" />}

          {resultUrl && !isProcessing && (
            <DownloadCard
              href={resultUrl}
              filename={outputFilename}
              fileSize={resultSize}
              originalSize={file?.size}
              onDownload={() => setDownloaded(true)}
            />
          )}
        </div>
      )}

      {downloaded && (
        <PostDownloadState
          toolSlug="rotate-pdf"
          resetLabel="Rotate another PDF"
          onReset={reset}
          redownloadSlot={
            resultUrl ? (
              <a href={resultUrl} download={outputFilename} className="underline hover:text-foreground transition-colors">
                Re-download {outputFilename}
              </a>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
