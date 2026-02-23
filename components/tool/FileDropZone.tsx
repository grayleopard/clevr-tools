"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, AlertCircle } from "lucide-react";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFiles: (files: File[]) => void;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DropState = "idle" | "hover" | "loaded" | "error";

export default function FileDropZone({
  accept,
  multiple = false,
  maxSizeMB,
  onFiles,
  className = "",
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<DropState>("idle");
  const [loadedFiles, setLoadedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const acceptedExtensions = accept.split(",").map((s) => s.trim().toLowerCase());

  const validate = useCallback(
    (files: File[]): string | null => {
      for (const file of files) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!acceptedExtensions.some((a) => a === ext || a === file.type)) {
          return `"${file.name}" is not a supported format. Accepted: ${accept}`;
        }
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          return `"${file.name}" exceeds the ${maxSizeMB} MB size limit.`;
        }
      }
      return null;
    },
    [accept, acceptedExtensions, maxSizeMB]
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
    },
    [validate, onFiles]
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
  }, []);

  const stateStyles: Record<DropState, string> = {
    idle: "border-border hover:border-primary/60 hover:bg-muted/30",
    hover: "border-primary bg-primary/5",
    loaded: "border-primary bg-primary/5",
    error: "border-destructive bg-destructive/5",
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${stateStyles[state]}`}
        onDragOver={(e) => { e.preventDefault(); setState("hover"); }}
        onDragLeave={() => setState(loadedFiles.length ? "loaded" : "idle")}
        onDrop={handleDrop}
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
        ) : state === "loaded" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-2">
              {loadedFiles.map((f, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {f.name} ({formatBytes(f.size)})
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); clear(); }}
            >
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {state === "hover" ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or <span className="text-primary underline">click to browse</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted: {accept}
              {maxSizeMB ? ` · Max ${maxSizeMB} MB` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
