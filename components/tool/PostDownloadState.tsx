"use client";

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import ToolCard from "@/components/tool/ToolCard";
import AdSlot from "@/components/tool/AdSlot";

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
  const tool = getToolBySlug(toolSlug);
  const relatedTools = tool ? getRelatedTools(tool).slice(0, 3) : [];

  return (
    <div className="space-y-6">
      {/* Success card */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900/40 dark:bg-green-950/20">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/40">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <p className="text-base font-semibold text-green-800 dark:text-green-300">
            Downloaded successfully
          </p>
          <p className="mt-1 text-sm text-green-700/70 dark:text-green-400/60">
            Your file is in your Downloads folder
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onReset}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
        >
          {resetLabel}
        </button>

        {/* Secondary re-download */}
        {redownloadSlot && (
          <div className="text-xs text-muted-foreground">{redownloadSlot}</div>
        )}
      </div>

      {/* You might also need */}
      {relatedTools.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">You might also need:</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      )}

      {/* Ad */}
      <AdSlot className="h-[90px]" />
    </div>
  );
}
