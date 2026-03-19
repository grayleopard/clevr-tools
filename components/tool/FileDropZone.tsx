"use client";

import { useRef, useState, useCallback, useMemo, useEffect, useId } from "react";
import { AlertCircle, ClipboardPaste, Lock, Plus, Upload } from "lucide-react";
import { usePdfXRayContext } from "@/lib/xray/pdf-xray-context";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFiles: (files: File[]) => void;
  className?: string;
  /** Change this value to force-reset the drop zone to its idle state. */
  resetKey?: number;
  /** When true, render a compact "Add more files" bar instead of the full drop zone. */
  compact?: boolean;
  /** Optional clipboard action for tools that support direct paste. */
  onPasteClipboard?: () => void;
  headline?: string;
  privacyNote?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Derive a deduplicated, uppercase list of format labels from the accept string. */
function parseFormats(accept: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of accept.split(",")) {
    const ext = raw.trim().replace(/^\./, "").toLowerCase();
    // Normalise aliases
    const label =
      ext === "jpeg" ? "JPG" :
      ext === "heif" ? "HEIC" :
      ext.toUpperCase();
    if (!seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

type DropState = "idle" | "hover" | "loaded" | "error";

export default function FileDropZone({
  accept,
  multiple = false,
  maxSizeMB,
  onFiles,
  className = "",
  resetKey,
  compact = false,
  onPasteClipboard,
  headline = "Drop files here",
  privacyNote = "Files stay in your browser — nothing is uploaded",
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<DropState>("idle");
  const [loadedFiles, setLoadedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const xrayCtx = usePdfXRayContext();
  const dragCounter = useRef(0);
  const gridPatternId = useId().replace(/:/g, "");
  const hasSelection = loadedFiles.length > 0;
  const showCompact = compact || hasSelection;

  // Reset internal state when parent changes resetKey
  const prevResetKey = useRef(resetKey);
  useEffect(() => {
    if (resetKey !== undefined && resetKey !== prevResetKey.current) {
      prevResetKey.current = resetKey;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting internal state in response to parent resetKey prop change
      setLoadedFiles([]);
      setState("idle");
      setErrorMsg("");
      if (inputRef.current) inputRef.current.value = "";
      xrayCtx?.setFile(null);
    }
  }, [resetKey, xrayCtx]);

  const acceptedExtensions = useMemo(
    () => accept.split(",").map((s) => s.trim().toLowerCase()),
    [accept]
  );
  const formatLabels = parseFormats(accept);

  const validate = useCallback(
    (files: File[]): string | null => {
      for (const file of files) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!acceptedExtensions.some((a) => a === ext || a === file.type)) {
          return `"${file.name}" is not a supported format.`;
        }
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          return `"${file.name}" exceeds the ${maxSizeMB} MB limit.`;
        }
      }
      return null;
    },
    [acceptedExtensions, maxSizeMB]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const err = validate(files);
      if (err) {
        setState("error");
        setErrorMsg(err);
        return;
      }
      setLoadedFiles(files);
      setState("loaded");
      setErrorMsg("");
      onFiles(files);
      // Publish the first file to PdfXRayContext when inside a provider
      xrayCtx?.setFile(files[0] ?? null);
    },
    [validate, onFiles, xrayCtx]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const files = Array.from(e.dataTransfer.files);
      if (files.length) handleFiles(multiple ? files : [files[0]]);
    },
    [handleFiles, multiple]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) handleFiles(files);
    },
    [handleFiles]
  );

  const clear = useCallback(() => {
    setLoadedFiles([]);
    setState("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
    xrayCtx?.setFile(null);
  }, [xrayCtx]);

  const stateStyles: Record<DropState, string> = {
    idle: "border-[color:var(--ghost-border)] bg-muted/[0.28] hover:border-primary/40 hover:bg-primary/[0.03]",
    hover: "border-primary/45 bg-primary/[0.05]",
    loaded: "border-primary/50 bg-primary/[0.05]",
    error: "border-destructive bg-destructive/5",
  };

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const totalSize = loadedFiles.reduce((sum, file) => sum + file.size, 0);
  const compactLabel = multiple ? "Add more files" : "Choose another file";
  const supportsClipboard = typeof onPasteClipboard === "function";

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
      />

      {showCompact ? (
        <div className="space-y-2">
          <div
            className="flex min-h-14 items-center justify-center gap-3 rounded-[1.15rem] border border-dashed border-[color:var(--ghost-border)] bg-muted/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
            onClick={openPicker}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openPicker()}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="font-medium">{compactLabel}</span>
            {hasSelection && (
              <span className="truncate text-xs text-muted-foreground">
                {multiple && loadedFiles.length > 1
                  ? `${loadedFiles.length} selected · ${formatBytes(totalSize)}`
                  : `${loadedFiles[0]?.name ?? ""} · ${formatBytes(totalSize)}`}
              </span>
            )}
          </div>
          {state === "error" && errorMsg ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <span className="min-w-0 truncate">{errorMsg}</span>
              <button
                type="button"
                className="shrink-0 underline"
                onClick={(event) => {
                  event.stopPropagation();
                  clear();
                }}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`group relative min-h-[260px] overflow-hidden rounded-[2rem] border-2 border-dashed p-8 text-center transition-[border-color,background-color] duration-200 cursor-pointer ${stateStyles[state]}`}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!e.dataTransfer.types.includes("Files")) return;
            dragCounter.current++;
            if (dragCounter.current === 1) setState("hover");
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => {
            dragCounter.current = Math.max(0, dragCounter.current - 1);
            if (dragCounter.current === 0) setState("idle");
          }}
          onDrop={(e) => {
            dragCounter.current = 0;
            handleDrop(e);
          }}
          onClick={openPicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openPicker()}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] text-foreground">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={gridPatternId} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-x-[18%] top-8 h-20 rounded-full bg-primary/10 blur-3xl" />

          {state === "error" ? (
            <div className="relative z-10 flex flex-col items-center gap-2">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm font-medium text-destructive">{errorMsg}</p>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="rounded-full bg-card p-4 shadow-[var(--shadow-sm)] transition-transform duration-500 group-hover:scale-110">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                  {state === "hover" ? "Drop it here" : headline}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Upload once, process locally, and keep the original workflow intact.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_100%)] px-5 py-3 text-sm font-semibold text-[var(--on-primary-fixed)] shadow-[var(--shadow-sm)] transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.98]"
                >
                  <Upload className="h-4 w-4" />
                  Browse Files
                </button>
                {supportsClipboard ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPasteClipboard?.();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted/80"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                    Paste Clipboard
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {formatLabels.map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {fmt}
                  </span>
                ))}
                {maxSizeMB && (
                  <span className="rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Max {maxSizeMB} MB
                  </span>
                )}
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                <Lock className="h-3 w-3 shrink-0" />
                {privacyNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
