# PDF-to-Fillable Placement Debug

## Root cause

Placement drift came from mixing coordinate systems and rotation assumptions between preview and export.

## Current mapping pipeline

The tool now keeps a single rotation basis across preview and export:

- Render: `page.getViewport({ scale, rotation: page.rotate })`
- Click to place:
  - Convert click to viewport-local CSS coordinates.
  - Convert viewport rectangle to PDF rect with `viewport.convertToPdfPoint`.
- Overlay render:
  - Convert stored PDF rect to viewport rect with `viewport.convertToViewportRectangle`.
- Drag:
  - Move in viewport CSS space.
  - Convert dragged viewport rectangle back to PDF rect.
- Export:
  - Keep original PDF page rotation metadata unchanged.
  - Add AcroForm fields directly at stored PDF-point coordinates.

## Why this fixes consistency

Preview and export now use the exact same page rotation basis and the same coordinate conversions, so field placement no longer depends on an extra export-time normalization step.
