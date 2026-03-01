function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safe(value, fallback = 1) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
}

export function domPointToNxNy({ clientX, clientY, pageRectCss }) {
  const rectWidth = Math.max(1, safe(pageRectCss?.width, 1));
  const rectHeight = Math.max(1, safe(pageRectCss?.height, 1));
  const rectLeft = safe(pageRectCss?.left, 0);
  const rectTop = safe(pageRectCss?.top, 0);

  const nx = clamp((safe(clientX, 0) - rectLeft) / rectWidth, 0, 1);
  const ny = clamp((safe(clientY, 0) - rectTop) / rectHeight, 0, 1);

  return { nx, ny };
}

export function pdfPtSizeToCssPx({
  widthPt,
  heightPt,
  pageRectCss,
  pageSizePt,
}) {
  const rectWidth = Math.max(1, safe(pageRectCss?.width, 1));
  const rectHeight = Math.max(1, safe(pageRectCss?.height, 1));
  const pageWidthPt = Math.max(1, safe(pageSizePt?.widthPt, 1));
  const pageHeightPt = Math.max(1, safe(pageSizePt?.heightPt, 1));
  const clampedWidthPt = clamp(safe(widthPt, 0), 0, pageWidthPt);
  const clampedHeightPt = clamp(safe(heightPt, 0), 0, pageHeightPt);

  return {
    widthPx: (clampedWidthPt / pageWidthPt) * rectWidth,
    heightPx: (clampedHeightPt / pageHeightPt) * rectHeight,
  };
}

export function cssPxToPdfPtSize({
  widthPx,
  heightPx,
  pageRectCss,
  pageSizePt,
}) {
  const rectWidth = Math.max(1, safe(pageRectCss?.width, 1));
  const rectHeight = Math.max(1, safe(pageRectCss?.height, 1));
  const pageWidthPt = Math.max(1, safe(pageSizePt?.widthPt, 1));
  const pageHeightPt = Math.max(1, safe(pageSizePt?.heightPt, 1));
  const clampedWidthPx = clamp(safe(widthPx, 0), 0, rectWidth);
  const clampedHeightPx = clamp(safe(heightPx, 0), 0, rectHeight);

  return {
    widthPt: (clampedWidthPx / rectWidth) * pageWidthPt,
    heightPt: (clampedHeightPx / rectHeight) * pageHeightPt,
  };
}

export function nxnyToCssPx({ nx, ny, pageRectCss }) {
  const rectWidth = Math.max(1, safe(pageRectCss?.width, 1));
  const rectHeight = Math.max(1, safe(pageRectCss?.height, 1));

  return {
    leftPx: clamp(safe(nx, 0), 0, 1) * rectWidth,
    topPx: clamp(safe(ny, 0), 0, 1) * rectHeight,
  };
}

export function nxnyToPdfPt({ nx, ny, pageSizePt, fieldSizePt }) {
  const pageWidthPt = Math.max(1, safe(pageSizePt?.widthPt, 1));
  const pageHeightPt = Math.max(1, safe(pageSizePt?.heightPt, 1));
  const widthPt = clamp(safe(fieldSizePt?.widthPt, 0), 0, pageWidthPt);
  const heightPt = clamp(safe(fieldSizePt?.heightPt, 0), 0, pageHeightPt);

  const nxClamped = clamp(safe(nx, 0), 0, 1);
  const nyClamped = clamp(safe(ny, 0), 0, 1);
  const xPt = clamp(nxClamped * pageWidthPt, 0, Math.max(0, pageWidthPt - widthPt));
  const yPt = clamp(
    pageHeightPt - nyClamped * pageHeightPt - heightPt,
    0,
    Math.max(0, pageHeightPt - heightPt)
  );

  return {
    xPt,
    yPt,
  };
}

export function clampNxNyToBounds({ nx, ny, fieldSizePt, pageSizePt }) {
  const pageWidthPt = Math.max(1, safe(pageSizePt?.widthPt, 1));
  const pageHeightPt = Math.max(1, safe(pageSizePt?.heightPt, 1));
  const widthPt = clamp(safe(fieldSizePt?.widthPt, 0), 0, pageWidthPt);
  const heightPt = clamp(safe(fieldSizePt?.heightPt, 0), 0, pageHeightPt);

  const maxNx = Math.max(0, 1 - widthPt / pageWidthPt);
  const maxNy = Math.max(0, 1 - heightPt / pageHeightPt);

  return {
    nx: clamp(safe(nx, 0), 0, maxNx),
    ny: clamp(safe(ny, 0), 0, maxNy),
    maxNx,
    maxNy,
  };
}
