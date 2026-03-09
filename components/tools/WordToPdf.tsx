"use client";

import { useState, useCallback, useRef } from "react";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import FileDropZone from "@/components/tool/FileDropZone";
import DownloadCard from "@/components/tool/DownloadCard";
import PostDownloadState from "@/components/tool/PostDownloadState";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import { usePdfXRayContext } from "@/lib/xray/pdf-xray-context";
import { addToast } from "@/lib/toast";
import { truncateFilename, formatBytes } from "@/lib/utils";
import { loadPdfMake } from "@/lib/pdfmake-loader";
import { sanitizeWordPreviewHtml } from "@/lib/security/word-preview-sanitizer.mjs";
import { X } from "lucide-react";

type PageSize = "a4" | "letter";
type Orientation = "portrait" | "landscape";
type Margins = "normal" | "narrow" | "wide";

// Margins in mm: [top, right, bottom, left]
const MARGIN_MAP: Record<Margins, [number, number, number, number]> = {
  normal:  [25.4, 25.4, 25.4, 25.4],
  narrow:  [12.7, 12.7, 12.7, 12.7],
  wide:    [25.4, 50.8, 25.4, 50.8],
};

// Page dimensions in mm — used in the preview label only
const PAGE_WIDTH_MM: Record<PageSize, Record<Orientation, number>> = {
  a4:     { portrait: 210, landscape: 297 },
  letter: { portrait: 215.9, landscape: 279.4 },
};

// pdfmake uses points. 1 mm = 2.8346 pt
const mmToPt = (mm: number) => Math.round(mm * 2.8346);

// Stylesheet for the HTML preview pane only (NOT used for PDF generation).
// Uses only safe hex colors — no CSS custom properties, no oklch().
const PREVIEW_STYLES: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "12pt",
  lineHeight: 1.5,
  color: "#000000",
};

interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
}

// Recursively strip any `font` / `fontFamily` references injected by
// html-to-pdfmake from the Word document's CSS styles (e.g. Calibri,
// Times New Roman). pdfmake only has Roboto in its vfs_fonts bundle, so
// any other font reference causes "Unknown font format" at PDFFontFactory.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripCustomFonts(node: any): void {
  if (Array.isArray(node)) {
    node.forEach(stripCustomFonts);
  } else if (node && typeof node === "object") {
    delete node.font;
    if (node.style && typeof node.style === "object") {
      delete node.style.font;
      delete node.style.fontFamily;
    }
    if (node.text)        stripCustomFonts(node.text);
    if (node.stack)       stripCustomFonts(node.stack);
    if (node.ul)          stripCustomFonts(node.ul);
    if (node.ol)          stripCustomFonts(node.ol);
    if (node.table?.body) stripCustomFonts(node.table.body);
    if (node.columns)     stripCustomFonts(node.columns);
  }
}

