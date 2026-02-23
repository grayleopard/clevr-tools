"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { Slider } from "@/components/ui/slider";
import JSZip from "jszip";
import { Package } from "lucide-react";
import { truncateFilename } from "@/lib/utils";

interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
}

export default function PngToWebp() {
  const [quality, setQuality] = useState(85);
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
          const bitmap = await createImageBitmap(file);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
              "image/webp",
              quality / 100
            );
          });

          const baseName = file.name.replace(/\.png$/i, "");
          converted.push({
            url: URL.createObjectURL(blob),
            filename: `${baseName}.webp`,
            size: blob.size,
            originalSize: file.size,
            originalName: file.name,
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
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setDownloaded(false);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* 1. Drop zone */}
      <FileDropZone accept=".png" multiple maxSizeMB={50} onFiles={handleFiles} />

      {/* 2. Options */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">WebP Quality</label>
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
      {isProcessing && <ProcessingIndicator label="Converting to WebP…" />}

      {/* 4. Results (pre-download) */}
      {results.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Results</h2>
          {results.map((r, i) => (
            <DownloadCard
              key={i}
              href={r.url}
              filename={r.filename}
              fileSize={r.size}
              originalSize={r.originalSize}
              onDownload={() => setDownloaded(true)}
            />
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
          toolSlug="png-to-webp"
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
