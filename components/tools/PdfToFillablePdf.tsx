"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import DownloadCard from "@/components/tool/DownloadCard";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import { addToast } from "@/lib/toast";
import { formatBytes } from "@/lib/utils";
import {
  CalendarDays,
  CheckSquare,
  Download,
  Move,
  PenSquare,
  Type,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { FillableFieldDefinition, FillableFieldType } from "@/lib/pdf/fillable-pdf";
import {
  getFieldDisplayNormSize,
  mapDomPointToPdfPoint,
  mapNormalizedFieldToPdfPoint,
  mapPdfFieldToDomRect,
} from "@/lib/pdf/field-placement.mjs";

interface PdfLike {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: ({ scale, rotation }: { scale: number; rotation?: number }) => {
      width: number;
      height: number;
      rotation?: number;
    };
    render: (args: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
      canvas: HTMLCanvasElement;
    }) => { promise: Promise<void> };
  }>;
  destroy?: () => void;
}

interface FillableFieldUI {
  id: string;
  type: FillableFieldType;
  pageIndex: number;
  nx: number;
  ny: number;
  width: number;
  height: number;
  name: string;
  label?: string;
  pageWidthPt: number;
  pageHeightPt: number;
  pageRotation: number;
}

interface DragState {
  fieldId: string;
  startClientX: number;
  startClientY: number;
  startNx: number;
  startNy: number;
  rectWidth: number;
  rectHeight: number;
  maxNx: number;
  maxNy: number;
}

interface Size2D {
  width: number;
  height: number;
}

interface CurrentPageMetrics {
  pageWidthPt: number;
  pageHeightPt: number;
  pageRotation: number;
  displayWidthCss: number;
  displayHeightCss: number;
  viewport: unknown;
}

interface DebugPoint {
  xCss: number;
  yCss: number;
  nx: number;
  ny: number;
  xPt: number;
  yPt: number;
}

const FIELD_DEFAULTS: Record<FillableFieldType, Size2D> = {
  text: { width: 220, height: 28 },
  checkbox: { width: 18, height: 18 },
  date: { width: 160, height: 28 },
  signature: { width: 220, height: 28 },
};

const FIELD_LABELS: Record<FillableFieldType, string> = {
  text: "Text",
  checkbox: "Checkbox",
  date: "Date",
  signature: "Signature",
};

const FIELD_ICONS: Record<FillableFieldType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  checkbox: CheckSquare,
  date: CalendarDays,
  signature: PenSquare,
};

let pdfWorkerReady = false;

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfWorkerReady && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfWorkerReady = true;
  }
  return pdfjs;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeRotation(value: number): number {
  return ((value % 360) + 360) % 360;
}

function nextFieldName(type: FillableFieldType, count: number): string {
  switch (type) {
    case "text":
      return `text_${count}`;
    case "checkbox":
      return `checkbox_${count}`;
    case "date":
      return `date_${count}`;
    case "signature":
      return `signature_${count}`;
    default:
      return `field_${count}`;
  }
}

function fieldLabelForType(type: FillableFieldType): string {
  return FIELD_LABELS[type];
}

function toExportField(field: FillableFieldUI): FillableFieldDefinition {
  const mapped = mapNormalizedFieldToPdfPoint({
    nx: field.nx,
    ny: field.ny,
    pdfPageWidth: field.pageWidthPt,
    pdfPageHeight: field.pageHeightPt,
    fieldWidthPt: field.width,
    fieldHeightPt: field.height,
    pageRotation: field.pageRotation,
  });

  return {
    type: field.type,
    pageIndex: field.pageIndex,
    x: mapped.xPt,
    y: mapped.yPt,
    width: field.width,
    height: field.height,
    name: field.name,
    label: field.label,
  };
}

