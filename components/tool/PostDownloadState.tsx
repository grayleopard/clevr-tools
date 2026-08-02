"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import AdSlot from "@/components/tool/AdSlot";

const LazyRelatedToolsPanel = dynamic(
  () => import("@/components/tool/RelatedToolsPanel"),
  { ssr: false }
);

interface PostDownloadStateProps {
  toolSlug: string;
  resetLabel: string;
  onReset: () => void;
  redownloadSlot?: ReactNode;
}

export default function PostDownloadState({
  toolSlug,
  resetLabel,
  onReset,
  redownloadSlot,
}: PostDownloadStateProps) {
  return (
    <div className="space-y-6">
      {/* Success card */}
      <div
        className="flex min-w-0 flex-col items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-5 py-8 text-center sm:px-6 dark:border-green-900/40 dark:bg-green-950/20"
      >
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/40">
          <CheckCircle2
            className="h-8 w-8 text-green-700 dark:text-green-300"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0" role="status" aria-live="polite" aria-atomic="true">
          <p className="text-base font-semibold text-green-800 dark:text-green-300">
            Downloaded successfully
          </p>
          <p className="mt-1 break-words text-sm text-green-800 dark:text-green-300">
            Your file is in your Downloads folder
          </p>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 max-w-full break-words rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,opacity,box-shadow] hover:opacity-90 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-green-50 dark:focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
        >
          {resetLabel}
        </button>

        {/* Secondary re-download */}
        {redownloadSlot ? (
          <div className="max-w-full break-words text-xs text-muted-foreground">
            {redownloadSlot}
          </div>
        ) : null}
      </div>

      <LazyRelatedToolsPanel toolSlug={toolSlug} />

      {/* Ad */}
      <AdSlot className="h-[90px]" />
    </div>
  );
}
