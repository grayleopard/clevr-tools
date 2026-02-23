"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
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

export default function JpgToPng() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
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
            "image/png"
          );
        });

        const baseName = file.name.replace(/\.(jpg|jpeg)$/i, "");
        converted.push({
          url: URL.createObjectURL(blob),
          filename: `${baseName}.png`,
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
  }, []);

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
      <FileDropZone accept=".jpg,.jpeg" multiple maxSizeMB={50} onFiles={handleFiles} />

      {/* 2. Processing */}
      {isProcessing && <ProcessingIndicator label="Converting to PNG…" />}

      {/* 3. Results (pre-download) */}
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

      {/* 4. Post-download state */}
      {downloaded && (
        <PostDownloadState
          toolSlug="jpg-to-png"
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
