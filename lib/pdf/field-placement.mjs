function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeRotation(rotation) {
  const normalized = Number(rotation) || 0;
  return ((normalized % 360) + 360) % 360;
}

function getFieldNormSize({
  pdfPageWidth,
  pdfPageHeight,
  fieldWidthPt,
  fieldHeightPt,
  pageRotation = 0,
}) {
  const safePageWidth = Math.max(1, Number(pdfPageWidth) || 1);
  const safePageHeight = Math.max(1, Number(pdfPageHeight) || 1);
  const widthNormRaw = clamp((Number(fieldWidthPt) || 0) / safePageWidth, 0, 1);
  const heightNormRaw = clamp((Number(fieldHeightPt) || 0) / safePageHeight, 0, 1);
  const rotation = normalizeRotation(pageRotation);

  if (rotation === 90 || rotation === 270) {
    return {
      widthNorm: heightNormRaw,
      heightNorm: widthNormRaw,
    };
  }

  return {
    widthNorm: widthNormRaw,
    heightNorm: heightNormRaw,
  };
}

function mapDisplayTopLeftToUnrotatedTopLeft({
  nx,
  ny,
  fieldWidthPt,
  fieldHeightPt,
  pdfPageWidth,
  pdfPageHeight,
  pageRotation = 0,
}) {
  const safePageWidth = Math.max(1, Number(pdfPageWidth) || 1);
  const safePageHeight = Math.max(1, Number(pdfPageHeight) || 1);
  const wNorm = clamp((Number(fieldWidthPt) || 0) / safePageWidth, 0, 1);
  const hNorm = clamp((Number(fieldHeightPt) || 0) / safePageHeight, 0, 1);
  const rotation = normalizeRotation(pageRotation);

  if (rotation === 90) {
    return {
      ux: ny,
      uyFromTop: 1 - nx - hNorm,
    };
  }

  if (rotation === 180) {
    return {
      ux: 1 - nx - wNorm,
      uyFromTop: 1 - ny - hNorm,
    };
  }

  if (rotation === 270) {
    return {
      ux: 1 - ny - wNorm,
      uyFromTop: nx,
    };
  }

  return {
    ux: nx,
    uyFromTop: ny,
  };
}

function mapUnrotatedTopLeftToDisplayTopLeft({
  ux,
  uyFromTop,
  fieldWidthPt,
  fieldHeightPt,
  pdfPageWidth,
  pdfPageHeight,
  pageRotation = 0,
}) {
  const safePageWidth = Math.max(1, Number(pdfPageWidth) || 1);
  const safePageHeight = Math.max(1, Number(pdfPageHeight) || 1);
  const wNorm = clamp((Number(fieldWidthPt) || 0) / safePageWidth, 0, 1);
  const hNorm = clamp((Number(fieldHeightPt) || 0) / safePageHeight, 0, 1);
  const rotation = normalizeRotation(pageRotation);

  if (rotation === 90) {
    return {
      nx: 1 - uyFromTop - hNorm,
      ny: ux,
    };
  }

  if (rotation === 180) {
    return {
      nx: 1 - ux - wNorm,
      ny: 1 - uyFromTop - hNorm,
    };
  }

  if (rotation === 270) {
    return {
      nx: uyFromTop,
      ny: 1 - ux - wNorm,
    };
  }

  return {
    nx: ux,
    ny: uyFromTop,
  };
}

export function getFieldDisplayNormSize(params) {
  return getFieldNormSize(params);
}

