"use client";

import { useState, useCallback, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  FileImage,
  Layers,
  Minimize2,
  Smartphone,
  X,
  Scissors,
  RotateCw,
  Sparkles,
  FileOutput,
  Maximize2,
  Crop,
  Merge,
  ClipboardPaste,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePasteImage } from "@/lib/usePasteImage";
import { setPendingFile } from "@/lib/file-handoff";
import {
  detectSmartConverterFileType,
  getSmartConverterActions,
  getSmartConverterRoute,
  type SmartConverterActionId,
  type SmartConverterFileType,
} from "@/lib/image-remediation/smart-converter-contracts";
import { addToast } from "@/lib/toast";
import { formatBytes, truncateFilename } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type FileType = SmartConverterFileType;
type ActionId = SmartConverterActionId;
type Stage = "idle" | "detected";

interface DetectedFile {
  file: File;
  type: FileType;
  previewUrl: string | null;
  dimensions: { width: number; height: number } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface ActionDef {
  icon: LucideIcon;
  name: string;
  description: string;
  accent: string;
}

const ACTION_DEFS: Record<ActionId, ActionDef> = {
  "compress-gif": {
    icon: Minimize2,
    name: "Compress GIF",
    description: "Reduce animated GIF size while keeping motion intact",
    accent: "text-primary",
  },
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
  "pdf-to-jpg": {
    icon: FileImage,
    name: "Convert to JPG",
    description: "Extract each page as a JPG image",
    accent: "text-amber-600 dark:text-amber-400",
  },
  "split-pdf": {
    icon: Scissors,
    name: "Split PDF",
    description: "Extract pages or split into separate files",
    accent: "text-purple-600 dark:text-purple-400",
  },
  "rotate-pdf": {
    icon: RotateCw,
    name: "Rotate PDF",
    description: "Rotate pages individually or all at once",
    accent: "text-blue-600 dark:text-blue-400",
  },
  "to-pdf": {
    icon: FileText,
    name: "Convert to PDF",
    description: "Create a PDF from your image",
    accent: "text-red-600 dark:text-red-400",
  },
  "resize-image": {
    icon: Maximize2,
    name: "Resize Image",
    description: "Change dimensions while keeping quality",
    accent: "text-teal-600 dark:text-teal-400",
  },
  "crop-image": {
    icon: Crop,
    name: "Crop Image",
    description: "Trim to the exact area you need",
    accent: "text-orange-600 dark:text-orange-400",
  },
  "merge-pdf": {
    icon: Merge,
    name: "Merge PDFs",
    description: "Combine multiple PDFs into one file",
    accent: "text-green-600 dark:text-green-400",
  },
  "word-to-pdf": {
    icon: FileOutput,
    name: "Convert to PDF",
    description: "Export Word document as a PDF file",
    accent: "text-blue-600 dark:text-blue-400",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FileTypeIcon({ type, className }: { type: FileType; className?: string }) {
  switch (type) {
    case "pdf":  return <FileText className={className} />;
    case "docx": return <FileOutput className={className} />;
    case "gif":  return <Layers className={className} />;
    case "heic": return <Smartphone className={className} />;
    default:     return <FileImage className={className} />;
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
  onPasteClipboard,
  descriptionId,
}: {
  isDraggingOver: boolean;
  onDragEnter: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  onBrowse: () => void;
  onPasteClipboard: () => void;
  descriptionId: string;
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative overflow-hidden border-2 border-dashed px-5 py-10 text-center transition-[border-color,background-color,transform] duration-200 focus-within:border-primary/60 sm:px-6 motion-reduce:transition-none ${
        isDraggingOver
          ? "border-primary/55 bg-primary/[0.08] motion-reduce:transform-none"
          : "border-[color:var(--ghost-border)] bg-card/[0.88] hover:border-primary/40 hover:bg-card"
      }`}
    >
      <button
        type="button"
        onClick={onBrowse}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[18%] top-8 h-20 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,var(--ghost-border)_1px,transparent_0)] [background-size:16px_16px]" />
      </div>

      <div className="pointer-events-none relative z-20 flex min-h-[256px] min-w-0 flex-col items-center justify-center gap-5">
        <div className="relative animate-bob motion-reduce:animate-none">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center border-2 border-primary/25 bg-primary/10">
            <Upload className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/[0.15]">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </div>
        </div>

        <div className="min-w-0 max-w-full space-y-3">
          <p
            className="break-words text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-[2rem]"
            aria-live="polite"
            aria-atomic="true"
          >
            {isDraggingOver ? "Release to detect your file" : "Drop any file here"}
          </p>
          <p className="mx-auto max-w-xl break-words text-sm leading-7 text-muted-foreground sm:text-[15px]">
            <span className="md:hidden">Convert or compress files instantly.</span>
            <span className="hidden md:inline">Convert or compress files instantly. Drag one in, browse from your device, or paste from your clipboard.</span>
          </p>
        </div>

        <div className="pointer-events-auto flex w-full flex-wrap justify-center gap-3 sm:w-auto">
          <button
            type="button"
            aria-describedby={descriptionId}
            onClick={(event) => {
              event.stopPropagation();
              onBrowse();
            }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--primary-fixed),var(--primary))] px-5 py-3 text-sm font-semibold text-[var(--on-primary)] shadow-[var(--shadow-sm)] transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto dark:bg-[linear-gradient(135deg,var(--primary),var(--primary-dim))] motion-reduce:transform-none motion-reduce:transition-none"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Browse Files
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPasteClipboard();
            }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/[0.85] px-5 py-3 text-sm font-semibold text-primary transition-[background-color,color,border-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto motion-reduce:transform-none motion-reduce:transition-none"
          >
            <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
            Paste Clipboard
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["PNG", "JPG", "GIF", "WebP", "PDF", "DOCX"].map((fmt) => (
            <span
              key={fmt}
              className="border border-[color:var(--ghost-border)] bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {fmt}
            </span>
          ))}
        </div>

        <p className="flex max-w-full items-start justify-center gap-2 break-words text-xs leading-5 text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>These six formats are handled in your browser. Every tool states where its processing happens before you start.</span>
        </p>
      </div>
    </div>
  );
}

function DetectedView({
  detected,
  navigatingAction,
  onAction,
  onReset,
}: {
  detected: DetectedFile;
  navigatingAction: ActionId | null;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}) {
  const actions = getSmartConverterActions(detected.type);
  const typeLabel = detected.type === "unknown" ? "File" : detected.type.toUpperCase();
  const isPreviewable = detected.previewUrl !== null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">

        {/* File info card */}
        <div className="flex flex-col gap-4 border border-[color:var(--ghost-border)] bg-card/[0.92] p-5">
          {/* Thumbnail or icon */}
          <div className="flex h-40 items-center justify-center overflow-hidden bg-muted/55">
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
          <div className="min-w-0 space-y-2">
            <p className="truncate text-base font-semibold text-foreground" title={detected.file.name}>
              {truncateFilename(detected.file.name, 28)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {detected.type === "unknown" ? "File" : detected.type}
              </span>
              <span className="self-center text-xs text-muted-foreground">
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
            type="button"
            onClick={onReset}
            disabled={navigatingAction !== null}
            className="flex min-h-11 items-center gap-1.5 self-start border border-[color:var(--ghost-border)] bg-muted/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Change file
          </button>
        </div>

        {/* Action cards panel */}
        <div className="flex flex-col gap-4 border border-[color:var(--ghost-border)] bg-muted/[0.45] p-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Detected file
            </p>
            <p className="break-words text-lg font-bold tracking-[-0.02em] text-foreground">
              {typeLabel} detected — what do you want to do?
            </p>
          </div>
          {actions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-[color:var(--ghost-border)] bg-card/70 p-8 text-center text-sm text-muted-foreground">
              No tools available for this file type yet.
              <br />
              Browse the tools below.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {actions.map((actionId) => {
                const def = ACTION_DEFS[actionId];
                const Icon = def.icon;
                const isNavigating = navigatingAction === actionId;
                const isOtherNavigating = navigatingAction !== null && navigatingAction !== actionId;

                return (
                  <button
                    key={actionId}
                    type="button"
                    onClick={() => onAction(actionId)}
                    disabled={navigatingAction !== null}
                    aria-busy={isNavigating || undefined}
                    className={[
                      "group flex min-h-11 min-w-0 items-start gap-3 border border-[color:var(--ghost-border)] bg-card/[0.88] p-4 text-left",
                      "transition-[background-color,opacity,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none",
                      isNavigating
                        ? "bg-primary/10 scale-[0.98]"
                        : isOtherNavigating
                        ? "cursor-default opacity-35"
                        : "hover:bg-card active:scale-[0.98]",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isNavigating
                          ? "bg-primary/10"
                          : "bg-muted/80 group-hover:bg-primary/10",
                      ].join(" ")}
                    >
                      {isNavigating ? (
                        <div
                          className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <Icon className={`h-4 w-4 ${def.accent}`} aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-foreground">
                        {isNavigating ? "Opening…" : def.name}
                      </p>
                      {!isNavigating && (
                        <p className="mt-1 break-words text-xs leading-snug text-muted-foreground">
                          {def.description}
                        </p>
                      )}
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

// ─── Main Component ───────────────────────────────────────────────────────────

interface SmartConverterProps {
  deferredBrowseToken?: number;
  deferredFile?: File | null;
  deferredFileToken?: number;
  onDeferredFileHandled?: () => void;
}

export default function SmartConverter({
  deferredBrowseToken = 0,
  deferredFile = null,
  deferredFileToken = 0,
  onDeferredFileHandled,
}: SmartConverterProps = {}) {

  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [detected, setDetected] = useState<DetectedFile | null>(null);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [dropZoneDragging, setDropZoneDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [navigatingAction, setNavigatingAction] = useState<ActionId | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const handledBrowseTokenRef = useRef(0);
  const handledDeferredFileTokenRef = useRef(0);
  const idStem = useId().replace(/:/g, "");
  const fileInputId = `smart-converter-input-${idStem}`;
  const fileDescriptionId = `smart-converter-description-${idStem}`;
  const errorId = `smart-converter-error-${idStem}`;
  // stageRef lets processFile read current stage without adding it as a dep
  const stageRef = useRef<Stage>("idle");

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
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsPageDragging(false);
      setDropZoneDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file) processFileRef.current(file);
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
  }, []);

  // ── URL cleanup on unmount ────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (detected?.previewUrl) URL.revokeObjectURL(detected.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Logo-click reset (same-page nav) ─────────────────────────────────────

  useEffect(() => {
    const handleReset = () => {
      setDetected((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
      setError(null);
      setNavigatingAction(null);
      stageRef.current = "idle";
      setStage("idle");
    };
    window.addEventListener("clevr:reset-home", handleReset);
    return () => window.removeEventListener("clevr:reset-home", handleReset);
  }, []);

  // ── Core logic ────────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setNavigatingAction(null);

    const type = detectSmartConverterFileType(file);
    const isPreviewable = (["png", "jpg", "gif", "webp"] as FileType[]).includes(type);
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

    // Clean up previous preview URL
    setDetected((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file, type, previewUrl, dimensions };
    });

    stageRef.current = "detected";
    setStage("detected");
  }, []);

  // Keep a stable ref so the drag event closure always calls the latest processFile
  const processFileRef = useRef(processFile);
  processFileRef.current = processFile;

  usePasteImage(processFile);

  useEffect(() => {
    if (!deferredBrowseToken) return;
    if (handledBrowseTokenRef.current === deferredBrowseToken) return;
    handledBrowseTokenRef.current = deferredBrowseToken;
    requestAnimationFrame(() => {
      fileInputRef.current?.click();
    });
  }, [deferredBrowseToken]);

  useEffect(() => {
    if (!deferredFile || !deferredFileToken) return;
    if (handledDeferredFileTokenRef.current === deferredFileToken) return;
    handledDeferredFileTokenRef.current = deferredFileToken;
    processFile(deferredFile);
    onDeferredFileHandled?.();
  }, [deferredFile, deferredFileToken, onDeferredFileHandled, processFile]);

  const handleAction = useCallback(
    (actionId: ActionId) => {
      if (!detected || navigatingAction) return;
      const route = getSmartConverterRoute(detected.type, actionId);
      if (!route) {
        setError("That action is not supported for this file type.");
        return;
      }
      setNavigatingAction(actionId);

      // Brief feedback delay (spinner visible) before navigating
      setTimeout(() => {
        setPendingFile(detected.file);
        router.push(route);
        if (detected.previewUrl) URL.revokeObjectURL(detected.previewUrl);
        setDetected(null);
        setNavigatingAction(null);
        stageRef.current = "idle";
        setStage("idle");
        setError(null);
      }, 160);
    },
    [detected, router, navigatingAction]
  );

  const reset = useCallback(() => {
    if (navigatingAction) return; // don't reset while navigating
    setDetected((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setError(null);
    stageRef.current = "idle";
    setStage("idle");
  }, [navigatingAction]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handlePasteFromClipboard = useCallback(async () => {
    if (!navigator.clipboard?.read) {
      addToast("Clipboard access is limited here — paste manually with Ctrl+V", "info");
      return;
    }

    try {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;

        const blob = await item.getType(imageType);
        const extension = imageType.split("/").pop() === "jpeg" ? "jpg" : imageType.split("/").pop() ?? "png";
        const file = new File([blob], `clipboard.${extension}`, { type: imageType });
        await processFile(file);
        addToast("Image pasted from clipboard", "success");
        return;
      }

      addToast("No image found in clipboard — paste manually with Ctrl+V if needed", "info");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, [processFile]);

  // ── Render ────────────────────────────────────────────────────────────────

  const inputDescribedBy = error ? `${fileDescriptionId} ${errorId}` : fileDescriptionId;
  const detectedStatus = detected
    ? `${detected.file.name} detected. Choose what you want to do next.`
    : "";

  return (
    <>
      {/* Full-page drag overlay */}
      {isPageDragging && (
        <div
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-primary/[0.06] px-4 backdrop-blur-[2px]"
          aria-hidden="true"
        >
          <div className="flex max-w-full flex-col items-center gap-3 border-2 border-dashed border-primary/55 bg-card/[0.88] px-8 py-8 shadow-[var(--ambient-shadow-strong)] sm:px-12">
            <Upload className="h-8 w-8 animate-bob text-primary motion-reduce:animate-none" />
            <p className="text-base font-semibold text-primary">Drop anywhere</p>
          </div>
        </div>
      )}

      <div className="relative">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {detectedStatus}
        </p>

        {/* Error banner */}
        {error && (
          <div
            id={errorId}
            role="alert"
            className="mb-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <span className="min-w-0 flex-1 break-words">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive motion-reduce:transition-none"
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Both views always in DOM — toggled with visibility + opacity */}

        {/* Idle view: hidden instantly via display:none */}
        <div style={{ display: stage === "idle" ? "block" : "none" }}>
          <IdleView
            isDraggingOver={dropZoneDragging}
            onDragEnter={(e) => { e.stopPropagation(); setDropZoneDragging(true); }}
            onDragLeave={(e) => {
              e.stopPropagation();
              const nextTarget = e.relatedTarget;
              if (nextTarget instanceof Node && e.currentTarget.contains(nextTarget)) return;
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
            onPasteClipboard={() => {
              void handlePasteFromClipboard();
            }}
            descriptionId={fileDescriptionId}
          />
        </div>

        {/* Detected view: pre-laid-out with visibility:hidden, fades in via opacity */}
        <div
          className="transition-opacity duration-200 motion-reduce:transition-none"
          style={{
            visibility: stage === "detected" ? "visible" : "hidden",
            opacity: stage === "detected" ? 1 : 0,
            pointerEvents: stage === "detected" ? "auto" : "none",
            // When hidden, collapse so idle view layout isn't affected
            ...(stage !== "detected" ? { position: "absolute" as const, left: 0, right: 0, top: 0 } : {}),
          }}
        >
          {detected && (
            <DetectedView
              detected={detected}
              navigatingAction={navigatingAction}
              onAction={handleAction}
              onReset={reset}
            />
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <label htmlFor={fileInputId} className="sr-only">
        Choose a file to convert or compress
      </label>
      <input
        id={fileInputId}
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx"
        className="sr-only"
        tabIndex={-1}
        aria-describedby={inputDescribedBy}
        aria-invalid={Boolean(error) || undefined}
        onChange={handleFileInput}
      />
      <p id={fileDescriptionId} className="sr-only">
        Choose one PNG, JPG, GIF, WebP, PDF, or DOCX file. You can also drag a file
        onto this page or paste an image from your clipboard. Processing happens in your browser.
      </p>
    </>
  );
}
