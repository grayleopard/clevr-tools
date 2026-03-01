# PDF-to-Fillable Placement Debug

## Current mapping audit

The regression came from mixed unit systems in the same flow:

1. Placement used click coordinates in CSS pixels (`clientX/Y` + `getBoundingClientRect`).
2. Field dimensions were stored in PDF points.
3. Overlay rendering and export were not guaranteed to pass through a single shared conversion layer.
4. Rotation logic introduced additional width/height transforms, which amplified the mismatch and produced distorted overlays (tall/skinny boxes).

## Unified model now used

- Position storage: normalized top-left (`nx`, `ny`) in `[0..1]` relative to the displayed page rect.
- Size storage: PDF points (`widthPt`, `heightPt`) only.
- Overlay render:
  - `leftPx = nx * rect.width`
  - `topPx = ny * rect.height`
  - `widthPx = (widthPt / pageWidthPt) * rect.width`
  - `heightPx = (heightPt / pageHeightPt) * rect.height`
- Export:
  - `xPt = nx * pageWidthPt`
  - `yPt = pageHeightPt - (ny * pageHeightPt) - heightPt`

## Shared helpers

Implemented pure conversion helpers in `lib/pdf/field-placement.mjs` and used them in all paths:

- `domPointToNxNy`
- `pdfPtSizeToCssPx`
- `cssPxToPdfPtSize`
- `nxnyToCssPx`
- `nxnyToPdfPt`
- `clampNxNyToBounds`

This enforces one coordinate/sizing model for click-to-place, overlay display, drag, resize, and export.

## Rotation handling note

To avoid dual transform paths during this urgent fix, rendering is normalized to upright page orientation (`rotation: 0`) in the tool. A visible note is shown when source PDF metadata indicates rotation. This keeps placement and export consistent until full rotated-page support is reintroduced through the same conversion pipeline.
