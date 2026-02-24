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

type ConvertMode = "structured" | "clean";

// ─── PDF Text Extraction Types ─────────────────────────────────────────────

interface PdfTextItem {
  str: string;
  transform: [number, number, number, number, number, number];
  fontName: string;
  height: number;
  width: number;
}

interface TextLine {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  pageNum: number;
}

// ─── Structure Analysis ────────────────────────────────────────────────────

function extractFontSize(item: PdfTextItem): number {
  // Font size from transform matrix: |scaleY| = transform[3]
  return Math.abs(item.transform[3]) || item.height || 12;
}

function isBoldFont(fontName: string): boolean {
  return /bold|heavy|black|demi/i.test(fontName);
}

function isItalicFont(fontName: string): boolean {
  return /italic|oblique|slant/i.test(fontName);
}

interface DocBlock {
  text: string;
  type: "h1" | "h2" | "h3" | "body" | "bullet" | "numbered";
  isBold: boolean;
  isItalic: boolean;
  number?: number; // for numbered list items
}

function analyzeStructure(lines: TextLine[], mode: ConvertMode): DocBlock[] {
  if (lines.length === 0) return [];

  // Compute median font size for body text detection
  const sizes = lines.map((l) => l.fontSize).filter((s) => s > 0);
  const sorted = [...sizes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 12;

  const blocks: DocBlock[] = [];
  let inNumberedList = false;
  let listCounter = 0;

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    if (mode === "clean") {
      // Clean mode: just output body paragraphs, no heading detection
      blocks.push({ text, type: "body", isBold: false, isItalic: false });
      continue;
    }

    // Structured mode: detect headings by relative font size and bold
    const relSize = line.fontSize / median;

    // Bullet list detection
    const bulletMatch = text.match(/^[•\-–—*○●▪▸►]\s+(.+)$/);
    if (bulletMatch) {
      inNumberedList = false;
      listCounter = 0;
      blocks.push({ text: bulletMatch[1], type: "bullet", isBold: false, isItalic: false });
      continue;
    }

    // Numbered list detection
    const numberedMatch = text.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      const num = parseInt(numberedMatch[1]);
      if (!inNumberedList || num === listCounter + 1 || num === 1) {
        inNumberedList = true;
        listCounter = num;
        blocks.push({ text: numberedMatch[2], type: "numbered", isBold: false, isItalic: false, number: num });
        continue;
      }
    } else {
      inNumberedList = false;
      listCounter = 0;
    }

    // Heading detection by font size
    if (relSize >= 1.8 || (relSize >= 1.4 && line.isBold)) {
      blocks.push({ text, type: "h1", isBold: line.isBold, isItalic: line.isItalic });
    } else if (relSize >= 1.35 || (relSize >= 1.2 && line.isBold)) {
      blocks.push({ text, type: "h2", isBold: line.isBold, isItalic: line.isItalic });
    } else if (relSize >= 1.15 || (relSize >= 1.05 && line.isBold && text.length < 80)) {
      blocks.push({ text, type: "h3", isBold: line.isBold, isItalic: line.isItalic });
    } else {
      blocks.push({ text, type: "body", isBold: line.isBold, isItalic: line.isItalic });
    }
  }

  return blocks;
}

// ─── Preview text from blocks ──────────────────────────────────────────────

function blocksToPreviewText(blocks: DocBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h1": return `# ${b.text}`;
        case "h2": return `## ${b.text}`;
        case "h3": return `### ${b.text}`;
        case "bullet": return `• ${b.text}`;
        case "numbered": return `${b.number ?? ""}. ${b.text}`;
        default: return b.text;
      }
    })
    .join("\n\n");
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
}

