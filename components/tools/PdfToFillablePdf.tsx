"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FileDropZone from "@/components/tool/FileDropZone";
import PageDragOverlay from "@/components/tool/PageDragOverlay";
import ProcessingIndicator from "@/components/tool/ProcessingIndicator";
import { useAutoLoadFile } from "@/lib/useAutoLoadFile";
import { addToast } from "@/lib/toast";
import { formatBytes } from "@/lib/utils";
import { TipJar } from "@/components/tool/TipJar";
import {
  CalendarDays,
  CheckSquare,
  Download,
  Move,
  PenSquare,
  RotateCw,
  Type,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { FillableFieldDefinition, FillableFieldType } from "@/lib/pdf/fillable-pdf";
import {
  clampPdfRectToPage,
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
  destroy?: () => void | Promise<void>;
}

interface PdfLoadingTaskLike {
  promise: Promise<unknown>;
  destroy?: () => void | Promise<void>;
}

interface FillableFieldUI {
  id: string;
  type: FillableFieldType;
  pageIndex: number;
  /** Canonical unrotated PDF coordinates. Never store viewport coordinates. */
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
  name: string;
  label?: string;
}

interface DragState {
  fieldId: string;
  startMouseX: number;
  startMouseY: number;
  startFieldLeftPx: number;
  startFieldTopPx: number;
  fieldWidthPx: number;
  fieldHeightPx: number;
  fieldWidthPt: number;
  fieldHeightPt: number;
  viewport: PdfViewportLike;
  pageWidthPt: number;
  pageHeightPt: number;
}

interface PageMetrics {
  pageRotate: number;
  pageWidthPt: number;
  pageHeightPt: number;
  widthCss: number;
  heightCss: number;
  totalRotation: number;
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
  const [resetKey, setResetKey] = useState(0);
  const [userRotation, setUserRotation] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [debugPoint, setDebugPoint] = useState<DebugPoint | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PdfLike | null>(null);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pageInfoRef = useRef<Record<number, { pageWidthPt: number; pageHeightPt: number }>>({});
  const pageInherentRotationRef = useRef<Record<number, number>>({});
  const userRotationRef = useRef(0);
  const viewportRef = useRef<PdfViewportLike | null>(null);
  const loadingTaskRef = useRef<PdfLoadingTaskLike | null>(null);
  const renderTaskRef = useRef<import("pdfjs-dist").RenderTask | null>(null);
  const renderTaskPromiseRef = useRef<Promise<void> | null>(null);
  const renderSeqRef = useRef(0);
  const loadSeqRef = useRef(0);
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

  const cancelLoadingTask = useCallback(() => {
    const task = loadingTaskRef.current;
    loadingTaskRef.current = null;
    if (!task?.destroy) return;
    try {
      void Promise.resolve(task.destroy()).catch(() => {
        // Ignore destruction races when a new file replaces an old load.
      });
    } catch {
      // Ignore synchronous destruction races for the same reason.
    }
  }, []);

  const destroyPdf = useCallback(() => {
    renderSeqRef.current += 1;
    loadSeqRef.current += 1;
    cancelRenderTask();
    cancelLoadingTask();
    const activePdf = pdfRef.current;
    if (activePdf?.destroy) {
      try {
        void Promise.resolve(activePdf.destroy()).catch(() => {
          // Ignore destruction races when replacing or unmounting a preview.
        });
      } catch {
        // Ignore synchronous destruction races when replacing or unmounting a preview.
      }
    }
    pdfRef.current = null;
    viewportRef.current = null;
  }, [cancelLoadingTask, cancelRenderTask]);

  useEffect(() => {
    return () => {
      destroyPdf();
    };
  }, [destroyPdf]);

  const renderPage = useCallback(
    async (pageIndex: number) => {
      const pdf = pdfRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas) return;
      const seq = ++renderSeqRef.current;
      const previousRender = renderTaskPromiseRef.current;
      cancelRenderTask();

      setIsRenderingPage(true);
      try {
        // PDF.js cannot render two tasks into one canvas at once. Cancellation
        // is asynchronous, so drain the old task before starting a new one.
        if (previousRender) await previousRender;
        if (seq !== renderSeqRef.current || pdfRef.current !== pdf) return;

        const page = await pdf.getPage(pageIndex + 1);
        if (seq !== renderSeqRef.current || pdfRef.current !== pdf) return;

        const pageRotate = page.rotate || 0;
        pageInherentRotationRef.current[pageIndex] = pageRotate;

        const autoCorrection = (360 - pageRotate) % 360;
        const totalRotation = (autoCorrection + userRotation) % 360;

        const rawViewport = page.getViewport({ scale: 1, rotation: 0 });
        const cssViewport = page.getViewport({ scale: zoom, rotation: totalRotation });
        const dpr = window.devicePixelRatio || 1;
        const renderViewport = page.getViewport({ scale: zoom * dpr, rotation: totalRotation });

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
        const taskPromise = task.promise.catch((error) => {
          if (isRenderCancelledError(error)) return;
          throw error;
        });
        renderTaskPromiseRef.current = taskPromise;

        try {
          await taskPromise;
        } finally {
          if (renderTaskRef.current === task) {
            renderTaskRef.current = null;
          }
          if (renderTaskPromiseRef.current === taskPromise) {
            renderTaskPromiseRef.current = null;
          }
        }

        if (seq !== renderSeqRef.current || pdfRef.current !== pdf) return;

        viewportRef.current = cssViewport;
        pageInfoRef.current[pageIndex] = {
          pageWidthPt: rawViewport.width,
          pageHeightPt: rawViewport.height,
        };

        setPageMetrics({
          pageRotate,
          pageWidthPt: rawViewport.width,
          pageHeightPt: rawViewport.height,
          widthCss: cssViewport.width,
          heightCss: cssViewport.height,
          totalRotation,
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
    [cancelRenderTask, userRotation, zoom]
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
      setUserRotation(0);
      userRotationRef.current = 0;
      setDebugPoint(null);
      pageInfoRef.current = {};
      pageInherentRotationRef.current = {};
      fieldCountRef.current = { text: 0, checkbox: 0, date: 0, signature: 0 };
      destroyPdf();
      const loadSeq = ++loadSeqRef.current;
      let loadingTask: PdfLoadingTaskLike | null = null;

      try {
        const fileBytes = new Uint8Array(await uploaded.arrayBuffer());
        if (loadSeq !== loadSeqRef.current) return;
        const pdfjs = await loadPdfJs();
        if (loadSeq !== loadSeqRef.current) return;
        loadingTask = pdfjs.getDocument({ data: fileBytes.slice(0) }) as PdfLoadingTaskLike;
        loadingTaskRef.current = loadingTask;
        const pdf = (await loadingTask.promise) as unknown as PdfLike;
        if (loadSeq !== loadSeqRef.current) {
          try {
            await pdf.destroy?.();
          } catch {
            // The replacement load owns the UI; ignore cleanup races.
          }
          return;
        }
        if (pdf.numPages < 1) {
          try {
            await pdf.destroy?.();
          } catch {
            // Opening fails either way; do not replace its error with cleanup noise.
          }
          throw new Error("PDF has no pages");
        }

        pdfBytesRef.current = fileBytes;
        pdfRef.current = pdf;
        setFile(uploaded);
        setPageCount(pdf.numPages);
      } catch (error) {
        if (loadSeq !== loadSeqRef.current) return;
        console.error(error);
        setFile(null);
        pdfBytesRef.current = null;
        addToast("Failed to open this PDF.", "error");
      } finally {
        if (loadingTaskRef.current === loadingTask) {
          loadingTaskRef.current = null;
        }
        if (loadSeq === loadSeqRef.current) {
          setIsLoadingPdf(false);
        }
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

  // Keep userRotationRef in sync for use in callbacks
  userRotationRef.current = userRotation;

  const placeField = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const overlay = overlayRef.current;
      const viewport = viewportRef.current;
      if (!overlay || !pageMetrics || !viewport) return;
      if ((event.target as HTMLElement).closest("[data-field-id]")) return;

      const rect = overlay.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Click position in CSS pixels relative to overlay
      const vx = clamp(event.clientX - rect.left, 0, rect.width);
      const vy = clamp(event.clientY - rect.top, 0, rect.height);

      const defaults = FIELD_DEFAULTS[activeFieldType];
      // Start from a raw-PDF sized rectangle, project it into the current
      // viewport, then map the click target back to one canonical raw rect.
      // This keeps source rotation, user rotation, zoom, and DPR out of the
      // persisted field definition.
      const defaultViewportRect = pdfRectToViewportRect({
        viewport,
        xPt: 0,
        yPt: 0,
        widthPt: defaults.widthPt,
        heightPt: defaults.heightPt,
      });
      const rawRect = viewportRectToPdfRect({
        viewport,
        leftPx: vx,
        topPx: vy,
        widthPx: defaultViewportRect.widthPx,
        heightPx: defaultViewportRect.heightPx,
      });
      const clamped = clampPdfRectToPage({
        xPt: rawRect.xPt,
        yPt: rawRect.yPt,
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
          xPt: clamped.xPt,
          yPt: clamped.yPt,
          widthPt: clamped.widthPt,
          heightPt: clamped.heightPt,
          name: nextFieldName(activeFieldType, nextCount),
          label: fieldLabelForType(activeFieldType),
        },
      ]);
      setSelectedFieldId(id);
      setDebugPoint({
        xCss: vx,
        yCss: vy,
        nx: vx / rect.width,
        ny: vy / rect.height,
        xPt: clamped.xPt,
        yPt: clamped.yPt,
      });
    },
    [activeFieldType, currentPage, pageMetrics]
  );

  const handleFieldPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, field: FillableFieldUI) => {
      const viewport = viewportRef.current;
      if (!viewport || !pageMetrics) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedFieldId(field.id);

      const viewportRect = pdfRectToViewportRect({
        viewport,
        xPt: field.xPt,
        yPt: field.yPt,
        widthPt: field.widthPt,
        heightPt: field.heightPt,
      });

      dragRef.current = {
        fieldId: field.id,
        startMouseX: event.clientX,
        startMouseY: event.clientY,
        startFieldLeftPx: viewportRect.leftPx,
        startFieldTopPx: viewportRect.topPx,
        fieldWidthPx: viewportRect.widthPx,
        fieldHeightPx: viewportRect.heightPx,
        fieldWidthPt: field.widthPt,
        fieldHeightPt: field.heightPt,
        viewport,
        pageWidthPt: pageMetrics.pageWidthPt,
        pageHeightPt: pageMetrics.pageHeightPt,
      };
    },
    [pageMetrics]
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaX = event.clientX - drag.startMouseX;
      const deltaY = event.clientY - drag.startMouseY;
      const rawRect = viewportRectToPdfRect({
        viewport: drag.viewport,
        leftPx: drag.startFieldLeftPx + deltaX,
        topPx: drag.startFieldTopPx + deltaY,
        widthPx: drag.fieldWidthPx,
        heightPx: drag.fieldHeightPx,
      });
      const clamped = clampPdfRectToPage({
        xPt: rawRect.xPt,
        yPt: rawRect.yPt,
        widthPt: drag.fieldWidthPt,
        heightPt: drag.fieldHeightPt,
        pageWidthPt: drag.pageWidthPt,
        pageHeightPt: drag.pageHeightPt,
      });

      setFields((previous) =>
        previous.map((field) =>
          field.id === drag.fieldId
            ? {
                ...field,
                xPt: clamped.xPt,
                yPt: clamped.yPt,
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
      if (!selectedFieldId || !pageMetrics) return;
      setFields((previous) =>
        previous.map((field) => {
          if (field.id !== selectedFieldId) return field;
          const merged = { ...field, ...patch };
          const clamped = clampPdfRectToPage({
            xPt: merged.xPt,
            yPt: merged.yPt,
            widthPt: merged.widthPt,
            heightPt: merged.heightPt,
            pageWidthPt: pageMetrics.pageWidthPt,
            pageHeightPt: pageMetrics.pageHeightPt,
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
    [pageMetrics, selectedFieldId]
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
        // Kept for the current declaration shape; exporter intentionally
        // ignores it because x/y/width/height are already raw PDF values.
        placedRotation: 0,
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
    pageInherentRotationRef.current = {};
    setFields([]);
    setSelectedFieldId(null);
    setFile(null);
    setIsLoadingPdf(false);
    setIsRenderingPage(false);
    setPageCount(0);
    setCurrentPage(0);
    setPageMetrics(null);
    setUserRotation(0);
    userRotationRef.current = 0;
    setDebugPoint(null);
    setResetKey((k) => k + 1);
  }, [destroyPdf]);

  const handleDimensionInput = useCallback(
    (key: "widthPt" | "heightPt", value: string) => {
      if (!selectedField || !pageMetrics) return;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return;
      const max = key === "widthPt" ? pageMetrics.pageWidthPt : pageMetrics.pageHeightPt;
      const bounded = clamp(parsed, 8, Math.max(8, max));
      updateSelectedField({ [key]: bounded } as Partial<FillableFieldUI>);
    },
    [pageMetrics, selectedField, updateSelectedField]
  );

  return (
    <div className="space-y-6">
      <PageDragOverlay onFiles={handleFiles} />

      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Add fillable fields to any PDF. Everything runs in your browser, so your PDF
        stays private on your device.
      </div>

      <FileDropZone accept=".pdf" multiple={false} maxSizeMB={100} onFiles={handleFiles} resetKey={resetKey} compact={file !== null} />

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
                  onClick={() => setUserRotation((prev) => (prev + 90) % 360)}
                  disabled={fieldsOnCurrentPage.length > 0}
                  title={
                    fieldsOnCurrentPage.length > 0
                      ? "Remove all fields on this page to change rotation"
                      : "Rotate view 90\u00B0"
                  }
                  className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Rotate view"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
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
                  page.rotate {pageMetrics.pageRotate}° · totalRotation {pageMetrics.totalRotation}°
                  {" · "}userRotation {userRotation}° ·
                  {" "}scale {zoom.toFixed(2)}
                </p>
              )}
              <p className="w-full text-xs text-muted-foreground">
                Pick a field type, then click anywhere on the page preview to place it.
              </p>
            </div>

            <div className="relative overflow-auto rounded-xl border border-border bg-muted/30 p-3">
              <div className="relative mx-auto" style={{ width: "fit-content" }}>
                <canvas
                  ref={canvasRef}
                  className="block bg-white shadow-sm"
                  style={{ display: "block" }}
                />

                <div
                  ref={overlayRef}
                  data-testid="pdf-fillable-overlay"
                  onClick={placeField}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: pageMetrics ? `${pageMetrics.widthCss}px` : undefined,
                    height: pageMetrics ? `${pageMetrics.heightCss}px` : undefined,
                    cursor: activeFieldType ? "crosshair" : "default",
                  }}
                >
                  {fieldsOnCurrentPage.map((field) => {
                    const selected = selectedFieldId === field.id;
                    const viewport = viewportRef.current;
                    const fieldViewportRect = viewport
                      ? pdfRectToViewportRect({
                          viewport,
                          xPt: field.xPt,
                          yPt: field.yPt,
                          widthPt: field.widthPt,
                          heightPt: field.heightPt,
                        })
                      : null;

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
                          left: fieldViewportRect?.leftPx ?? 0,
                          top: fieldViewportRect?.topPx ?? 0,
                          width: Math.max(14, fieldViewportRect?.widthPx ?? 0),
                          height: Math.max(14, fieldViewportRect?.heightPx ?? 0),
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
                  <label htmlFor="pdf-fillable-field-name" className="text-xs font-medium text-muted-foreground">Name</label>
                  <input
                    id="pdf-fillable-field-name"
                    type="text"
                    value={selectedField.name}
                    onChange={(event) => updateSelectedField({ name: event.target.value })}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="pdf-fillable-field-label" className="text-xs font-medium text-muted-foreground">Label</label>
                  <input
                    id="pdf-fillable-field-label"
                    type="text"
                    value={selectedField.label ?? ""}
                    onChange={(event) => updateSelectedField({ label: event.target.value })}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="pdf-fillable-field-width" className="text-xs font-medium text-muted-foreground">Width (pt)</label>
                    <input
                      id="pdf-fillable-field-width"
                      type="number"
                      min={8}
                      value={Math.round(selectedField.widthPt)}
                      onChange={(event) => handleDimensionInput("widthPt", event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="pdf-fillable-field-height" className="text-xs font-medium text-muted-foreground">Height (pt)</label>
                    <input
                      id="pdf-fillable-field-height"
                      type="number"
                      min={8}
                      value={Math.round(selectedField.heightPt)}
                      onChange={(event) => handleDimensionInput("heightPt", event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Field positions and sizes are stored in PDF points and scale with the page preview.
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
              <TipJar />
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
