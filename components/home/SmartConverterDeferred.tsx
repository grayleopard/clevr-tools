"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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
}: {
  isDraggingOver: boolean;
  onActivateBrowse: () => void;
  onDropFile: (file: File) => void;
  onDragState: (dragging: boolean) => void;
  onPasteClipboard: () => void;
}) {
  return (
    <div
      onClick={onActivateBrowse}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivateBrowse();
        }
      }}
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
      className={`relative overflow-hidden rounded-[1.75rem] border border-dashed px-6 py-12 text-center transition-[border-color,background-color,transform] duration-200 ${
        isDraggingOver
          ? "border-primary/55 bg-primary/[0.08]"
          : "border-[color:var(--ghost-border)] bg-card/[0.88] hover:border-primary/40 hover:bg-card"
      }`}
      role="button"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[18%] top-8 h-20 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,var(--ghost-border)_1px,transparent_0)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 flex min-h-[280px] flex-col items-center justify-center gap-6">
        <div className="rounded-full bg-muted/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Smart converter
        </div>

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
            Convert, compress, or route files instantly. Drag a file in, browse from your device, or paste a copied image from the clipboard.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onActivateBrowse();
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
          {["PNG", "JPG", "WebP", "HEIC", "PDF", "DOCX"].map((format) => (
            <span
              key={format}
              className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {format}
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

export default function SmartConverterDeferred() {
  const [enabled, setEnabled] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileToken, setPendingFileToken] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      />
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.heic,.heif,.pdf,.docx,.doc"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void activateWithFile(file);
          event.target.value = "";
        }}
      />
    </>
  );
}
