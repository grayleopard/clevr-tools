"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import PostDownloadState from "@/components/tool/PostDownloadState";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { usePasteImage } from "@/lib/usePasteImage";
import { addToast } from "@/lib/toast";
import type { PDFDocument } from "pdf-lib";
import { TipJar } from "@/components/tool/TipJar";
import {
  GripVertical,
  X,
  FileText,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";

type PageSize = "A4" | "Letter" | "fit";
type Orientation = "portrait" | "landscape";

interface OrderedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImagesToPdfProps {
  accept: string;
  toolSlug: string;
  resetLabel: string;
}

async function fileToEmbeddable(file: File, pdfDoc: PDFDocument) {
  const arrayBuffer = await file.arrayBuffer();
  const mime = file.type.toLowerCase();

  if (mime === "image/jpeg" || mime === "image/jpg") {
    return pdfDoc.embedJpg(arrayBuffer);
  }
  if (mime === "image/png") {
    return pdfDoc.embedPng(arrayBuffer);
  }
  // WebP and other formats: convert via canvas to PNG first
  return new Promise<Awaited<ReturnType<typeof pdfDoc.embedPng>>>(
    (resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const buf = await blob.arrayBuffer();
          resolve(pdfDoc.embedPng(buf));
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    }
  );
}

// ─── Page dimensions in points (PDF standard) ────────────────────────────────

const PAGE_DIMS = {
  A4: { w: 595, h: 842 },
  Letter: { w: 612, h: 792 },
} as const;

function getPageDims(
  pageSize: PageSize,
  orientation: Orientation
): { w: number; h: number } {
  let w: number, h: number;
  if (pageSize === "fit") {
    w = 600;
    h = 800;
  } else {
    const dims = PAGE_DIMS[pageSize];
    w = dims.w;
    h = dims.h;
  }
  if (pageSize !== "fit" && orientation === "landscape") {
    [w, h] = [h, w];
  }
  return { w, h };
}

/** CSS mockup of a single PDF page with the image positioned inside. */
function PdfPagePreview({
  file,
  pageSize,
  orientation,
  margins,
  maxH = 320,
  maxW = 280,
  showLabel = true,
}: {
  file: OrderedFile;
  pageSize: PageSize;
  orientation: Orientation;
  margins: boolean;
  maxH?: number;
  maxW?: number;
  showLabel?: boolean;
}) {
  const { w: pageW, h: pageH } = getPageDims(pageSize, orientation);
  const marginPt = margins ? 40 : 0;
  const marginPct = (marginPt / pageW) * 100;
  const marginPctV = (marginPt / pageH) * 100;
  const scale = Math.min(maxH / pageH, maxW / pageW);
  const mockupW = pageW * scale;
  const mockupH = pageH * scale;

  return (
    <div
      className="relative rounded-sm bg-white dark:bg-zinc-100 overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-300"
      style={{ width: mockupW, height: mockupH }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ padding: `${marginPctV}% ${marginPct}%` }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
      {showLabel && (
        <div className="absolute bottom-1 right-1.5 text-[9px] text-zinc-400 font-medium">
          {pageSize === "fit" ? "Fit" : `${pageSize} ${orientation}`}
        </div>
      )}
    </div>
  );
}

/** Compact single-line bar for adding more files after initial upload. */
function AddMoreBar({
  accept,
  onFiles,
}: {
  accept: string;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="rounded-lg border border-dashed border-border p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-primary transition-colors"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length) onFiles(droppedFiles);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          if (selected.length) onFiles(selected);
          e.target.value = "";
        }}
      />
      <Plus className="h-4 w-4" />
      <span>Add more files</span>
    </div>
  );
}

