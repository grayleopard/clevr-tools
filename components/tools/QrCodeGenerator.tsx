"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import PostDownloadState from "@/components/tool/PostDownloadState";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type QRSize = 128 | 256 | 512 | 1024;

export default function QrCodeGenerator() {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [value, setValue] = useState("");
  const [size, setSize] = useState<QRSize>(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const [downloaded, setDownloaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(async (val: string) => {
    if (!val.trim()) {
      setDataUrl("");
      setSvgString("");
      return;
    }

    try {
      const [png, svg] = await Promise.all([
        QRCode.toDataURL(val, {
          width: size,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: errorLevel,
        }),
        QRCode.toString(val, {
          type: "svg",
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: errorLevel,
        }),
      ]);
      setDataUrl(png);
      setSvgString(svg);
    } catch {
      // invalid input
    }
  }, [size, fgColor, bgColor, errorLevel]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generate(value), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, generate]);

  const downloadPng = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
    setDownloaded(true);
  }, [dataUrl]);

  const downloadSvg = useCallback(() => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  }, [svgString]);

  const reset = useCallback(() => {
    setValue("");
    setDownloaded(false);
  }, []);

  const placeholder = inputType === "url" ? "https://example.com" : "Enter any text…";

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <Tabs value={inputType} onValueChange={(v) => setInputType(v as "url" | "text")}>
          <TabsList className="w-full">
            <TabsTrigger value="url" className="flex-1">URL</TabsTrigger>
            <TabsTrigger value="text" className="flex-1">Plain Text</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="mt-3">
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </TabsContent>
          <TabsContent value="text" className="mt-3">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Options */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Size</label>
            <div className="flex gap-2 flex-wrap">
              {([128, 256, 512, 1024] as QRSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    size === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Error Correction</label>
            <div className="flex gap-2">
              {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setErrorLevel(lvl)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    errorLevel === lvl
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Foreground</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-border"
                />
                <span className="text-xs font-mono text-muted-foreground">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-border"
                />
                <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center gap-4">
          {dataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- QR preview uses generated data URL */}
              <img
                src={dataUrl}
                alt="QR Code preview"
                width={180}
                height={180}
                className="rounded"
              />
              <div className="flex w-full gap-2">
                <button
                  onClick={downloadPng}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  onClick={downloadSvg}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  Download SVG
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <div className="mb-2 h-[180px] w-[180px] rounded-lg bg-muted/50 flex items-center justify-center">
                <span className="text-3xl">⬛</span>
              </div>
              Enter text or URL to generate
            </div>
          )}
        </div>
      </div>

      {/* Post-download state */}
      {downloaded && (
        <PostDownloadState
          toolSlug="qr-code-generator"
          resetLabel="Generate another QR code"
          onReset={reset}
          redownloadSlot={
            dataUrl ? (
              <div className="flex gap-3">
                <a
                  href={dataUrl}
                  download="qrcode.png"
                  className="underline hover:text-foreground transition-colors"
                >
                  Re-download PNG
                </a>
                <span>·</span>
                <button
                  onClick={() => {
                    if (!svgString) return;
                    const blob = new Blob([svgString], { type: "image/svg+xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "qrcode.svg";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="underline hover:text-foreground transition-colors"
                >
                  Re-download SVG
                </button>
              </div>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
