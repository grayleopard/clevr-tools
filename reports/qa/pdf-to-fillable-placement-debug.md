# PDF-to-Fillable Placement Debug

## Current mapping pipeline (before fix)

1. Click coordinates were captured from `MouseEvent.clientX/clientY` in the overlay.
2. The tool converted click position to normalized values via `rect = overlay.getBoundingClientRect()`:
   - `normalizedX = (clientX - rect.left) / rect.width`
   - `normalizedY = (clientY - rect.top) / rect.height`
3. It immediately converted those normalized values to PDF points using:
   - `x = normalizedX * pageWidth`
   - `y = pageHeight - normalizedY * pageHeight - fieldHeight`
4. The resulting absolute `x/y` points were stored in component state and reused for overlay rendering and export.

## Assumptions and issues

- Assumed a direct 1:1 relationship between displayed page orientation and pdf-lib coordinate space.
- Did not use a single shared mapper for:
  - click -> placement
  - overlay rendering
  - export conversion
- Rotation was not modeled in the point transform, so rotated pages could place fields in unexpected locations.
- Absolute point storage increased drift risk when field dimensions changed and when display transforms differed from page-space assumptions.

## Fix direction implemented

- Added a single shared mapping module (`lib/pdf/field-placement.mjs`) that handles:
  - DOM click -> normalized display coordinates -> PDF points
  - normalized display coordinates -> PDF points for export
  - PDF points -> DOM rect for overlay rendering
- Mapping is based on CSS-space `getBoundingClientRect()` to stay stable across zoom, DPR, and scroll.
- Rotation-aware transforms (`0/90/180/270`) are applied consistently.
- Field state now stores normalized top-left coordinates (`nx/ny`) plus field dimensions in points, then resolves to PDF points only when exporting.
- Added a dev-only debug overlay toggle with crosshair and live `(nx, ny, xPt, yPt)` values.