export default function ImagesToPdf({
  accept,
  toolSlug,
  resetLabel,
}: ImagesToPdfProps) {
  const [files, setFiles] = useState<OrderedFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margins, setMargins] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const ordered: OrderedFile[] = newFiles.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setFiles((prev) => [...prev, ...ordered]);
    setDownloaded(false);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
  }, [resultUrl]);

  useAutoLoadFile(addFiles);
  usePasteImage((file) => addFiles([file]));

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const f = prev.find((x) => x.id === id);
        if (f) URL.revokeObjectURL(f.previewUrl);
        const next = prev.filter((x) => x.id !== id);
        // Adjust preview index if needed
        if (previewIndex >= next.length && next.length > 0) {
          setPreviewIndex(next.length - 1);
        }
        return next;
      });
    },
    [previewIndex]
  );

  // Drag-to-reorder handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    ) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    setFiles((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(dragItem.current!, 1);
      copy.splice(dragOverItem.current!, 0, item);
      return copy;
    });
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDownload = useCallback(async () => {
    if (files.length === 0 || isDownloading) return;
    setIsDownloading(true);
    try {
      const { PDFDocument, PageSizes } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const margin = margins ? 40 : 0;

      for (const { file } of files) {
        const image = await fileToEmbeddable(file, pdfDoc);
        const { width: imgW, height: imgH } = image.scale(1);

        let pageW: number, pageH: number;
        if (pageSize === "A4") {
          [pageW, pageH] = PageSizes.A4;
        } else if (pageSize === "Letter") {
          [pageW, pageH] = PageSizes.Letter;
        } else {
          pageW = imgW;
          pageH = imgH;
        }

        if (pageSize !== "fit" && orientation === "landscape") {
          [pageW, pageH] = [pageH, pageW];
        }

        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;
        const scale = Math.min(availW / imgW, availH / imgH, 1);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const x = margin + (availW - drawW) / 2;
        const y = margin + (availH - drawH) / 2;

        const page = pdfDoc.addPage([pageW, pageH]);
        page.drawImage(image, { x, y, width: drawW, height: drawH });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Store for re-download
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setDownloaded(true);
      addToast("PDF downloaded", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to create PDF. Please try again.", "error");
    } finally {
      setIsDownloading(false);
    }
  }, [files, pageSize, orientation, margins, resultUrl]);

  const reset = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setResultUrl(null);
    setDownloaded(false);
    setPreviewIndex(0);
    setResetKey((k) => k + 1);
  }, [files, resultUrl]);

  const outputFilename =
    files.length > 0
      ? `${files[0].file.name.replace(/\.[^.]+$/, "")}.pdf`
      : "output.pdf";

  // Clamp preview index
  const safePreviewIndex = Math.min(
    previewIndex,
    Math.max(0, files.length - 1)
  );

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={addFiles} />

      {/* Drop zone — full when no files, hidden when files loaded */}
      {files.length === 0 && (
        <FileDropZone
          accept={accept}
          multiple
          maxSizeMB={50}
          onFiles={addFiles}
          resetKey={resetKey}
        />
      )}

      {/* Main content — shown after file upload, hidden after download */}
      {files.length > 0 && !downloaded && (
        <div className="space-y-4">
          {/* File list header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {files.length === 1
                ? `${truncateFilename(files[0].file.name, 40)} · ${formatBytes(files[0].file.size)}`
                : `${files.length} images — drag to reorder`}
            </h2>
            <button
              onClick={reset}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear all
            </button>
          </div>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {files.map((f, i) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="relative cursor-grab active:cursor-grabbing group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.previewUrl}
                  alt={f.file.name}
                  className="w-full rounded-lg border border-border object-contain bg-muted/20 aspect-square"
                />
                <div className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
                  {i + 1}
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>

          {/* Add more files — compact bar */}
          <AddMoreBar accept={accept} onFiles={addFiles} />

          {/* Settings */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page size</label>
                <div className="flex gap-1.5">
                  {(["A4", "Letter", "fit"] as PageSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPageSize(s)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${pageSize === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                    >
                      {s === "fit" ? "Fit image" : s}
                    </button>
                  ))}
                </div>
              </div>
              {pageSize !== "fit" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Orientation</label>
                  <div className="flex gap-1.5">
                    {(["portrait", "landscape"] as Orientation[]).map((o) => (
                      <button
                        key={o}
                        onClick={() => setOrientation(o)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors capitalize ${orientation === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Margins</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setMargins(true)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${margins ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    On
                  </button>
                  <button
                    onClick={() => setMargins(false)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${!margins ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col items-center gap-3">
            <PdfPagePreview
              file={files[safePreviewIndex]}
              pageSize={pageSize}
              orientation={orientation}
              margins={margins}
            />

            {/* Page navigation for multi-file */}
            {files.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setPreviewIndex((i) => Math.max(0, i - 1))
                  }
                  disabled={safePreviewIndex === 0}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Page {safePreviewIndex + 1} of {files.length}
                </span>
                <button
                  onClick={() =>
                    setPreviewIndex((i) =>
                      Math.min(files.length - 1, i + 1)
                    )
                  }
                  disabled={safePreviewIndex === files.length - 1}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Download bar — generates PDF on click */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-primary/25 bg-primary/5 px-5 py-4 transition-all hover:border-primary/50 hover:bg-primary/10 active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
              <span className="truncate text-sm font-semibold text-foreground">
                {truncateFilename(outputFilename, 35)}
              </span>
              <span className="text-xs text-muted-foreground">
                {files.length} page{files.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all group-hover:opacity-90 group-hover:shadow-md">
              <Download className="h-4 w-4" />
              <span>{isDownloading ? "Generating…" : "Download"}</span>
            </div>
          </button>

          <TipJar />
        </div>
      )}

      {/* Post-download */}
      {downloaded && (
        <>
          <PostDownloadState
            toolSlug={toolSlug}
            resetLabel={resetLabel}
            onReset={reset}
            redownloadSlot={
              resultUrl ? (
                <a
                  href={resultUrl}
                  download={outputFilename}
                  className="underline hover:text-foreground transition-colors"
                >
                  Re-download {truncateFilename(outputFilename, 28)}
                </a>
              ) : undefined
            }
          />
          <TipJar />
        </>
      )}
    </div>
  );
}