export default function WordToPdf() {
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margins, setMargins] = useState<Margins>("normal");

  const [isParsing, setIsParsing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [rawHtml, setRawHtml] = useState<string | null>(null);

  const xrayCtx = usePdfXRayContext();

  // Store source file ref for convert step
  const sourceFileRef = useRef<File | null>(null);

  // Step 1: Parse the DOCX file — extract HTML preview
  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsParsing(true);
    setResult(null);
    setDownloaded(false);
    setPreviewHtml(null);
    setRawHtml(null);
    setSourceFile(file);
    sourceFileRef.current = file;
    setProgress("Reading file…");

    try {
      const buffer = await file.arrayBuffer();

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

      setPreviewHtml(sanitizeWordPreviewHtml(html));
      setRawHtml(html);
    } catch (err) {
      console.error("Word parsing failed:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to read document — please try again",
        "error"
      );
    } finally {
      setIsParsing(false);
      setProgress("");
    }
  }, []);

  useAutoLoadFile(handleFiles);

  // Step 2: Convert parsed HTML to PDF (triggered by button click)
  const handleConvert = useCallback(async () => {
    if (!rawHtml || !sourceFileRef.current) return;

    setIsConverting(true);
    setProgress("Loading PDF libraries…");

    try {
      const [pdfMake, htmlToPdfmakeModule] = await Promise.all([
        loadPdfMake(),
        import("html-to-pdfmake"),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const htmlToPdfmake = (htmlToPdfmakeModule as any).default ?? htmlToPdfmakeModule;

      setProgress("Converting to PDF…");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = htmlToPdfmake(rawHtml, { window: window as any });
      stripCustomFonts(content);

      // MARGIN_MAP order: [top, right, bottom, left]
      // pdfmake pageMargins order: [left, top, right, bottom]
      const mv = MARGIN_MAP[margins];
      const pageMargins: [number, number, number, number] = [
        mmToPt(mv[3]), // left
        mmToPt(mv[0]), // top
        mmToPt(mv[1]), // right
        mmToPt(mv[2]), // bottom
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize:        pageSize === "a4" ? "A4" : "LETTER",
        pageOrientation: orientation,
        pageMargins,
        content,
        defaultStyle: {
          font:       "Roboto",
          fontSize:   11,
          lineHeight: 1.4,
        },
        styles: {
          html_h1: { fontSize: 20, bold: true, marginBottom: 8 },
          html_h2: { fontSize: 16, bold: true, marginBottom: 6 },
          html_h3: { fontSize: 13, bold: true, marginBottom: 4 },
          html_h4: { fontSize: 12, bold: true, marginBottom: 3 },
          html_h5: { fontSize: 11, bold: true, marginBottom: 2 },
          html_h6: { fontSize: 10, bold: true, marginBottom: 2 },
          html_p:  { marginBottom: 6 },
          html_blockquote: { marginLeft: 20, color: "#555555" },
          html_pre:  { fontSize: 9 },
          html_code: { fontSize: 9 },
        },
      };

      const file = sourceFileRef.current;
      const baseName = file.name.replace(/\.(docx?|doc)$/i, "");
      const filename = `${baseName}.pdf`;

      setProgress("Generating PDF…");

      const pdfBlob = await Promise.race([
        new Promise<Blob>((resolve, reject) => {
          try {
            pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
              if (blob) resolve(blob);
              else reject(new Error("pdfmake returned an empty result"));
            });
          } catch (err) {
            reject(err);
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("PDF generation timed out after 30 seconds. Try a smaller document.")),
            30_000
          )
        ),
      ]);

      if (result) URL.revokeObjectURL(result.url);
      const url = URL.createObjectURL(pdfBlob);
      setResult({
        url,
        filename,
        size:         pdfBlob.size,
        originalSize: file.size,
        originalName: file.name,
      });

      // Feed the generated PDF into X-Ray context
      if (xrayCtx) {
        const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });
        xrayCtx.setFile(pdfFile);
      }

      addToast("Converted to PDF successfully", "success");
    } catch (err) {
      console.error("Word to PDF failed:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to convert document — please try again",
        "error"
      );
    } finally {
      setIsConverting(false);
      setProgress("");
    }
  }, [rawHtml, pageSize, orientation, margins, result, xrayCtx]);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setDownloaded(false);
    setPreviewHtml(null);
    setRawHtml(null);
    setSourceFile(null);
    sourceFileRef.current = null;
    setResetKey((k) => k + 1);
    if (xrayCtx) xrayCtx.setFile(null);
  }, [result, xrayCtx]);

  const isProcessing = isParsing || isConverting;
  const hasFile = previewHtml !== null;

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Converts .docx to PDF entirely in your browser — headings, bold, italic, lists, and tables are preserved. Files never leave your device.
      </div>

      {/* 1. Drop zone */}
      <FileDropZone accept=".docx,.doc" multiple={false} maxSizeMB={50} onFiles={handleFiles} resetKey={resetKey} />

      {/* 2. File info bar */}
      {sourceFile && hasFile && !isProcessing && !downloaded && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {sourceFile.name} &middot; {formatBytes(sourceFile.size)}
            </div>
            <button
              onClick={reset}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Options (shown after parsing, before or after conversion) */}
      {hasFile && !isProcessing && !downloaded && (
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
              {margins === "wide"   && "1 inch top/bottom, 2 inch left/right (for binding)"}
            </p>
          </div>
        </div>
      )}

      {/* 4. Document preview */}
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
              style={PREVIEW_STYLES}
              // `previewHtml` is sanitized through `sanitizeWordPreviewHtml` before state is set.
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}

      {/* 5. Convert button */}
      {hasFile && !isProcessing && !downloaded && (
        <button
          onClick={handleConvert}
          className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {result ? "Reconvert to PDF" : "Convert to PDF"}
        </button>
      )}

      {/* 6. Processing */}
      {isProcessing && <ProcessingIndicator label={progress || "Converting…"} />}

      {/* 7. Result */}
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

      {/* 8. Post-download state */}
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