export default function PdfToFillablePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [currentPageMetrics, setCurrentPageMetrics] = useState<CurrentPageMetrics | null>(null);
  const [fields, setFields] = useState<FillableFieldUI[]>([]);
  const [activeFieldType, setActiveFieldType] = useState<FillableFieldType>("text");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugPoint, setDebugPoint] = useState<DebugPoint | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PdfLike | null>(null);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const fieldCountRef = useRef<Record<FillableFieldType, number>>({
    text: 0,
    checkbox: 0,
    date: 0,
    signature: 0,
  });
  const dragRef = useRef<DragState | null>(null);
  const isDev = process.env.NODE_ENV !== "production";

  const revokeResultUrl = useCallback(() => {
    setDownloaded(false);
    setResultSize(0);
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  }, []);

  const destroyPdf = useCallback(() => {
    if (pdfRef.current?.destroy) {
      pdfRef.current.destroy();
    }
    pdfRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      revokeResultUrl();
      destroyPdf();
    };
  }, [destroyPdf, revokeResultUrl]);

  const renderPage = useCallback(
    async (pageIndex: number) => {
      const pdf = pdfRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas) return;

      setIsRenderingPage(true);
      try {
        const page = await pdf.getPage(pageIndex + 1);
        const unrotatedViewport = page.getViewport({ scale: 1, rotation: 0 });
        const cssViewport = page.getViewport({ scale: zoom });
        const dpr = window.devicePixelRatio || 1;
        const renderViewport = page.getViewport({ scale: zoom * dpr });

        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        canvas.style.width = `${cssViewport.width}px`;
        canvas.style.height = `${cssViewport.height}px`;

        const context = canvas.getContext("2d");
        if (!context) {
          addToast("Canvas is not available in this browser.", "error");
          return;
        }

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: renderViewport,
          canvas,
        }).promise;

        setCurrentPageMetrics({
          pageWidthPt: unrotatedViewport.width,
          pageHeightPt: unrotatedViewport.height,
          pageRotation: normalizeRotation(Number(cssViewport.rotation) || 0),
          displayWidthCss: cssViewport.width,
          displayHeightCss: cssViewport.height,
          viewport: cssViewport,
        });
      } catch (error) {
        console.error(error);
        addToast("Failed to render PDF page.", "error");
      } finally {
        setIsRenderingPage(false);
      }
    },
    [zoom]
  );

  const handleFiles = useCallback(
    async (incomingFiles: File[]) => {
      const uploaded = incomingFiles[0];
      if (!uploaded) return;

      setIsLoadingPdf(true);
      revokeResultUrl();
      setFields([]);
      setSelectedFieldId(null);
      setCurrentPage(0);
      setPageCount(0);
      setCurrentPageMetrics(null);
      setDebugPoint(null);
      fieldCountRef.current = { text: 0, checkbox: 0, date: 0, signature: 0 };
      destroyPdf();

      try {
        const fileBytes = new Uint8Array(await uploaded.arrayBuffer());
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: fileBytes.slice(0) });
        const pdf = (await loadingTask.promise) as unknown as PdfLike;

        pdfBytesRef.current = fileBytes;
        pdfRef.current = pdf;
        setFile(uploaded);
        setPageCount(pdf.numPages);
        addToast(`Loaded ${uploaded.name} (${pdf.numPages} pages)`, "success", 1800);
      } catch (error) {
        console.error(error);
        setFile(null);
        pdfBytesRef.current = null;
        addToast("Failed to open this PDF.", "error");
      } finally {
        setIsLoadingPdf(false);
      }
    },
    [destroyPdf, revokeResultUrl]
  );

  useAutoLoadFile(handleFiles);

  useEffect(() => {
    if (!pdfRef.current || pageCount === 0) return;
    void renderPage(currentPage);
  }, [currentPage, pageCount, renderPage]);

  const fieldsOnCurrentPage = useMemo(
    () => fields.filter((field) => field.pageIndex === currentPage),
    [fields, currentPage]
  );

  const selectedField = useMemo(
    () => fields.find((field) => field.id === selectedFieldId) ?? null,
    [fields, selectedFieldId]
  );

  const placeField = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!overlayRef.current || !currentPageMetrics) return;
      if ((event.target as HTMLElement).closest("[data-field-id]")) return;

      const rect = overlayRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      fieldCountRef.current[activeFieldType] += 1;
      const nextCount = fieldCountRef.current[activeFieldType];
      const defaults = FIELD_DEFAULTS[activeFieldType];
      const width = Math.min(defaults.width, currentPageMetrics.pageWidthPt);
      const height = Math.min(defaults.height, currentPageMetrics.pageHeightPt);

      const mapped = mapDomPointToPdfPoint({
        clientX: event.clientX,
        clientY: event.clientY,
        canvasRect: rect,
        cssZoom: zoom,
        dpr: window.devicePixelRatio || 1,
        pdfViewport: currentPageMetrics.viewport,
        pdfPageWidth: currentPageMetrics.pageWidthPt,
        pdfPageHeight: currentPageMetrics.pageHeightPt,
        fieldWidthPt: width,
        fieldHeightPt: height,
        pageRotation: currentPageMetrics.pageRotation,
      });

      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `field-${Date.now()}-${nextCount}`;
      const fieldName = nextFieldName(activeFieldType, nextCount);
      const label = fieldLabelForType(activeFieldType);

      setFields((previous) => [
        ...previous,
        {
          id,
          type: activeFieldType,
          pageIndex: currentPage,
          nx: mapped.nx,
          ny: mapped.ny,
          width,
          height,
          name: fieldName,
          label,
          pageWidthPt: currentPageMetrics.pageWidthPt,
          pageHeightPt: currentPageMetrics.pageHeightPt,
          pageRotation: currentPageMetrics.pageRotation,
        },
      ]);
      setSelectedFieldId(id);
      setDebugPoint({
        xCss: clamp(event.clientX - rect.left, 0, rect.width),
        yCss: clamp(event.clientY - rect.top, 0, rect.height),
        nx: mapped.nx,
        ny: mapped.ny,
        xPt: mapped.xPt,
        yPt: mapped.yPt,
      });
      revokeResultUrl();
    },
    [activeFieldType, currentPage, currentPageMetrics, revokeResultUrl, zoom]
  );

  const handleFieldPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, field: FillableFieldUI) => {
      if (!overlayRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedFieldId(field.id);

      const rect = overlayRef.current.getBoundingClientRect();
      const norm = getFieldDisplayNormSize({
        pdfPageWidth: field.pageWidthPt,
        pdfPageHeight: field.pageHeightPt,
        fieldWidthPt: field.width,
        fieldHeightPt: field.height,
        pageRotation: field.pageRotation,
      });

      dragRef.current = {
        fieldId: field.id,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startNx: field.nx,
        startNy: field.ny,
        rectWidth: rect.width,
        rectHeight: rect.height,
        maxNx: Math.max(0, 1 - norm.widthNorm),
        maxNy: Math.max(0, 1 - norm.heightNorm),
      };
    },
    []
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      const drag = dragRef.current;
      const dx = event.clientX - drag.startClientX;
      const dy = event.clientY - drag.startClientY;
      const deltaNx = dx / Math.max(1, drag.rectWidth);
      const deltaNy = dy / Math.max(1, drag.rectHeight);
      const nextNx = clamp(drag.startNx + deltaNx, 0, drag.maxNx);
      const nextNy = clamp(drag.startNy + deltaNy, 0, drag.maxNy);

      setFields((previous) =>
        previous.map((field) =>
          field.id === drag.fieldId ? { ...field, nx: nextNx, ny: nextNy } : field
        )
      );
    };

    const handlePointerUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      revokeResultUrl();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [revokeResultUrl]);

  const updateSelectedField = useCallback(
    (patch: Partial<FillableFieldUI>) => {
      if (!selectedFieldId) return;
      setFields((previous) =>
        previous.map((field) =>
          field.id === selectedFieldId ? { ...field, ...patch } : field
        )
      );
      revokeResultUrl();
    },
    [revokeResultUrl, selectedFieldId]
  );

  const removeField = useCallback(
    (fieldId: string) => {
      setFields((previous) => previous.filter((field) => field.id !== fieldId));
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
      revokeResultUrl();
    },
    [revokeResultUrl, selectedFieldId]
  );

  const exportFillablePdf = useCallback(async () => {
    const source = pdfBytesRef.current;
    if (!source || !file) return;
    if (fields.length === 0) {
      addToast("Add at least one field before exporting.", "info");
      return;
    }

    setIsExporting(true);
    try {
      const { createFillablePdf } = await import("@/lib/pdf/fillable-pdf.mjs");
      const outputFields = fields.map(toExportField);
      const output = await createFillablePdf(source, outputFields);
      const outputBytes = Uint8Array.from(output);
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      revokeResultUrl();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      addToast("Fillable PDF created.", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to export fillable PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [fields, file, revokeResultUrl]);

  const resetTool = useCallback(() => {
    revokeResultUrl();
    destroyPdf();
    pdfBytesRef.current = null;
    dragRef.current = null;
    fieldCountRef.current = { text: 0, checkbox: 0, date: 0, signature: 0 };
    setFields([]);
    setSelectedFieldId(null);
    setFile(null);
    setPageCount(0);
    setCurrentPage(0);
    setCurrentPageMetrics(null);
    setDebugPoint(null);
  }, [destroyPdf, revokeResultUrl]);

  const handleDimensionInput = useCallback(
    (key: "width" | "height", value: string) => {
      if (!selectedField) return;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return;
      const max = key === "width" ? selectedField.pageWidthPt : selectedField.pageHeightPt;
      const bounded = clamp(parsed, 8, Math.max(8, max));

      const nextWidth = key === "width" ? bounded : selectedField.width;
      const nextHeight = key === "height" ? bounded : selectedField.height;
      const norm = getFieldDisplayNormSize({
        pdfPageWidth: selectedField.pageWidthPt,
        pdfPageHeight: selectedField.pageHeightPt,
        fieldWidthPt: nextWidth,
        fieldHeightPt: nextHeight,
        pageRotation: selectedField.pageRotation,
      });

      const patch: Partial<FillableFieldUI> = {
        [key]: bounded,
        nx: clamp(selectedField.nx, 0, Math.max(0, 1 - norm.widthNorm)),
        ny: clamp(selectedField.ny, 0, Math.max(0, 1 - norm.heightNorm)),
      };
      updateSelectedField(patch);
    },
    [selectedField, updateSelectedField]
  );

  const outputFilename = file
    ? file.name.replace(/\.pdf$/i, "-fillable.pdf")
    : "fillable.pdf";

  const canvasDisplayRect = useMemo(
    () => ({
      left: 0,
      top: 0,
      width: currentPageMetrics?.displayWidthCss ?? 0,
      height: currentPageMetrics?.displayHeightCss ?? 0,
    }),
    [currentPageMetrics]
  );

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Add fillable fields to any PDF. Everything runs in your browser, so your PDF
        stays private on your device.
      </div>

      <FileDropZone
        accept=".pdf"
        multiple={false}
        maxSizeMB={100}
        onFiles={handleFiles}
      />

      {isLoadingPdf && <ProcessingIndicator label="Loading PDF preview…" />}

      {file && pageCount > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pageCount} pages · {formatBytes(file.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.6, 2))
                  }
                  className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-14 text-center text-xs font-medium text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.6, 2))
                  }
                  className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
              {(["text", "checkbox", "date", "signature"] as FillableFieldType[]).map((type) => {
                const Icon = FIELD_ICONS[type];
                const isActive = activeFieldType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveFieldType(type)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {FIELD_LABELS[type]}
                  </button>
                );
              })}
              {isDev && (
                <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showDebug}
                    onChange={(event) => setShowDebug(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border"
                  />
                  Placement debug
                </label>
              )}
              <p className="w-full text-xs text-muted-foreground">
                Pick a field type, then click anywhere on the page preview to place it.
              </p>
            </div>

            <div className="relative overflow-auto rounded-xl border border-border bg-zinc-200/30 p-3">
              <div
                className="relative mx-auto"
                style={{
                  width: currentPageMetrics?.displayWidthCss
                    ? `${currentPageMetrics.displayWidthCss}px`
                    : "fit-content",
                  minHeight: currentPageMetrics?.displayHeightCss
                    ? `${currentPageMetrics.displayHeightCss}px`
                    : "240px",
                }}
              >
                <canvas ref={canvasRef} className="block bg-white shadow-sm" />
                <div
                  ref={overlayRef}
                  data-testid="pdf-fillable-overlay"
                  className="absolute inset-0"
                  onClick={placeField}
                  style={{
                    width: currentPageMetrics?.displayWidthCss
                      ? `${currentPageMetrics.displayWidthCss}px`
                      : undefined,
                    height: currentPageMetrics?.displayHeightCss
                      ? `${currentPageMetrics.displayHeightCss}px`
                      : undefined,
                  }}
                >
                  {fieldsOnCurrentPage.map((field) => {
                    const mappedPdf = mapNormalizedFieldToPdfPoint({
                      nx: field.nx,
                      ny: field.ny,
                      pdfPageWidth: field.pageWidthPt,
                      pdfPageHeight: field.pageHeightPt,
                      fieldWidthPt: field.width,
                      fieldHeightPt: field.height,
                      pageRotation: field.pageRotation,
                    });

                    const domRect = mapPdfFieldToDomRect({
                      xPt: mappedPdf.xPt,
                      yPt: mappedPdf.yPt,
                      pdfPageWidth: field.pageWidthPt,
                      pdfPageHeight: field.pageHeightPt,
                      fieldWidthPt: field.width,
                      fieldHeightPt: field.height,
                      pageRotation: field.pageRotation,
                      canvasRect: canvasDisplayRect,
                    });

                    const selected = selectedFieldId === field.id;

                    return (
                      <button
                        key={field.id}
                        data-field-id={field.id}
                        type="button"
                        onPointerDown={(event) => handleFieldPointerDown(event, field)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedFieldId(field.id);
                        }}
                        className={`absolute flex items-center justify-between gap-2 rounded border px-2 text-[11px] font-medium ${
                          selected
                            ? "border-primary bg-primary/15 text-primary shadow"
                            : "border-sky-500/70 bg-sky-500/10 text-sky-700"
                        }`}
                        style={{
                          left: domRect.left,
                          top: domRect.top,
                          width: Math.max(14, domRect.width),
                          height: Math.max(14, domRect.height),
                        }}
                      >
                        <span className="truncate">{field.label || field.name}</span>
                        <Move className="h-3 w-3 shrink-0 opacity-70" />
                      </button>
                    );
                  })}

                  {isDev && showDebug && debugPoint && (
                    <>
                      <div
                        className="pointer-events-none absolute bg-rose-500/70"
                        style={{
                          left: 0,
                          right: 0,
                          top: debugPoint.yCss,
                          height: 1,
                        }}
                      />
                      <div
                        className="pointer-events-none absolute bg-rose-500/70"
                        style={{
                          top: 0,
                          bottom: 0,
                          left: debugPoint.xCss,
                          width: 1,
                        }}
                      />
                      <div className="pointer-events-none absolute left-2 bottom-2 rounded bg-black/75 px-2 py-1 text-[10px] text-white">
                        nx {debugPoint.nx.toFixed(3)} · ny {debugPoint.ny.toFixed(3)} · xPt{" "}
                        {Math.round(debugPoint.xPt)} · yPt {Math.round(debugPoint.yPt)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {isRenderingPage && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50">
                  <ProcessingIndicator label="Rendering page…" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((value) => Math.max(0, value - 1))}
                  disabled={currentPage === 0}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((value) => Math.min(pageCount - 1, value + 1))
                  }
                  disabled={currentPage >= pageCount - 1}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {pageCount}
                {currentPageMetrics ? ` · rotation ${currentPageMetrics.pageRotation}°` : ""}
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Fields</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {fields.length}
                </span>
              </div>
              <ul className="max-h-52 space-y-2 overflow-auto pr-1">
                {fields.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                    No fields yet. Click on the preview to add one.
                  </li>
                )}
                {fields.map((field) => (
                  <li key={field.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        setCurrentPage(field.pageIndex);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                        selectedFieldId === field.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <p className="font-medium text-foreground">{field.name}</p>
                      <p className="text-muted-foreground">
                        {FIELD_LABELS[field.type]} · page {field.pageIndex + 1}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedField && (
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Selected Field</h3>
                  <button
                    type="button"
                    onClick={() => removeField(selectedField.id)}
                    className="inline-flex items-center gap-1 rounded-md text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={(event) => updateSelectedField({ name: event.target.value })}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Label</label>
                  <input
                    type="text"
                    value={selectedField.label ?? ""}
                    onChange={(event) => updateSelectedField({ label: event.target.value })}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Width</label>
                    <input
                      type="number"
                      min={8}
                      value={Math.round(selectedField.width)}
                      onChange={(event) => handleDimensionInput("width", event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Height</label>
                    <input
                      type="number"
                      min={8}
                      value={Math.round(selectedField.height)}
                      onChange={(event) => handleDimensionInput("height", event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Drag on canvas to reposition. Size controls are in PDF points.
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              <button
                type="button"
                onClick={exportFillablePdf}
                disabled={fields.length === 0 || isExporting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export Fillable PDF
              </button>
              <button
                type="button"
                onClick={resetTool}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Start Over
              </button>
            </div>
          </aside>
        </div>
      )}

      {isExporting && <ProcessingIndicator label="Building fillable PDF…" />}

      {resultUrl && (
        <DownloadCard
          href={resultUrl}
          filename={outputFilename}
          fileSize={resultSize}
          onDownload={() => setDownloaded(true)}
        />
      )}

      {downloaded && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-400">
          Download complete. You can continue editing fields and export again.
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        Date fields are regular text fields prefilled with <code>YYYY-MM-DD</code>. Signature
        fields are text fields labeled for signing.
      </div>
    </div>
  );
}
