"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ClipboardPaste, Lock, Sparkles, Upload } from "lucide-react";
import { addToast } from "@/lib/toast";

const loadSmartConverter = () => import("@/components/home/SmartConverter");

const SmartConverter = dynamic(loadSmartConverter, {
  ssr: false,
  loading: () => null,
});

function SmartConverterSkeleton({
  isDraggingOver,
  onActivateBrowse,
  onDropFile,
  onDragState,
  onPasteClipboard,
  descriptionId,
}: {
  isDraggingOver: boolean;
  onActivateBrowse: () => void;
  onDropFile: (file: File) => void;
  onDragState: (dragging: boolean) => void;
  onPasteClipboard: () => void;
  descriptionId: string;
}) {
  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragState(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
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
      className={`relative overflow-hidden border-2 border-dashed px-5 py-10 text-center transition-[border-color,background-color,transform] duration-200 focus-within:border-primary/60 sm:px-6 motion-reduce:transition-none ${
        isDraggingOver
          ? "border-primary/55 bg-primary/[0.08] motion-reduce:transform-none"
          : "border-[color:var(--ghost-border)] bg-card/[0.88] hover:border-primary/40 hover:bg-card"
      }`}
    >
      <button
        type="button"
        onClick={onActivateBrowse}
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
              onActivateBrowse();
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
          {["PNG", "JPG", "GIF", "WebP", "PDF", "DOCX"].map((format) => (
            <span
              key={format}
              className="border border-[color:var(--ghost-border)] bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {format}
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

export default function SmartConverterDeferred() {
  const [enabled, setEnabled] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileToken, setPendingFileToken] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const idStem = useId().replace(/:/g, "");
  const inputId = `deferred-converter-input-${idStem}`;
  const descriptionId = `deferred-converter-description-${idStem}`;

  const activateBrowse = useCallback(() => {
    void loadSmartConverter();
    inputRef.current?.click();
  }, []);

  const activateWithFile = useCallback(async (file: File) => {
    setPendingFile(file);
    setPendingFileToken((token) => token + 1);
    await loadSmartConverter();
    setEnabled(true);
  }, []);

  const dropFile = useCallback((file: File) => {
    void activateWithFile(file);
  }, [activateWithFile]);

  const handleClipboardPaste = useCallback(async () => {
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
        await activateWithFile(file);
        addToast("Image pasted from clipboard", "success");
        return;
      }

      addToast("No image found in clipboard — paste manually with Ctrl+V if needed", "info");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, [activateWithFile]);

  useEffect(() => {
    const schedulePreload = () => {
      void loadSmartConverter();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(schedulePreload, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(schedulePreload, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  if (enabled) {
    return (
      <SmartConverter
        deferredFile={pendingFile}
        deferredFileToken={pendingFileToken}
        onDeferredFileHandled={() => setPendingFile(null)}
      />
    );
  }

  return (
    <>
      <SmartConverterSkeleton
        isDraggingOver={isDraggingOver}
        onActivateBrowse={activateBrowse}
        onDropFile={dropFile}
        onDragState={setIsDraggingOver}
        onPasteClipboard={() => {
          void handleClipboardPaste();
        }}
        descriptionId={descriptionId}
      />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {pendingFile ? `Loading file tools for ${pendingFile.name}.` : ""}
      </p>
      <label htmlFor={inputId} className="sr-only">
        Choose a file to convert or compress
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx"
        className="sr-only"
        tabIndex={-1}
        aria-describedby={descriptionId}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void activateWithFile(file);
          event.target.value = "";
        }}
      />
      <p id={descriptionId} className="sr-only">
        Choose one PNG, JPG, GIF, WebP, PDF, or DOCX file. You can also drag a file here or
        paste an image from your clipboard. Processing happens in your browser.
      </p>
    </>
  );
}
