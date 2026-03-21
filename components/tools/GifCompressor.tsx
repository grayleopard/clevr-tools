"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import FileDropZone from "@/components/tool/FileDropZone";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { Slider } from "@/components/ui/slider";
import { TipJar } from "@/components/tool/TipJar";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import { usePasteImage } from "@/lib/usePasteImage";
import { addToast } from "@/lib/toast";
import {
  analyzeGif,
  compressGif,
  type GifAnalysis,
  type GifCompressionResult,
  type GifFrameReduction,
  type GifScale,
} from "@/lib/gif-compression";
import { formatBytes, truncateFilename } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools";

interface SelectedGif {
  file: File;
  previewUrl: string;
  analysis: GifAnalysis | null;
}

interface CompressedGifState {
  file: File;
  previewUrl: string;
  analysis: GifCompressionResult;
  processMs: number;
}

const relatedTools = [
  "image-compressor",
  "pdf-compressor",
  "png-to-webp",
  "resize-image",
].flatMap((slug) => {
  const tool = getToolBySlug(slug);
  return tool ? [{ name: tool.name, href: tool.route }] : [];
});

const frameReductionOptions: Array<{ label: string; value: GifFrameReduction }> = [
  { label: "None", value: 1 },
  { label: "Every 2nd", value: 2 },
  { label: "Every 3rd", value: 3 },
  { label: "Every 4th", value: 4 },
];

const scaleOptions: Array<{ label: string; value: GifScale }> = [
  { label: "100%", value: 100 },
  { label: "75%", value: 75 },
  { label: "50%", value: 50 },
  { label: "25%", value: 25 },
];

const maxColorOptions = [256, 128, 64, 32, 16] as const;

