"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { normalizeCanvasQuality } from "@/lib/image-quality";
import { addToast } from "@/lib/toast";
import { formatBytes } from "@/lib/utils";
import { usePasteImage } from "@/lib/usePasteImage";
import { getRelatedTools, getToolBySlug } from "@/lib/tools";
import { Download, Package, Lock, Unlock, X } from "lucide-react";
import { TipJar } from "@/components/tool/TipJar";

interface UploadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ResizedResult {
  original: UploadedImage;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  filename: string;
}

type OutputFormat = "original" | "jpeg" | "png" | "webp";

interface Preset {
  label: string;
  width: number;
  height: number;
}

const tool = getToolBySlug("resize-image")!;
const relatedTools = getRelatedTools(tool).map((relatedTool) => ({
  name: relatedTool.name,
  href: relatedTool.route,
}));

const presets: Preset[] = [
  { label: "Instagram Post", width: 1080, height: 1080 },
  { label: "Instagram Story", width: 1080, height: 1920 },
  { label: "Facebook Cover", width: 820, height: 312 },
  { label: "Twitter Header", width: 1500, height: 500 },
  { label: "LinkedIn Banner", width: 1584, height: 396 },
  { label: "YouTube Thumbnail", width: 1280, height: 720 },
  { label: "HD", width: 1280, height: 720 },
  { label: "Full HD", width: 1920, height: 1080 },
  { label: "4K", width: 3840, height: 2160 },
  { label: "Passport Photo", width: 600, height: 600 },
];

const qualityOptions = [
  { label: "Low", value: 0.6 },
  { label: "Medium", value: 0.8 },
  { label: "High", value: 0.92 },
  { label: "Max", value: 1.0 },
];

function formatOutputFormat(fmt: OutputFormat): string {
  return fmt === "original" ? "Keep original" : fmt.toUpperCase();
}

