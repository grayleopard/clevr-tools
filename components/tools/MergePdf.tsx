"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { PDFDocument } from "pdf-lib";
import { GripVertical, X, FileText } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";

interface PdfFile {
  id: string;
  file: File;
  pageCount: number;
}

export default function MergePdf() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const added: PdfFile[] = [];
    for (const file of newFiles) {
      try {
        const buf = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buf);
        added.push({
          id: Math.random().toString(36).slice(2),
          file,
          pageCount: pdfDoc.getPageCount(),
        });
      } catch {
        addToast(`Failed to load ${file.name} — is it a valid PDF?`, "error");
      }
    }
    setFiles((prev) => [...prev, ...added]);
    setResultUrl(null);
    setDownloaded(false);
  }, []);

  useAutoLoadFile(addFiles);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultUrl(null);
  }, []);

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

  const handleMerge = useCallback(async () => {
    if (files.length < 2) { addToast("Add at least 2 PDFs to merge", "info"); return; }
    setIsProcessing(true);
    try {
      const merged = await PDFDocument.create();
      for (const { file } of files) {
        const buf = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        const copied = await merged.copyPages(pdf, pdf.getPageIndices());
        copied.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
      addToast(`${files.length} PDFs merged (${totalPages} pages total)`, "success");
    } catch (err) {
      console.error(err);
      addToast("Merge failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [files, resultUrl]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setResultUrl(null);
    setResultSize(0);
    setDownloaded(false);
  }, [resultUrl]);

  const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
  const outputFilename = files.length > 0 ? "merged.pdf" : "merged.pdf";

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={addFiles} />

      <FileDropZone accept=".pdf" multiple maxSizeMB={100} onFiles={addFiles} />

      {files.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {files.length} PDF{files.length > 1 ? "s" : ""} · {totalPages} pages total · drag to reorder
            </h2>
            <button onClick={reset} className="text-xs text-muted-foreground underline hover:text-foreground">Clear all</button>
          </div>

          {/* Reorderable PDF list */}
          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-red-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{truncateFilename(f.file.name, 40)}</p>
                    <p className="text-xs text-muted-foreground">{f.pageCount} page{f.pageCount !== 1 ? "s" : ""} · {formatBytes(f.file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add more */}
          <FileDropZone accept=".pdf" multiple maxSizeMB={100} onFiles={addFiles} className="mt-2" />

          {/* Merge button */}
          {resultUrl === null && files.length >= 2 && (
            <button
              onClick={handleMerge}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Merge {files.length} PDFs
            </button>
          )}

          {files.length < 2 && (
            <p className="text-sm text-muted-foreground">Add at least 2 PDFs to merge.</p>
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

      {isProcessing && <ProcessingIndicator label="Merging PDFs…" />}

      {downloaded && (
        <PostDownloadState
          toolSlug="merge-pdf"
          resetLabel="Merge more PDFs"
          onReset={reset}
          redownloadSlot={
            resultUrl ? (
              <a href={resultUrl} download={outputFilename} className="underline hover:text-foreground transition-colors">
                Re-download merged.pdf
              </a>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
