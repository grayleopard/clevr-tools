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
  items: PdfTextItem[];
}

// ─── Structure Analysis ────────────────────────────────────────────────────

function extractFontSize(item: PdfTextItem): number {
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
  type: "h1" | "h2" | "h3" | "body" | "bullet" | "numbered" | "table" | "pageBreak";
  isBold: boolean;
  isItalic: boolean;
  number?: number;
  tableRows?: string[][];
}

interface ConversionStats {
  extractedPages: number;
  headingCount: number;
  paragraphCount: number;
  tableCount: number;
  listItemCount: number;
  imagePagesCount: number;
}

// ─── Table Detection ───────────────────────────────────────────────────────

/** Get column boundaries by finding X gaps > 20pt between consecutive items */
function getColumnPositions(items: PdfTextItem[]): number[] {
  if (items.length < 2) return [];
  const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);
  const positions: number[] = [sorted[0].transform[4]];
  for (let i = 1; i < sorted.length; i++) {
    const prevRight = sorted[i - 1].transform[4] + sorted[i - 1].width;
    const currLeft = sorted[i].transform[4];
    if (currLeft - prevRight > 20) {
      positions.push(currLeft);
    }
  }
  return positions;
}

/** Check if two sets of column positions are consistent (within tolerance) */
function columnsConsistent(a: number[], b: number[], tolerance: number = 40): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > tolerance) return false;
  }
  return true;
}

/** Split items into cells based on column boundaries */
function splitIntoCells(items: PdfTextItem[], colPositions: number[], tolerance: number = 40): string[] {
  const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);
  const cells: string[] = Array.from({ length: colPositions.length }, () => "");
  for (const item of sorted) {
    const x = item.transform[4];
    // Find which column this item belongs to
    let bestCol = 0;
    let bestDist = Math.abs(x - colPositions[0]);
    for (let c = 1; c < colPositions.length; c++) {
      const dist = Math.abs(x - colPositions[c]);
      if (dist < bestDist) {
        bestDist = dist;
        bestCol = c;
      }
    }
    // Only assign if within tolerance of any column boundary, or between this and next
    cells[bestCol] = cells[bestCol] ? cells[bestCol] + " " + item.str.trim() : item.str.trim();
  }
  return cells;
}

/** Detect table runs from a list of lines */
function detectTables(lines: TextLine[]): { start: number; end: number; colPositions: number[]; rows: string[][] }[] {
  const tables: { start: number; end: number; colPositions: number[]; rows: string[][] }[] = [];
  const colData: { positions: number[]; isMultiCol: boolean }[] = lines.map((line) => {
    const positions = getColumnPositions(line.items);
    return { positions, isMultiCol: positions.length >= 2 };
  });

  let i = 0;
  while (i < lines.length) {
    if (!colData[i].isMultiCol) {
      i++;
      continue;
    }
    // Start of potential table
    let j = i + 1;
    while (j < lines.length && colData[j].isMultiCol && columnsConsistent(colData[i].positions, colData[j].positions)) {
      j++;
    }
    // Need at least 2 consecutive multi-column lines
    if (j - i >= 2) {
      const refPositions = colData[i].positions;
      const rows: string[][] = [];
      for (let k = i; k < j; k++) {
        rows.push(splitIntoCells(lines[k].items, refPositions));
      }
      tables.push({ start: i, end: j, colPositions: refPositions, rows });
    }
    i = j;
  }
  return tables;
}

// ─── Paragraph Merging ─────────────────────────────────────────────────────

interface ParagraphGroup {
  lines: TextLine[];
  isBold: boolean;
  isItalic: boolean;
  fontSize: number;
}

