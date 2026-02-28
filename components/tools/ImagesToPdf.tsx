"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { usePasteImage } from "@/lib/usePasteImage";
import { addToast } from "@/lib/toast";
import type { PDFDocument } from "pdf-lib";
import { GripVertical, X } from "lucide-react";

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
  return new Promise<Awaited<ReturnType<typeof pdfDoc.embedPng>>>((resolve, reject) => {
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
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        const buf = await blob.arrayBuffer();
        resolve(pdfDoc.embedPng(buf));
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export default function ImagesToPdf({ accept, toolSlug, resetLabel }: ImagesToPdfProps) {
  const [files, setFiles] = useState<OrderedFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margins, setMargins] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const ordered: OrderedFile[] = newFiles.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setFiles((prev) => [...prev, ...ordered]);
    setResultUrl(null);
    setDownloaded(false);
  }, []);

  useAutoLoadFile(addFiles);
  usePasteImage((file) => addFiles([file]));

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  // Drag-to-reorder handlers
  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null; dragOverItem.current = null; return;
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

  const handleCreate = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
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
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      addToast("PDF created successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to create PDF. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [files, pageSize, orientation, margins, resultUrl]);

  const reset = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setResultUrl(null);
    setResultSize(0);
    setDownloaded(false);
  }, [files, resultUrl]);

  const outputFilename = files.length > 0 ? `${files[0].file.name.replace(/\.[^.]+$/, "")}.pdf` : "output.pdf";

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={addFiles} />

      {/* Drop zone */}
      <FileDropZone accept={accept} multiple maxSizeMB={50} onFiles={addFiles} />

      {/* Reorderable file list */}
      {files.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{files.length} image{files.length > 1 ? "s" : ""} — drag to reorder</h2>
            <button onClick={reset} className="text-xs text-muted-foreground underline hover:text-foreground">Clear all</button>
          </div>
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
                <img src={f.previewUrl} alt={f.file.name} className="w-full rounded-lg border border-border object-contain bg-muted/20 aspect-square" />
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

          {/* Options */}
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
                <button
                  onClick={() => setMargins((m) => !m)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${margins ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                >
                  {margins ? "With margins" : "No margins"}
                </button>
              </div>
            </div>
          </div>

          {/* Create button */}
          {resultUrl === null && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Create PDF
            </button>
          )}

          {/* Result */}
          {resultUrl && (
            <DownloadCard
              href={resultUrl}
              filename={outputFilename}
              fileSize={resultSize}
              onDownload={() => setDownloaded(true)}
            />
          )}
        </div>
      )}

      {isProcessing && <ProcessingIndicator label="Creating PDF…" />}

      {/* Post-download */}
      {downloaded && (
        <PostDownloadState
          toolSlug={toolSlug}
          resetLabel={resetLabel}
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
