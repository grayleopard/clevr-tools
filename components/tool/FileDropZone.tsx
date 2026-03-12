"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { X, AlertCircle, FileText, ImageIcon, Smartphone, Lock, Plus } from "lucide-react";
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

/** Pick a sensible icon from the accept string. */
function DropIcon({ accept, className = "h-6 w-6 text-primary" }: { accept: string; className?: string }) {
  if (accept.includes("pdf")) return <FileText className={className} />;
  if (accept.includes("heic") || accept.includes("heif"))
    return <Smartphone className={className} />;
  return <ImageIcon className={className} />;
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
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<DropState>("idle");
  const [loadedFiles, setLoadedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const xrayCtx = usePdfXRayContext();
  const dragCounter = useRef(0);

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
    idle: "border-border hover:border-primary/50 hover:bg-primary/[0.02]",
    hover: "border-primary bg-primary/5",
    loaded: "border-primary/60 bg-primary/5",
    error: "border-destructive bg-destructive/5",
  };

  // ── Compact "Add more files" bar (controlled by parent) ─────
  if (compact) {
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
        <div
          className="rounded-lg border border-dashed border-border p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-primary transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <Plus className="h-4 w-4" />
          <span>Add more files</span>
        </div>
      </div>
    );
  }

  // ── Compact bar when file(s) are loaded ──────────────────────
  if (state === "loaded") {
    const totalSize = loadedFiles.reduce((s, f) => s + f.size, 0);
    const label =
      multiple && loadedFiles.length > 1
        ? `${loadedFiles.length} files selected`
        : (loadedFiles[0]?.name ?? "");

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
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
          <DropIcon accept={accept} className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
            {label}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatBytes(totalSize)}
          </span>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-[border-color,background-color] duration-200 cursor-pointer ${stateStyles[state]}`}
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
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={handleChange}
        />

        {state === "error" ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={(e) => { e.stopPropagation(); clear(); }}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <DropIcon accept={accept} />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {state === "hover" ? "Drop it here" : "Drag & drop files here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or <span className="text-primary underline">click to browse</span>
              </p>
            </div>

            {/* Format pills */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {formatLabels.map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {fmt}
                </span>
              ))}
              {maxSizeMB && (
                <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                  Max {maxSizeMB} MB
                </span>
              )}
            </div>

            {/* Privacy line */}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Lock className="h-3 w-3 shrink-0" />
              Files stay in your browser — nothing is uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
