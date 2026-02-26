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

// Load pdfmake v0.2.x from CDN, bypassing Turbopack/bundler entirely.
// The CDN scripts set window.pdfMake globally with vfs_fonts already wired in,
// which is the pattern pdfmake's own docs recommend for browser usage.
// We pin to v0.2.10 (last stable v0.2 release) because vfs_fonts on v0.2.x
// uses the well-established pdfMake.vfs = { ... } API that Just Works.
const PDFMAKE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js";
const VFS_FONTS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadPdfMake(): Promise<NonNullable<Window["pdfMake"]>> {
  // Read via `any` to avoid TypeScript narrowing window.pdfMake to `never`
  // after async boundaries (TS can't track CDN-injected globals across awaits).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.pdfMake) return w.pdfMake;
  // Load pdfmake first, then vfs_fonts (order matters — vfs_fonts reads window.pdfMake)
  await loadScript(PDFMAKE_CDN);
  await loadScript(VFS_FONTS_CDN);
  if (!w.pdfMake) {
    throw new Error("pdfmake CDN scripts loaded but window.pdfMake is undefined");
  }
  console.log("pdfMake loaded from CDN — vfs font files:", Object.keys(w.pdfMake.vfs ?? {}).length);
  return w.pdfMake;
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
    setProgress("Reading file…");

    try {
      console.log("Step 1: reading file buffer…");
      const buffer = await file.arrayBuffer();

      setProgress("Extracting document content…");
      console.log("Step 2: mammoth converting .docx to HTML…");
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
      console.log("Step 3: mammoth done — HTML length:", html.length);

      const warningCount = messages.filter((m) => m.type === "warning").length;
      if (warningCount > 0) {
        addToast(`${warningCount} formatting element(s) may not render perfectly`, "info");
      }

      setPreviewHtml(html);
      setProgress("Loading PDF libraries…");

      // Load pdfmake from CDN (bypasses Turbopack vfs_fonts bundling issues)
      // and html-to-pdfmake from npm (pure JS function, no font dependencies).
      console.log("Step 4: loading pdfmake from CDN + html-to-pdfmake…");
      const [pdfMake, htmlToPdfmakeModule] = await Promise.all([
        loadPdfMake(),
        import("html-to-pdfmake"),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const htmlToPdfmake = (htmlToPdfmakeModule as any).default ?? htmlToPdfmakeModule;
      console.log("Step 4: libraries ready — vfs font files:", Object.keys(pdfMake.vfs ?? {}).length);

      setProgress("Converting HTML to PDF document…");
      console.log("Step 5: html-to-pdfmake converting…");

      // Convert the mammoth HTML string into a pdfmake content tree.
      // html-to-pdfmake handles headings, paragraphs, bold, italic,
      // underline, lists, tables, and base64 images.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = htmlToPdfmake(html, { window: window as any });

      // html-to-pdfmake may embed font names extracted from the Word document
      // (Calibri, Times New Roman, Arial, etc.) as `font` properties on content
      // nodes. pdfmake only has Roboto in vfs_fonts, so any other font name
      // causes "Unknown font format" at PDFFontFactory.open. Strip them all so
      // everything falls through to the defaultStyle Roboto.
      stripCustomFonts(content);

      console.log("Step 6: html-to-pdfmake done — content items:", Array.isArray(content) ? content.length : typeof content);

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
          // html-to-pdfmake maps HTML tags to these style names
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
      console.log("Step 7: doc definition ready — pageSize:", docDefinition.pageSize, "orientation:", docDefinition.pageOrientation);

      const baseName = file.name.replace(/\.(docx?|doc)$/i, "");
      const filename  = `${baseName}.pdf`;

      setProgress("Generating PDF…");
      console.log("Step 8: pdfmake generating PDF blob…");

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
      console.log("Step 9: PDF blob created — size:", pdfBlob.size);

      const url = URL.createObjectURL(pdfBlob);
      setResult({
        url,
        filename,
        size:         pdfBlob.size,
        originalSize: file.size,
        originalName: file.name,
      });

      const pct = Math.round((1 - pdfBlob.size / file.size) * 100);
      addToast(
        pct > 0 ? `Converted to PDF — ${pct}% smaller` : "Converted to PDF successfully",
        "success"
      );
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
              {margins === "wide"   && "1 inch top/bottom, 2 inch left/right (for binding)"}
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
              style={PREVIEW_STYLES}
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
