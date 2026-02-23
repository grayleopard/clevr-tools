import { ArrowRight } from "lucide-react";

interface BeforeAfterProps {
  originalSize: number;
  compressedSize: number;
  filename?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BeforeAfter({ originalSize, compressedSize, filename }: BeforeAfterProps) {
  const reduction = Math.round((1 - compressedSize / originalSize) * 100);
  const isSmaller = compressedSize < originalSize;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
      {filename && (
        <span className="max-w-32 truncate text-muted-foreground text-xs">{filename}</span>
      )}
      <span className="font-medium">{formatBytes(originalSize)}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="font-medium">{formatBytes(compressedSize)}</span>
      {isSmaller ? (
        <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          -{reduction}%
        </span>
      ) : (
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          No reduction
        </span>
      )}
    </div>
  );
}
