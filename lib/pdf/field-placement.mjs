function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function normalizeRotation(value) {
  const raw = safeNumber(value, 0);
  const normalized = ((raw % 360) + 360) % 360;
  if (normalized < 45 || normalized >= 315) return 0;
  if (normalized < 135) return 90;
  if (normalized < 225) return 180;
  return 270;
}

export function getNeutralizedRotation(sourceRotation) {
  const normalized = normalizeRotation(sourceRotation);
  const inverse = (360 - normalized) % 360;
  return normalizeRotation(normalized + inverse);
}

export function getLocalViewportPoint({ clientX, clientY, canvasRect }) {
  const width = Math.max(1, safeNumber(canvasRect?.width, 1));
  const height = Math.max(1, safeNumber(canvasRect?.height, 1));
  const left = safeNumber(canvasRect?.left, 0);
  const top = safeNumber(canvasRect?.top, 0);

  const xViewport = clamp(safeNumber(clientX, 0) - left, 0, width);
  const yViewport = clamp(safeNumber(clientY, 0) - top, 0, height);

  return {
    xViewport,
    yViewport,
    nx: xViewport / width,
    ny: yViewport / height,
  };
}

export function viewportRectToPdfRect({ viewport, leftPx, topPx, widthPx, heightPx }) {
  const left = safeNumber(leftPx, 0);
  const top = safeNumber(topPx, 0);
  const width = Math.max(0, safeNumber(widthPx, 0));
  const height = Math.max(0, safeNumber(heightPx, 0));

  const [x1, y1] = viewport.convertToPdfPoint(left, top);
  const [x2, y2] = viewport.convertToPdfPoint(left + width, top + height);

  return {
    xPt: Math.min(x1, x2),
    yPt: Math.min(y1, y2),
    widthPt: Math.abs(x2 - x1),
    heightPt: Math.abs(y2 - y1),
  };
}

export function pdfRectToViewportRect({ viewport, xPt, yPt, widthPt, heightPt }) {
  const x = safeNumber(xPt, 0);
  const y = safeNumber(yPt, 0);
  const width = Math.max(0, safeNumber(widthPt, 0));
  const height = Math.max(0, safeNumber(heightPt, 0));

  const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
    x,
    y,
    x + width,
    y + height,
  ]);

  return {
    leftPx: Math.min(x1, x2),
    topPx: Math.min(y1, y2),
    widthPx: Math.abs(x2 - x1),
    heightPx: Math.abs(y2 - y1),
  };
}

export function clampPdfRectToPage({ xPt, yPt, widthPt, heightPt, pageWidthPt, pageHeightPt }) {
  const pageWidth = Math.max(1, safeNumber(pageWidthPt, 1));
  const pageHeight = Math.max(1, safeNumber(pageHeightPt, 1));
  const width = clamp(safeNumber(widthPt, 0), 8, pageWidth);
  const height = clamp(safeNumber(heightPt, 0), 8, pageHeight);

  return {
    xPt: clamp(safeNumber(xPt, 0), 0, Math.max(0, pageWidth - width)),
    yPt: clamp(safeNumber(yPt, 0), 0, Math.max(0, pageHeight - height)),
    widthPt: width,
    heightPt: height,
  };
}

export function mapDomPointToPdfPoint({
  clientX,
  clientY,
  canvasRect,
  pdfViewport,
  pdfPageWidth,
  pdfPageHeight,
  fieldWidthPt = 0,
  fieldHeightPt = 0,
}) {
  const local = getLocalViewportPoint({ clientX, clientY, canvasRect });
  const [xPtRaw, yPtRaw] = pdfViewport.convertToPdfPoint(local.xViewport, local.yViewport);

  const clamped = clampPdfRectToPage({
    xPt: xPtRaw,
    yPt: yPtRaw - safeNumber(fieldHeightPt, 0),
    widthPt: safeNumber(fieldWidthPt, 0),
    heightPt: safeNumber(fieldHeightPt, 0),
    pageWidthPt: safeNumber(pdfPageWidth, 1),
    pageHeightPt: safeNumber(pdfPageHeight, 1),
  });

  return {
    xPt: clamped.xPt,
    yPt: clamped.yPt,
    nx: local.nx,
    ny: local.ny,
  };
}