export default function ImageResizer() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [percentage, setPercentage] = useState(100);
  const [usePercentage, setUsePercentage] = useState(false);
  const [lockAspect, setLockAspect] = useState(true);
  const [quality, setQuality] = useState(0.92);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResizedResult[]>([]);
  const [activeTab, setActiveTab] = useState<"custom" | "presets">("custom");
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [lastPreset, setLastPreset] = useState<Preset | null>(null);

  const aspectRatioRef = useRef(1);
  const [resetKey, setResetKey] = useState(0);

  const handleFiles = useCallback((files: File[]) => {
    const loaded: UploadedImage[] = [];
    let remaining = files.length;

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        loaded.push({ file, url, width: image.naturalWidth, height: image.naturalHeight });
        remaining--;

        if (remaining === 0) {
          setImages(loaded);
          setResults([]);
          const first = loaded[0];
          setTargetWidth(first.width);
          setTargetHeight(first.height);
          aspectRatioRef.current = first.width / first.height;
        }
      };
      image.src = url;
    });
  }, []);

  useAutoLoadFile(handleFiles);
  usePasteImage((file) => handleFiles([file]));

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

  const handleWidthChange = useCallback(
    (width: number) => {
      setTargetWidth(width);
      setSelectedPreset(null);
      setResults([]);
      if (lockAspect && aspectRatioRef.current > 0) {
        setTargetHeight(Math.round(width / aspectRatioRef.current));
      }
    },
    [lockAspect]
  );

  const handleHeightChange = useCallback(
    (height: number) => {
      setTargetHeight(height);
      setSelectedPreset(null);
      setResults([]);
      if (lockAspect && aspectRatioRef.current > 0) {
        setTargetWidth(Math.round(height * aspectRatioRef.current));
      }
    },
    [lockAspect]
  );

  const handlePercentageChange = useCallback(
    (pct: number) => {
      setPercentage(pct);
      if (images.length > 0) {
        const first = images[0];
        setTargetWidth(Math.round(first.width * (pct / 100)));
        setTargetHeight(Math.round(first.height * (pct / 100)));
      }
    },
    [images]
  );

  const applyPreset = useCallback((preset: Preset) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setLockAspect(false);
    setUsePercentage(false);
    setSelectedPreset(preset);
    setLastPreset(preset);
    setResults([]);
  }, []);

  const resizeImages = useCallback(async () => {
    if (images.length === 0 || targetWidth <= 0 || targetHeight <= 0) return;
    setIsProcessing(true);
    setResults([]);

    try {
      const resized: ResizedResult[] = [];

      for (const image of images) {
        const img = new Image();
        img.src = image.url;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(img, 0, 0, targetWidth, targetHeight);

        const mimeType =
          outputFormat === "original" ? image.file.type : `image/${outputFormat}`;
        const showQuality = mimeType === "image/jpeg" || mimeType === "image/webp";

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob(
            (nextBlob) => resolve(nextBlob!),
            mimeType,
            showQuality ? normalizeCanvasQuality(quality) : undefined
          )
        );

        const ext =
          outputFormat === "original"
            ? image.file.name.split(".").pop() || "jpg"
            : outputFormat;
        const baseName = image.file.name.replace(/\.[^.]+$/, "");
        const filename = `${baseName}-${targetWidth}x${targetHeight}.${ext}`;

        resized.push({
          original: image,
          blob,
          url: URL.createObjectURL(blob),
          width: targetWidth,
          height: targetHeight,
          filename,
        });
      }

      setResults(resized);

      if (resized.length === 1) {
        const anchor = document.createElement("a");
        anchor.href = resized[0].url;
        anchor.download = resized[0].filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } else if (resized.length > 1) {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (const result of resized) {
          zip.file(result.filename, result.blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const anchor = document.createElement("a");
        anchor.href = zipUrl;
        anchor.download = "resized-images.zip";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(zipUrl);
      }
    } catch (err) {
      console.error("Resize failed:", err);
      addToast("Resize failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [images, targetWidth, targetHeight, quality, outputFormat]);

  const downloadAll = useCallback(async () => {
    if (results.length <= 1) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const result of results) {
      zip.file(result.filename, result.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resized-images.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const reset = useCallback(() => {
    images.forEach((image) => URL.revokeObjectURL(image.url));
    results.forEach((result) => URL.revokeObjectURL(result.url));
    setImages([]);
    setResults([]);
    setTargetWidth(0);
    setTargetHeight(0);
    setPercentage(100);
    setSelectedPreset(null);
    setLastPreset(null);
    setResetKey((key) => key + 1);
  }, [images, results]);

  const showQualityControl =
    outputFormat === "jpeg" ||
    outputFormat === "webp" ||
    (outputFormat === "original" &&
      images.length > 0 &&
      (images[0].file.type === "image/jpeg" || images[0].file.type === "image/webp"));
  const showPresetPreview =
    activeTab === "presets" && selectedPreset !== null && images.length > 0;
  const presetPreviewWidth =
    selectedPreset !== null
      ? Math.min(560, (selectedPreset.width / selectedPreset.height) * 400)
      : 0;

  const settingsPanel = (
    <div className="space-y-6">
      <div className="rounded-[1rem] bg-card/80 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("custom");
              setSelectedPreset(null);
            }}
            className={`rounded-[0.85rem] px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "custom"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Custom size
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("presets");
              if (
                selectedPreset === null &&
                lastPreset !== null &&
                targetWidth === lastPreset.width &&
                targetHeight === lastPreset.height
              ) {
                setSelectedPreset(lastPreset);
              }
            }}
            className={`rounded-[0.85rem] px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "presets"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {activeTab === "custom" ? (
        <div className="space-y-5">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={usePercentage}
              onChange={(event) => {
                setUsePercentage(event.target.checked);
                if (event.target.checked) {
                  handlePercentageChange(percentage);
                }
              }}
              className="rounded border-border"
            />
            Use percentage
          </label>

          {usePercentage ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Scale: {percentage}%</label>
              <input
                type="range"
                min={1}
                max={200}
                value={percentage}
                onChange={(event) => handlePercentageChange(Number(event.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>200%</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Width
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={targetWidth || ""}
                  onChange={(event) => handleWidthChange(Number(event.target.value))}
                  className="w-full rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm tabular-nums"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setLockAspect(!lockAspect);
                  if (!lockAspect && images.length > 0) {
                    aspectRatioRef.current = images[0].width / images[0].height;
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
                title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              >
                {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                {lockAspect ? "Aspect locked" : "Aspect unlocked"}
              </button>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Height
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={targetHeight || ""}
                  onChange={(event) => handleHeightChange(Number(event.target.value))}
                  className="w-full rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/75 px-3 py-2 text-sm tabular-nums"
                />
              </div>
            </div>
          )}

          {showQualityControl ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quality</label>
              <div className="grid grid-cols-2 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuality(option.value)}
                    className={`rounded-[1rem] border px-3 py-2 text-sm font-medium transition-colors ${
                      quality === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[color:var(--ghost-border)] bg-card/75 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Output format</label>
            <div className="grid gap-2">
              {(["original", "jpeg", "png", "webp"] as OutputFormat[]).map((fmt) => (
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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`flex items-center justify-between rounded-[1rem] border px-3 py-2.5 text-sm transition-colors ${
                selectedPreset?.label === preset.label
                  ? "border-primary bg-primary/10 ring-1 ring-primary/15"
                  : "border-[color:var(--ghost-border)] bg-card/75 hover:border-primary/35 hover:bg-card"
              }`}
            >
              <span
                className={`font-medium ${
                  selectedPreset?.label === preset.label ? "text-primary" : "text-foreground"
                }`}
              >
                {preset.label}
              </span>
              <span
                className={`text-xs tabular-nums ${
                  selectedPreset?.label === preset.label
                    ? "text-primary/75"
                    : "text-muted-foreground"
                }`}
              >
                {preset.width} × {preset.height}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const infoPanel = (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground">
      <p>
        Resize first when you know the target slot. It reduces file size and makes later
        compression more predictable.
      </p>
      {images.length > 0 ? (
        <div className="rounded-[1rem] bg-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Source
          </p>
          <p className="mt-3 font-medium text-foreground">
            {images.length === 1 ? images[0].file.name : `${images.length} images loaded`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {images[0].width} × {images[0].height} px
          </p>
        </div>
      ) : null}
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
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.gif"
          multiple
          maxSizeMB={50}
          onFiles={handleFiles}
          resetKey={resetKey}
          compact={images.length > 0}
          onPasteClipboard={() => {
            void handleClipboardPaste();
          }}
        />

        {images.length > 0 ? (
          <>
            <div className="rounded-[1.5rem] bg-muted/45 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
                <div className="overflow-hidden rounded-[1.2rem] bg-card/80">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img
                    src={images[0].url}
                    alt={images[0].file.name}
                    className="h-44 w-full object-contain"
                  />
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-foreground">
                      {images[0].file.name}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {images[0].width} × {images[0].height} px
                      {images.length === 1 ? (
                        <span> · {formatBytes(images[0].file.size)}</span>
                      ) : (
                        <span> · {images.length} images loaded</span>
                      )}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      Set a custom target size or jump to a preset, then export using the
                      current browser-based workflow.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    aria-label="Remove uploaded images"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showPresetPreview && selectedPreset ? (
              <div className="rounded-[1.5rem] bg-muted/45 p-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex w-full justify-center overflow-hidden">
                    <div
                      key={`${selectedPreset.label}-${selectedPreset.width}x${selectedPreset.height}`}
                      className="relative max-w-full overflow-hidden rounded-[1.2rem] bg-card/85 shadow-[var(--shadow-sm)]"
                      style={{
                        aspectRatio: `${selectedPreset.width} / ${selectedPreset.height}`,
                        width: `${presetPreviewWidth}px`,
                        maxWidth: "100%",
                        maxHeight: "400px",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- local preset preview */}
                      <img
                        src={images[0].url}
                        alt={`${selectedPreset.label} preview`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {selectedPreset.label} · {selectedPreset.width} × {selectedPreset.height}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                void resizeImages();
              }}
              disabled={isProcessing || targetWidth <= 0 || targetHeight <= 0}
              className="w-full rounded-[1.2rem] bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-6 py-3 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing
                ? "Resizing…"
                : selectedPreset
                  ? `Resize to ${selectedPreset.label} (${targetWidth} × ${targetHeight})`
                  : `Resize to ${targetWidth} × ${targetHeight}`}
            </button>
          </>
        ) : null}

        {isProcessing ? <ProcessingIndicator label="Resizing images…" /> : null}

        {results.length > 0 && !isProcessing ? (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Results
            </h2>
            {results.map((result, index) => (
              <div
                key={`${result.filename}-${index}`}
                className="rounded-[1.5rem] bg-muted/45 p-4"
              >
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img
                    src={result.url}
                    alt={`Resized ${result.filename}`}
                    className="h-20 w-20 rounded-[1rem] bg-card/80 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {result.filename}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.width} × {result.height} px · {formatBytes(result.blob.size)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Original: {result.original.width} × {result.original.height} px ·{" "}
                      {formatBytes(result.original.file.size)}
                    </p>
                  </div>
                </div>
                <a
                  href={result.url}
                  download={result.filename}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                  <Download className="h-4 w-4" />
                  Download again
                </a>
              </div>
            ))}

            {results.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  void downloadAll();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Download all again as ZIP
              </button>
            ) : null}

            <TipJar />
          </div>
        ) : null}
      </div>
    </ToolPageLayout>
  );
}
