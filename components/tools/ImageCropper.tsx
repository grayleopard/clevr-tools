"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import FileDropZone from "@/components/tool/FileDropZone";
import { addToast } from "@/lib/toast";
import { normalizeCanvasQuality } from "@/lib/image-quality";
import {
  detectRasterBlobFormat,
  isGifFile,
  isStaticRasterFormat,
  rasterExtension,
  rasterMimeType,
  type StaticRasterFormat,
} from "@/lib/image-remediation/raster-formats";
import { formatBytes } from "@/lib/utils";
import { Download, X } from "lucide-react";
import { TipJar } from "@/components/tool/TipJar";

interface CropResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  filename: string;
}

interface AspectOption {
  label: string;
  value: number | undefined;
  isCircle?: boolean;
}

const aspectOptions: AspectOption[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "Circle", value: 1, isCircle: true },
];

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 80 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper() {
  const [imgSrc, setImgSrc] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState<StaticRasterFormat>("png");
  const [fileSize, setFileSize] = useState(0);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [isCircle, setIsCircle] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const detectedFormat = await detectRasterBlobFormat(file);

    if (isGifFile(file, detectedFormat)) {
      addToast(
        "Animated GIF cropping isn't supported because it would remove animation. Convert a still frame to PNG or JPG first.",
        "error"
      );
      return;
    }
    if (!isStaticRasterFormat(detectedFormat)) {
      addToast(
        "Couldn't read that file — choose a valid JPG, PNG, or WebP image.",
        "error"
      );
      return;
    }

    setFileName(file.name);
    setFileFormat(detectedFormat);
    setFileSize(file.size);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspect(undefined);
    setIsCircle(false);
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
    };
    reader.onerror = () => {
      console.error(`Failed to read file: ${file.name}`);
      setFileName("");
      setFileSize(0);
      addToast("Couldn't read that file — it may be corrupt or an unsupported format. Try a different file.", "error");
    };
    reader.readAsDataURL(file.slice(0, file.size, rasterMimeType(detectedFormat)));
  }, []);

  const handleImageError = useCallback(() => {
    console.error("Failed to decode image data");
    setImgSrc("");
    setFileName("");
    setFileSize(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
    addToast("Couldn't read that file — it may be corrupt or an unsupported format. Try a different file.", "error");
  }, []);

  useAutoLoadFile(handleFiles);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initialAspect = aspect ?? 1;
      const initialCrop = centerAspectCrop(width, height, initialAspect);
      const nextCrop = aspect
        ? initialCrop
        : { unit: "%" as const, width: 80, height: 80, x: 10, y: 10 };
      setCrop(nextCrop);
      setCompletedCrop(convertToPixelCrop(nextCrop, width, height));
    },
    [aspect]
  );

  const selectAspect = useCallback(
    (option: AspectOption) => {
      setIsCircle(!!option.isCircle);
      setAspect(option.value);
      setResult((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return null;
      });

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = option.value
          ? centerAspectCrop(width, height, option.value)
          : { unit: "%" as const, width: 80, height: 80, x: 10, y: 10 };
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      } else {
        setCompletedCrop(undefined);
      }
    },
    []
  );

  const cropImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    try {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const scaledWidth = Math.max(1, completedCrop.width * scaleX);
      const scaledHeight = Math.max(1, completedCrop.height * scaleY);
      let sourceWidth = scaledWidth;
      let sourceHeight = scaledHeight;
      let sourceX = completedCrop.x * scaleX;
      let sourceY = completedCrop.y * scaleY;

      if (isCircle) {
        const sourceSize = Math.min(scaledWidth, scaledHeight);
        sourceX += (scaledWidth - sourceSize) / 2;
        sourceY += (scaledHeight - sourceSize) / 2;
        sourceWidth = sourceSize;
        sourceHeight = sourceSize;
      }

      const outputWidth = Math.max(1, Math.round(sourceWidth));
      const outputHeight = isCircle
        ? outputWidth
        : Math.max(1, Math.round(sourceHeight));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable");

      if (isCircle) {
        ctx.beginPath();
        ctx.arc(
          outputWidth / 2,
          outputHeight / 2,
          outputWidth / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
      }

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const outputFormat: StaticRasterFormat = isCircle ? "png" : fileFormat;
      const outputType = rasterMimeType(outputFormat);
      const outputExt = rasterExtension(outputFormat);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (nextBlob) =>
            nextBlob
              ? resolve(nextBlob)
              : reject(new Error(`This browser could not export ${outputFormat.toUpperCase()}`)),
          outputType,
          normalizeCanvasQuality(0.92)
        )
      );
      const actualFormat = await detectRasterBlobFormat(blob);
      if (actualFormat !== outputFormat) {
        throw new Error(
          `This browser returned ${actualFormat.toUpperCase()} instead of ${outputFormat.toUpperCase()}`
        );
      }

      const baseName = fileName.replace(/\.[^.]+$/, "");
      const croppedFilename = `${baseName}-cropped.${outputExt}`;

      if (result) URL.revokeObjectURL(result.url);

      setResult({
        blob,
        url: URL.createObjectURL(blob),
        width: outputWidth,
        height: outputHeight,
        filename: croppedFilename,
      });

    } catch (err) {
      console.error("Crop failed:", err);
      addToast("Crop failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, isCircle, fileFormat, fileName, result]);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setImgSrc("");
    setFileName("");
    setFileFormat("png");
    setFileSize(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setResult(null);
    setIsCircle(false);
    setAspect(undefined);
    setResetKey((k) => k + 1);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!imgSrc && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp"
          multiple={false}
          maxSizeMB={50}
          onFiles={handleFiles}
          resetKey={resetKey}
        />
      )}
      {!imgSrc && (
        <p className="text-xs leading-5 text-muted-foreground">
          Animated GIFs are not supported because cropping would remove animation.
          Convert a still frame to JPG or PNG first.
        </p>
      )}

      {imgSrc && (
        <>
          {/* File info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {fileName} &middot; {formatBytes(fileSize)}
              </div>
              <button
                onClick={reset}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Aspect ratio buttons */}
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="text-sm font-medium mb-2 block">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectOptions.map((option) => {
                const isActive = option.isCircle
                  ? isCircle
                  : !isCircle && aspect === option.value;
                return (
                  <button
                    key={option.label}
                    onClick={() => selectAspect(option)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crop area */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={isCircle}
              className="max-h-[500px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop source"
                onLoad={onImageLoad}
                onError={handleImageError}
                className="max-h-[500px] w-auto"
              />
            </ReactCrop>
          </div>

          {/* Crop button */}
          <button
            onClick={cropImage}
            disabled={!completedCrop || isProcessing}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Cropping\u2026" : "Crop Image"}
          </button>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Result</h2>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.url}
                alt={`Cropped ${result.filename}`}
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {result.filename}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.width} &times; {result.height} px &middot;{" "}
                  {formatBytes(result.blob.size)}
                </p>
              </div>
            </div>
            <a
              href={result.url}
              download={result.filename}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
          <TipJar />
        </div>
      )}
    </div>
  );
}
