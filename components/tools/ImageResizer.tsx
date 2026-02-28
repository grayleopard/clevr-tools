"use client";

import { useState, useCallback, useRef } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { addToast } from "@/lib/toast";
import { formatBytes } from "@/lib/utils";

import { Download, Package, Lock, Unlock, X } from "lucide-react";

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

  const aspectRatioRef = useRef(1);

  const handleFiles = useCallback((files: File[]) => {
    const loaded: UploadedImage[] = [];
    let remaining = files.length;

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        loaded.push({ file, url, width: img.naturalWidth, height: img.naturalHeight });
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
      img.src = url;
    });
  }, []);

  const handleWidthChange = useCallback(
    (w: number) => {
      setTargetWidth(w);
      if (lockAspect && aspectRatioRef.current > 0) {
        setTargetHeight(Math.round(w / aspectRatioRef.current));
      }
    },
    [lockAspect]
  );

  const handleHeightChange = useCallback(
    (h: number) => {
      setTargetHeight(h);
      if (lockAspect && aspectRatioRef.current > 0) {
        setTargetWidth(Math.round(h * aspectRatioRef.current));
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
    setActiveTab("custom");
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
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const mimeType =
          outputFormat === "original" ? image.file.type : `image/${outputFormat}`;
        const showQuality = mimeType === "image/jpeg" || mimeType === "image/webp";

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob(
            (b) => resolve(b!),
            mimeType,
            showQuality ? quality : undefined
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
      addToast(
        resized.length === 1
          ? `Resized to ${targetWidth} \u00d7 ${targetHeight}`
          : `${resized.length} images resized`,
        "success"
      );
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
    for (const r of results) {
      zip.file(r.filename, r.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resized-images.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const reset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setImages([]);
    setResults([]);
    setTargetWidth(0);
    setTargetHeight(0);
    setPercentage(100);
  }, [images, results]);

  const showQualityControl =
    outputFormat === "jpeg" ||
    outputFormat === "webp" ||
    (outputFormat === "original" &&
      images.length > 0 &&
      (images[0].file.type === "image/jpeg" || images[0].file.type === "image/webp"));

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <FileDropZone
        accept=".jpg,.jpeg,.png,.webp,.gif"
        multiple
        maxSizeMB={50}
        onFiles={handleFiles}
      />

      {images.length > 0 && (
        <>
          {/* Original info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Original: {images[0].width} &times; {images[0].height} px
                {images.length === 1 && (
                  <span> &middot; {formatBytes(images[0].file.size)}</span>
                )}
                {images.length > 1 && (
                  <span> &middot; {images.length} images</span>
                )}
              </div>
              <button
                onClick={reset}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "custom"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Custom Size
              </button>
              <button
                onClick={() => setActiveTab("presets")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "presets"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Presets
              </button>
            </div>

            <div className="p-5 space-y-5">
              {activeTab === "custom" && (
                <>
                  {/* Percentage toggle */}
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={usePercentage}
                      onChange={(e) => {
                        setUsePercentage(e.target.checked);
                        if (e.target.checked) {
                          handlePercentageChange(percentage);
                        }
                      }}
                      className="rounded border-border"
                    />
                    Use percentage
                  </label>

                  {usePercentage ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Scale: {percentage}%
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={200}
                        value={percentage}
                        onChange={(e) =>
                          handlePercentageChange(Number(e.target.value))
                        }
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1%</span>
                        <span>200%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          value={targetWidth || ""}
                          onChange={(e) =>
                            handleWidthChange(Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setLockAspect(!lockAspect);
                          if (!lockAspect && images.length > 0) {
                            aspectRatioRef.current =
                              images[0].width / images[0].height;
                          }
                        }}
                        className="mt-5 rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title={
                          lockAspect
                            ? "Aspect ratio locked"
                            : "Aspect ratio unlocked"
                        }
                      >
                        {lockAspect ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          value={targetHeight || ""}
                          onChange={(e) =>
                            handleHeightChange(Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums"
                        />
                      </div>
                    </div>
                  )}

                  {/* Quality */}
                  {showQualityControl && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quality</label>
                      <div className="flex gap-2">
                        {qualityOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setQuality(opt.value)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              quality === opt.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output format */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output format</label>
                    <div className="flex gap-2">
                      {(
                        ["original", "jpeg", "png", "webp"] as OutputFormat[]
                      ).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            outputFormat === fmt
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {fmt === "original"
                            ? "Keep original"
                            : fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "presets" && (
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset)}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-muted"
                    >
                      <span className="font-medium text-foreground">
                        {preset.label}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {preset.width} &times; {preset.height}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resize button */}
          <button
            onClick={resizeImages}
            disabled={isProcessing || targetWidth <= 0 || targetHeight <= 0}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Resizing\u2026"
              : `Resize to ${targetWidth} \u00d7 ${targetHeight}`}
          </button>
        </>
      )}

      {/* Processing */}
      {isProcessing && <ProcessingIndicator label="Resizing images\u2026" />}

      {/* Results */}
      {results.length > 0 && !isProcessing && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Results</h2>
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={`Resized ${r.filename}`}
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {r.filename}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.width} &times; {r.height} px &middot;{" "}
                    {formatBytes(r.blob.size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Original: {r.original.width} &times; {r.original.height} px
                    &middot; {formatBytes(r.original.file.size)}
                  </p>
                </div>
              </div>
              <a
                href={r.url}
                download={r.filename}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          ))}

          {results.length > 1 && (
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Download All as ZIP
            </button>
          )}
        </div>
      )}
    </div>
  );
}
