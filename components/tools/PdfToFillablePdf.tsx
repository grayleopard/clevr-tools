"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
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
  clampPdfRectToPage,
  getLocalViewportPoint,
  pdfRectToViewportRect,
  viewportRectToPdfRect,
} from "@/lib/pdf/field-placement.mjs";

interface PdfViewportLike {
  width: number;
  height: number;
  rotation: number;
  convertToPdfPoint: (x: number, y: number) => [number, number];
  convertToViewportRectangle: (rect: [number, number, number, number]) => [number, number, number, number];
}

interface PdfPageLike {
  rotate: number;
  getViewport: ({ scale, rotation }: { scale: number; rotation?: number }) => PdfViewportLike;
  render: (args: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewportLike;
    canvas: HTMLCanvasElement;
  }) => import("pdfjs-dist").RenderTask;
}

interface PdfLike {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
  destroy?: () => void;
}

interface FillableFieldUI {
  id: string;
  type: FillableFieldType;
  pageIndex: number;
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
  name: string;
  label?: string;
}

interface DragState {
  fieldId: string;
  pageLeft: number;
  pageTop: number;
  pageWidth: number;
  pageHeight: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
  widthPx: number;
  heightPx: number;
  widthPt: number;
  heightPt: number;
  pageWidthPt: number;
  pageHeightPt: number;
}

interface PageMetrics {
  pageWidthPt: number;
  pageHeightPt: number;
  widthCss: number;
  heightCss: number;
  sourceRotation: number;
  activeRotation: number;
}

interface DebugPoint {
  xCss: number;
  yCss: number;
  nx: number;
  ny: number;
  xPt: number;
  yPt: number;
}

