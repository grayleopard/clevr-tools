"use client";

import { useState, useCallback } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { addToast } from "@/lib/toast";
import { truncateFilename } from "@/lib/utils";

type PageSize = "a4" | "letter";
type Orientation = "portrait" | "landscape";
type Margins = "normal" | "narrow" | "wide";

// Margins in mm: [top, right, bottom, left]
const MARGIN_MAP: Record<Margins, [number, number, number, number]> = {
  normal:  [25.4, 25.4, 25.4, 25.4],
  narrow:  [12.7, 12.7, 12.7, 12.7],
  wide:    [25.4, 50.8, 25.4, 50.8],
};

// Page dimensions in mm for preview width calculation
const PAGE_WIDTH_MM: Record<PageSize, Record<Orientation, number>> = {
  a4:     { portrait: 210, landscape: 297 },
  letter: { portrait: 215.9, landscape: 279.4 },
};

// Content width/height in pixels for the hidden iframe (96 DPI equivalent)
const PAGE_WIDTH_PX: Record<PageSize, Record<Orientation, number>> = {
  a4:     { portrait: 794, landscape: 1123 },
  letter: { portrait: 816, landscape: 1056 },
};
const PAGE_HEIGHT_PX: Record<PageSize, Record<Orientation, number>> = {
  a4:     { portrait: 1123, landscape: 794 },
  letter: { portrait: 1056, landscape: 816 },
};

