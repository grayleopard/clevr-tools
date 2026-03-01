import test from "node:test";
import assert from "node:assert/strict";

import {
  clampNxNyToBounds,
  domPointToNxNy,
  nxnyToPdfPt,
  pdfPtSizeToCssPx,
} from "../lib/pdf/field-placement.mjs";

function approxEqual(actual, expected, epsilon = 0.001) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

test("pdfPtSizeToCssPx scales proportionally from PDF points to CSS pixels", () => {
  const size = pdfPtSizeToCssPx({
    widthPt: 200,
    heightPt: 28,
    pageRectCss: { width: 1000, height: 1400 },
    pageSizePt: { widthPt: 500, heightPt: 700 },
  });

  approxEqual(size.widthPx, 400);
  approxEqual(size.heightPx, 56);
});

test("center click maps to center nx/ny and correct PDF point inversion", () => {
  const click = domPointToNxNy({
    clientX: 250,
    clientY: 350,
    pageRectCss: { left: 0, top: 0, width: 500, height: 700 },
  });
  approxEqual(click.nx, 0.5);
  approxEqual(click.ny, 0.5);

  const mapped = nxnyToPdfPt({
    nx: click.nx,
    ny: click.ny,
    pageSizePt: { widthPt: 500, heightPt: 700 },
    fieldSizePt: { widthPt: 200, heightPt: 28 },
  });
  approxEqual(mapped.xPt, 250);
  approxEqual(mapped.yPt, 322);
});

test("zoom and dpr do not affect normalized click mapping when rect scales", () => {
  const at100 = domPointToNxNy({
    clientX: 190,
    clientY: 120,
    pageRectCss: { left: 10, top: 20, width: 360, height: 240 },
  });

  const at150 = domPointToNxNy({
    clientX: 280,
    clientY: 170,
    pageRectCss: { left: 10, top: 20, width: 540, height: 360 },
  });

  approxEqual(at100.nx, at150.nx);
  approxEqual(at100.ny, at150.ny);
});

test("default text field height stays in a sane range for overlay rendering", () => {
  const size = pdfPtSizeToCssPx({
    widthPt: 220,
    heightPt: 28,
    pageRectCss: { width: 900, height: 1200 },
    pageSizePt: { widthPt: 612, heightPt: 792 },
  });

  assert.ok(size.heightPx > 0, "height should be positive");
  assert.ok(size.heightPx < 1200 * 0.2, "height should not exceed 20% of page height");
});

test("clampNxNyToBounds keeps field inside page", () => {
  const bounded = clampNxNyToBounds({
    nx: 0.95,
    ny: 0.97,
    pageSizePt: { widthPt: 500, heightPt: 700 },
    fieldSizePt: { widthPt: 200, heightPt: 28 },
  });

  approxEqual(bounded.maxNx, 0.6);
  approxEqual(bounded.nx, 0.6);
  assert.ok(bounded.ny <= bounded.maxNy);
});
