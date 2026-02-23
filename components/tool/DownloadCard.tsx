"use client";

import { Download, ArrowRight } from "lucide-react";
import { truncateFilename, formatBytes } from "@/lib/utils";

interface DownloadCardProps {
  href: string;
  filename: string;
  fileSize: number;
  originalSize?: number;
  onDownload?: () => void;
}

export default function DownloadCard({
  href,
  filename,
  fileSize,
  originalSize,
  onDownload,
}: DownloadCardProps) {
  const reduction =
    originalSize && originalSize > fileSize
      ? Math.round((1 - fileSize / originalSize) * 100)
      : null;

  return (
    <a
      href={href}
      download={filename}
      onClick={onDownload}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-primary/25 bg-primary/5 px-5 py-4 transition-all hover:border-primary/50 hover:bg-primary/10 active:scale-[0.99]"
    >
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
  );
}
