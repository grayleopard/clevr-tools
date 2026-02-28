"use client";

import { useState, useCallback, useRef } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import FileDropZone from "@/components/tool/FileDropZone";
import { addToast } from "@/lib/toast";
import { formatBytes } from "@/lib/utils";
import { Download, X } from "lucide-react";

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
  const [fileType, setFileType] = useState("image/png");
  const [fileSize, setFileSize] = useState(0);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [isCircle, setIsCircle] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setFileType(file.type);
    setFileSize(file.size);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initialAspect = aspect ?? 1;
      const initialCrop = centerAspectCrop(width, height, initialAspect);
      setCrop(aspect ? initialCrop : { unit: "%", width: 80, height: 80, x: 10, y: 10 });
    },
    [aspect]
  );

  const selectAspect = useCallback(
    (option: AspectOption) => {
      setIsCircle(!!option.isCircle);
      setAspect(option.value);
      setResult(null);

      if (imgRef.current && option.value) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, option.value);
        setCrop(newCrop);
      } else if (imgRef.current && !option.value) {
        setCrop({ unit: "%", width: 80, height: 80, x: 10, y: 10 });
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

      const cropW = Math.round(completedCrop.width * scaleX);
      const cropH = Math.round(completedCrop.height * scaleY);
      const cropX = Math.round(completedCrop.x * scaleX);
      const cropY = Math.round(completedCrop.y * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d")!;

      if (isCircle) {
        ctx.beginPath();
        ctx.arc(
          cropW / 2,
          cropH / 2,
          Math.min(cropW, cropH) / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
      }

      ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const outputType = isCircle ? "image/png" : fileType || "image/png";
      const outputExt = isCircle
        ? "png"
        : outputType === "image/jpeg"
          ? "jpg"
          : outputType === "image/webp"
            ? "webp"
            : "png";

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), outputType, 0.92)
      );

      const baseName = fileName.replace(/\.[^.]+$/, "");
      const croppedFilename = `${baseName}-cropped.${outputExt}`;

      if (result) URL.revokeObjectURL(result.url);

      setResult({
        blob,
        url: URL.createObjectURL(blob),
        width: cropW,
        height: cropH,
        filename: croppedFilename,
      });

      addToast(`Cropped to ${cropW} \u00d7 ${cropH}`, "success");
    } catch (err) {
      console.error("Crop failed:", err);
      addToast("Crop failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, isCircle, fileType, fileName, result]);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setImgSrc("");
    setFileName("");
    setCrop(undefined);
    setCompletedCrop(undefined);
    setResult(null);
    setIsCircle(false);
    setAspect(undefined);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!imgSrc && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.gif"
          multiple={false}
          maxSizeMB={50}
          onFiles={handleFiles}
        />
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
        </div>
      )}
    </div>
  );
}
