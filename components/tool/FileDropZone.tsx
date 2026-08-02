"use client";

import {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
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
  subline?: string;
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

const stateStyles: Record<DropState, string> = {
  idle: "border-[color:var(--ghost-border)] bg-muted/[0.28] hover:border-primary/40 hover:bg-primary/[0.03]",
  hover: "border-primary/45 bg-primary/[0.05] scale-[1.005] motion-reduce:transform-none",
  loaded: "border-primary/50 bg-primary/[0.05] animate-success-pulse motion-reduce:animate-none",
  error: "border-destructive bg-destructive/5",
};

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

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
  subline = "Drop a file, get the result. Nothing is uploaded.",
  privacyNote = "Files stay in your browser — nothing is uploaded",
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [state, setState] = useState<DropState>("idle");
  const [loadedFiles, setLoadedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const xrayCtx = usePdfXRayContext();
  const dragCounter = useRef(0);
  const idStem = useId().replace(/:/g, "");
  const inputId = `file-input-${idStem}`;
  const descriptionId = `file-description-${idStem}`;
  const errorId = `file-error-${idStem}`;
  const gridPatternId = `file-grid-${idStem}`;
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

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const totalSize = loadedFiles.reduce((sum, file) => sum + file.size, 0);
  const compactLabel = multiple ? "Add more files" : "Choose another file";
  const supportsClipboard = typeof onPasteClipboard === "function";
  const inputDescription = `${subline} Accepted formats: ${formatLabels.join(", ")}.${
    maxSizeMB ? ` Maximum file size: ${maxSizeMB} MB.` : ""
  } ${privacyNote}.`;
  const describedBy = state === "error" && errorMsg
    ? `${descriptionId} ${errorId}`
    : descriptionId;
  const selectionStatus = hasSelection
    ? multiple && loadedFiles.length > 1
      ? `${loadedFiles.length} files selected, ${formatBytes(totalSize)} total.`
      : `${loadedFiles[0]?.name ?? "File"} selected, ${formatBytes(totalSize)}.`
    : "";

  return (
    <div className={`relative ${className}`}>
      {isHydrated ? (
        <>
          <label htmlFor={inputId} className="sr-only">
            {multiple ? "Choose files" : "Choose a file"}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            tabIndex={-1}
            aria-describedby={describedBy}
            aria-invalid={state === "error" || undefined}
            onChange={handleChange}
          />
        </>
      ) : null}
      <p id={descriptionId} className="sr-only">
        {inputDescription}
      </p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {selectionStatus}
      </p>

      {showCompact ? (
        <div className="space-y-2">
          <button
            type="button"
            className="flex min-h-14 w-full min-w-0 items-center justify-center gap-2 border border-dashed border-[color:var(--ghost-border)] bg-muted/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={openPicker}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            aria-label={compactLabel}
            aria-describedby={describedBy}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="shrink-0 font-medium">{compactLabel}</span>
            {hasSelection && (
              <span className="min-w-0 truncate text-left text-xs text-muted-foreground">
                {multiple && loadedFiles.length > 1
                  ? `${loadedFiles.length} selected · ${formatBytes(totalSize)}`
                  : `${loadedFiles[0]?.name ?? ""} · ${formatBytes(totalSize)}`}
              </span>
            )}
          </button>
          {state === "error" && errorMsg ? (
            <div
              id={errorId}
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              <span className="min-w-0 flex-1 break-words">{errorMsg}</span>
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-md px-2 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                onClick={clear}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`group relative min-h-[300px] overflow-hidden border-2 border-dashed p-5 text-center transition-[border-color,background-color,transform] duration-200 focus-within:border-primary/60 sm:p-8 motion-reduce:transition-none ${stateStyles[state]}`}
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
        >
          <button
            type="button"
            onClick={openPicker}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] text-foreground">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id={gridPatternId} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
            </svg>
          </div>

          {state === "error" ? (
            <div
              id={errorId}
              role="alert"
              className="pointer-events-none relative z-20 flex min-h-[218px] flex-col items-center justify-center gap-2"
            >
              <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
              <p className="max-w-full break-words text-sm font-medium text-destructive">{errorMsg}</p>
              <button
                type="button"
                className="pointer-events-auto min-h-11 rounded-md px-3 text-xs text-muted-foreground underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                onClick={clear}
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="pointer-events-none relative z-20 flex flex-col items-center gap-5">
              <div className={`border-2 border-primary bg-primary/10 p-4 transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none ${state === "hover" ? "scale-105" : ""}`}>
                <span className="flex h-10 w-10 items-center justify-center">
                  <Upload
                    className={`h-5 w-5 text-primary transition-transform duration-300 motion-reduce:transform-none motion-reduce:transition-none ${state === "hover" ? "-translate-y-0.5" : ""}`}
                    aria-hidden="true"
                  />
                </span>
              </div>
              <div className="min-w-0 max-w-full space-y-2">
                <p className="break-words font-display text-3xl font-black uppercase leading-none tracking-[-0.055em] text-foreground">
                  {state === "hover" ? "Drop it here" : headline}
                </p>
                <p className="break-words text-sm leading-7 text-muted-foreground">
                  {subline}
                </p>
              </div>

              <div className="pointer-events-auto flex w-full flex-wrap justify-center gap-3 sm:w-auto">
                <button
                  type="button"
                  aria-describedby={describedBy}
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-primary bg-primary px-5 py-3 text-sm font-bold text-[var(--on-primary)] transition-[transform,background-color,color] duration-150 hover:bg-primary-dim hover:text-background active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Browse Files
                </button>
                {supportsClipboard ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPasteClipboard?.();
                    }}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-primary bg-card/80 px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto motion-reduce:transition-none"
                  >
                    <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
                    Paste Clipboard
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {formatLabels.map((fmt) => (
                  <span
                    key={fmt}
                    className="border-b border-[color:var(--ghost-border)] bg-muted/70 px-1 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {fmt}
                  </span>
                ))}
                {maxSizeMB && (
                  <span className="border-b border-[color:var(--ghost-border)] bg-muted/70 px-1 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Max {maxSizeMB} MB
                  </span>
                )}
              </div>

              <p className="flex max-w-full items-start justify-center gap-1.5 break-words text-xs leading-5 text-muted-foreground/80">
                <Lock className="mt-1 h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{privacyNote}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
