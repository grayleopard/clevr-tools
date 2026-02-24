"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  FileImage,
  Layers,
  Minimize2,
  Smartphone,
  X,
  Download,
  RotateCcw,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ImagePreviewCard from "@/components/tool/ImagePreviewCard";
import ToolCard from "@/components/tool/ToolCard";
import AdSlot from "@/components/tool/AdSlot";
import { PasteToast } from "@/components/tool/PasteToast";
import { usePasteImage } from "@/lib/usePasteImage";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import {
  compressImage,
  toJpg,
  toPng,
  toWebp,
  heicToJpg,
  compressPdf,
} from "@/lib/processors";
import { formatBytes, truncateFilename } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type FileType = "png" | "jpg" | "webp" | "heic" | "pdf" | "unknown";
type ActionId =
  | "compress-image"
  | "to-jpg"
  | "to-png"
  | "to-webp"
  | "compress-pdf";
type Stage = "idle" | "detected" | "processing" | "done";

interface DetectedFile {
  file: File;
  type: FileType;
  previewUrl: string | null;
  dimensions: { width: number; height: number } | null;
}

interface ProcessResult {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  actionId: ActionId;
  toolSlug: string;
  isImage: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ACTIONS: Record<FileType, ActionId[]> = {
  png: ["compress-image", "to-jpg", "to-webp"],
  jpg: ["compress-image", "to-png", "to-webp"],
  webp: ["to-png", "to-jpg"],
  heic: ["to-jpg"],
  pdf: ["compress-pdf"],
  unknown: [],
};

interface ActionDef {
  icon: LucideIcon;
  name: string;
  description: string;
  accent: string;
}

const ACTION_DEFS: Record<ActionId, ActionDef> = {
  "compress-image": {
    icon: Minimize2,
    name: "Compress",
    description: "Reduce file size while preserving quality",
    accent: "text-blue-600 dark:text-blue-400",
  },
  "to-jpg": {
    icon: FileImage,
    name: "Convert to JPG",
    description: "Smaller files, great for photos and sharing",
    accent: "text-amber-600 dark:text-amber-400",
  },
  "to-png": {
    icon: FileImage,
    name: "Convert to PNG",
    description: "Lossless format with transparency support",
    accent: "text-green-600 dark:text-green-400",
  },
  "to-webp": {
    icon: Layers,
    name: "Convert to WebP",
    description: "Modern web format — up to 30% smaller",
    accent: "text-purple-600 dark:text-purple-400",
  },
  "compress-pdf": {
    icon: FileText,
    name: "Compress PDF",
    description: "Strip metadata and reduce file size",
    accent: "text-red-600 dark:text-red-400",
  },
};

const PROCESSING_LABELS: Record<ActionId, string> = {
  "compress-image": "Compressing image…",
  "to-jpg": "Converting to JPG…",
  "to-png": "Converting to PNG…",
  "to-webp": "Converting to WebP…",
  "compress-pdf": "Compressing PDF…",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectFileType(file: File): FileType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();
  if (mime === "image/png" || ext === "png") return "png";
  if (mime === "image/jpeg" || ext === "jpg" || ext === "jpeg") return "jpg";
  if (mime === "image/webp" || ext === "webp") return "webp";
  if (
    mime === "image/heic" ||
    mime === "image/heif" ||
    ext === "heic" ||
    ext === "heif"
  )
    return "heic";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  return "unknown";
}

function getToolSlug(fileType: FileType, actionId: ActionId): string {
  if (actionId === "compress-image") return "image-compressor";
  if (actionId === "compress-pdf") return "pdf-compressor";
  if (actionId === "to-jpg") {
    if (fileType === "heic") return "heic-to-jpg";
    return "png-to-jpg";
  }
  if (actionId === "to-png") {
    if (fileType === "webp") return "webp-to-png";
    return "jpg-to-png";
  }
  if (actionId === "to-webp") return "png-to-webp";
  return "image-compressor";
}

function FileTypeIcon({ type, className }: { type: FileType; className?: string }) {
  switch (type) {
    case "pdf":
      return <FileText className={className} />;
    case "heic":
      return <Smartphone className={className} />;
    default:
      return <FileImage className={className} />;
  }
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function IdleView({
  isDraggingOver,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBrowse,
}: {
  isDraggingOver: boolean;
  onDragEnter: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  onBrowse: () => void;
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onBrowse}
      className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
        isDraggingOver
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
      }`}
    >
      {/* Animated upload icon */}
      <div className="relative animate-bob">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-base font-semibold text-foreground">
          {isDraggingOver ? "Drop it!" : "Drop any file here"}
        </p>
        <p className="text-sm text-muted-foreground">
          or{" "}
          <span className="text-primary underline underline-offset-2">
            click to browse
          </span>{" "}
          · paste with Ctrl+V
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {["PNG", "JPG", "WebP", "HEIC", "PDF"].map((fmt) => (
          <span
            key={fmt}
            className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {fmt}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetectedView({
  detected,
  onAction,
  onReset,
}: {
  detected: DetectedFile;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}) {
  const actions = TYPE_ACTIONS[detected.type];
  const isPreviewable = detected.previewUrl !== null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* File info card */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          {/* Thumbnail or icon */}
          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/40 h-36">
            {isPreviewable ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detected.previewUrl!}
                alt={detected.file.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <FileTypeIcon
                type={detected.type}
                className="h-12 w-12 text-muted-foreground"
              />
            )}
          </div>

          {/* Metadata */}
          <div className="min-w-0 space-y-1.5">
            <p
              className="truncate text-sm font-semibold text-foreground"
              title={detected.file.name}
            >
              {truncateFilename(detected.file.name, 28)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase">
                {detected.type === "unknown" ? "File" : detected.type}
              </span>
              <span className="text-xs text-muted-foreground self-center">
                {formatBytes(detected.file.size)}
              </span>
            </div>
            {detected.dimensions && (
              <p className="text-xs text-muted-foreground">
                {detected.dimensions.width} × {detected.dimensions.height}
              </p>
            )}
          </div>

          {/* Change file */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground self-start"
          >
            <X className="h-3.5 w-3.5" />
            Change file
          </button>
        </div>

        {/* Action cards */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">
            What do you want to do?
          </p>
          {actions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No tools available for this file type yet.
              <br />
              Browse the tools below.
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {actions.map((actionId) => {
                const def = ACTION_DEFS[actionId];
                const Icon = def.icon;
                return (
                  <button
                    key={actionId}
                    onClick={() => onAction(actionId)}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                      <Icon className={`h-4 w-4 ${def.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {def.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                        {def.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessingView({ label }: { label: string }) {
  return (
    <div className="animate-in fade-in duration-200 flex min-h-[320px] flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function DoneView({
  detected,
  result,
  onTryAnother,
  onStartOver,
}: {
  detected: DetectedFile;
  result: ProcessResult;
  onTryAnother: () => void;
  onStartOver: () => void;
}) {
  const reduction =
    result.originalSize > result.size
      ? Math.round((1 - result.size / result.originalSize) * 100)
      : null;

  const tool = getToolBySlug(result.toolSlug);
  const relatedTools = tool ? getRelatedTools(tool).slice(0, 3) : [];

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  }, [result]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
      {/* Before/after preview for images */}
      {result.isImage && detected.previewUrl && (
        <ImagePreviewCard
          originalUrl={detected.previewUrl}
          originalName={detected.file.name}
          originalSize={detected.file.size}
          processedUrl={result.url}
          processedName={result.filename}
          processedSize={result.size}
        />
      )}

      {/* Size comparison + download */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {truncateFilename(result.filename, 36)}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>{formatBytes(result.originalSize)}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">
              {formatBytes(result.size)}
            </span>
            {reduction !== null && reduction > 0 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                −{reduction}%
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onTryAnother}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try another action
        </button>
        <button
          onClick={onStartOver}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </button>
      </div>

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <div className="space-y-3 pt-1">
          <p className="text-sm font-medium text-muted-foreground">
            You might also need:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      )}

      <AdSlot className="h-[90px]" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartConverter() {
  const [stage, setStage] = useState<Stage>("idle");
  const [detected, setDetected] = useState<DetectedFile | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [dropZoneDragging, setDropZoneDragging] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // ── Full-page drag-and-drop ───────────────────────────────────────────────

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      dragCounterRef.current++;
      setIsPageDragging(true);
    };
    const handleDragLeave = () => {
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setIsPageDragging(false);
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsPageDragging(false);
      setDropZoneDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file) processFile(file);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── URL cleanup on unmount ────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (detected?.previewUrl) URL.revokeObjectURL(detected.previewUrl);
      if (result?.url) URL.revokeObjectURL(result.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core logic ────────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    // Revoke previous URLs
    setDetected((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setResult((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setError(null);

    const type = detectFileType(file);
    const isPreviewable = ["png", "jpg", "webp"].includes(type);

    let previewUrl: string | null = null;
    let dimensions: { width: number; height: number } | null = null;

    if (isPreviewable) {
      previewUrl = URL.createObjectURL(file);
      try {
        const bitmap = await createImageBitmap(file);
        dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
      } catch {
        // dimensions unavailable — no-op
      }
    }

    setDetected({ file, type, previewUrl, dimensions });
    setStage("detected");
  }, []);

  // Clipboard paste — feeds directly into processFile (same as drop)
  const { pasteToast } = usePasteImage(processFile);

  const handleAction = useCallback(
    async (actionId: ActionId) => {
      if (!detected) return;
      setError(null);
      setProcessingLabel(PROCESSING_LABELS[actionId]);
      setStage("processing");

      const baseName = detected.file.name.replace(/\.[^.]+$/, "");

      try {
        let blob: Blob;
        let filename: string;

        switch (actionId) {
          case "compress-image": {
            const { blob: b, ext } = await compressImage(
              detected.file,
              80,
              "original"
            );
            blob = b;
            filename = `${baseName}-compressed.${ext}`;
            break;
          }
          case "to-jpg":
            blob = await toJpg(detected.file, 90);
            filename = `${baseName}.jpg`;
            break;
          case "to-png":
            blob = await toPng(detected.file);
            filename = `${baseName}.png`;
            break;
          case "to-webp":
            blob = await toWebp(detected.file, 85);
            filename = `${baseName}.webp`;
            break;
          case "compress-pdf":
            blob = await compressPdf(detected.file);
            filename = `${baseName}-compressed.pdf`;
            break;
        }

        const toolSlug = getToolSlug(detected.type, actionId);
        const isImage = actionId !== "compress-pdf";

        setResult((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return {
            url: URL.createObjectURL(blob),
            filename,
            size: blob.size,
            originalSize: detected.file.size,
            actionId,
            toolSlug,
            isImage,
          };
        });
        setStage("done");
      } catch (err) {
        console.error("Processing failed:", err);
        setError("Something went wrong. Please try again.");
        setStage("detected");
      }
    },
    [detected]
  );

  const backToDetected = useCallback(() => {
    setResult((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setError(null);
    setStage("detected");
  }, []);

  const reset = useCallback(() => {
    setDetected((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setResult((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setError(null);
    setStage("idle");
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so same file can be reselected
      e.target.value = "";
    },
    [processFile]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Full-page drag overlay */}
      {isPageDragging && stage !== "processing" && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-primary/5 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary border-dashed bg-background/80 px-12 py-8 shadow-xl">
            <Upload className="h-8 w-8 text-primary animate-bob" />
            <p className="text-base font-semibold text-primary">
              Drop anywhere
            </p>
          </div>
        </div>
      )}

      {/* Smart converter container */}
      <div className="relative">
        {/* Error banner */}
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto shrink-0 opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {stage === "idle" && (
          <IdleView
            isDraggingOver={dropZoneDragging}
            onDragEnter={(e) => {
              e.stopPropagation();
              setDropZoneDragging(true);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              setDropZoneDragging(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropZoneDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
            onBrowse={() => fileInputRef.current?.click()}
          />
        )}

        {stage === "detected" && detected && (
          <DetectedView
            detected={detected}
            onAction={handleAction}
            onReset={reset}
          />
        )}

        {stage === "processing" && (
          <ProcessingView label={processingLabel} />
        )}

        {stage === "done" && detected && result && (
          <DoneView
            detected={detected}
            result={result}
            onTryAnother={backToDetected}
            onStartOver={reset}
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.heic,.heif,.pdf"
        className="hidden"
        onChange={handleFileInput}
      />

      <PasteToast show={pasteToast} />
    </>
  );
}
