"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";
import { formatBytes, truncateFilename } from "@/lib/utils";

interface ImagePreviewCardProps {
  originalUrl: string;
  originalName: string;
  originalSize: number;
  processedUrl: string;
  processedName: string;
  processedSize: number;
}

interface LightboxState {
  src: string;
  label: string;
}

export default function ImagePreviewCard({
  originalUrl,
  originalName,
  originalSize,
  processedUrl,
  processedName,
  processedSize,
}: ImagePreviewCardProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [originalError, setOriginalError] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Original */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original
          </p>
          <button
            onClick={() =>
              !originalError && setLightbox({ src: originalUrl, label: originalName })
            }
            className={`group relative w-full overflow-hidden rounded-lg border border-border bg-muted/30 ${
              originalError ? "cursor-default" : "cursor-zoom-in"
            }`}
            disabled={originalError}
          >
            {originalError ? (
              <div className="flex h-44 w-full items-center justify-center text-muted-foreground">
                <span className="text-xs">Preview unavailable</span>
              </div>
            ) : (
              <>
                <img
                  src={originalUrl}
                  alt={`Original: ${originalName}`}
                  onError={() => setOriginalError(true)}
                  className="h-44 w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium shadow backdrop-blur-sm">
                    <ZoomIn className="h-3 w-3" />
                    Zoom
                  </span>
                </div>
              </>
            )}
          </button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate font-mono">{truncateFilename(originalName, 22)}</span>
            <span className="shrink-0 pl-2">{formatBytes(originalSize)}</span>
          </div>
        </div>

        {/* Processed */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Result
          </p>
          <button
            onClick={() => setLightbox({ src: processedUrl, label: processedName })}
            className="group relative w-full cursor-zoom-in overflow-hidden rounded-lg border border-primary/25 bg-primary/5"
          >
            <img
              src={processedUrl}
              alt={`Result: ${processedName}`}
              className="h-44 w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium shadow backdrop-blur-sm">
                <ZoomIn className="h-3 w-3" />
                Zoom
              </span>
            </div>
          </button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate font-mono">{truncateFilename(processedName, 22)}</span>
            <span className="shrink-0 pl-2">{formatBytes(processedSize)}</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 text-white/80 transition-colors hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
              <span className="text-sm">Close</span>
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.label}
              className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <p className="mt-2 text-center text-xs text-white/60">{lightbox.label}</p>
          </div>
        </div>
      )}
    </>
  );
}
