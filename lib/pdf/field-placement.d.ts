export interface CanvasRectCss {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PdfViewportLike {
  width: number;
  height: number;
  rotation: number;
  convertToPdfPoint(x: number, y: number): [number, number];
  convertToViewportRectangle(rect: [number, number, number, number]): [number, number, number, number];
}

export interface PdfRectPt {
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
}

export function normalizeRotation(value: number): 0 | 90 | 180 | 270;

export function getNeutralizedRotation(sourceRotation: number): number;

export function getLocalViewportPoint(params: {
  clientX: number;
  clientY: number;
  canvasRect: CanvasRectCss;
}): { xViewport: number; yViewport: number; nx: number; ny: number };

export function viewportRectToPdfRect(params: {
  viewport: PdfViewportLike;
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
}): PdfRectPt;

export function pdfRectToViewportRect(params: {
  viewport: PdfViewportLike;
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
}): { leftPx: number; topPx: number; widthPx: number; heightPx: number };

export function clampPdfRectToPage(params: {
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
  pageWidthPt: number;
  pageHeightPt: number;
}): PdfRectPt;

export function mapDomPointToPdfPoint(params: {
  clientX: number;
  clientY: number;
  canvasRect: CanvasRectCss;
  pdfViewport: PdfViewportLike;
  pdfPageWidth: number;
  pdfPageHeight: number;
  fieldWidthPt?: number;
  fieldHeightPt?: number;
}): { xPt: number; yPt: number; nx: number; ny: number };
