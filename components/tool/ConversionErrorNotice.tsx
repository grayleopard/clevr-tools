"use client";

import { AlertCircle } from "lucide-react";

/**
 * Inline failure notice for per-file conversion errors — pairs with a toast
 * fired at the moment of failure so the message survives even if the toast
 * has already auto-dismissed by the time the user looks. Always names a next
 * step, not just what went wrong.
 */
export function ConversionErrorNotice({ failedFilenames }: { failedFilenames: string[] }) {
  if (failedFilenames.length === 0) return null;

  const heading =
    failedFilenames.length === 1
      ? `Couldn't convert ${failedFilenames[0]}`
      : `Couldn't convert ${failedFilenames.length} files: ${failedFilenames.join(", ")}`;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">{heading}</p>
        <p className="mt-0.5 text-destructive/80">
          It may be corrupt or an unsupported format. Try a different file.
        </p>
      </div>
    </div>
  );
}
