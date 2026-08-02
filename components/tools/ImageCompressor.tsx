"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { usePasteImage } from "@/lib/usePasteImage";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { Slider } from "@/components/ui/slider";
import { compressImage, type ImageOutputFormat } from "@/lib/processors";
import { addToast } from "@/lib/toast";
import { formatBytes, truncateFilename } from "@/lib/utils";
import { TipJar } from "@/components/tool/TipJar";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { getRelatedTools, getToolBySlug } from "@/lib/tools";
import {
  trackSafeToolDuration,
  trackSafeToolEvent,
  trackSafeToolFailure,
} from "@/lib/analytics/safe-tool-events";
import { Download, Package, RotateCcw } from "lucide-react";

interface CompressedFile {
  file: File;
  originalFile: File;
  originalUrl: string;
  url: string;
  width: number;
  height: number;
}

const tool = getToolBySlug("image-compressor")!;
const relatedTools = getRelatedTools(tool).map((relatedTool) => ({
  name: relatedTool.name,
  href: relatedTool.route,
}));

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function readImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Failed to load image dimensions"));
    image.src = src;
  });
}

function formatOutputFormat(fmt: ImageOutputFormat): string {
  return fmt === "original" ? "Keep original" : fmt.toUpperCase();
}

function revokeCompressedFiles(files: CompressedFile[]): void {
  files.forEach((result) => {
    URL.revokeObjectURL(result.url);
    URL.revokeObjectURL(result.originalUrl);
  });
}

function getOutputStem(filename: string, fallback: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, "").trim();
  return withoutExtension && withoutExtension !== "." ? withoutExtension : fallback;
}

function createCompressedFilename(
  originalName: string,
  extension: string,
  usedNames: Set<string>
): string {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const base = `${getOutputStem(originalName, "image")}-compressed`;
  let suffix = 1;
  let filename = `${base}.${safeExtension}`;

  while (usedNames.has(filename.toLocaleLowerCase())) {
    suffix += 1;
    filename = `${base}-${suffix}.${safeExtension}`;
  }

  usedNames.add(filename.toLocaleLowerCase());
  return filename;
}

