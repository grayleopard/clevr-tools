"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import ImagePreviewCard from "@/components/tool/ImagePreviewCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { usePasteImage } from "@/lib/usePasteImage";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { Slider } from "@/components/ui/slider";
import { toJpg } from "@/lib/processors";
import { addToast } from "@/lib/toast";
import { truncateFilename } from "@/lib/utils";
import { TipJar } from "@/components/tool/TipJar";
import { getRelatedTools, getToolBySlug } from "@/lib/tools";

interface Result {
  url: string;
  filename: string;
  originalName: string;
  originalUrl: string;
  size: number;
  originalSize: number;
}

const tool = getToolBySlug("png-to-jpg")!;
const relatedTools = getRelatedTools(tool).map((relatedTool) => ({
  name: relatedTool.name,
  href: relatedTool.route,
}));

export default function PngToJpg() {
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const sourceFileRef = useRef<File | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const convert = useCallback(async (file: File, q: number) => {
    setIsProcessing(true);
    setResult((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
        URL.revokeObjectURL(prev.originalUrl);
      }
      return null;
    });

    try {
      const blob = await toJpg(file, q);
      const baseName = file.name.replace(/\.png$/i, "");
      setResult({
        url: URL.createObjectURL(blob),
        filename: `${baseName}.jpg`,
        originalName: file.name,
        originalUrl: URL.createObjectURL(file),
        size: blob.size,
        originalSize: file.size,
      });
    } catch (err) {
      console.error("Conversion failed:", err);
      addToast("Conversion failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      sourceFileRef.current = file;
      setDownloaded(false);
      void convert(file, quality);
    },
    [quality, convert]
  );

  useAutoLoadFile(handleFiles);
  usePasteImage((file) => handleFiles([file]));

  useEffect(() => {
    if (!sourceFileRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (sourceFileRef.current) {
        void convert(sourceFileRef.current, quality);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [quality, convert]);

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
        const extension =
          imageType.split("/").pop() === "jpeg"
            ? "jpg"
            : imageType.split("/").pop() ?? "png";
        handleFiles([new File([blob], `clipboard.${extension}`, { type: imageType })]);
        addToast("Image pasted from clipboard", "success");
        return;
      }

      addToast("No image found in clipboard — paste manually with Ctrl+V if needed", "info");
    } catch {
      addToast("Clipboard access denied — paste manually with Ctrl+V", "info");
    }
  }, [handleFiles]);

  const reset = useCallback(() => {
    setResult((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
        URL.revokeObjectURL(prev.originalUrl);
      }
      return null;
    });
    setDownloaded(false);
    sourceFileRef.current = null;
    setResetKey((key) => key + 1);
  }, []);

  const settingsPanel = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">JPEG quality</label>
          <span className="text-sm font-mono text-primary">{quality}%</span>
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[quality]}
          onValueChange={([value]) => setQuality(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[80, 90].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setQuality(preset)}
            className={`rounded-[1rem] border px-3 py-2 text-sm font-medium transition-colors ${
              quality === preset
                ? "border-primary bg-primary/10 text-primary"
                : "border-[color:var(--ghost-border)] bg-card/75 text-foreground hover:border-primary/35 hover:text-primary"
            }`}
          >
            {preset === 80 ? "Web (80)" : "Balanced (90)"}
          </button>
        ))}
      </div>
    </div>
  );

  const infoPanel = (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground">
      <p>
        JPG replaces PNG transparency with a white background. Use it when you want a
        lighter-weight file for photos or screenshots.
      </p>
      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Conversion note
        </p>
        <p className="mt-3">
          The browser handles the conversion locally and preserves the existing clevr.tools
          no-upload workflow.
        </p>
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      categoryName="Files & Assets"
      categoryHref="/files"
      relatedTools={relatedTools}
      settingsPanel={settingsPanel}
      infoPanel={infoPanel}
    >
      <div className="space-y-6">
        <PageDragOverlay onFiles={handleFiles} />

        <FileDropZone
          accept=".png"
          multiple={false}
          maxSizeMB={50}
          onFiles={handleFiles}
          resetKey={resetKey}
          compact={result !== null || isProcessing}
          onPasteClipboard={() => {
            void handleClipboardPaste();
          }}
        />

        {isProcessing ? <ProcessingIndicator label="Converting to JPG…" /> : null}

        {result && !isProcessing ? (
          <>
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Result
              </h2>
              <ImagePreviewCard
                originalUrl={result.originalUrl}
                originalName={result.originalName}
                originalSize={result.originalSize}
                processedUrl={result.url}
                processedName={result.filename}
                processedSize={result.size}
              />
              <DownloadCard
                href={result.url}
                filename={result.filename}
                fileSize={result.size}
                originalSize={result.originalSize}
                onDownload={() => setDownloaded(true)}
              />
            </div>

            {downloaded ? (
              <PostDownloadState
                toolSlug="png-to-jpg"
                resetLabel="Convert another file"
                onReset={reset}
                redownloadSlot={
                  <a
                    href={result.url}
                    download={result.filename}
                    className="underline transition-colors hover:text-foreground"
                  >
                    Re-download {truncateFilename(result.filename, 28)}
                  </a>
                }
              />
            ) : null}

            <TipJar />
          </>
        ) : null}
      </div>
    </ToolPageLayout>
  );
}