function isGifFile(file: File): boolean {
  return file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(durationMs >= 10_000 ? 0 : 1)}s`;
}

function estimateFrameCount(frameCount: number, frameReduction: GifFrameReduction): number {
  if (frameReduction === 1) return frameCount;
  return Math.max(1, Math.ceil(frameCount / frameReduction));
}

export default function GifCompressor() {
  const [compression, setCompression] = useState(58);
  const [maxColors, setMaxColors] = useState<(typeof maxColorOptions)[number]>(128);
  const [frameReduction, setFrameReduction] = useState<GifFrameReduction>(1);
  const [scale, setScale] = useState<GifScale>(100);
  const [selected, setSelected] = useState<SelectedGif | null>(null);
  const [result, setResult] = useState<CompressedGifState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const analysisTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl);
    };
  }, [selected?.previewUrl]);

  useEffect(() => {
    return () => {
      if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
    };
  }, [result?.previewUrl]);

  const reset = useCallback(() => {
    setSelected(null);
    setResult(null);
    setDownloaded(false);
    setIsProcessing(false);
    setResetKey((value) => value + 1);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!isGifFile(file)) {
      addToast("GIF Compressor only accepts animated GIF files.", "error");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      addToast("This GIF exceeds the 50 MB limit.", "error");
      return;
    }

    const token = analysisTokenRef.current + 1;
    analysisTokenRef.current = token;

    setDownloaded(false);
    setResult(null);
    setSelected({
      file,
      previewUrl: URL.createObjectURL(file),
      analysis: null,
    });

    try {
      const analysis = await analyzeGif(file);

      if (analysisTokenRef.current !== token) return;

      setSelected((current) =>
        current && current.file === file
          ? {
              ...current,
              analysis,
            }
          : current
      );
    } catch (error) {
      console.error("Failed to analyze GIF:", error);
      addToast("Could not read this GIF. Please try another file.", "error");
    }
  }, []);

  const handleCompress = useCallback(async () => {
    if (!selected || isProcessing) return;

    setIsProcessing(true);
    setDownloaded(false);

    try {
      const startedAt = performance.now();
      const compressed = await compressGif(selected.file, {
        compression,
        maxColors,
        frameReduction,
        scale,
      });
      const processMs = Math.round(performance.now() - startedAt);
      const baseName = selected.file.name.replace(/\.[^.]+$/, "");
      const file = new File([compressed.blob], `${baseName}-compressed.gif`, {
        type: "image/gif",
      });

      setResult({
        file,
        previewUrl: URL.createObjectURL(file),
        analysis: compressed,
        processMs,
      });
    } catch (error) {
      console.error("GIF compression failed:", error);
      addToast("GIF compression failed. Try a smaller file or stronger settings.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [compression, frameReduction, isProcessing, maxColors, scale, selected]);

  const handleClipboardPaste = useCallback(async () => {
    if (!navigator.clipboard?.read) {
      addToast("Clipboard access is limited here — paste manually with Ctrl+V", "info");
      return;
    }

    try {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        if (!item.types.includes("image/gif")) continue;
        const blob = await item.getType("image/gif");
        await handleFiles([new File([blob], "clipboard.gif", { type: "image/gif" })]);
        addToast("GIF pasted from clipboard", "success");
        return;
      }

      addToast("No GIF found in clipboard — paste manually with Ctrl+V if needed", "info");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, [handleFiles]);

  useAutoLoadFile(handleFiles);
  usePasteImage((file) => {
    void handleFiles([file]);
  });

  const bytesSaved =
    selected && result ? Math.max(0, selected.file.size - result.file.size) : 0;
  const savedPercent =
    selected && result && selected.file.size > 0
      ? Math.max(0, Math.round((1 - result.file.size / selected.file.size) * 100))
      : 0;
  const estimatedFrames = selected?.analysis
    ? estimateFrameCount(selected.analysis.frameCount, frameReduction)
    : null;

  const settingsPanel = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Compression</label>
          <span className="text-sm font-mono text-primary">{compression}</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[compression]}
          onValueChange={([value]) => setCompression(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Higher fidelity</span>
          <span>Smaller file</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Max colors</label>
        <div className="grid grid-cols-3 gap-2">
          {maxColorOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMaxColors(value)}
              className={`rounded-[1rem] border px-3 py-2 text-sm font-medium transition-colors ${
                maxColors === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[color:var(--ghost-border)] bg-card/75 text-muted-foreground hover:border-primary/35 hover:text-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Frame reduction</label>
          {estimatedFrames !== null ? (
            <span className="text-xs text-muted-foreground">
              ~{estimatedFrames} frames
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {frameReductionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFrameReduction(option.value)}
              className={`rounded-[1rem] border px-3 py-2 text-sm font-medium transition-colors ${
                frameReduction === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[color:var(--ghost-border)] bg-card/75 text-muted-foreground hover:border-primary/35 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Resize / scale</label>
        <div className="grid grid-cols-2 gap-2">
          {scaleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setScale(option.value)}
              className={`rounded-[1rem] border px-3 py-2 text-sm font-medium transition-colors ${
                scale === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[color:var(--ghost-border)] bg-card/75 text-muted-foreground hover:border-primary/35 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Quick presets</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Targets</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => {
              setCompression(82);
              setMaxColors(64);
              setFrameReduction(2);
              setScale(75);
            }}
            className="rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
          >
            Discord (8MB)
          </button>
          <button
            type="button"
            onClick={() => {
              setCompression(58);
              setMaxColors(128);
              setFrameReduction(1);
              setScale(100);
            }}
            className="rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
          >
            Web (Balanced)
          </button>
        </div>
      </div>

      {result ? (
        <div className="rounded-[1rem] bg-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Output details
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Format</dt>
              <dd className="font-medium text-foreground">GIF</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Dimensions</dt>
              <dd className="font-medium text-foreground">
                {result.analysis.width} × {result.analysis.height}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Frames</dt>
              <dd className="font-medium text-foreground">{result.analysis.frameCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Colors</dt>
              <dd className="font-medium text-foreground">{result.analysis.colors}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">File size</dt>
              <dd className="font-medium text-foreground">{formatBytes(result.file.size)}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {selected ? (
        <button
          type="button"
          onClick={() => {
            void handleCompress();
          }}
          disabled={isProcessing}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-6 py-4 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? "Compressing…" : result ? "Recompress GIF" : "Compress GIF"}
        </button>
      ) : null}
    </div>
  );

  const infoPanel = (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground">
      <p>
        For Discord or chat apps, color reduction does most of the work first. Only drop scale or
        frames when the GIF still misses the target.
      </p>
      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Browser-based processing
        </p>
        <p className="mt-3">
          Animation decode, palette reduction, and GIF export all happen locally in your browser.
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
      settingsTitle="Compression settings"
      infoTitle="Tool notes"
    >
      <div className="space-y-6">
        <PageDragOverlay onFiles={handleFiles} />

        <FileDropZone
          accept=".gif"
          maxSizeMB={50}
          onFiles={handleFiles}
          resetKey={resetKey}
          compact={Boolean(selected)}
          headline="Drop any GIF here"
          privacyNote="Files stay in your browser — nothing is uploaded"
          onPasteClipboard={() => {
            void handleClipboardPaste();
          }}
        />

        {selected && !result && !isProcessing ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
            <div className="overflow-hidden rounded-[1.5rem] bg-muted/45 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-foreground/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-background">
                  Original preview
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(selected.file.size)}
                </span>
              </div>
              <div className="flex min-h-[320px] items-center justify-center rounded-[1.2rem] bg-card/85">
                {/* eslint-disable-next-line @next/next/no-img-element -- local animated GIF preview */}
                <img
                  src={selected.previewUrl}
                  alt={selected.file.name}
                  className="max-h-[320px] max-w-full rounded-[1rem] object-contain"
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-muted/45 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                GIF workspace
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {truncateFilename(selected.file.name, 42)}
              </h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1rem] bg-card/80 px-4 py-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    File size
                  </dt>
                  <dd className="mt-3 text-xl font-bold tracking-[-0.02em] text-foreground">
                    {formatBytes(selected.file.size)}
                  </dd>
                </div>
                <div className="rounded-[1rem] bg-card/80 px-4 py-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Dimensions
                  </dt>
                  <dd className="mt-3 text-xl font-bold tracking-[-0.02em] text-foreground">
                    {selected.analysis
                      ? `${selected.analysis.width} × ${selected.analysis.height}`
                      : "Reading…"}
                  </dd>
                </div>
                <div className="rounded-[1rem] bg-card/80 px-4 py-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Frames
                  </dt>
                  <dd className="mt-3 text-xl font-bold tracking-[-0.02em] text-foreground">
                    {selected.analysis ? selected.analysis.frameCount : "Reading…"}
                  </dd>
                </div>
                <div className="rounded-[1rem] bg-card/80 px-4 py-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Duration
                  </dt>
                  <dd className="mt-3 text-xl font-bold tracking-[-0.02em] text-foreground">
                    {selected.analysis ? formatDuration(selected.analysis.durationMs) : "Reading…"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void handleCompress();
                  }}
                  className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-8 py-4 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-opacity hover:opacity-95"
                >
                  Compress GIF
                </button>
                <p className="text-sm text-muted-foreground">
                  Client-side only. Animation stays intact.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {isProcessing ? <ProcessingIndicator label="Compressing GIF…" /> : null}

        {selected && result && !isProcessing ? (
          <>
            <section className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-muted/45 p-4">
                  <span className="absolute left-7 top-7 z-10 rounded-full bg-foreground/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-background">
                    Original ({formatBytes(selected.file.size)})
                  </span>
                  <div className="flex h-[320px] items-center justify-center rounded-[1.2rem] bg-card/80">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local animated GIF preview */}
                    <img
                      src={selected.previewUrl}
                      alt={selected.file.name}
                      className="max-h-full max-w-full rounded-[1rem] object-contain"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {truncateFilename(selected.file.name, 34)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.analysis?.frameCount ?? "?"} frames
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.5rem] bg-primary/8 p-4">
                  <span className="absolute right-7 top-7 z-10 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-primary)]">
                    Compressed ({formatBytes(result.file.size)})
                  </span>
                  <div className="flex h-[320px] items-center justify-center rounded-[1.2rem] bg-card/85">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local animated GIF preview */}
                    <img
                      src={result.previewUrl}
                      alt={result.file.name}
                      className="max-h-full max-w-full rounded-[1rem] object-contain"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {truncateFilename(result.file.name, 34)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.analysis.frameCount} frames
                    </p>
                  </div>
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
                        {result.processMs}ms
                      </p>
                    </div>
                    <div className="min-w-[120px] rounded-[1rem] bg-card/80 px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Export
                      </p>
                      <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground">
                        GIF
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
                    href={result.previewUrl}
                    download={result.file.name}
                    onClick={() => setDownloaded(true)}
                    className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-8 py-4 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-opacity hover:opacity-95"
                  >
                    <Download className="h-4 w-4" />
                    Download Compressed
                  </a>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-primary/[0.07] p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Download
                  </p>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {truncateFilename(result.file.name, 42)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(selected.file.size)} → {formatBytes(result.file.size)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-primary)]">
                    Saved {savedPercent}%
                  </span>
                  <a
                    href={result.previewUrl}
                    download={result.file.name}
                    onClick={() => setDownloaded(true)}
                    className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-8 py-4 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-opacity hover:opacity-95"
                  >
                    <Download className="h-4 w-4" />
                    Download GIF
                  </a>
                </div>
              </div>
            </section>

            {downloaded ? (
              <PostDownloadState
                toolSlug="gif-compressor"
                resetLabel="Compress another GIF"
                onReset={reset}
                redownloadSlot={
                  <a
                    href={result.previewUrl}
                    download={result.file.name}
                    className="underline transition-colors hover:text-foreground"
                  >
                    Re-download {truncateFilename(result.file.name, 28)}
                  </a>
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