// Stylesheet written into the isolated iframe — ONLY safe hex colors,
// zero Tailwind CSS, zero CSS custom properties.
// This is what the iframe body actually renders (mammoth HTML goes inside <body>).
const IFRAME_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt; line-height: 1.5;
    color: #000000; background: #ffffff;
  }
  h1 { font-size: 20pt; font-weight: bold; margin: 0 0 10pt; line-height: 1.3; }
  h2 { font-size: 16pt; font-weight: bold; margin: 12pt 0 6pt; line-height: 1.3; }
  h3 { font-size: 13pt; font-weight: bold; margin: 10pt 0 4pt; line-height: 1.3; }
  h4 { font-size: 12pt; font-weight: bold; margin: 8pt 0 3pt; }
  h5, h6 { font-size: 11pt; font-weight: bold; margin: 6pt 0 2pt; }
  p { margin: 0 0 8pt; line-height: 1.5; }
  ul, ol { margin: 0 0 8pt 22pt; padding: 0; }
  li { margin: 2pt 0; line-height: 1.5; }
  strong, b { font-weight: bold; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 11pt; }
  td, th { border: 1px solid #aaaaaa; padding: 4pt 8pt; vertical-align: top; }
  th { background: #f0f0f0; font-weight: bold; }
  a { color: #1155cc; text-decoration: underline; }
  blockquote { margin: 8pt 0 8pt 20pt; padding-left: 10pt; border-left: 3px solid #cccccc; color: #555555; }
  pre, code { font-family: 'Courier New', Courier, monospace; font-size: 10pt; background: #f5f5f5; padding: 2pt 4pt; border-radius: 2px; }
  img { max-width: 100%; height: auto; }
`;


interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
}

export default function WordToPdf() {
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margins, setMargins] = useState<Margins>("normal");

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setDownloaded(false);
    setPreviewHtml(null);
    setProgress("Parsing Word document…");

    try {
      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer();

      // Dynamic import — mammoth is browser-only
      setProgress("Extracting document content…");
      const mammoth = await import("mammoth/mammoth.browser");

      const { value: html, messages } = await mammoth.convertToHtml(
        { arrayBuffer: buffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
          ],
        }
      );

      const warningCount = messages.filter((m) => m.type === "warning").length;
      if (warningCount > 0) {
        addToast(`${warningCount} formatting element(s) may not render perfectly`, "info");
      }

      // Show preview
      setPreviewHtml(html);
      setProgress("Rendering PDF…");

      const marginValues = MARGIN_MAP[margins];
      const pageFmt = pageSize === "a4" ? "a4" : "letter";
      const contentWidthPx  = PAGE_WIDTH_PX[pageSize][orientation];
      const contentHeightPx = PAGE_HEIGHT_PX[pageSize][orientation];

      // === IFRAME ISOLATION APPROACH ===
      // Render inside a hidden <iframe> that has its own clean document with
      // zero Tailwind CSS.  html2canvas resolves computed styles via
      // element.ownerDocument.defaultView — the iframe's window — so it never
      // sees Tailwind's oklch() custom properties, which browsers expose as
      // lab() in getComputedStyle and which crash html2canvas.
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText = [
        "position: fixed",
        "top: -99999px",
        "left: 0",
        `width: ${contentWidthPx}px`,
        `height: ${contentHeightPx}px`,
        "border: none",
        "visibility: hidden",
        "pointer-events: none",
      ].join("; ");
      document.body.appendChild(iframe);

      try {
        const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (!iframeDoc) throw new Error("Could not access iframe document");

        // Write a self-contained HTML document with only safe hex colors
        iframeDoc.open();
        iframeDoc.write(
          `<!DOCTYPE html><html><head><meta charset="utf-8">` +
          `<style>${IFRAME_STYLES}</style></head>` +
          `<body>${html}</body></html>`
        );
        iframeDoc.close();

        // Yield one tick so the iframe has time to lay out
        await new Promise<void>((r) => setTimeout(r, 60));

        const html2pdf = (await import("html2pdf.js")).default;
        const baseName = file.name.replace(/\.(docx?|doc)$/i, "");
        const filename = `${baseName}.pdf`;

        const opt = {
          margin: marginValues,
          filename,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            logging: false,
            useCORS: false,          // same-origin iframe — no CORS needed
            width: contentWidthPx,
            windowWidth: contentWidthPx,
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: pageFmt, orientation },
        };

        let pdfBlob: Blob;
        try {
          pdfBlob = await html2pdf()
            .set(opt)
            .from(iframeDoc.body)    // render from the isolated iframe body
            .outputPdf("blob");
        } catch (renderErr) {
          console.error("PDF render failed:", renderErr);
          const msg =
            renderErr instanceof Error && renderErr.message
              ? renderErr.message
              : "Rendering failed";
          throw new Error(
            `Could not render PDF (${msg}). Try a simpler document or reduce the page content.`
          );
        }

        const url = URL.createObjectURL(pdfBlob);
        setResult({
          url,
          filename,
          size: pdfBlob.size,
          originalSize: file.size,
          originalName: file.name,
        });

        const pct = Math.round((1 - pdfBlob.size / file.size) * 100);
        if (pct > 0) {
          addToast(`Converted to PDF — ${pct}% smaller`, "success");
        } else {
          addToast("Converted to PDF successfully", "success");
        }
      } finally {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }
    } catch (err) {
      console.error("Word to PDF failed:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to convert document — please try again",
        "error"
      );
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  }, [pageSize, orientation, margins]);

  useAutoLoadFile(handleFiles);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setDownloaded(false);
    setPreviewHtml(null);
  }, [result]);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Converts .docx to PDF entirely in your browser — headings, bold, italic, lists, and tables are preserved. Files never leave your device.
      </div>

      {/* 1. Drop zone */}
      <FileDropZone accept=".docx,.doc" multiple={false} maxSizeMB={50} onFiles={handleFiles} />

      {/* 2. Options */}
      {!isProcessing && !result && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Output Options</p>

          {/* Page size + orientation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Page Size</label>
              <div className="flex gap-2">
                {(["a4", "letter"] as PageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={[
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      pageSize === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    {s === "a4" ? "A4" : "Letter"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Orientation</label>
              <div className="flex gap-2">
                {(["portrait", "landscape"] as Orientation[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={[
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors capitalize",
                      orientation === o
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    {o === "portrait" ? "Portrait" : "Landscape"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Margins */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Margins</label>
            <div className="flex gap-2">
              {(["normal", "narrow", "wide"] as Margins[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMargins(m)}
                  className={[
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors capitalize",
                    margins === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {margins === "normal" && "1 inch on all sides (standard)"}
              {margins === "narrow" && "0.5 inch on all sides (more content per page)"}
              {margins === "wide" && "1 inch top/bottom, 2 inch left/right (for binding)"}
            </p>
          </div>
        </div>
      )}

      {/* 3. Processing */}
      {isProcessing && <ProcessingIndicator label={progress || "Converting…"} />}

      {/* 4. Document preview (shown after parsing, before download) */}
      {previewHtml && !isProcessing && !downloaded && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document Preview</p>
            <p className="text-xs text-muted-foreground">
              {PAGE_WIDTH_MM[pageSize][orientation]}mm wide · {margins} margins
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto bg-white p-6">
            <div
              className="text-black text-sm leading-relaxed prose prose-sm max-w-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}

      {/* 5. Result */}
      {result && !isProcessing && !downloaded && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Result</h2>
          <DownloadCard
            href={result.url}
            filename={result.filename}
            fileSize={result.size}
            originalSize={result.originalSize}
            onDownload={() => setDownloaded(true)}
          />
        </div>
      )}

      {/* 6. Post-download state */}
      {downloaded && (
        <PostDownloadState
          toolSlug="word-to-pdf"
          resetLabel="Convert another document"
          onReset={reset}
          redownloadSlot={
            result && (
              <a
                href={result.url}
                download={result.filename}
                className="underline hover:text-foreground transition-colors"
              >
                Re-download {truncateFilename(result.filename, 28)}
              </a>
            )
          }
        />
      )}
    </div>
  );
}