function groupIntoParagraphs(lines: TextLine[]): ParagraphGroup[] {
  if (lines.length === 0) return [];

  const groups: ParagraphGroup[] = [];
  let currentGroup: TextLine[] = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const prev = lines[i - 1];
    const curr = lines[i];

    // Y gap: PDF Y is bottom-up, lines sorted top-to-bottom so prev.y > curr.y
    const yGap = Math.abs(prev.y - curr.y);
    const avgLineHeight = (prev.fontSize + curr.fontSize) / 2;
    const fontSizeDelta = Math.abs(prev.fontSize - curr.fontSize);
    const isLargeFont = prev.fontSize > 14 || curr.fontSize > 14;

    const sameParagraph =
      yGap <= 1.5 * avgLineHeight &&
      fontSizeDelta <= 0.15 * prev.fontSize &&
      !isLargeFont;

    if (sameParagraph) {
      currentGroup.push(curr);
    } else {
      groups.push(finalizeParagraphGroup(currentGroup));
      currentGroup = [curr];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(finalizeParagraphGroup(currentGroup));
  }

  return groups;
}

function finalizeParagraphGroup(lines: TextLine[]): ParagraphGroup {
  const dominant = lines.reduce((prev, curr) => (curr.fontSize > prev.fontSize ? curr : prev));
  return {
    lines,
    isBold: dominant.isBold,
    isItalic: dominant.isItalic,
    fontSize: dominant.fontSize,
  };
}

// ─── Structure Analysis (page-aware) ───────────────────────────────────────

