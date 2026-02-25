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

// Content width in pixels for html2canvas rendering (96 DPI equivalent)
const PAGE_WIDTH_PX: Record<PageSize, Record<Orientation, number>> = {
  a4:     { portrait: 794, landscape: 1123 },
  letter: { portrait: 816, landscape: 1056 },
};

// Regex for CSS color functions that html2canvas cannot parse.
// Browsers internally convert oklch() to lab() in getComputedStyle,
// which crashes html2canvas with "Attempting to parse unsupported color function 'lab'".
const MODERN_COLOR_RE = /\b(?:lab|lch|oklch|oklab)\s*\(|\bcolor-mix\s*\(|\bcolor\s*\(display-/;

/**
 * Walk every element in `root` and override any computed color that uses a
 * modern CSS color function with a safe hex fallback.  Must be called AFTER
 * the container is in the live DOM so getComputedStyle returns real values.
 */
function sanitizeModernColors(root: HTMLElement): void {
  const safe = (raw: string, fallback: string) =>
    MODERN_COLOR_RE.test(raw) ? fallback : null;

  const walk = (el: Element) => {
    const h = el as HTMLElement;
    const cs = window.getComputedStyle(el);

    const color = cs.getPropertyValue("color");
    const fix = safe(color, "#000000");
    if (fix) h.style.setProperty("color", fix, "important");

    const bg = cs.getPropertyValue("background-color");
    const bgFix = safe(bg, el === root ? "#ffffff" : "transparent");
    if (bgFix) h.style.setProperty("background-color", bgFix, "important");

    for (const side of ["top", "right", "bottom", "left"] as const) {
      const bc = cs.getPropertyValue(`border-${side}-color`);
      const bcFix = safe(bc, "#cccccc");
      if (bcFix) h.style.setProperty(`border-${side}-color`, bcFix, "important");
    }

    const outline = cs.getPropertyValue("outline-color");
    const outlineFix = safe(outline, "transparent");
    if (outlineFix) h.style.setProperty("outline-color", outlineFix, "important");

    for (const child of el.children) walk(child);
  };

  walk(root);
}

const WORD_STYLES = `
  * { box-sizing: border-box; }
  body, div { margin: 0; padding: 0; }
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
  td, th { border: 1px solid #aaa; padding: 4pt 8pt; vertical-align: top; }
  th { background: #f0f0f0; font-weight: bold; }
  a { color: #1155CC; text-decoration: underline; }
  blockquote { margin: 8pt 0 8pt 20pt; padding-left: 10pt; border-left: 3px solid #ccc; color: #555; }
  pre, code { font-family: 'Courier New', Courier, monospace; font-size: 10pt; background: #f5f5f5; padding: 2pt 4pt; border-radius: 2px; }
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

      // Build the styled container
      const marginValues = MARGIN_MAP[margins];
      const pageFmt = pageSize === "a4" ? "a4" : "letter";

      const container = document.createElement("div");
      container.style.cssText = [
        "font-family: Georgia, 'Times New Roman', serif",
        "font-size: 12pt",
        "line-height: 1.5",
        "color: #000",
        "background: #fff",
        "width: 100%",
      ].join(";");

      const styleEl = document.createElement("style");
      styleEl.textContent = WORD_STYLES;
      container.appendChild(styleEl);

      const contentEl = document.createElement("div");
      contentEl.innerHTML = html;
      container.appendChild(contentEl);

      // Mount off-screen — use fixed positioning far above viewport
      // so the element has a real layout width for html2canvas
      const contentWidthPx = PAGE_WIDTH_PX[pageSize][orientation];
      container.style.position = "fixed";
      container.style.top = "-99999px";
      container.style.left = "0";
      container.style.width = `${contentWidthPx}px`;
      document.body.appendChild(container);

      try {
        // CRITICAL: sanitize modern CSS color functions (lab, oklch, oklab, etc.)
        // BEFORE html2canvas reads computed styles.  The site uses oklch() via
        // Tailwind v4 CSS variables; browsers expose these as lab() values in
        // getComputedStyle, which crashes html2canvas with an unsupported-color
        // parse error.  Overriding them with safe hex fallbacks prevents the crash.
        sanitizeModernColors(container);

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
            useCORS: true,
            width: contentWidthPx,
            windowWidth: contentWidthPx,
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: pageFmt, orientation },
        };

        let pdfBlob: Blob;
        try {
          pdfBlob = await html2pdf().set(opt).from(container).outputPdf("blob");
        } catch (renderErr) {
          // html2canvas / jsPDF render failure — give the user an actionable message
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
        if (document.body.contains(container)) {
          document.body.removeChild(container);
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