export default function ImageCompressor() {
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("original");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CompressedFile[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [lastProcessMs, setLastProcessMs] = useState<number | null>(null);

  const sourceFilesRef = useRef<File[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<CompressedFile[]>([]);
  const processRunRef = useRef(0);

  const clearResults = useCallback(() => {
    revokeCompressedFiles(resultsRef.current);
    resultsRef.current = [];
    setResults([]);
  }, []);

  useEffect(() => {
    trackSafeToolEvent("image-compressor", "opened");
  }, []);

  const compress = useCallback(
    async (files: File[], q: number, fmt: ImageOutputFormat) => {
      if (files.length === 0) return;
      const runId = ++processRunRef.current;
      const startedAt = performance.now();

      clearResults();
      setIsProcessing(true);
      setLastProcessMs(null);
      setDownloaded(false);
      trackSafeToolEvent("image-compressor", "started");

      const compressed: CompressedFile[] = [];
      const usedNames = new Set<string>();
      let validInputRecorded = false;
      let failedCount = 0;
      let committed = false;

      try {
        await waitForNextPaint();
        if (runId !== processRunRef.current) return;

        for (const originalFile of files) {
          if (runId !== processRunRef.current) return;

          let originalUrl: string | null = null;
          let outputUrl: string | null = null;

          try {
            originalUrl = URL.createObjectURL(originalFile);
            await readImageDimensions(originalUrl);
            if (!validInputRecorded) {
              trackSafeToolEvent("image-compressor", "valid_input");
              validInputRecorded = true;
            }

            const { blob, ext, mimeType } = await compressImage(originalFile, q, fmt);
            if (blob.size === 0) throw new Error("Empty compression output");

            const filename = createCompressedFilename(originalFile.name, ext, usedNames);
            const newFile = new File([blob], filename, { type: mimeType });
            outputUrl = URL.createObjectURL(newFile);
            const { width, height } = await readImageDimensions(outputUrl);

            if (runId !== processRunRef.current) return;

            compressed.push({
              file: newFile,
              originalFile,
              originalUrl,
              url: outputUrl,
              width,
              height,
            });
            originalUrl = null;
            outputUrl = null;
          } catch {
            failedCount += 1;
            if (runId !== processRunRef.current) return;
          } finally {
            // URLs are transferred to `compressed` only after both previews
            // validate. A stale run can return before that handoff.
            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (outputUrl) URL.revokeObjectURL(outputUrl);
          }
        }

        if (runId !== processRunRef.current) return;

        const duration = performance.now() - startedAt;
        if (failedCount > 0) {
          trackSafeToolFailure("image-compressor", "processing");
        }

        if (compressed.length === 0) {
          addToast("We couldn't compress these images. Try a JPG, PNG, or WebP file.", "error");
          return;
        }

        resultsRef.current = compressed;
        setResults(compressed);
        setLastProcessMs(Math.round(duration));
        trackSafeToolEvent("image-compressor", "succeeded");
        trackSafeToolDuration("image-compressor", duration);
        committed = true;

        if (failedCount > 0) {
          addToast(
            `${failedCount} image${failedCount === 1 ? "" : "s"} couldn't be compressed. The remaining output is ready.`,
            "info"
          );
        }
      } catch {
        if (runId === processRunRef.current) {
          trackSafeToolFailure("image-compressor", "processing");
          addToast("Compression couldn't finish. Try again with a supported image.", "error");
        }
      } finally {
        if (!committed) revokeCompressedFiles(compressed);
        if (runId === processRunRef.current) setIsProcessing(false);
      }
    },
    [clearResults]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      sourceFilesRef.current = files;
      setHasSelection(files.length > 0);
      setDownloaded(false);
      void compress(files, quality, outputFormat);
    },
    [quality, outputFormat, compress]
  );

  useAutoLoadFile(handleFiles);
  usePasteImage((file) => handleFiles([file]));

  useEffect(() => {
    if (sourceFilesRef.current.length === 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void compress(sourceFilesRef.current, quality, outputFormat);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [quality, outputFormat, compress]);

  useEffect(() => {
    return () => {
      processRunRef.current += 1;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      revokeCompressedFiles(resultsRef.current);
      resultsRef.current = [];
    };
  }, []);

  const handleClipboardPaste = useCallback(async () => {
    if (!navigator.clipboard?.read) {
      addToast("Clipboard access is limited here — paste manually with Ctrl+V", "info");
      return;
    }

    try {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;

        const blob = await item.getType(imageType);
        const extension =
          imageType.split("/").pop() === "jpeg"
            ? "jpg"
            : imageType.split("/").pop() ?? "png";
        handleFiles([new File([blob], `clipboard.${extension}`, { type: imageType })]);
        addToast("Image pasted from clipboard", "success");
        return;
      }

      addToast("No image found in clipboard — paste manually with Ctrl+V if needed", "info");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, [handleFiles]);

  const downloadAll = useCallback(async () => {
    if (results.length <= 1) return;
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const { file } of results) zip.file(file.name, file);
      const blob = await zip.generateAsync({ type: "blob" });
      if (blob.size === 0) throw new Error("Empty ZIP output");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "compressed-images.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setDownloaded(true);
      trackSafeToolEvent("image-compressor", "download");
    } catch {
      trackSafeToolFailure("image-compressor", "download");
      addToast("Couldn't create the ZIP. Download the images individually instead.", "error");
    }
  }, [results]);

  const markDownloaded = useCallback(() => {
    setDownloaded(true);
    trackSafeToolEvent("image-compressor", "download");
  }, []);

  const reset = useCallback(() => {
    const hadOutput = resultsRef.current.length > 0 || downloaded;
    processRunRef.current += 1;
    clearResults();
    setDownloaded(false);
    setHasSelection(false);
    setLastProcessMs(null);
    sourceFilesRef.current = [];
    setResetKey((key) => key + 1);
    if (hadOutput) trackSafeToolEvent("image-compressor", "process_another");
  }, [clearResults, downloaded]);

  const totalOriginalSize = results.reduce((sum, result) => sum + result.originalFile.size, 0);
  const totalCompressedSize = results.reduce((sum, result) => sum + result.file.size, 0);
  const bytesSaved = Math.max(0, totalOriginalSize - totalCompressedSize);
  const savedPercent =
    totalOriginalSize > 0
      ? Math.max(0, Math.round((1 - totalCompressedSize / totalOriginalSize) * 100))
      : 0;
  const primaryResult = results[0] ?? null;

  const settingsPanel = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Quality</label>
          <span className="text-sm font-mono text-primary">{quality}%</span>
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[quality]}
          onValueChange={([value]) => setQuality(value)}
          aria-label="Compression quality"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Output format</label>
        <div className="grid grid-cols-1 gap-2">
          {(["original", "jpeg", "webp"] as ImageOutputFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setOutputFormat(fmt)}
              aria-pressed={outputFormat === fmt}
              className={`border px-3 py-2 text-left text-sm font-medium transition-colors ${
                outputFormat === fmt
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[color:var(--ghost-border)] bg-card/75 text-muted-foreground hover:border-primary/35 hover:text-foreground"
              }`}
            >
              {formatOutputFormat(fmt)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Quick presets</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Export</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setQuality(80)}
            className="border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Web (80)
          </button>
          <button
            type="button"
            onClick={() => setQuality(95)}
            className="border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Ultra (95)
          </button>
        </div>
      </div>

      {primaryResult ? (
        <div className="border-t border-[color:var(--ghost-border)] bg-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Output details
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Format</dt>
              <dd className="font-medium text-foreground">
                {primaryResult.file.type.replace("image/", "").toUpperCase()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Dimensions</dt>
              <dd className="font-medium text-foreground">
                {primaryResult.width} × {primaryResult.height}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Files</dt>
              <dd className="font-medium text-foreground">
                {results.length}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );

  const infoPanel = (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground">
      <p>
        Use WebP when the output is headed for the web. Stay with the original format when
        you need the safest compatibility with an existing workflow.
      </p>
      <div className="border-l-2 border-primary bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Local processing
        </p>
        <p className="mt-3">
          Compression runs in this browser. Your images are not uploaded for this tool.
        </p>
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      categoryName="Files & Assets"
      categoryHref="/files"
      relatedTools={relatedTools}
      settingsPanel={settingsPanel}
      infoPanel={infoPanel}
      privacyContext="files"
    >
      <div className="space-y-6">
        <PageDragOverlay onFiles={handleFiles} />

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isProcessing
            ? "Compressing images"
            : results.length > 0
              ? `${results.length} image${results.length === 1 ? "" : "s"} ready to download`
              : ""}
        </p>

        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          maxSizeMB={50}
          onFiles={handleFiles}
          resetKey={resetKey}
          compact={hasSelection}
          onPasteClipboard={() => {
            void handleClipboardPaste();
          }}
        />

        {isProcessing ? <ProcessingIndicator label="Compressing images…" /> : null}

        {results.length > 0 && !isProcessing ? (
          <>
            {results.length === 1 && primaryResult ? (
              <section className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="relative overflow-hidden border border-[color:var(--ghost-border)] bg-muted/45 p-4">
                    <span className="absolute left-7 top-7 z-10 border border-foreground bg-foreground/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-background tabular-nums">
                      Original ({formatBytes(primaryResult.originalFile.size)})
                    </span>
                    <div className="flex h-[320px] items-center justify-center border border-[color:var(--ghost-border)] bg-card/80">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                      <img
                        src={primaryResult.originalUrl}
                        alt={primaryResult.originalFile.name}
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {truncateFilename(primaryResult.originalFile.name, 44)}
                    </p>
                  </div>

                  <div className="relative overflow-hidden border border-primary/40 bg-primary/8 p-4">
                    <span className="absolute right-7 top-7 z-10 border border-primary bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--on-primary)] tabular-nums">
                      Optimized ({formatBytes(primaryResult.file.size)})
                    </span>
                    <div className="flex h-[320px] items-center justify-center border border-primary/25 bg-card/85">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                      <img
                        src={primaryResult.url}
                        alt={primaryResult.file.name}
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {truncateFilename(primaryResult.file.name, 44)}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 border-l-4 border-primary bg-muted/55 p-6 sm:p-8">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="flex justify-center lg:justify-start">
                      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center border-2 border-primary bg-primary/12 text-primary">
                        <span className="text-[1.9rem] font-black leading-none tabular-nums">{savedPercent}%</span>
                      </div>
                    </div>

                    <div className="grid flex-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                      <div className="min-w-[120px] border-t border-[color:var(--ghost-border)] bg-card/80 px-5 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Storage savings
                        </p>
                        <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground tabular-nums">
                          {bytesSaved > 0 ? `-${formatBytes(bytesSaved)}` : "No reduction"}
                        </p>
                      </div>
                      <div className="min-w-[120px] border-t border-[color:var(--ghost-border)] bg-card/80 px-5 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Process time
                        </p>
                        <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground tabular-nums">
                          {lastProcessMs !== null ? `${lastProcessMs}ms` : "Pending"}
                        </p>
                      </div>
                      <div className="min-w-[120px] border-t border-[color:var(--ghost-border)] bg-card/80 px-5 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Export
                        </p>
                        <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground">
                          {primaryResult.file.type.replace("image/", "").toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 lg:justify-end">
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex min-h-14 items-center gap-2 border border-primary bg-card/80 px-8 py-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Process Another
                    </button>
                    <a
                      href={primaryResult.url}
                      download={primaryResult.file.name}
                      onClick={markDownloaded}
                      className="inline-flex min-h-14 items-center gap-2 border border-primary bg-primary px-8 py-4 text-sm font-bold text-[var(--on-primary)] transition-colors hover:bg-primary-dim hover:text-background"
                    >
                      <Download className="h-4 w-4" />
                      Download Optimized
                    </a>
                  </div>
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Results
                </h2>
                {results.map((result, index) => (
                  <DownloadCard
                    key={`${result.file.name}-${index}`}
                    href={result.url}
                    filename={result.file.name}
                    fileSize={result.file.size}
                    originalSize={result.originalFile.size}
                    thumbnailUrl={result.url}
                    onDownload={markDownloaded}
                  />
                ))}
                {results.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      void downloadAll();
                    }}
                    className="inline-flex items-center gap-2 border border-[color:var(--ghost-border)] bg-card/80 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Package className="h-4 w-4" />
                    Download all as ZIP
                  </button>
                ) : null}
              </section>
            )}

            {downloaded ? (
              <PostDownloadState
                toolSlug="image-compressor"
                resetLabel="Compress another image"
                onReset={reset}
                redownloadSlot={
                  results.length === 1 && primaryResult ? (
                    <a
                      href={primaryResult.url}
                      download={primaryResult.file.name}
                      onClick={markDownloaded}
                      className="underline transition-colors hover:text-foreground"
                    >
                      Re-download {truncateFilename(primaryResult.file.name, 28)}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void downloadAll();
                      }}
                      className="underline transition-colors hover:text-foreground"
                    >
                      Re-download all as ZIP
                    </button>
                  )
                }
              />
            ) : null}

            <TipJar />
          </>
        ) : null}
      </div>
    </ToolPageLayout>
  );
}