const FIELD_DEFAULTS: Record<FillableFieldType, { widthPt: number; heightPt: number }> = {
  text: { widthPt: 220, heightPt: 28 },
  checkbox: { widthPt: 18, heightPt: 18 },
  date: { widthPt: 160, heightPt: 28 },
  signature: { widthPt: 220, heightPt: 28 },
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

function normalizeRotationDegrees(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

function normalizeQuarterTurnRotation(rotation: number): 0 | 90 | 180 | 270 {
  const normalized = normalizeRotationDegrees(rotation);
  const snapped = Math.round(normalized / 90) * 90;
  const quarter = ((snapped % 360) + 360) % 360;
  if (quarter === 90 || quarter === 180 || quarter === 270) return quarter;
  return 0;
}

function isRenderCancelledError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "RenderingCancelledException"
  );
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

export default function PdfToFillablePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pageMetrics, setPageMetrics] = useState<PageMetrics | null>(null);
  const [fields, setFields] = useState<FillableFieldUI[]>([]);
  const [activeFieldType, setActiveFieldType] = useState<FillableFieldType>("text");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewUpright, setViewUpright] = useState(false);
  const [isViewUprightTouched, setIsViewUprightTouched] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugPoint, setDebugPoint] = useState<DebugPoint | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PdfLike | null>(null);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pageInfoRef = useRef<Record<number, { pageWidthPt: number; pageHeightPt: number }>>({});
  const viewportRef = useRef<PdfViewportLike | null>(null);
  const renderTaskRef = useRef<import("pdfjs-dist").RenderTask | null>(null);
  const renderSeqRef = useRef(0);
  const fieldCountRef = useRef<Record<FillableFieldType, number>>({
    text: 0,
    checkbox: 0,
    date: 0,
    signature: 0,
  });
  const dragRef = useRef<DragState | null>(null);
  const isDev = process.env.NODE_ENV !== "production";
  const [debugFromQuery, setDebugFromQuery] = useState(false);
  const isDebugVisible = (isDev && showDebug) || debugFromQuery;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setDebugFromQuery(params.get("debug") === "1");
  }, []);

  const cancelRenderTask = useCallback(() => {
    if (!renderTaskRef.current) return;
    try {
      renderTaskRef.current.cancel();
    } catch {
      // Ignore cancellation races.
    }
    renderTaskRef.current = null;
  }, []);

  const destroyPdf = useCallback(() => {
    renderSeqRef.current += 1;
    cancelRenderTask();
    if (pdfRef.current?.destroy) {
      pdfRef.current.destroy();
    }
    pdfRef.current = null;
    viewportRef.current = null;
  }, [cancelRenderTask]);

  useEffect(() => {
    return () => {
      destroyPdf();
    };
  }, [destroyPdf]);

  const getPageInfo = useCallback(
    (pageIndex: number) => {
      const info = pageInfoRef.current[pageIndex];
      if (info) return info;
      if (!pageMetrics || pageIndex !== currentPage) return null;
      return {
        pageWidthPt: pageMetrics.pageWidthPt,
        pageHeightPt: pageMetrics.pageHeightPt,
      };
    },
    [currentPage, pageMetrics]
  );

  const renderPage = useCallback(
    async (pageIndex: number) => {
      const pdf = pdfRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas) return;
      const seq = ++renderSeqRef.current;
      cancelRenderTask();

      setIsRenderingPage(true);
      try {
        const page = await pdf.getPage(pageIndex + 1);
        if (seq !== renderSeqRef.current) return;

        const sourceRotation = normalizeQuarterTurnRotation(page.rotate || 0);
        const defaultUpright = sourceRotation !== 0;
        const shouldViewUpright = isViewUprightTouched ? viewUpright : defaultUpright;
        if (!isViewUprightTouched && viewUpright !== defaultUpright) {
          setViewUpright(defaultUpright);
        }
        const displayRotation = shouldViewUpright ? (360 - sourceRotation) % 360 : sourceRotation;
        const viewportRotation = shouldViewUpright ? displayRotation : sourceRotation;

        const rawViewport = page.getViewport({ scale: 1, rotation: 0 });
        const cssViewport = page.getViewport({ scale: zoom, rotation: viewportRotation });
        const dpr = window.devicePixelRatio || 1;
        const renderViewport = page.getViewport({ scale: zoom * dpr, rotation: viewportRotation });

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
        const task = page.render({
          canvasContext: context,
          viewport: renderViewport,
          canvas,
        });
        renderTaskRef.current = task;

        try {
          await task.promise;
        } catch (error) {
          if (isRenderCancelledError(error)) return;
          throw error;
        } finally {
          if (renderTaskRef.current === task) {
            renderTaskRef.current = null;
          }
        }

        if (seq !== renderSeqRef.current) return;

        viewportRef.current = cssViewport;
        pageInfoRef.current[pageIndex] = {
          pageWidthPt: rawViewport.width,
          pageHeightPt: rawViewport.height,
        };

        setPageMetrics({
          pageWidthPt: rawViewport.width,
          pageHeightPt: rawViewport.height,
          widthCss: cssViewport.width,
          heightCss: cssViewport.height,
          sourceRotation,
          activeRotation: viewportRotation,
        });
      } catch (error) {
        if (isRenderCancelledError(error)) return;
        console.error(error);
        addToast("Failed to render PDF page.", "error");
      } finally {
        if (seq === renderSeqRef.current) {
          setIsRenderingPage(false);
        }
      }
    },
    [cancelRenderTask, isViewUprightTouched, viewUpright, zoom]
  );

  const handleFiles = useCallback(
    async (incomingFiles: File[]) => {
      const uploaded = incomingFiles[0];
      if (!uploaded) return;

      setIsLoadingPdf(true);
      setFields([]);
      setSelectedFieldId(null);
      setCurrentPage(0);
      setPageCount(0);
      setPageMetrics(null);
      setViewUpright(false);
      setIsViewUprightTouched(false);
      setDebugPoint(null);
      pageInfoRef.current = {};
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
    [destroyPdf]
  );

  useAutoLoadFile(handleFiles);

  useEffect(() => {
    if (!pdfRef.current || pageCount === 0) return;
    void renderPage(currentPage);
    return () => {
      renderSeqRef.current += 1;
      cancelRenderTask();
    };
  }, [cancelRenderTask, currentPage, pageCount, renderPage]);

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
      const overlay = overlayRef.current;
      const viewport = viewportRef.current;
      if (!overlay || !pageMetrics || !viewport) return;
      if ((event.target as HTMLElement).closest("[data-field-id]")) return;

      const rect = overlay.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const defaults = FIELD_DEFAULTS[activeFieldType];
      const sizeAtOrigin = pdfRectToViewportRect({
        viewport,
        xPt: 0,
        yPt: 0,
        widthPt: defaults.widthPt,
        heightPt: defaults.heightPt,
      });

      const local = getLocalViewportPoint({
        clientX: event.clientX,
        clientY: event.clientY,
        canvasRect: rect,
      });

      const mappedRect = viewportRectToPdfRect({
        viewport,
        leftPx: local.xViewport,
        topPx: local.yViewport,
        widthPx: Math.max(8, sizeAtOrigin.widthPx),
        heightPx: Math.max(8, sizeAtOrigin.heightPx),
      });

      const clampedRect = clampPdfRectToPage({
        ...mappedRect,
        widthPt: defaults.widthPt,
        heightPt: defaults.heightPt,
        pageWidthPt: pageMetrics.pageWidthPt,
        pageHeightPt: pageMetrics.pageHeightPt,
      });

      fieldCountRef.current[activeFieldType] += 1;
      const nextCount = fieldCountRef.current[activeFieldType];
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `field-${Date.now()}-${nextCount}`;

      setFields((previous) => [
        ...previous,
        {
          id,
          type: activeFieldType,
          pageIndex: currentPage,
          xPt: clampedRect.xPt,
          yPt: clampedRect.yPt,
          widthPt: clampedRect.widthPt,
          heightPt: clampedRect.heightPt,
          name: nextFieldName(activeFieldType, nextCount),
          label: fieldLabelForType(activeFieldType),
        },
      ]);
      setSelectedFieldId(id);
      setDebugPoint({
        xCss: local.xViewport,
        yCss: local.yViewport,
        nx: local.nx,
        ny: local.ny,
        xPt: clampedRect.xPt,
        yPt: clampedRect.yPt,
      });
    },
    [activeFieldType, currentPage, pageMetrics]
  );

  const handleFieldPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, field: FillableFieldUI) => {
      const overlay = overlayRef.current;
      const viewport = viewportRef.current;
      const info = getPageInfo(field.pageIndex);
      if (!overlay || !viewport || !info) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedFieldId(field.id);

      const containerRect = overlay.getBoundingClientRect();
      const fieldRect = pdfRectToViewportRect({
        viewport,
        xPt: field.xPt,
        yPt: field.yPt,
        widthPt: field.widthPt,
        heightPt: field.heightPt,
      });

      dragRef.current = {
        fieldId: field.id,
        pageLeft: containerRect.left,
        pageTop: containerRect.top,
        pageWidth: containerRect.width,
        pageHeight: containerRect.height,
        pointerOffsetX: event.clientX - (containerRect.left + fieldRect.leftPx),
        pointerOffsetY: event.clientY - (containerRect.top + fieldRect.topPx),
        widthPx: fieldRect.widthPx,
        heightPx: fieldRect.heightPx,
        widthPt: field.widthPt,
        heightPt: field.heightPt,
        pageWidthPt: info.pageWidthPt,
        pageHeightPt: info.pageHeightPt,
      };
    },
    [getPageInfo]
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const viewport = viewportRef.current;
      if (!drag || !viewport) return;

      const nextLeft = clamp(
        event.clientX - drag.pageLeft - drag.pointerOffsetX,
        0,
        Math.max(0, drag.pageWidth - drag.widthPx)
      );
      const nextTop = clamp(
        event.clientY - drag.pageTop - drag.pointerOffsetY,
        0,
        Math.max(0, drag.pageHeight - drag.heightPx)
      );

      const mappedRect = viewportRectToPdfRect({
        viewport,
        leftPx: nextLeft,
        topPx: nextTop,
        widthPx: drag.widthPx,
        heightPx: drag.heightPx,
      });

      const clampedRect = clampPdfRectToPage({
        xPt: mappedRect.xPt,
        yPt: mappedRect.yPt,
        widthPt: drag.widthPt,
        heightPt: drag.heightPt,
        pageWidthPt: drag.pageWidthPt,
        pageHeightPt: drag.pageHeightPt,
      });

      setFields((previous) =>
        previous.map((field) =>
          field.id === drag.fieldId
            ? {
                ...field,
                xPt: clampedRect.xPt,
                yPt: clampedRect.yPt,
              }
            : field
        )
      );
    };

    const handlePointerUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const updateSelectedField = useCallback(
    (patch: Partial<FillableFieldUI>) => {
      if (!selectedFieldId) return;
      setFields((previous) =>
        previous.map((field) => {
          if (field.id !== selectedFieldId) return field;
          const merged = { ...field, ...patch };
          const info = getPageInfo(merged.pageIndex);
          if (!info) return merged;
          const clamped = clampPdfRectToPage({
            xPt: merged.xPt,
            yPt: merged.yPt,
            widthPt: merged.widthPt,
            heightPt: merged.heightPt,
            pageWidthPt: info.pageWidthPt,
            pageHeightPt: info.pageHeightPt,
          });
          return {
            ...merged,
            xPt: clamped.xPt,
            yPt: clamped.yPt,
            widthPt: clamped.widthPt,
            heightPt: clamped.heightPt,
          };
        })
      );
    },
    [getPageInfo, selectedFieldId]
  );

  const removeField = useCallback(
    (fieldId: string) => {
      setFields((previous) => previous.filter((field) => field.id !== fieldId));
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
    },
    [selectedFieldId]
  );

  const outputFilename = file ? file.name.replace(/\.pdf$/i, "-fillable.pdf") : "fillable.pdf";

  const downloadFillablePdf = useCallback(async () => {
    const source = pdfBytesRef.current;
    if (!source || !file) return;
    if (fields.length === 0) {
      addToast("Add at least one field before downloading.", "info");
      return;
    }

    setIsExporting(true);
    try {
      const { createFillablePdf } = await import("@/lib/pdf/fillable-pdf.mjs");
      const outputFields: FillableFieldDefinition[] = fields.map((field) => ({
        type: field.type,
        pageIndex: field.pageIndex,
        x: field.xPt,
        y: field.yPt,
        width: field.widthPt,
        height: field.heightPt,
        name: field.name,
        label: field.label,
      }));
      const output = await createFillablePdf(source, outputFields);
      const blob = new Blob([new Uint8Array(output)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = outputFilename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast("Download started.", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to generate fillable PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [fields, file, outputFilename]);

  const resetTool = useCallback(() => {
    destroyPdf();
    pdfBytesRef.current = null;
    dragRef.current = null;
    fieldCountRef.current = { text: 0, checkbox: 0, date: 0, signature: 0 };
    pageInfoRef.current = {};
    setFields([]);
    setSelectedFieldId(null);
    setFile(null);
    setPageCount(0);
    setCurrentPage(0);
    setPageMetrics(null);
    setViewUpright(false);
    setIsViewUprightTouched(false);
    setDebugPoint(null);
  }, [destroyPdf]);

  const handleDimensionInput = useCallback(
    (key: "widthPt" | "heightPt", value: string) => {
      if (!selectedField) return;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return;
      const info = getPageInfo(selectedField.pageIndex);
      if (!info) return;
      const max = key === "widthPt" ? info.pageWidthPt : info.pageHeightPt;
      const bounded = clamp(parsed, 8, Math.max(8, max));
      updateSelectedField({ [key]: bounded } as Partial<FillableFieldUI>);
    },
    [getPageInfo, selectedField, updateSelectedField]
  );

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Add fillable fields to any PDF. Everything runs in your browser, so your PDF
        stays private on your device.
      </div>

      <FileDropZone accept=".pdf" multiple={false} maxSizeMB={100} onFiles={handleFiles} />

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
                <label className="mr-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={viewUpright}
                    onChange={(event) => {
                      setIsViewUprightTouched(true);
                      setViewUpright(event.target.checked);
                    }}
                    className="h-3.5 w-3.5 rounded border-border"
                  />
                  View upright
                </label>
                <button
                  type="button"
                  onClick={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.6, 2))}
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
                  onClick={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.6, 2))}
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
              {isDebugVisible && pageMetrics && (
                <p className="ml-auto text-[11px] text-muted-foreground">
                  sourceRotation {pageMetrics.sourceRotation}° · viewUpright{" "}
                  {String(viewUpright)} · viewportRotation {pageMetrics.activeRotation}° · scale{" "}
                  {zoom.toFixed(2)}
                </p>
              )}
              <p className="w-full text-xs text-muted-foreground">
                Pick a field type, then click anywhere on the page preview to place it.
              </p>
            </div>

            <div className="relative overflow-auto rounded-xl border border-border bg-zinc-200/30 p-3">
              <div
                className="relative mx-auto"
                style={{
                  width: pageMetrics?.widthCss ? `${pageMetrics.widthCss}px` : "fit-content",
                  minHeight: pageMetrics?.heightCss ? `${pageMetrics.heightCss}px` : "240px",
                }}
              >
                <canvas ref={canvasRef} className="block bg-white shadow-sm" />
                <div
                  ref={overlayRef}
                  data-testid="pdf-fillable-overlay"
                  className="absolute inset-0"
                  onClick={placeField}
                  style={{
                    width: pageMetrics?.widthCss ? `${pageMetrics.widthCss}px` : undefined,
                    height: pageMetrics?.heightCss ? `${pageMetrics.heightCss}px` : undefined,
                  }}
                >
                  {fieldsOnCurrentPage.map((field) => {
                    const viewport = viewportRef.current;
                    if (!pageMetrics || !viewport) return null;

                    const rect = pdfRectToViewportRect({
                      viewport,
                      xPt: field.xPt,
                      yPt: field.yPt,
                      widthPt: field.widthPt,
                      heightPt: field.heightPt,
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
                          left: rect.leftPx,
                          top: rect.topPx,
                          width: Math.max(14, rect.widthPx),
                          height: Math.max(14, rect.heightPx),
                        }}
                      >
                        <span className="truncate">{field.label || field.name}</span>
                        <Move className="h-3 w-3 shrink-0 opacity-70" />
                      </button>
                    );
                  })}

                  {isDebugVisible && debugPoint && (
                    <>
                      <div
                        className="pointer-events-none absolute bg-rose-500/70"
                        style={{ left: 0, right: 0, top: debugPoint.yCss, height: 1 }}
                      />
                      <div
                        className="pointer-events-none absolute bg-rose-500/70"
                        style={{ top: 0, bottom: 0, left: debugPoint.xCss, width: 1 }}
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
                  onClick={() => setCurrentPage((value) => Math.min(pageCount - 1, value + 1))}
                  disabled={currentPage >= pageCount - 1}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {pageCount}
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
                    <label className="text-xs font-medium text-muted-foreground">Width (pt)</label>
                    <input
                      type="number"
                      min={8}
                      value={Math.round(selectedField.widthPt)}
                      onChange={(event) => handleDimensionInput("widthPt", event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Height (pt)</label>
                    <input
                      type="number"
                      min={8}
                      value={Math.round(selectedField.heightPt)}
                      onChange={(event) => handleDimensionInput("heightPt", event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Field positions and sizes are stored in PDF points and projected through the active pdf.js viewport.
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              <button
                type="button"
                onClick={downloadFillablePdf}
                disabled={fields.length === 0 || isExporting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Generating…" : "Download Fillable PDF"}
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

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        Date fields are regular text fields prefilled with <code>YYYY-MM-DD</code>. Signature
        fields are text fields labeled for signing.
      </div>
    </div>
  );
}
