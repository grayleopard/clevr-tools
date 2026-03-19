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

  const compress = useCallback(
    async (files: File[], q: number, fmt: ImageOutputFormat) => {
      if (files.length === 0) return;
      setIsProcessing(true);
      setLastProcessMs(null);
      setResults((prev) => {
        prev.forEach((result) => {
          URL.revokeObjectURL(result.url);
          URL.revokeObjectURL(result.originalUrl);
        });
        return [];
      });
      await waitForNextPaint();

      const startedAt = performance.now();

      try {
        const compressed: CompressedFile[] = [];

        for (const originalFile of files) {
          const originalUrl = URL.createObjectURL(originalFile);
          const { width, height } = await readImageDimensions(originalUrl);
          const { blob, ext, mimeType } = await compressImage(originalFile, q, fmt);
          const baseName = originalFile.name.replace(/\.[^.]+$/, "");
          const newFile = new File([blob], `${baseName}-compressed.${ext}`, { type: mimeType });

          compressed.push({
            file: newFile,
            originalFile,
            originalUrl,
            url: URL.createObjectURL(newFile),
            width,
            height,
          });
        }

        setResults(compressed);
        setLastProcessMs(Math.round(performance.now() - startedAt));
      } catch (err) {
        console.error("Compression failed:", err);
        addToast("Compression failed. Please try again.", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleFiles = useCallback(
    (files: File[]) => {
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
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const { file } of results) zip.file(file.name, file);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "compressed-images.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const reset = useCallback(() => {
    results.forEach((result) => {
      URL.revokeObjectURL(result.url);
      URL.revokeObjectURL(result.originalUrl);
    });
    setResults([]);
    setDownloaded(false);
    setHasSelection(false);
    setLastProcessMs(null);
    sourceFilesRef.current = [];
    setResetKey((key) => key + 1);
  }, [results]);

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
              className={`rounded-[1rem] border px-3 py-2 text-left text-sm font-medium transition-colors ${
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
            className="rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
          >
            Web (80)
          </button>
          <button
            type="button"
            onClick={() => setQuality(95)}
            className="rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
          >
            Ultra (95)
          </button>
        </div>
      </div>

      {primaryResult ? (
        <div className="rounded-[1rem] bg-card/80 p-4">
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
      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Local processing
        </p>
        <p className="mt-3">
          Compression runs in your browser and keeps the current clevr.tools privacy model
          intact.
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
    >
      <div className="space-y-6">
        <PageDragOverlay onFiles={handleFiles} />

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
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-muted/45 p-4">
                    <span className="absolute left-7 top-7 z-10 rounded-full bg-foreground/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-background">
                      Original ({formatBytes(primaryResult.originalFile.size)})
                    </span>
                    <div className="flex h-[320px] items-center justify-center rounded-[1.2rem] bg-card/80">
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

                  <div className="relative overflow-hidden rounded-[1.5rem] bg-primary/8 p-4">
                    <span className="absolute right-7 top-7 z-10 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-primary)]">
                      Optimized ({formatBytes(primaryResult.file.size)})
                    </span>
                    <div className="flex h-[320px] items-center justify-center rounded-[1.2rem] bg-card/85">
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

                <div className="space-y-8 rounded-[1.75rem] bg-muted/55 p-8">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="flex justify-center lg:justify-start">
                      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-primary/12 text-primary">
                        <span className="text-[1.9rem] font-black leading-none">{savedPercent}%</span>
                      </div>
                    </div>

                    <div className="grid flex-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                      <div className="min-w-[120px] rounded-[1rem] bg-card/80 px-5 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Storage savings
                        </p>
                        <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground">
                          {bytesSaved > 0 ? `-${formatBytes(bytesSaved)}` : "No reduction"}
                        </p>
                      </div>
                      <div className="min-w-[120px] rounded-[1rem] bg-card/80 px-5 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Process time
                        </p>
                        <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground">
                          {lastProcessMs ? `${lastProcessMs}ms` : "Pending"}
                        </p>
                      </div>
                      <div className="min-w-[120px] rounded-[1rem] bg-card/80 px-5 py-4">
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
                      className="inline-flex min-h-14 items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-8 py-4 text-sm font-semibold text-primary transition-colors hover:bg-muted/80"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Process Another
                    </button>
                    <a
                      href={primaryResult.url}
                      download={primaryResult.file.name}
                      onClick={() => setDownloaded(true)}
                      className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-8 py-4 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-opacity hover:opacity-95"
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
                    onDownload={() => setDownloaded(true)}
                  />
                ))}
                {results.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      void downloadAll();
                      setDownloaded(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary"
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
