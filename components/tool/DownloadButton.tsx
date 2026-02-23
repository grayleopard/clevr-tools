"use client";

import { Download } from "lucide-react";

interface DownloadButtonProps {
  href: string;
  filename: string;
  label?: string;
  fileSize?: number;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DownloadButton({
  href,
  filename,
  label = "Download",
  fileSize,
  className = "",
}: DownloadButtonProps) {
  return (
    <a
      href={href}
      download={filename}
      className={`inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80 ${className}`}
    >
      <Download className="h-4 w-4" />
      <span>{label}</span>
      {fileSize !== undefined && (
        <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
          {formatBytes(fileSize)}
        </span>
      )}
    </a>
  );
}
