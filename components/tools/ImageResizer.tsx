"use client";

import { useState, useCallback, useRef } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { usePasteImage } from "@/lib/usePasteImage";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import JSZip from "jszip";
import { Package, Lock, Unlock, ArrowRight } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";

type ResizeMode = "dimensions" | "presets" | "target";

interface Preset { label: string; w: number; h: number; note?: string; }

const PRESETS: Preset[] = [
  { label: "Instagram Post", w: 1080, h: 1080, note: "1:1" },
  { label: "Instagram Story", w: 1080, h: 1920, note: "9:16" },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "LinkedIn Banner", w: 1584, h: 396 },
  { label: "YouTube Thumbnail", w: 1280, h: 720, note: "HD" },
  { label: "Passport Photo", w: 600, h: 600, note: "2×2 in" },
  { label: "Web Banner", w: 1200, h: 628 },
];

interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
  width: number;
  height: number;
  thumbnailUrl: string;
}

async function resizeImage(
  file: File,
  targetW: number,
  targetH: number,
  targetKB?: number
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";

      if (targetKB) {
        // Binary search for quality to hit target file size
        const targetBytes = targetKB * 1024;
        if (mime === "image/png") {
          // PNG is lossless — just scale dimensions down to hit target
          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png")
          );
          if (blob.size <= targetBytes) { resolve({ blob, width: targetW, height: targetH }); return; }
          // Recursively scale down
          const scaleFactor = Math.sqrt(targetBytes / blob.size);
          const newW = Math.max(1, Math.round(targetW * scaleFactor));
          const newH = Math.max(1, Math.round(targetH * scaleFactor));
          const result = await resizeImage(file, newW, newH, targetKB);
          resolve(result); return;
        }

        let low = 0.01, high = 1.0;
        let best: Blob | null = null;
        for (let i = 0; i < 8; i++) {
          const q = (low + high) / 2;
          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), mime, q)
          );
          if (blob.size <= targetBytes) { best = blob; low = q; }
          else { high = q; }
        }
        const finalBlob = best ?? await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), mime, 0.01)
        );
        resolve({ blob: finalBlob, width: targetW, height: targetH });
      } else {
        const quality = mime === "image/png" ? undefined : 0.88;
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), mime, quality)
        );
        resolve({ blob, width: targetW, height: targetH });
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

export default function ImageResizer() {
  const [mode, setMode] = useState<ResizeMode>("dimensions");
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [lockAspect, setLockAspect] = useState(true);
  const [targetKB, setTargetKB] = useState("500");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  // Original dimensions for aspect ratio lock
  const originalDimsRef = useRef<{ w: number; h: number } | null>(null);

  const handleWidthChange = useCallback((val: string) => {
    setWidth(val);
    if (lockAspect && originalDimsRef.current) {
      const { w, h } = originalDimsRef.current;
      const newH = Math.round(parseInt(val) * (h / w));
      if (!isNaN(newH)) setHeight(String(newH));
    }
  }, [lockAspect]);

  const handleHeightChange = useCallback((val: string) => {
    setHeight(val);
    if (lockAspect && originalDimsRef.current) {
      const { w, h } = originalDimsRef.current;
      const newW = Math.round(parseInt(val) * (w / h));
      if (!isNaN(newW)) setWidth(String(newW));
    }
  }, [lockAspect]);

  const applyPreset = useCallback((preset: Preset) => {
    setWidth(String(preset.w));
    setHeight(String(preset.h));
    setMode("dimensions");
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setResults([]);
    setDownloaded(false);

    // Get original dimensions from first file for aspect lock
    if (files.length > 0 && !originalDimsRef.current) {
      const img = new Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise<void>((resolve) => {
        img.onload = () => {
          originalDimsRef.current = { w: img.naturalWidth, h: img.naturalHeight };
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
        img.src = url;
      });
    }

    const processed: Result[] = [];
    for (const file of files) {
      try {
        const w = parseInt(width) || 800;
        const h = parseInt(height) || 600;
        const kb = mode === "target" ? parseInt(targetKB) || 500 : undefined;

        const { blob, width: outW, height: outH } = await resizeImage(file, w, h, kb);
        const ext = file.type === "image/png" ? "png" : "jpg";
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const filename = `${baseName}-${outW}x${outH}.${ext}`;
        const url = URL.createObjectURL(blob);
        processed.push({
          url,
          filename,
          size: blob.size,
          originalSize: file.size,
          originalName: file.name,
          width: outW,
          height: outH,
          thumbnailUrl: url,
        });
      } catch (err) {
        console.error(err);
        addToast(`Failed to resize ${file.name}`, "error");
      }
    }

    setResults(processed);
    setIsProcessing(false);
    if (processed.length > 0) {
      addToast(`${processed.length} image${processed.length > 1 ? "s" : ""} resized`, "success");
    }
  }, [mode, width, height, targetKB]);

  usePasteImage((file) => handleFiles([file]));

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
    a.download = "resized-images.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const reset = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setDownloaded(false);
    originalDimsRef.current = null;
  }, [results]);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <FileDropZone accept=".jpg,.jpeg,.png,.webp" multiple maxSizeMB={50} onFiles={handleFiles} />

      {/* Mode tabs */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="flex gap-1.5">
          {([
            { id: "dimensions", label: "Custom Size" },
            { id: "presets", label: "Presets" },
            { id: "target", label: "Target File Size" },
          ] as { id: ResizeMode; label: string }[]).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${mode === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "dimensions" && (
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={() => setLockAspect((l) => !l)}
                className="mb-2 rounded-lg border border-border p-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              >
                {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            {lockAspect && (
              <p className="text-xs text-muted-foreground">Aspect ratio locked — changing one dimension updates the other proportionally.</p>
            )}
          </div>
        )}

        {mode === "presets" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="group rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <p className="text-xs font-semibold text-foreground">{preset.label}</p>
                <p className="text-xs text-muted-foreground">{preset.w}×{preset.h}</p>
                {preset.note && <p className="text-xs text-muted-foreground/70">{preset.note}</p>}
              </button>
            ))}
          </div>
        )}

        {mode === "target" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Target file size (KB)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={10}
                  value={targetKB}
                  onChange={(e) => setTargetKB(e.target.value)}
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                />
                <div className="flex gap-1.5">
                  {["100", "500", "1000"].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setTargetKB(kb)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${targetKB === kb ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                    >
                      {kb === "1000" ? "1 MB" : `${kb} KB`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Uses binary-search quality reduction to get as close to your target as possible. Dimensions from "Custom Size" apply first.
            </p>
          </div>
        )}
      </div>

      {isProcessing && <ProcessingIndicator label="Resizing images…" />}

      {results.length > 0 && !isProcessing && !downloaded && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Results</h2>
          {results.map((r, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{r.originalName}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-foreground">{r.width}×{r.height}px</span>
              </div>
              <DownloadCard
                href={r.url}
                filename={r.filename}
                fileSize={r.size}
                originalSize={r.originalSize}
                thumbnailUrl={r.thumbnailUrl}
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

      {downloaded && (
        <PostDownloadState
          toolSlug="resize-image"
          resetLabel="Resize another image"
          onReset={reset}
          redownloadSlot={
            results.length === 1 ? (
              <a href={results[0].url} download={results[0].filename} className="underline hover:text-foreground transition-colors">
                Re-download {truncateFilename(results[0].filename, 28)}
              </a>
            ) : (
              <button onClick={downloadAll} className="underline hover:text-foreground transition-colors">
                Re-download all as ZIP
              </button>
            )
          }
        />
      )}
    </div>
  );
}