export function mapNormalizedFieldToPdfPoint({
  nx,
  ny,
  pdfPageWidth,
  pdfPageHeight,
  fieldWidthPt,
  fieldHeightPt,
  pageRotation = 0,
}) {
  const safePageWidth = Math.max(1, Number(pdfPageWidth) || 1);
  const safePageHeight = Math.max(1, Number(pdfPageHeight) || 1);
  const fieldWidth = clamp(Number(fieldWidthPt) || 0, 0, safePageWidth);
  const fieldHeight = clamp(Number(fieldHeightPt) || 0, 0, safePageHeight);

  const displayFieldNorm = getFieldNormSize({
    pdfPageWidth: safePageWidth,
    pdfPageHeight: safePageHeight,
    fieldWidthPt: fieldWidth,
    fieldHeightPt: fieldHeight,
    pageRotation,
  });

  const clampedNx = clamp(Number(nx) || 0, 0, 1 - displayFieldNorm.widthNorm);
  const clampedNy = clamp(Number(ny) || 0, 0, 1 - displayFieldNorm.heightNorm);

  const mapped = mapDisplayTopLeftToUnrotatedTopLeft({
    nx: clampedNx,
    ny: clampedNy,
    fieldWidthPt: fieldWidth,
    fieldHeightPt: fieldHeight,
    pdfPageWidth: safePageWidth,
    pdfPageHeight: safePageHeight,
    pageRotation,
  });

  const ux = clamp(mapped.ux, 0, 1);
  const uyFromTop = clamp(mapped.uyFromTop, 0, 1);

  const xPt = clamp(ux * safePageWidth, 0, Math.max(0, safePageWidth - fieldWidth));
  const yPt = clamp(
    safePageHeight - uyFromTop * safePageHeight - fieldHeight,
    0,
    Math.max(0, safePageHeight - fieldHeight)
  );

  return {
    nx: clampedNx,
    ny: clampedNy,
    xPt,
    yPt,
  };
}

export function mapDomPointToPdfPoint({
  clientX,
  clientY,
  canvasRect,
  cssZoom,
  dpr,
  pdfViewport,
  pdfPageWidth,
  pdfPageHeight,
  fieldWidthPt,
  fieldHeightPt,
  pageRotation = 0,
}) {
  // clientX/clientY and canvasRect are both in CSS pixels. Keep mapping in CSS space.
  const _unusedCssZoom = cssZoom;
  const _unusedDpr = dpr;
  const _unusedViewport = pdfViewport;
  void _unusedCssZoom;
  void _unusedDpr;
  void _unusedViewport;

  const rectWidth = Math.max(1, Number(canvasRect?.width) || 1);
  const rectHeight = Math.max(1, Number(canvasRect?.height) || 1);
  const left = Number(canvasRect?.left) || 0;
  const top = Number(canvasRect?.top) || 0;
  const localXCss = Number(clientX) - left;
  const localYCss = Number(clientY) - top;
  const nxRaw = clamp(localXCss / rectWidth, 0, 1);
  const nyRaw = clamp(localYCss / rectHeight, 0, 1);

  return mapNormalizedFieldToPdfPoint({
    nx: nxRaw,
    ny: nyRaw,
    pdfPageWidth,
    pdfPageHeight,
    fieldWidthPt,
    fieldHeightPt,
    pageRotation,
  });
}

export function mapPdfFieldToDomRect({
  xPt,
  yPt,
  pdfPageWidth,
  pdfPageHeight,
  fieldWidthPt,
  fieldHeightPt,
  pageRotation = 0,
  canvasRect,
}) {
  const safePageWidth = Math.max(1, Number(pdfPageWidth) || 1);
  const safePageHeight = Math.max(1, Number(pdfPageHeight) || 1);
  const fieldWidth = clamp(Number(fieldWidthPt) || 0, 0, safePageWidth);
  const fieldHeight = clamp(Number(fieldHeightPt) || 0, 0, safePageHeight);

  const ux = clamp((Number(xPt) || 0) / safePageWidth, 0, 1);
  const uyFromTop = clamp(
    (safePageHeight - (Number(yPt) || 0) - fieldHeight) / safePageHeight,
    0,
    1
  );

  const mapped = mapUnrotatedTopLeftToDisplayTopLeft({
    ux,
    uyFromTop,
    fieldWidthPt: fieldWidth,
    fieldHeightPt: fieldHeight,
    pdfPageWidth: safePageWidth,
    pdfPageHeight: safePageHeight,
    pageRotation,
  });

  const fieldNorm = getFieldNormSize({
    pdfPageWidth: safePageWidth,
    pdfPageHeight: safePageHeight,
    fieldWidthPt: fieldWidth,
    fieldHeightPt: fieldHeight,
    pageRotation,
  });

  const left = (Number(canvasRect?.left) || 0) + mapped.nx * (Number(canvasRect?.width) || 0);
  const top = (Number(canvasRect?.top) || 0) + mapped.ny * (Number(canvasRect?.height) || 0);
  const width = fieldNorm.widthNorm * (Number(canvasRect?.width) || 0);
  const height = fieldNorm.heightNorm * (Number(canvasRect?.height) || 0);

  return {
    nx: mapped.nx,
    ny: mapped.ny,
    left,
    top,
    width,
    height,
  };
}
