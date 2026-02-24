"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { compressPdf } from "@/lib/processors";
import { addToast } from "@/lib/toast";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
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

export default function PdfCompressor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setResults([]);
    setDownloaded(false);
    const processed: Result[] = [];

    for (const file of files) {
      try {
        const blob = await compressPdf(file);
        const baseName = file.name.replace(/\.pdf$/i, "");
        processed.push({
          url: URL.createObjectURL(blob),
          filename: `${baseName}-compressed.pdf`,
          size: blob.size,
          originalSize: file.size,
          originalName: file.name,
        });
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
        addToast(`Failed to compress ${file.name}`, "error");
      }
    }

    setResults(processed);
    setIsProcessing(false);
    if (processed.length === 1) {
      const r = processed[0];
      const pct = Math.round((1 - r.size / r.originalSize) * 100);
      if (pct > 0) addToast(`PDF compressed — ${pct}% smaller`, "success");
      else addToast("PDF compression complete", "success");
    } else if (processed.length > 1) {
      addToast(`${processed.length} PDFs compressed`, "success");
    }
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
    a.download = "compressed-pdfs.zip";
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
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Strips embedded metadata and uses object streams to reduce file size. Works best on PDFs with verbose metadata or unoptimized structure.
      </div>

      {/* 1. Drop zone */}
      <FileDropZone accept=".pdf" multiple maxSizeMB={100} onFiles={handleFiles} />

      {/* 2. Processing */}
      {isProcessing && <ProcessingIndicator label="Compressing PDFs…" />}

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
          toolSlug="pdf-compressor"
          resetLabel="Compress another PDF"
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
