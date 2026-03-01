import test from "node:test";
import assert from "node:assert/strict";

import {
  mapDomPointToPdfPoint,
  mapNormalizedFieldToPdfPoint,
} from "../lib/pdf/field-placement.mjs";

function approxEqual(actual, expected, epsilon = 0.0001) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

test("center click maps to center region in PDF points with inverted Y", () => {
  const mapped = mapDomPointToPdfPoint({
    clientX: 200,
    clientY: 300,
    canvasRect: { left: 0, top: 0, width: 400, height: 600 },
    cssZoom: 1,
    dpr: 1,
    pdfPageWidth: 800,
    pdfPageHeight: 1200,
    fieldWidthPt: 100,
    fieldHeightPt: 50,
    pageRotation: 0,
  });

  approxEqual(mapped.nx, 0.5);
  approxEqual(mapped.ny, 0.5);
  approxEqual(mapped.xPt, 400);
  approxEqual(mapped.yPt, 550);
});

test("zoom changes do not alter normalized mapping", () => {
  const at100 = mapDomPointToPdfPoint({
    clientX: 100,
    clientY: 80,
    canvasRect: { left: 10, top: 20, width: 360, height: 240 },
    cssZoom: 1,
    dpr: 1,
    pdfPageWidth: 612,
    pdfPageHeight: 792,
    fieldWidthPt: 120,
    fieldHeightPt: 24,
    pageRotation: 0,
  });

  const at150 = mapDomPointToPdfPoint({
    clientX: 145,
    clientY: 110,
    canvasRect: { left: 10, top: 20, width: 540, height: 360 },
    cssZoom: 1.5,
    dpr: 1,
    pdfPageWidth: 612,
    pdfPageHeight: 792,
    fieldWidthPt: 120,
    fieldHeightPt: 24,
    pageRotation: 0,
  });

  approxEqual(at100.nx, at150.nx);
  approxEqual(at100.ny, at150.ny);
  approxEqual(at100.xPt, at150.xPt);
  approxEqual(at100.yPt, at150.yPt);
});

test("devicePixelRatio changes do not alter normalized mapping", () => {
  const lowDpr = mapDomPointToPdfPoint({
    clientX: 220,
    clientY: 160,
    canvasRect: { left: 20, top: 40, width: 400, height: 300 },
    cssZoom: 1,
    dpr: 1,
    pdfPageWidth: 1000,
    pdfPageHeight: 800,
    fieldWidthPt: 160,
    fieldHeightPt: 30,
    pageRotation: 0,
  });

  const highDpr = mapDomPointToPdfPoint({
    clientX: 220,
    clientY: 160,
    canvasRect: { left: 20, top: 40, width: 400, height: 300 },
    cssZoom: 1,
    dpr: 3,
    pdfPageWidth: 1000,
    pdfPageHeight: 800,
    fieldWidthPt: 160,
    fieldHeightPt: 30,
    pageRotation: 0,
  });

  approxEqual(lowDpr.nx, highDpr.nx);
  approxEqual(lowDpr.ny, highDpr.ny);
  approxEqual(lowDpr.xPt, highDpr.xPt);
  approxEqual(lowDpr.yPt, highDpr.yPt);
});

test("rotation 90 mapping lands field in expected quadrant", () => {
  const mapped = mapDomPointToPdfPoint({
    clientX: 100,
    clientY: 100,
    canvasRect: { left: 0, top: 0, width: 400, height: 400 },
    cssZoom: 1,
    dpr: 1,
    pdfPageWidth: 600,
    pdfPageHeight: 800,
    fieldWidthPt: 120,
    fieldHeightPt: 40,
    pageRotation: 90,
  });

  approxEqual(mapped.nx, 0.25);
  approxEqual(mapped.ny, 0.25);
  approxEqual(mapped.xPt, 150);
  approxEqual(mapped.yPt, 200);
});

test("normalized mapping is deterministic for export", () => {
  const mapped = mapNormalizedFieldToPdfPoint({
    nx: 0.25,
    ny: 0.25,
    pdfPageWidth: 600,
    pdfPageHeight: 800,
    fieldWidthPt: 120,
    fieldHeightPt: 40,
    pageRotation: 90,
  });

  approxEqual(mapped.xPt, 150);
  approxEqual(mapped.yPt, 200);
});
