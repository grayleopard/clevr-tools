"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Download, Loader2, Sparkles, Wand2 } from "lucide-react";
import FileDropZone from "@/components/tool/FileDropZone";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { TipJar } from "@/components/tool/TipJar";
import { setPendingFile } from "@/lib/file-handoff";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import { usePasteImage } from "@/lib/usePasteImage";
import { formatBytes, truncateFilename } from "@/lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.webp";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const CHECKERBOARD_STYLE = {
  backgroundColor: "#f8fafc",
  backgroundImage:
    "linear-gradient(45deg, rgba(148,163,184,0.18) 25%, transparent 25%), linear-gradient(-45deg, rgba(148,163,184,0.18) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148,163,184,0.18) 75%), linear-gradient(-45deg, transparent 75%, rgba(148,163,184,0.18) 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
} as const;

type SourceImage = {
  file: File;
  url: string;
  width: number;
  height: number;
};

type ResultImage = {
  file: File;
  url: string;
  processingTime: string | null;
  remaining: number | null;
};

function isSupportedImage(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function getResultFilename(name: string): string {
  return `${name.replace(/\.[^.]+$/, "")}-no-bg.png`;
}

function buildInlineError(message: string) {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

export default function BackgroundRemover() {
  const router = useRouter();
  const [source, setSource] = useState<SourceImage | null>(null);
  const [result, setResult] = useState<ResultImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const previousSourceUrlRef = useRef<string | null>(null);
  const previousResultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previousSourceUrlRef.current) URL.revokeObjectURL(previousSourceUrlRef.current);
      if (previousResultUrlRef.current) URL.revokeObjectURL(previousResultUrlRef.current);
    };
  }, []);

  const clearResult = useCallback(() => {
    setResult((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      previousResultUrlRef.current = null;
      return null;
    });
  }, []);

  const resetAll = useCallback(() => {
    clearResult();
    setSource((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      previousSourceUrlRef.current = null;
      return null;
    });
    setError(null);
    setIsProcessing(false);
    setResetKey((value) => value + 1);
  }, [clearResult]);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!isSupportedImage(file)) {
      resetAll();
      setError("Unsupported file type. Upload JPG, PNG, or WebP.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      resetAll();
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    const url = URL.createObjectURL(file);

    try {
      const bitmap = await createImageBitmap(file);
      const nextSource: SourceImage = {
        file,
        url,
        width: bitmap.width,
        height: bitmap.height,
      };
      bitmap.close();

      clearResult();
      setError(null);
      setSource((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        previousSourceUrlRef.current = url;
        return nextSource;
      });
    } catch {
      URL.revokeObjectURL(url);
      setError("We couldn’t read that image. Try a different file.");
    }
  }, [clearResult, resetAll]);

  useAutoLoadFile(handleFiles);
  usePasteImage((file) => handleFiles([file]));

  const removeBackground = useCallback(async () => {
    if (!source) return;

    setError(null);
    setIsProcessing(true);
    clearResult();

    try {
      const formData = new FormData();
      formData.append("file", source.file);

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Processing failed." }));
        setError(payload.error || "Processing failed.");
        return;
      }

      const blob = await response.blob();
      const file = new File([blob], getResultFilename(source.file.name), {
        type: "image/png",
      });
      const url = URL.createObjectURL(file);
      const remainingHeader = response.headers.get("X-RateLimit-Remaining");
      const nextResult: ResultImage = {
        file,
        url,
        processingTime: response.headers.get("X-Processing-Time"),
        remaining:
          remainingHeader !== null && remainingHeader !== ""
            ? Number(remainingHeader)
            : null,
      };

      setResult((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        previousResultUrlRef.current = url;
        return nextResult;
      });
    } catch {
      setError("Something went wrong while removing the background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [clearResult, source]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const anchor = document.createElement("a");
    anchor.href = result.url;
    anchor.download = result.file.name;
    anchor.click();
  }, [result]);

  const sendToTool = useCallback(
    (route: string) => {
      if (!result) return;
      setPendingFile(result.file);
      router.push(route);
    },
    [result, router]
  );

  const processingSubtitle = useMemo(() => {
    if (!isProcessing || !source) return null;
    return `Processing ${truncateFilename(source.file.name, 42)} with AI…`;
  }, [isProcessing, source]);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <FileDropZone
        accept={ACCEPT}
        maxSizeMB={10}
        onFiles={handleFiles}
        resetKey={resetKey}
        compact={Boolean(source)}
      />

      <div className="rounded-xl border border-sky-500/15 bg-sky-500/5 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">🔒 Privacy note:</span> Your image is sent to our AI server for processing, then immediately deleted. Never stored.
      </div>

      {source ? (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Upload
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {truncateFilename(source.file.name, 52)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatBytes(source.file.size)} · {source.width} × {source.height}px
              </p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Choose another image
            </button>
          </div>

          {!result ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
                <div className="flex min-h-[360px] items-center justify-center p-4 sm:min-h-[420px] sm:p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local user file preview */}
                  <img
                    src={source.url}
                    alt={source.file.name}
                    className="max-h-[320px] w-full object-contain sm:max-h-[380px]"
                  />
                </div>
                {isProcessing ? (
                  <>
                    <div className="absolute inset-0 bg-slate-950/5" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/8 to-transparent" />
                    <div
                      className="absolute left-0 right-0 h-[3px] animate-[xray-scan_2.2s_ease-in-out_infinite] will-change-[top,opacity]"
                      style={{
                        background: "var(--scan-line)",
                        boxShadow:
                          "0 0 12px 4px var(--scan-line), 0 0 40px 8px var(--scan-glow)",
                      }}
                    />
                    <div className="absolute inset-x-4 bottom-4 rounded-xl bg-background/90 px-4 py-3 text-sm shadow-sm backdrop-blur-sm">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Removing background...
                      </div>
                      {processingSubtitle ? (
                        <p className="mt-1 text-xs text-muted-foreground">{processingSubtitle}</p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>

              <button
                type="button"
                onClick={removeBackground}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {isProcessing ? "Removing background..." : "Remove Background"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Original
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-border bg-white">
                    <div className="flex min-h-[320px] items-center justify-center p-4 sm:min-h-[360px] sm:p-6">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local user file preview */}
                      <img
                        src={source.url}
                        alt={`Original ${source.file.name}`}
                        className="max-h-[300px] w-full object-contain sm:max-h-[340px]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="truncate font-mono">{truncateFilename(source.file.name, 32)}</span>
                    <span className="shrink-0">{formatBytes(source.file.size)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Result
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-primary/25" style={CHECKERBOARD_STYLE}>
                    <div className="flex min-h-[320px] items-center justify-center p-4 sm:min-h-[360px] sm:p-6">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                      <img
                        src={result.url}
                        alt={`Background removed ${result.file.name}`}
                        className="max-h-[300px] w-full object-contain sm:max-h-[340px]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="truncate font-mono">{truncateFilename(result.file.name, 32)}</span>
                    <span className="shrink-0">{formatBytes(result.file.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center gap-4 rounded-xl border-2 border-primary/25 bg-primary/5 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {truncateFilename(result.file.name, 40)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(result.file.size)}</span>
                    {result.processingTime ? <span>· Processed in {result.processingTime}</span> : null}
                    {result.remaining !== null ? <span>· {result.remaining} free removals left today</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadResult}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                ⚡ 5 free removals per day · Processed with AI — your image never leaves our servers
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Next actions
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => sendToTool("/tools/resize-image")}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="text-sm font-semibold text-foreground">Resize Image</p>
                    <p className="mt-1 text-xs text-muted-foreground">Prepare the cutout for a listing, thumbnail, or social post.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => sendToTool("/compress/image")}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="text-sm font-semibold text-foreground">Compress Image</p>
                    <p className="mt-1 text-xs text-muted-foreground">Trim file size before uploading the transparent PNG anywhere.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => sendToTool("/convert/png-to-webp")}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="text-sm font-semibold text-foreground">Convert to WebP</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create a lighter web-ready version once the background is gone.</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Bot className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Upload a photo to remove the background.</p>
              <p className="mt-1">Best results come from clean subject separation, good lighting, and clear edges around the object you want to keep.</p>
            </div>
          </div>
        </section>
      )}

      {error ? (
        <div className="space-y-3">
          {buildInlineError(error)}
          {error.includes("free removals") ? (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Need more volume? <a href="https://buymeacoffee.com/clevr.tools" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">Notify me about Pro</a> while unlimited removals is in progress.
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">How it works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">1</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Upload an image</p>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, or WebP up to 10MB. Product photos, portraits, and pet shots work well.</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">2</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Run the AI cutout</p>
            <p className="mt-1 text-sm text-muted-foreground">The image is sent to our background-removal server, processed in memory, then discarded.</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">3</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Download transparent PNG</p>
            <p className="mt-1 text-sm text-muted-foreground">Use the cutout directly or send it into Resize, Compress, or PNG to WebP next.</p>
          </div>
        </div>
      </div>

      <TipJar />
    </div>
  );
}
