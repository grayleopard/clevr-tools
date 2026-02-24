"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import ImagePreviewCard from "@/components/tool/ImagePreviewCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { PasteToast } from "@/components/tool/PasteToast";
import { usePasteImage } from "@/lib/usePasteImage";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { Slider } from "@/components/ui/slider";
import { heicToJpg } from "@/lib/processors";
import JSZip from "jszip";
import { Package } from "lucide-react";
import { truncateFilename } from "@/lib/utils";

interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
  originalUrl: string;
}

export default function HeicToJpg() {
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      setIsProcessing(true);
      setResults([]);
      setDownloaded(false);
      const converted: Result[] = [];

      for (const file of files) {
        try {
          const blob = await heicToJpg(file, quality);
          const baseName = file.name.replace(/\.(heic|heif)$/i, "");
          converted.push({
            url: URL.createObjectURL(blob),
            filename: `${baseName}.jpg`,
            size: blob.size,
            originalSize: file.size,
            originalName: file.name,
            // HEIC originals may not preview in all browsers — ImagePreviewCard handles gracefully
            originalUrl: URL.createObjectURL(file),
          });
        } catch (err) {
          console.error(`Failed to convert ${file.name}:`, err);
        }
      }

      setResults(converted);
      setIsProcessing(false);
    },
    [quality]
  );

  const { pasteToast } = usePasteImage((file) => handleFiles([file]));

  const downloadAll = useCallback(async () => {
    if (results.length < 2) return;
    const zip = new JSZip();
    for (const r of results) {
      const blob = await fetch(r.url).then((res) => res.blob());
      zip.file(r.filename, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-images.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const reset = useCallback(() => {
    results.forEach((r) => {
      URL.revokeObjectURL(r.url);
      URL.revokeObjectURL(r.originalUrl);
    });
    setResults([]);
    setDownloaded(false);
  }, [results]);

  return (
    <div className="space-y-6">
      <PasteToast show={pasteToast} />
      <PageDragOverlay onFiles={handleFiles} />

      {/* 1. Drop zone */}
      <FileDropZone accept=".heic,.heif" multiple maxSizeMB={100} onFiles={handleFiles} />

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
      {isProcessing && <ProcessingIndicator label="Converting HEIC to JPG…" />}

      {/* 4. Results (pre-download) */}
      {results.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Results</h2>
          {results.map((r, i) => (
            <div key={i} className="space-y-3">
              <ImagePreviewCard
                originalUrl={r.originalUrl}
                originalName={r.originalName}
                originalSize={r.originalSize}
                processedUrl={r.url}
                processedName={r.filename}
                processedSize={r.size}
              />
              <DownloadCard
                href={r.url}
                filename={r.filename}
                fileSize={r.size}
                originalSize={r.originalSize}
                onDownload={() => setDownloaded(true)}
              />
            </div>
          ))}
          {results.length > 1 && (
            <button
              onClick={() => { downloadAll(); setDownloaded(true); }}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Download all as ZIP
            </button>
          )}
        </div>
      )}

      {/* 5. Post-download state */}
      {downloaded && (
        <PostDownloadState
          toolSlug="heic-to-jpg"
          resetLabel="Convert another file"
          onReset={reset}
          redownloadSlot={
            results.length === 1 ? (
              <a
                href={results[0].url}
                download={results[0].filename}
                className="underline hover:text-foreground transition-colors"
              >
                Re-download {truncateFilename(results[0].filename, 28)}
              </a>
            ) : (
              <button
                onClick={downloadAll}
                className="underline hover:text-foreground transition-colors"
              >
                Re-download all as ZIP
              </button>
            )
          }
        />
      )}
    </div>
  );
}
