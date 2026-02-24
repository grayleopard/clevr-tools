"use client";

import { useState } from "react";
import { Download, ArrowRight, X } from "lucide-react";
import { truncateFilename, formatBytes } from "@/lib/utils";
import { addToast } from "@/lib/toast";

interface DownloadCardProps {
  href: string;
  filename: string;
  fileSize: number;
  originalSize?: number;
  thumbnailUrl?: string;
  onDownload?: () => void;
}

export default function DownloadCard({
  href,
  filename,
  fileSize,
  originalSize,
  thumbnailUrl,
  onDownload,
}: DownloadCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const reduction =
    originalSize && originalSize > fileSize
      ? Math.round((1 - fileSize / originalSize) * 100)
      : null;

  const handleDownload = () => {
    addToast("Downloading…", "info", 1500);
    onDownload?.();
  };

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && thumbnailUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={filename}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <a
        href={href}
        download={filename}
        onClick={handleDownload}
        className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-primary/25 bg-primary/5 px-5 py-4 transition-all hover:border-primary/50 hover:bg-primary/10 active:scale-[0.99]"
      >
        {/* Optional thumbnail */}
        {thumbnailUrl && (
          <div
            className="shrink-0 cursor-zoom-in"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLightboxOpen(true);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={filename}
              className="h-10 w-10 rounded-md object-cover border border-border hover:ring-2 hover:ring-primary/40 transition-all"
            />
          </div>
        )}

        {/* File info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-semibold text-foreground">
            {truncateFilename(filename, 35)}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {originalSize ? (
              <>
                <span>{formatBytes(originalSize)}</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span className="font-medium text-foreground">{formatBytes(fileSize)}</span>
                {reduction !== null && reduction > 0 && (
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    −{reduction}%
                  </span>
                )}
                {reduction !== null && reduction <= 0 && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    No reduction
                  </span>
                )}
              </>
            ) : (
              <span>{formatBytes(fileSize)}</span>
            )}
          </div>
        </div>

        {/* Download CTA */}
        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all group-hover:opacity-90 group-hover:shadow-md">
          <Download className="h-4 w-4" />
          <span>Download</span>
        </div>
      </a>
    </>
  );
}
