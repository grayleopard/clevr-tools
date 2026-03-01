import test from "node:test";
import assert from "node:assert/strict";

import {
  clampPdfRectToPage,
  getLocalViewportPoint,
  mapDomPointToPdfPoint,
  pdfRectToViewportRect,
  viewportRectToPdfRect,
} from "../lib/pdf/field-placement.mjs";

function approxEqual(actual, expected, epsilon = 0.001) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

function createMockViewport({ pageWidth, pageHeight, viewportWidth, viewportHeight, rotation = 0 }) {
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isQuarterTurn = normalizedRotation === 90 || normalizedRotation === 270;
  const rotatedWidth = isQuarterTurn ? pageHeight : pageWidth;
  const rotatedHeight = isQuarterTurn ? pageWidth : pageHeight;

  const scaleX = viewportWidth / rotatedWidth;
  const scaleY = viewportHeight / rotatedHeight;

  function pdfToViewportPoint(x, y) {
    switch (normalizedRotation) {
      case 90: {
        const rx = y;
        const ry = pageWidth - x;
        return [rx * scaleX, (rotatedHeight - ry) * scaleY];
      }
      case 180: {
        const rx = pageWidth - x;
        const ry = pageHeight - y;
        return [rx * scaleX, (rotatedHeight - ry) * scaleY];
      }
      case 270: {
        const rx = pageHeight - y;
        const ry = x;
        return [rx * scaleX, (rotatedHeight - ry) * scaleY];
      }
      default:
        return [x * scaleX, (pageHeight - y) * scaleY];
    }
  }

  function viewportToPdfPoint(xViewport, yViewport) {
    switch (normalizedRotation) {
      case 90: {
        const rx = xViewport / scaleX;
        const ry = rotatedHeight - yViewport / scaleY;
        return [pageWidth - ry, rx];
      }
      case 180: {
        const rx = xViewport / scaleX;
        const ry = rotatedHeight - yViewport / scaleY;
        return [pageWidth - rx, pageHeight - ry];
      }
      case 270: {
        const rx = xViewport / scaleX;
        const ry = rotatedHeight - yViewport / scaleY;
        return [ry, pageHeight - rx];
      }
      default:
        return [xViewport / scaleX, pageHeight - yViewport / scaleY];
    }
  }

  return {
    width: viewportWidth,
    height: viewportHeight,
    rotation: normalizedRotation,
    convertToPdfPoint(x, y) {
      return viewportToPdfPoint(x, y);
    },
    convertToViewportRectangle(rect) {
      const [x1, y1, x2, y2] = rect;
      const p1 = pdfToViewportPoint(x1, y1);
      const p2 = pdfToViewportPoint(x2, y2);
      return [p1[0], p1[1], p2[0], p2[1]];
    },
  };
}

test("viewportRectToPdfRect and pdfRectToViewportRect round-trip without rotation", () => {
  const viewport = createMockViewport({
    pageWidth: 500,
    pageHeight: 700,
    viewportWidth: 1000,
    viewportHeight: 1400,
    rotation: 0,
  });

  const pdfRect = viewportRectToPdfRect({
    viewport,
    leftPx: 250,
    topPx: 350,
    widthPx: 400,
    heightPx: 56,
  });

  approxEqual(pdfRect.widthPt, 200);
  approxEqual(pdfRect.heightPt, 28);

  const viewportRect = pdfRectToViewportRect({
    viewport,
    xPt: pdfRect.xPt,
    yPt: pdfRect.yPt,
    widthPt: pdfRect.widthPt,
    heightPt: pdfRect.heightPt,
  });

  approxEqual(viewportRect.leftPx, 250);
  approxEqual(viewportRect.topPx, 350);
  approxEqual(viewportRect.widthPx, 400);
  approxEqual(viewportRect.heightPx, 56);
});

test("local viewport normalization is stable across zoom/DPR-scaled rectangles", () => {
  const at100 = getLocalViewportPoint({
    clientX: 190,
    clientY: 120,
    canvasRect: { left: 10, top: 20, width: 360, height: 240 },
  });

  const at150 = getLocalViewportPoint({
    clientX: 280,
    clientY: 170,
    canvasRect: { left: 10, top: 20, width: 540, height: 360 },
  });

  approxEqual(at100.nx, at150.nx);
  approxEqual(at100.ny, at150.ny);
});

test("rotated viewport rectangle mapping remains consistent", () => {
  const viewport = createMockViewport({
    pageWidth: 612,
    pageHeight: 792,
    viewportWidth: 792,
    viewportHeight: 612,
    rotation: 90,
  });

  const pdfRect = viewportRectToPdfRect({
    viewport,
    leftPx: 120,
    topPx: 100,
    widthPx: 220,
    heightPx: 40,
  });

  const viewportRect = pdfRectToViewportRect({
    viewport,
    xPt: pdfRect.xPt,
    yPt: pdfRect.yPt,
    widthPt: pdfRect.widthPt,
    heightPt: pdfRect.heightPt,
  });

  approxEqual(viewportRect.leftPx, 120);
  approxEqual(viewportRect.topPx, 100);
  approxEqual(viewportRect.widthPx, 220);
  approxEqual(viewportRect.heightPx, 40);
});

test("mapDomPointToPdfPoint converts click with inverted Y and clamps inside page", () => {
  const viewport = createMockViewport({
    pageWidth: 500,
    pageHeight: 700,
    viewportWidth: 500,
    viewportHeight: 700,
    rotation: 0,
  });

  const mapped = mapDomPointToPdfPoint({
    clientX: 250,
    clientY: 350,
    canvasRect: { left: 0, top: 0, width: 500, height: 700 },
    pdfViewport: viewport,
    pdfPageWidth: 500,
    pdfPageHeight: 700,
    fieldWidthPt: 200,
    fieldHeightPt: 28,
  });

  approxEqual(mapped.nx, 0.5);
  approxEqual(mapped.ny, 0.5);
  approxEqual(mapped.xPt, 250);
  approxEqual(mapped.yPt, 322);
});

test("clampPdfRectToPage keeps field dimensions in a sane range", () => {
  const clamped = clampPdfRectToPage({
    xPt: 999,
    yPt: 999,
    widthPt: 200,
    heightPt: 28,
    pageWidthPt: 500,
    pageHeightPt: 700,
  });

  approxEqual(clamped.xPt, 300);
  approxEqual(clamped.yPt, 672);
  assert.ok(clamped.heightPt < 700 * 0.2);
});