function analyzeStructure(pageLines: Map<number, TextLine[]>, mode: ConvertMode): DocBlock[] {
  // Compute median font size across all pages for body text detection
  const allSizes: number[] = [];
  for (const lines of pageLines.values()) {
    for (const line of lines) {
      if (line.fontSize > 0) allSizes.push(line.fontSize);
    }
  }
  const sorted = [...allSizes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 12;

  const blocks: DocBlock[] = [];
  const pageNums = Array.from(pageLines.keys()).sort((a, b) => a - b);

  for (let pi = 0; pi < pageNums.length; pi++) {
    const pageNum = pageNums[pi];
    const lines = pageLines.get(pageNum)!;

    // Insert page break between pages (not before the first one)
    if (pi > 0) {
      blocks.push({ text: "", type: "pageBreak", isBold: false, isItalic: false });
    }

    if (lines.length === 0) continue;

    // Detect tables first
    const tables = mode === "structured" ? detectTables(lines) : [];
    const tableLineIndices = new Set<number>();
    for (const table of tables) {
      for (let k = table.start; k < table.end; k++) {
        tableLineIndices.add(k);
      }
    }

    // Process lines in order, inserting table blocks at the right positions
    let lineIdx = 0;
    let tableIdx = 0;

    while (lineIdx < lines.length) {
      // Check if we've hit a table start
      if (tableIdx < tables.length && lineIdx === tables[tableIdx].start) {
        const table = tables[tableIdx];
        blocks.push({
          text: `[Table: ${table.rows.length} rows x ${table.colPositions.length} cols]`,
          type: "table",
          isBold: false,
          isItalic: false,
          tableRows: table.rows,
        });
        lineIdx = table.end;
        tableIdx++;
        continue;
      }

      // Skip lines that are part of a table (shouldn't happen but guard)
      if (tableLineIndices.has(lineIdx)) {
        lineIdx++;
        continue;
      }

      // Collect consecutive non-table lines
      const nonTableLines: TextLine[] = [];
      while (lineIdx < lines.length && !tableLineIndices.has(lineIdx)) {
        // Also check if we reached a table start
        if (tableIdx < tables.length && lineIdx === tables[tableIdx].start) break;
        nonTableLines.push(lines[lineIdx]);
        lineIdx++;
      }

      if (nonTableLines.length === 0) continue;

      if (mode === "clean") {
        // Clean mode: group into paragraphs, output as body
        const groups = groupIntoParagraphs(nonTableLines);
        for (const group of groups) {
          const text = group.lines.map((l) => l.text.trim()).join(" ").trim();
          if (!text) continue;
          blocks.push({ text, type: "body", isBold: false, isItalic: false });
        }
      } else {
        // Structured mode: group into paragraphs, then classify
        const groups = groupIntoParagraphs(nonTableLines);

        let inNumberedList = false;
        let listCounter = 0;

        for (const group of groups) {
          const text = group.lines.map((l) => l.text.trim()).join(" ").trim();
          if (!text) continue;

          const relSize = group.fontSize / median;

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
          if (relSize >= 1.8 || (relSize >= 1.4 && group.isBold)) {
            blocks.push({ text, type: "h1", isBold: group.isBold, isItalic: group.isItalic });
          } else if (relSize >= 1.35 || (relSize >= 1.2 && group.isBold)) {
            blocks.push({ text, type: "h2", isBold: group.isBold, isItalic: group.isItalic });
          } else if (relSize >= 1.15 || (relSize >= 1.05 && group.isBold && text.length < 80)) {
            blocks.push({ text, type: "h3", isBold: group.isBold, isItalic: group.isItalic });
          } else {
            blocks.push({ text, type: "body", isBold: group.isBold, isItalic: group.isItalic });
          }
        }
      }
    }
  }

  return blocks;
}

// ─── Preview text from blocks ──────────────────────────────────────────────

function blocksToPreviewText(blocks: DocBlock[]): string {
  return blocks
    .filter((b) => b.type !== "pageBreak")
    .map((b) => {
      switch (b.type) {
        case "h1": return `# ${b.text}`;
        case "h2": return `## ${b.text}`;
        case "h3": return `### ${b.text}`;
        case "bullet": return `  * ${b.text}`;
        case "numbered": return `${b.number ?? ""}. ${b.text}`;
        case "table":
          if (!b.tableRows || b.tableRows.length === 0) return b.text;
          return b.tableRows.map((row) => "| " + row.join(" | ") + " |").join("\n");
        default: return b.text;
      }
    })
    .join("\n\n");
}

// ─── Stats ─────────────────────────────────────────────────────────────────

function computeStats(blocks: DocBlock[], imagePagesCount: number, extractedPages: number): ConversionStats {
  let headingCount = 0;
  let paragraphCount = 0;
  let tableCount = 0;
  let listItemCount = 0;

  for (const block of blocks) {
    switch (block.type) {
      case "h1":
      case "h2":
      case "h3":
        headingCount++;
        break;
      case "body":
        paragraphCount++;
        break;
      case "table":
        tableCount++;
        break;
      case "bullet":
      case "numbered":
        listItemCount++;
        break;
      // pageBreak is not counted
    }
  }

  return { extractedPages, headingCount, paragraphCount, tableCount, listItemCount, imagePagesCount };
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Result {
  url: string;
  filename: string;
  size: number;
  originalSize: number;
  originalName: string;
  stats: ConversionStats;
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
    setProgress("Loading PDF\u2026");

    try {
      const buffer = await file.arrayBuffer();

      // Set up pdfjs
      setProgress("Setting up PDF engine\u2026");
      const pdfjs = await import("pdfjs-dist");
      if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }

      const doc = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
      const numPages = doc.numPages;
      setPageCount(numPages);

      // Extract text from all pages, grouped by page
      const pageLines = new Map<number, TextLine[]>();
      let imagePagesCount = 0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress(`Extracting text \u2014 page ${pageNum} of ${numPages}\u2026`);
        const page = await doc.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group items by y-position into lines (within +/-3pt)
        const lineMap = new Map<number, PdfTextItem[]>();

        for (const rawItem of textContent.items) {
          const item = rawItem as unknown as PdfTextItem;
          if (!item.str?.trim()) continue;

          const y = Math.round(item.transform[5] / 3) * 3; // quantize to 3pt buckets
          if (!lineMap.has(y)) lineMap.set(y, []);
          lineMap.get(y)!.push(item);
        }

        // Track image-based pages (pages with 0 text items)
        if (lineMap.size === 0) {
          imagePagesCount++;
          pageLines.set(pageNum, []);
          continue;
        }

        // Sort lines by y desc (PDF y increases upward, we want top-to-bottom)
        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
        const lines: TextLine[] = [];

        for (const y of sortedYs) {
          const items = lineMap.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);
          const lineText = items.map((i) => i.str).join(" ").trim();
          if (!lineText) continue;

          // Use the dominant font size and style for this line
          const dominantItem = items.reduce((prev, curr) =>
            extractFontSize(curr) > extractFontSize(prev) ? curr : prev
          );

          lines.push({
            text: lineText,
            x: items[0].transform[4],
            y: items[0].transform[5],
            fontSize: extractFontSize(dominantItem),
            isBold: isBoldFont(dominantItem.fontName),
            isItalic: isItalicFont(dominantItem.fontName),
            pageNum,
            items,
          });
        }

        pageLines.set(pageNum, lines);
      }

      doc.destroy();

      // Check if we got any text at all
      let totalLines = 0;
      for (const lines of pageLines.values()) totalLines += lines.length;

      if (totalLines === 0) {
        addToast("No text found \u2014 this may be a scanned (image-based) PDF", "error");
        setIsProcessing(false);
        setProgress("");
        return;
      }

      // Analyze structure
      setProgress("Analyzing document structure\u2026");
      const blocks = analyzeStructure(pageLines, mode);
      const stats = computeStats(blocks, imagePagesCount, numPages);

      // Show preview
      setPreviewText(blocksToPreviewText(blocks));

      // Generate .docx
      setProgress("Generating Word document\u2026");
      const {
        Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType,
        PageBreak, Table, TableRow, TableCell, WidthType,
      } = await import("docx");

      const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

      for (const block of blocks) {
        if (block.type === "pageBreak") {
          children.push(new Paragraph({ children: [new PageBreak()] }));
          continue;
        }

        if (block.type === "table" && block.tableRows) {
          const tableRows = block.tableRows;
          const numCols = Math.max(...tableRows.map((r) => r.length), 1);
          children.push(
            new Table({
              width: { size: 9000, type: WidthType.DXA },
              rows: tableRows.map((row, ri) =>
                new TableRow({
                  children: Array.from({ length: numCols }, (_, ci) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: row[ci] ?? "", bold: ri === 0 })],
                        }),
                      ],
                    })
                  ),
                })
              ),
            })
          );
          continue;
        }

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
              spacing: { after: 120 },
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
        stats,
      });

      addToast(
        `Converted to Word \u2014 ${numPages} page${numPages !== 1 ? "s" : ""}, ${stats.paragraphCount} paragraphs`,
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
        Converts text content from PDFs into editable Word documents. Works best with text-heavy documents like reports, contracts, and articles. Complex layouts, images, and decorative elements may not be fully preserved. Scanned (image-only) PDFs are not supported.
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
          <ProcessingIndicator label={progress || "Converting\u2026"} />
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
                ? previewText.slice(0, 2000) + "\n\n[Preview truncated \u2014 full content included in download]"
                : previewText}
            </pre>
          </div>
        </div>
      )}

      {/* 5. Result */}
      {result && !isProcessing && !downloaded && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Result</h2>

          {/* Conversion Summary */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conversion Summary</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Stat label="pages" value={result.stats.extractedPages} />
              {result.stats.headingCount > 0 && <Stat label="headings" value={result.stats.headingCount} />}
              <Stat label="paragraphs" value={result.stats.paragraphCount} />
              {result.stats.tableCount > 0 && <Stat label="tables" value={result.stats.tableCount} />}
              {result.stats.listItemCount > 0 && <Stat label="list items" value={result.stats.listItemCount} />}
            </div>
            {result.stats.imagePagesCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                &#9888; {result.stats.imagePagesCount} page{result.stats.imagePagesCount !== 1 ? "s" : ""} appeared to be image-based and could not be converted.
              </p>
            )}
          </div>

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

// ─── Stat Component ────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold tabular-nums text-foreground dark:text-emerald-500">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
