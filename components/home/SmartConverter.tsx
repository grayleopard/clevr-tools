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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdSlot from "@/components/tool/AdSlot";
import { usePasteImage } from "@/lib/usePasteImage";
import { addToast } from "@/lib/toast";
import { setPendingFile } from "@/lib/file-handoff";
import { formatBytes, truncateFilename } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type FileType = "png" | "jpg" | "webp" | "heic" | "pdf" | "docx" | "unknown";
type ActionId =
  | "compress-image"
  | "to-jpg"
  | "to-png"
  | "to-webp"
  | "compress-pdf"
  | "pdf-to-jpg"
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
  png: ["compress-image", "to-jpg", "to-webp"],
  jpg: ["compress-image", "to-png", "to-webp"],
  webp: ["to-png", "to-jpg"],
  heic: ["to-jpg"],
  pdf: ["compress-pdf", "pdf-to-jpg", "split-pdf", "rotate-pdf"],
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
    case "compress-image": return "/compress/image";
    case "to-jpg":         return fileType === "heic" ? "/convert/heic-to-jpg" : "/convert/png-to-jpg";
    case "to-png":         return fileType === "webp" ? "/convert/webp-to-png" : "/convert/jpg-to-png";
    case "to-webp":        return "/convert/png-to-webp";
    case "compress-pdf":   return "/compress/pdf";
    case "pdf-to-jpg":     return "/convert/pdf-to-jpg";
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
          <span className="text-primary underline underline-offset-2">click to browse</span>
          {" "}· paste with Ctrl+V
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {["PNG", "JPG", "WebP", "HEIC", "PDF", "DOCX"].map((fmt) => (
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
  const isPreviewable = detected.previewUrl !== null;

  return (
    <div className="animate-in fade-in duration-250">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">

        {/* File info card — slides in from the left */}
        <div className="animate-in fade-in slide-in-from-left-3 duration-300 flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          {/* Thumbnail or icon */}
          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/40 h-36">
            {isPreviewable ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detected.previewUrl!}
                alt={detected.file.name}
                className="h-full w-full object-contain animate-in fade-in zoom-in-95 duration-300"
              />
            ) : (
              <FileTypeIcon
                type={detected.type}
                className="h-12 w-12 text-muted-foreground animate-in zoom-in-75 fade-in duration-200"
              />
            )}
          </div>

          {/* Metadata */}
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-sm font-semibold text-foreground" title={detected.file.name}>
              {truncateFilename(detected.file.name, 28)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {/* Badge pops in with a slight delay after the card */}
              <span
                className="animate-in zoom-in-75 fade-in duration-200 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase"
                style={{ animationDelay: "80ms" }}
              >
                {detected.type === "unknown" ? "File" : detected.type}
              </span>
              <span
                className="animate-in fade-in duration-200 text-xs text-muted-foreground self-center"
                style={{ animationDelay: "100ms" }}
              >
                {formatBytes(detected.file.size)}
              </span>
            </div>
            {detected.dimensions && (
              <p className="animate-in fade-in duration-200 text-xs text-muted-foreground" style={{ animationDelay: "120ms" }}>
                {detected.dimensions.width} × {detected.dimensions.height}
              </p>
            )}
          </div>

          {/* Change file */}
          <button
            onClick={onReset}
            disabled={navigatingAction !== null}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground self-start disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            Change file
          </button>
        </div>

        {/* Action cards panel — slides in from the right, with stagger per card */}
        <div
          className="animate-in fade-in slide-in-from-right-3 duration-300 flex flex-col gap-3"
          style={{ animationDelay: "50ms" }}
        >
          <p className="text-sm font-semibold text-foreground">What do you want to do?</p>
          {actions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No tools available for this file type yet.
              <br />
              Browse the tools below.
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {actions.map((actionId, i) => {
                const def = ACTION_DEFS[actionId];
                const Icon = def.icon;
                const isNavigating = navigatingAction === actionId;
                const isOtherNavigating = navigatingAction !== null && navigatingAction !== actionId;

                return (
                  <button
                    key={actionId}
                    onClick={() => onAction(actionId)}
                    disabled={navigatingAction !== null}
                    style={{ animationDelay: `${110 + i * 65}ms` }}
                    className={[
                      "animate-in fade-in slide-in-from-bottom-2 duration-300",
                      "group flex items-start gap-3 rounded-xl border bg-background p-4 text-left",
                      "transition-all duration-150",
                      isNavigating
                        ? "border-primary/50 bg-primary/5 scale-[0.98] shadow-sm"
                        : isOtherNavigating
                        ? "border-border opacity-35 cursor-default"
                        : "border-border hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isNavigating
                          ? "bg-primary/10"
                          : "bg-muted group-hover:bg-primary/10",
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
                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
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

export default function SmartConverter() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [detected, setDetected] = useState<DetectedFile | null>(null);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [dropZoneDragging, setDropZoneDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation states
  const [isIdleExiting, setIsIdleExiting] = useState(false);
  const [isDetectedExiting, setIsDetectedExiting] = useState(false);
  const [navigatingAction, setNavigatingAction] = useState<ActionId | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
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

  // ── Core logic ────────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setNavigatingAction(null);

    const prevStage = stageRef.current;

    // Animate current view out before showing the new file
    if (prevStage === "idle") {
      setIsIdleExiting(true);
      await new Promise<void>((r) => setTimeout(r, 130));
      setIsIdleExiting(false);
    } else {
      // Replace detected state: briefly fade it out
      setIsDetectedExiting(true);
      await new Promise<void>((r) => setTimeout(r, 130));
      setDetected((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
      setIsDetectedExiting(false);
    }

    const type = detectFileType(file);
    const isPreviewable = (["png", "jpg", "webp"] as FileType[]).includes(type);
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
    stageRef.current = "detected";
    setStage("detected");

    const typeLabel = type === "unknown" ? "File" : type.toUpperCase();
    addToast(`${typeLabel} detected — choose an action below`, "info", 3000);
  }, []);

  // Keep a stable ref so the drag event closure always calls the latest processFile
  const processFileRef = useRef(processFile);
  processFileRef.current = processFile;

  usePasteImage(processFile);

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
    setIsDetectedExiting(true);
    setTimeout(() => {
      setDetected((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
      setError(null);
      stageRef.current = "idle";
      setStage("idle");
      setIsDetectedExiting(false);
    }, 200);
  }, [navigatingAction]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Full-page drag overlay */}
      {isPageDragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-primary/5 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary border-dashed bg-background/80 px-12 py-8 shadow-xl">
            <Upload className="h-8 w-8 text-primary animate-bob" />
            <p className="text-base font-semibold text-primary">Drop anywhere</p>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Error banner */}
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-auto shrink-0 opacity-70 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Idle view — with exit animation */}
        {stage === "idle" && (
          <div
            className="transition-all ease-out"
            style={{
              transitionDuration: "130ms",
              opacity: isIdleExiting ? 0 : 1,
              transform: isIdleExiting ? "scale(0.97) translateY(4px)" : "scale(1) translateY(0)",
            }}
          >
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
            />
          </div>
        )}

        {/* Detected view — with exit animation */}
        {stage === "detected" && detected && (
          <div
            className="transition-all ease-out"
            style={{
              transitionDuration: "200ms",
              opacity: isDetectedExiting ? 0 : 1,
              transform: isDetectedExiting ? "translateY(8px)" : "translateY(0)",
            }}
          >
            <DetectedView
              detected={detected}
              navigatingAction={navigatingAction}
              onAction={handleAction}
              onReset={reset}
            />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.heic,.heif,.pdf,.docx,.doc"
        className="hidden"
        onChange={handleFileInput}
      />
    </>
  );
}
