"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import AdSlot from "@/components/tool/AdSlot";
import { usePasteImage } from "@/lib/usePasteImage";
import { setPendingFile } from "@/lib/file-handoff";
import { addToast } from "@/lib/toast";
import { formatBytes, truncateFilename } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type FileType = "png" | "jpg" | "gif" | "webp" | "heic" | "pdf" | "docx" | "unknown";
type ActionId =
  | "compress-gif"
  | "compress-image"
  | "to-jpg"
  | "to-png"
  | "to-webp"
  | "to-pdf"
  | "resize-image"
  | "crop-image"
  | "compress-pdf"
  | "pdf-to-jpg"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "word-to-pdf";
type Stage = "idle" | "detected";

interface DetectedFile {
  file: File;
  type: FileType;
  previewUrl: string | null;
  dimensions: { width: number; height: number } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ACTIONS: Record<FileType, ActionId[]> = {
  png: ["compress-image", "to-jpg", "to-webp", "to-pdf", "resize-image", "crop-image"],
  jpg: ["compress-image", "to-png", "to-webp", "to-pdf", "resize-image", "crop-image"],
  gif: ["compress-gif"],
  webp: ["to-png", "to-jpg", "resize-image"],
  heic: ["to-jpg", "to-png"],
  pdf: ["compress-pdf", "pdf-to-jpg", "merge-pdf", "split-pdf", "rotate-pdf"],
  docx: ["word-to-pdf"],
  unknown: [],
};

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

// ─── Route mapping ────────────────────────────────────────────────────────────

function getRoute(fileType: FileType, actionId: ActionId): string {
  switch (actionId) {
    case "compress-gif":   return "/tools/gif-compressor";
    case "compress-image": return "/compress/image";
    case "to-jpg":         return fileType === "heic" ? "/convert/heic-to-jpg" : "/convert/png-to-jpg";
    case "to-png":         return fileType === "webp" ? "/convert/webp-to-png" : "/convert/jpg-to-png";
    case "to-webp":        return "/convert/png-to-webp";
    case "to-pdf":         return fileType === "jpg" ? "/convert/jpg-to-pdf" : "/convert/png-to-pdf";
    case "resize-image":   return "/tools/resize-image";
    case "crop-image":     return "/files/image-cropper";
    case "compress-pdf":   return "/compress/pdf";
    case "pdf-to-jpg":     return "/convert/pdf-to-jpg";
    case "merge-pdf":      return "/tools/merge-pdf";
    case "split-pdf":      return "/tools/split-pdf";
    case "rotate-pdf":     return "/tools/rotate-pdf";
    case "word-to-pdf":    return "/convert/word-to-pdf";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectFileType(file: File): FileType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();
  if (mime === "image/png" || ext === "png") return "png";
  if (mime === "image/jpeg" || ext === "jpg" || ext === "jpeg") return "jpg";
  if (mime === "image/gif" || ext === "gif") return "gif";
  if (mime === "image/webp" || ext === "webp") return "webp";
  if (mime === "image/heic" || mime === "image/heif" || ext === "heic" || ext === "heif")
    return "heic";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    ext === "docx" || ext === "doc" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) return "docx";
  return "unknown";
}

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
}: {
  isDraggingOver: boolean;
  onDragEnter: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  onBrowse: () => void;
  onPasteClipboard: () => void;
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onBrowse}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onBrowse();
        }
      }}
      role="button"
      tabIndex={0}
      className={`relative overflow-hidden rounded-[1.75rem] border border-dashed px-6 py-10 text-center transition-[border-color,background-color,transform] duration-200 ${
        isDraggingOver
          ? "border-primary/55 bg-primary/[0.08]"
          : "border-[color:var(--ghost-border)] bg-card/[0.88] hover:border-primary/40 hover:bg-card"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[18%] top-8 h-20 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,var(--ghost-border)_1px,transparent_0)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 flex min-h-[256px] flex-col items-center justify-center gap-5">
        <div className="relative animate-bob">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.4rem] bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/[0.15]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-[2rem]">
            {isDraggingOver ? "Release to detect your file" : "Drop any file here"}
          </p>
          <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
            <span className="md:hidden">Convert, compress, or route files instantly.</span>
            <span className="hidden md:inline">Convert, compress, or route files instantly. Drag a file in, browse from your device, or paste a copied image from the clipboard.</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBrowse();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--primary-fixed),var(--primary))] px-5 py-3 text-sm font-semibold text-[var(--on-primary)] shadow-[var(--shadow-sm)] transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.98] dark:bg-[linear-gradient(135deg,var(--primary),var(--primary-dim))]"
          >
            <Upload className="h-4 w-4" />
            Browse Files
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPasteClipboard();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/[0.85] px-5 py-3 text-sm font-semibold text-primary transition-[background-color,color,border-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.98]"
          >
            <ClipboardPaste className="h-4 w-4" />
            Paste Clipboard
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["PNG", "JPG", "GIF", "WebP", "HEIC", "PDF", "DOCX"].map((fmt) => (
            <span
              key={fmt}
              className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {fmt}
            </span>
          ))}
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          All processing happens in your browser. Your files never leave your device.
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
  const actions = TYPE_ACTIONS[detected.type];
  const typeLabel = detected.type === "unknown" ? "File" : detected.type.toUpperCase();
  const isPreviewable = detected.previewUrl !== null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">

        {/* File info card */}
        <div className="flex flex-col gap-4 rounded-[1.5rem] bg-card/[0.92] p-5 shadow-[var(--shadow-sm)]">
          {/* Thumbnail or icon */}
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-[1.25rem] bg-muted/55">
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
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
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
            onClick={onReset}
            disabled={navigatingAction !== null}
            className="flex items-center gap-1.5 self-start rounded-full bg-muted/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            Change file
          </button>
        </div>

        {/* Action cards panel */}
        <div className="flex flex-col gap-4 rounded-[1.5rem] bg-muted/[0.45] p-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Detected file
            </p>
            <p className="text-lg font-bold tracking-[-0.02em] text-foreground">
              {typeLabel} detected — what do you want to do?
            </p>
          </div>
          {actions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-[1.25rem] border border-dashed border-[color:var(--ghost-border)] bg-card/70 p-8 text-center text-sm text-muted-foreground">
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
                    onClick={() => onAction(actionId)}
                    disabled={navigatingAction !== null}
                    className={[
                      "group flex items-start gap-3 rounded-[1.25rem] bg-card/[0.88] p-4 text-left shadow-[var(--shadow-sm)]",
                      "transition-[background-color,opacity,transform] duration-150",
                      isNavigating
                        ? "bg-primary/10 scale-[0.98]"
                        : isOtherNavigating
                        ? "opacity-35 cursor-default"
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
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Icon className={`h-4 w-4 ${def.accent}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {isNavigating ? "Opening…" : def.name}
                      </p>
                      {!isNavigating && (
                        <p className="mt-1 text-xs leading-snug text-muted-foreground">
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

      <AdSlot className="mt-6 h-[90px]" />
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

    const type = detectFileType(file);
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
      setNavigatingAction(actionId);

      // Brief feedback delay (spinner visible) before navigating
      setTimeout(() => {
        setPendingFile(detected.file);
        router.push(getRoute(detected.type, actionId));
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

  return (
    <>
      {/* Full-page drag overlay */}
      {isPageDragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-primary/[0.06] backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-dashed border-primary/55 bg-card/[0.88] px-12 py-8 shadow-[var(--ambient-shadow-strong)]">
            <Upload className="h-8 w-8 text-primary animate-bob" />
            <p className="text-base font-semibold text-primary">Drop anywhere</p>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Error banner */}
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            <button onClick={() => setError(null)} className="ml-auto shrink-0 opacity-70 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Both views always in DOM — toggled with visibility + opacity */}

        {/* Idle view: hidden instantly via display:none */}
        <div style={{ display: stage === "idle" ? "block" : "none" }}>
          <IdleView
            isDraggingOver={dropZoneDragging}
            onDragEnter={(e) => { e.stopPropagation(); setDropZoneDragging(true); }}
            onDragLeave={(e) => { e.stopPropagation(); setDropZoneDragging(false); }}
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
          />
        </div>

        {/* Detected view: pre-laid-out with visibility:hidden, fades in via opacity */}
        <div
          style={{
            visibility: stage === "detected" ? "visible" : "hidden",
            opacity: stage === "detected" ? 1 : 0,
            pointerEvents: stage === "detected" ? "auto" : "none",
            transition: "opacity 200ms ease",
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.heic,.heif,.pdf,.docx,.doc"
        className="hidden"
        onChange={handleFileInput}
      />
    </>
  );
}
