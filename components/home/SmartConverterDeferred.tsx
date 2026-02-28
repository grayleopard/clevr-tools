"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Sparkles, Upload } from "lucide-react";

const SmartConverter = dynamic(() => import("@/components/home/SmartConverter"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">Loading converter...</p>
    </div>
  ),
});

function SmartConverterSkeleton({
  isDraggingOver,
  onActivateBrowse,
  onDropFile,
  onDragState,
}: {
  isDraggingOver: boolean;
  onActivateBrowse: () => void;
  onDropFile: (file: File) => void;
  onDragState: (dragging: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivateBrowse}
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragState(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragState(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragState(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onDropFile(file);
      }}
      className={`flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
        isDraggingOver
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
      }`}
      aria-label="Open file converter"
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
          or <span className="text-primary underline underline-offset-2">click to browse</span>
          {" "}- paste with Ctrl+V
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {[
          "PNG",
          "JPG",
          "WebP",
          "HEIC",
          "PDF",
          "DOCX",
        ].map((format) => (
          <span
            key={format}
            className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {format}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function SmartConverterDeferred() {
  const [enabled, setEnabled] = useState(false);
  const [browseToken, setBrowseToken] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileToken, setPendingFileToken] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const activateBrowse = useCallback(() => {
    setEnabled(true);
    setBrowseToken((token) => token + 1);
  }, []);

  const dropFile = useCallback((file: File) => {
    setEnabled(true);
    setPendingFile(file);
    setPendingFileToken((token) => token + 1);
  }, []);

  if (enabled) {
    return (
      <SmartConverter
        deferredBrowseToken={browseToken}
        deferredFile={pendingFile}
        deferredFileToken={pendingFileToken}
        onDeferredFileHandled={() => setPendingFile(null)}
      />
    );
  }

  return (
    <SmartConverterSkeleton
      isDraggingOver={isDraggingOver}
      onActivateBrowse={activateBrowse}
      onDropFile={dropFile}
      onDragState={setIsDraggingOver}
    />
  );
}