export default function PdfToWord() {
  const [mode, setMode] = useState<ConvertMode>("structured");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setDownloaded(false);
    setPreviewText(null);
    setPageCount(0);
    setProgress("Loading PDF…");

    try {
      const buffer = await file.arrayBuffer();

      // Set up pdfjs
      setProgress("Setting up PDF engine…");
      const pdfjs = await import("pdfjs-dist");
      if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }

      const doc = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
      const numPages = doc.numPages;
      setPageCount(numPages);

      // Extract text from all pages
      const allLines: TextLine[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress(`Extracting text — page ${pageNum} of ${numPages}…`);
        const page = await doc.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group items by y-position into lines (within ±3pt)
        const lineMap = new Map<number, PdfTextItem[]>();

        for (const rawItem of textContent.items) {
          const item = rawItem as unknown as PdfTextItem;
          if (!item.str?.trim()) continue;

          const y = Math.round(item.transform[5] / 3) * 3; // quantize to 3pt buckets
          if (!lineMap.has(y)) lineMap.set(y, []);
          lineMap.get(y)!.push(item);
        }

        // Sort lines by y desc (PDF y increases upward, we want top-to-bottom)
        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

        for (const y of sortedYs) {
          const items = lineMap.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);
          const lineText = items.map((i) => i.str).join(" ").trim();
          if (!lineText) continue;

          // Use the dominant font size and style for this line
          const dominantItem = items.reduce((prev, curr) =>
            extractFontSize(curr) > extractFontSize(prev) ? curr : prev
          );

          allLines.push({
            text: lineText,
            x: items[0].transform[4],
            y: items[0].transform[5],
            fontSize: extractFontSize(dominantItem),
            isBold: isBoldFont(dominantItem.fontName),
            isItalic: isItalicFont(dominantItem.fontName),
            pageNum,
          });
        }
      }

      doc.destroy();

      if (allLines.length === 0) {
        addToast("No text found — this may be a scanned (image-based) PDF", "error");
        setIsProcessing(false);
        setProgress("");
        return;
      }

      // Analyze structure
      setProgress("Analyzing document structure…");
      const blocks = analyzeStructure(allLines, mode);

      // Show preview
      setPreviewText(blocksToPreviewText(blocks));

      // Generate .docx
      setProgress("Generating Word document…");
      const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = await import("docx");

      const children: InstanceType<typeof Paragraph>[] = [];

      for (const block of blocks) {
        const run = new TextRun({
          text: block.text,
          bold: block.type === "body" ? block.isBold : false,
          italics: block.isItalic,
          size: block.type === "body" ? 24 : undefined, // 12pt = 24 half-points
        });

        let para: InstanceType<typeof Paragraph>;

        switch (block.type) {
          case "h1":
            para = new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run] });
            break;
          case "h2":
            para = new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run] });
            break;
          case "h3":
            para = new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run] });
            break;
          case "bullet":
            para = new Paragraph({ bullet: { level: 0 }, children: [run] });
            break;
          case "numbered":
            para = new Paragraph({ numbering: { reference: "default-numbering", level: 0 }, children: [run] });
            break;
          default:
            para = new Paragraph({
              children: [run],
              alignment: AlignmentType.LEFT,
              spacing: { after: 120 }, // 6pt spacing after paragraph
            });
        }

        children.push(para);
      }

      const wordDoc = new Document({
        numbering: {
          config: [{
            reference: "default-numbering",
            levels: [{
              level: 0,
              format: "decimal" as const,
              text: "%1.",
              alignment: AlignmentType.LEFT,
            }],
          }],
        },
        sections: [{
          properties: {},
          children,
        }],
      });

      const blob = await Packer.toBlob(wordDoc);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const filename = `${baseName}.docx`;
      const url = URL.createObjectURL(blob);

      setResult({
        url,
        filename,
        size: blob.size,
        originalSize: file.size,
        originalName: file.name,
      });

      addToast(
        `Converted to Word — ${numPages} page${numPages !== 1 ? "s" : ""}, ${blocks.length} paragraphs`,
        "success"
      );
    } catch (err) {
      console.error("PDF to Word failed:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to convert PDF",
        "error"
      );
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  }, [mode]);

  useAutoLoadFile(handleFiles);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setDownloaded(false);
    setPreviewText(null);
    setPageCount(0);
  }, [result]);

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Extracts text from text-based PDFs and generates an editable .docx file. Scanned (image-only) PDFs require OCR and are not supported.
      </div>

      {/* 1. Drop zone */}
      <FileDropZone accept=".pdf" multiple={false} maxSizeMB={50} onFiles={handleFiles} />

      {/* 2. Options */}
      {!isProcessing && !result && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Conversion Mode</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => setMode("structured")}
              className={[
                "flex flex-col gap-1 rounded-lg border p-3.5 text-left transition-colors",
                mode === "structured"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted",
              ].join(" ")}
            >
              <span className={`text-sm font-semibold ${mode === "structured" ? "text-primary" : "text-foreground"}`}>
                Structured
              </span>
              <span className="text-xs text-muted-foreground leading-snug">
                Detects headings, lists, bold and italic text. Best for documents with clear visual hierarchy.
              </span>
            </button>
            <button
              onClick={() => setMode("clean")}
              className={[
                "flex flex-col gap-1 rounded-lg border p-3.5 text-left transition-colors",
                mode === "clean"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted",
              ].join(" ")}
            >
              <span className={`text-sm font-semibold ${mode === "clean" ? "text-primary" : "text-foreground"}`}>
                Clean Text
              </span>
              <span className="text-xs text-muted-foreground leading-snug">
                Extracts all text as plain paragraphs. Best for mixed-layout PDFs where heading detection may be unreliable.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Processing */}
      {isProcessing && (
        <div className="space-y-2">
          <ProcessingIndicator label={progress || "Converting…"} />
          {pageCount > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              {pageCount} page{pageCount !== 1 ? "s" : ""} detected
            </p>
          )}
        </div>
      )}

      {/* 4. Preview */}
      {previewText && !isProcessing && !downloaded && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extracted Content Preview</p>
            {pageCount > 0 && (
              <p className="text-xs text-muted-foreground">{pageCount} pages</p>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto bg-background p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
              {previewText.length > 2000
                ? previewText.slice(0, 2000) + "\n\n[Preview truncated — full content included in download]"
                : previewText}
            </pre>
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
          toolSlug="pdf-to-word"
          resetLabel="Convert another PDF"
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
