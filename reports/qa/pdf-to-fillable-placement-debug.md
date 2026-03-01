# PDF-to-Fillable Placement Debug

## Root cause

The broken behavior came from mixing coordinate systems:

1. Click/drag happened in viewport CSS pixels.
2. Overlay and export logic mixed normalized values and PDF-point math.
3. Rotation metadata was not handled with a single transform path, so rendered orientation and exported coordinates diverged.

## Current mapping pipeline

The tool now uses pdf.js viewport transforms as the single source of truth:

- Render: `page.getViewport({ scale, rotation: neutralRotation })`, where
  `neutralRotation` resolves to a rotation-neutral value (`0`) for metadata-only rotation inputs.
- Click to place:
  - Convert click to viewport-local CSS coordinates.
  - Convert viewport rectangle to PDF rect with `viewport.convertToPdfPoint`.
- Overlay render:
  - Convert PDF rect to viewport rect with `viewport.convertToViewportRectangle`.
- Drag:
  - Move in viewport CSS space.
  - Convert dragged viewport rectangle back to PDF rect.
- Export:
  - Source pages are normalized into a new PDF with rotation metadata baked into content and page rotation set to `0`.
  - Field rects are transformed with the exact same page transform used for content normalization.

## Why this fixes it

Every interaction path now uses the same conversion model (PDF points <-> viewport pixels) and the same rotation basis. That keeps placement stable across zoom, DPR, scrolling, and rotated inputs.
