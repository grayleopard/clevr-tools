"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { TipJar } from "@/components/tool/TipJar";
import { ArrowDown, ArrowUp, FileText, GripVertical, X } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";
import {
  trackSafeToolDuration,
  trackSafeToolEvent,
  trackSafeToolFailure,
} from "@/lib/analytics/safe-tool-events";

interface PdfFile {
  id: string;
  file: File;
  pageCount: number;
}

function createPdfId(sequence: number): string {
  return `pdf-${sequence}`;
}

export default function MergePdf() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const inputRunRef = useRef(0);
  const mergeRunRef = useRef(0);
  const nextPdfIdRef = useRef(0);

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResultUrl(null);
    setResultSize(0);
  }, []);

  useEffect(() => {
    trackSafeToolEvent("merge-pdf", "opened");
  }, []);

  useEffect(() => {
    return () => {
      inputRunRef.current += 1;
      mergeRunRef.current += 1;
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    };
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const runId = ++inputRunRef.current;
    mergeRunRef.current += 1;
    clearResult();
    setDownloaded(false);
    setIsProcessing(false);

    const added: PdfFile[] = [];
    let invalidCount = 0;

    for (const file of newFiles) {
      if (runId !== inputRunRef.current) return;

      try {
        const buffer = await file.arrayBuffer();
        const { PDFDocument } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.load(buffer, { updateMetadata: false });
        const pageCount = pdfDoc.getPageCount();
        if (pageCount < 1) throw new Error("PDF has no pages");
        if (runId !== inputRunRef.current) return;

        nextPdfIdRef.current += 1;
        added.push({
          id: createPdfId(nextPdfIdRef.current),
          file,
          pageCount,
        });
      } catch {
        invalidCount += 1;
        if (runId !== inputRunRef.current) return;
      }
    }

    if (runId !== inputRunRef.current) return;
    if (added.length > 0) {
      setFiles((previous) => [...previous, ...added]);
      trackSafeToolEvent("merge-pdf", "valid_input");
    }
    if (invalidCount > 0) {
      trackSafeToolFailure("merge-pdf", "invalid_input");
      addToast(
        `${invalidCount} PDF${invalidCount === 1 ? " couldn't" : "s couldn't"} be read. Check for password protection or file damage.`,
        "error"
      );
    }
  }, [clearResult]);

  useAutoLoadFile(addFiles);

  const removeFile = useCallback((id: string) => {
    inputRunRef.current += 1;
    mergeRunRef.current += 1;
    clearResult();
    setDownloaded(false);
    setFiles((previous) => previous.filter((file) => file.id !== id));
  }, [clearResult]);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    mergeRunRef.current += 1;
    clearResult();
    setDownloaded(false);
    setFiles((previous) => {
      if (fromIndex >= previous.length || toIndex >= previous.length) return previous;
      const reordered = [...previous];
      const [file] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, file);
      return reordered;
    });
  }, [clearResult]);

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    const fromIndex = dragItem.current;
    const toIndex = dragOverItem.current;
    dragItem.current = null;
    dragOverItem.current = null;
    if (fromIndex === null || toIndex === null) return;
    reorderFiles(fromIndex, toIndex);
  }, [reorderFiles]);

  const handleMerge = useCallback(async () => {
    if (files.length < 2 || isProcessing) return;
    const runId = ++mergeRunRef.current;
    const filesToMerge = [...files];
    const startedAt = performance.now();
    let committed = false;

    clearResult();
    setIsProcessing(true);
    setDownloaded(false);
    trackSafeToolEvent("merge-pdf", "started");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      let expectedPages = 0;

      for (const { file } of filesToMerge) {
        if (runId !== mergeRunRef.current) return;
        const inputBytes = await file.arrayBuffer();
        const inputPdf = await PDFDocument.load(inputBytes, { updateMetadata: false });
        const pageIndices = inputPdf.getPageIndices();
        if (pageIndices.length === 0) throw new Error("PDF has no pages");
        const copiedPages = await merged.copyPages(inputPdf, pageIndices);
        copiedPages.forEach((page) => merged.addPage(page));
        expectedPages += copiedPages.length;
      }

      const outputBytes = await merged.save({ useObjectStreams: true, addDefaultPage: false });
      if (runId !== mergeRunRef.current) return;

      // Independently reopen the emitted PDF before exposing it for download.
      const verifiedOutput = await PDFDocument.load(outputBytes.slice(0), {
        updateMetadata: false,
      });
      if (verifiedOutput.getPageCount() !== expectedPages) {
        throw new Error("Merged page count did not match inputs");
      }

      const blob = new Blob([outputBytes.slice().buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      if (blob.size === 0) throw new Error("Empty merged PDF");
      if (runId !== mergeRunRef.current) return;

      const url = URL.createObjectURL(blob);
      if (runId !== mergeRunRef.current) {
        URL.revokeObjectURL(url);
        return;
      }

      resultUrlRef.current = url;
      setResultUrl(url);
      setResultSize(blob.size);
      trackSafeToolEvent("merge-pdf", "succeeded");
      trackSafeToolDuration("merge-pdf", performance.now() - startedAt);
      committed = true;
    } catch {
      if (runId === mergeRunRef.current) {
        trackSafeToolFailure("merge-pdf", "processing");
        addToast("We couldn't merge these PDFs. Check that each selected file is readable.", "error");
      }
    } finally {
      if (runId === mergeRunRef.current) setIsProcessing(false);
      if (!committed && runId === mergeRunRef.current) clearResult();
    }
  }, [clearResult, files, isProcessing]);

  const markDownloaded = useCallback(() => {
    setDownloaded(true);
    trackSafeToolEvent("merge-pdf", "download");
  }, []);

  const reset = useCallback(() => {
    const hadOutput = Boolean(resultUrlRef.current) || downloaded;
    inputRunRef.current += 1;
    mergeRunRef.current += 1;
    clearResult();
    setFiles([]);
    setIsProcessing(false);
    setDownloaded(false);
    setResetKey((key) => key + 1);
    if (hadOutput) trackSafeToolEvent("merge-pdf", "process_another");
  }, [clearResult, downloaded]);

  const totalPages = files.reduce((sum, file) => sum + file.pageCount, 0);
  const outputFilename = "merged.pdf";

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={addFiles} />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isProcessing
          ? "Merging PDFs"
          : resultUrl
            ? "Merged PDF ready to download"
            : files.length > 0
              ? `${files.length} PDF${files.length === 1 ? "" : "s"} in merge order`
              : ""}
      </p>

      <FileDropZone
        accept=".pdf"
        multiple
        maxSizeMB={100}
        onFiles={addFiles}
        resetKey={resetKey}
        compact={files.length > 0}
      />

      {files.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-sm font-semibold">
                {files.length === 1
                  ? `${truncateFilename(files[0].file.name, 48)} · ${files[0].pageCount} page${files[0].pageCount !== 1 ? "s" : ""}`
                  : `${files.length} PDFs · ${totalPages} pages total`}
              </h2>
              {files.length > 1 ? (
                <p id="merge-order-help" className="mt-1 text-xs text-muted-foreground">
                  Merge order is top to bottom. Drag rows or use the move buttons.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 shrink-0 px-2 text-xs text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2" role="list" aria-describedby={files.length > 1 ? "merge-order-help" : undefined}>
            {files.map((file, index) => (
              <div
                key={file.id}
                role="listitem"
                draggable={files.length > 1}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(event) => event.preventDefault()}
                className="group flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/30 sm:gap-3 sm:px-4 sm:py-3"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {truncateFilename(file.file.name, 40)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.pageCount} page{file.pageCount !== 1 ? "s" : ""} · {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => reorderFiles(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move PDF ${index + 1} up`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderFiles(index, index + 1)}
                    disabled={index === files.length - 1}
                    aria-label={`Move PDF ${index + 1} down`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    aria-label={`Remove PDF ${index + 1}`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {resultUrl === null && files.length >= 2 ? (
            <button
              type="button"
              onClick={handleMerge}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Merge {files.length} PDFs
            </button>
          ) : null}

          {files.length < 2 ? (
            <p className="text-sm text-muted-foreground">Add one more PDF to merge.</p>
          ) : null}

          {resultUrl ? (
            <>
              <DownloadCard
                href={resultUrl}
                filename={outputFilename}
                fileSize={resultSize}
                onDownload={markDownloaded}
              />
              <TipJar />
            </>
          ) : null}
        </div>
      )}

      {isProcessing ? <ProcessingIndicator label="Merging PDFs…" /> : null}

      {downloaded ? (
        <>
          <PostDownloadState
            toolSlug="merge-pdf"
            resetLabel="Merge more PDFs"
            onReset={reset}
            redownloadSlot={
              resultUrl ? (
                <a
                  href={resultUrl}
                  download={outputFilename}
                  onClick={markDownloaded}
                  className="underline transition-colors hover:text-foreground"
                >
                  Re-download merged.pdf
                </a>
              ) : undefined
            }
          />
          <TipJar />
        </>
      ) : null}
    </div>
  );
}
