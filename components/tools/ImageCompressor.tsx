"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import ImagePreviewCard from "@/components/tool/ImagePreviewCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { usePasteImage } from "@/lib/usePasteImage";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { Slider } from "@/components/ui/slider";
import { compressImage, type ImageOutputFormat } from "@/lib/processors";
import { addToast } from "@/lib/toast";
import JSZip from "jszip";
import { Package } from "lucide-react";
import { truncateFilename } from "@/lib/utils";

interface CompressedFile {
  file: File;
  originalFile: File;
  originalUrl: string;
  url: string;
}

export default function ImageCompressor() {
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("original");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CompressedFile[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  const sourceFilesRef = useRef<File[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const compress = useCallback(
    async (files: File[], q: number, fmt: ImageOutputFormat) => {
      if (files.length === 0) return;
      setIsProcessing(true);
      setResults((prev) => {
        prev.forEach((r) => {
          URL.revokeObjectURL(r.url);
          URL.revokeObjectURL(r.originalUrl);
        });
        return [];
      });

      try {
        const compressed: CompressedFile[] = [];
        for (const originalFile of files) {
          const { blob, ext, mimeType } = await compressImage(originalFile, q, fmt);
          const baseName = originalFile.name.replace(/\.[^.]+$/, "");
          const newFile = new File(
            [blob],
            `${baseName}-compressed.${ext}`,
            { type: mimeType }
          );
          compressed.push({
            file: newFile,
            originalFile,
            originalUrl: URL.createObjectURL(originalFile),
            url: URL.createObjectURL(newFile),
          });
        }
        setResults(compressed);
        if (compressed.length === 1) {
          const r = compressed[0];
          const pct = Math.round((1 - r.file.size / r.originalFile.size) * 100);
          if (pct > 0) addToast(`Compressed — ${pct}% smaller`, "success");
          else addToast("Compression complete", "success");
        } else if (compressed.length > 1) {
          addToast(`${compressed.length} images compressed`, "success");
        }
      } catch (err) {
        console.error("Compression failed:", err);
        addToast("Compression failed. Please try again.", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      sourceFilesRef.current = files;
      setDownloaded(false);
      compress(files, quality, outputFormat);
    },
    [quality, outputFormat, compress]
  );

  useAutoLoadFile(handleFiles);
  usePasteImage((file) => handleFiles([file]));

  useEffect(() => {
    if (sourceFilesRef.current.length === 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      compress(sourceFilesRef.current, quality, outputFormat);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [quality, outputFormat, compress]);

  const downloadAll = useCallback(async () => {
    if (results.length <= 1) return;
    const zip = new JSZip();
    for (const { file } of results) zip.file(file.name, file);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed-images.zip";
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
    sourceFilesRef.current = [];
  }, [results]);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      {/* 1. Drop zone */}
      <FileDropZone
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        maxSizeMB={50}
        onFiles={handleFiles}
      />

      {/* 2. Options */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quality</label>
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Output format</label>
          <div className="flex gap-2">
            {(["original", "jpeg", "webp"] as ImageOutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setOutputFormat(fmt)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  outputFormat === fmt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {fmt === "original" ? "Keep original" : fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Processing */}
      {isProcessing && <ProcessingIndicator label="Compressing images…" />}

      {/* 4. Results (pre-download) */}
      {results.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Results</h2>
          {results.map((r, i) => (
            <div key={i} className="space-y-3">
              <ImagePreviewCard
                originalUrl={r.originalUrl}
                originalName={r.originalFile.name}
                originalSize={r.originalFile.size}
                processedUrl={r.url}
                processedName={r.file.name}
                processedSize={r.file.size}
              />
              <DownloadCard
                href={r.url}
                filename={r.file.name}
                fileSize={r.file.size}
                originalSize={r.originalFile.size}
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
          toolSlug="image-compressor"
          resetLabel="Compress another image"
          onReset={reset}
          redownloadSlot={
            results.length === 1 ? (
              <a
                href={results[0].url}
                download={results[0].file.name}
                className="underline hover:text-foreground transition-colors"
              >
                Re-download {truncateFilename(results[0].file.name, 28)}
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
