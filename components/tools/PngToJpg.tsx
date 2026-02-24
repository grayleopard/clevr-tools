"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import ImagePreviewCard from "@/components/tool/ImagePreviewCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { usePasteImage } from "@/lib/usePasteImage";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { Slider } from "@/components/ui/slider";
import { toJpg } from "@/lib/processors";
import { addToast } from "@/lib/toast";
import { truncateFilename } from "@/lib/utils";

interface Result {
  url: string;
  filename: string;
  originalName: string;
  originalUrl: string;
  size: number;
  originalSize: number;
}

export default function PngToJpg() {
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setIsProcessing(true);
      setResult((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev.url);
          URL.revokeObjectURL(prev.originalUrl);
        }
        return null;
      });
      setDownloaded(false);

      try {
        const blob = await toJpg(file, quality);
        const baseName = file.name.replace(/\.png$/i, "");
        const r = {
          url: URL.createObjectURL(blob),
          filename: `${baseName}.jpg`,
          originalName: file.name,
          originalUrl: URL.createObjectURL(file),
          size: blob.size,
          originalSize: file.size,
        };
        setResult(r);
        const pct = Math.round((1 - r.size / r.originalSize) * 100);
        if (pct > 0) addToast(`Converted to JPG — ${pct}% smaller`, "success");
        else addToast("Converted to JPG", "success");
      } catch (err) {
        console.error("Conversion failed:", err);
        addToast("Conversion failed. Please try again.", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [quality]
  );

  usePasteImage((file) => handleFiles([file]));

  const reset = useCallback(() => {
    setResult((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
        URL.revokeObjectURL(prev.originalUrl);
      }
      return null;
    });
    setDownloaded(false);
  }, []);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      {/* 1. Drop zone */}
      <FileDropZone accept=".png" multiple={false} maxSizeMB={50} onFiles={handleFiles} />

      {/* 2. Options */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">JPEG Quality</label>
          <span className="text-sm font-mono text-primary">{quality}%</span>
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[quality]}
          onValueChange={([v]) => setQuality(v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>

      {/* 3. Processing */}
      {isProcessing && <ProcessingIndicator label="Converting to JPG…" />}

      {/* 4. Result (pre-download) */}
      {result && !isProcessing && !downloaded && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Result</h2>
          <ImagePreviewCard
            originalUrl={result.originalUrl}
            originalName={result.originalName}
            originalSize={result.originalSize}
            processedUrl={result.url}
            processedName={result.filename}
            processedSize={result.size}
          />
          <DownloadCard
            href={result.url}
            filename={result.filename}
            fileSize={result.size}
            originalSize={result.originalSize}
            onDownload={() => setDownloaded(true)}
          />
        </div>
      )}

      {/* 5. Post-download state */}
      {downloaded && result && (
        <PostDownloadState
          toolSlug="png-to-jpg"
          resetLabel="Convert another file"
          onReset={reset}
          redownloadSlot={
            <a
              href={result.url}
              download={result.filename}
              className="underline hover:text-foreground transition-colors"
            >
              Re-download {truncateFilename(result.filename, 28)}
            </a>
          }
        />
      )}
    </div>
  );
}
