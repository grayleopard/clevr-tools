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
import { toPng } from "@/lib/processors";
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

export default function WebpToPng() {
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
        const blob = await toPng(file);
        const baseName = file.name.replace(/\.webp$/i, "");
        converted.push({
          url: URL.createObjectURL(blob),
          filename: `${baseName}.png`,
          size: blob.size,
          originalSize: file.size,
          originalName: file.name,
          originalUrl: URL.createObjectURL(file),
        });
      } catch (err) {
        console.error(`Failed to convert ${file.name}:`, err);
      }
    }

    setResults(converted);
    setIsProcessing(false);
  }, []);

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
      <FileDropZone accept=".webp" multiple maxSizeMB={50} onFiles={handleFiles} />

      {/* 2. Processing */}
      {isProcessing && <ProcessingIndicator label="Converting to PNG…" />}

      {/* 3. Results (pre-download) */}
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

      {/* 4. Post-download state */}
      {downloaded && (
        <PostDownloadState
          toolSlug="webp-to-png"
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
