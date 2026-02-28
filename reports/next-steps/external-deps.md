# Runtime External Dependency Inventory (Phase 2)

## Scope
Focused on conversion/upload/processing paths for runtime network dependencies that can impact integrity/availability.

## Findings (Before)

1. `lib/pdf-utils.ts`
- `pdfjs.GlobalWorkerOptions.workerSrc` pointed to:
  - `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
- Risk:
  - Runtime dependency on third-party CDN availability.
  - Integrity/supply-chain risk if URL path is tampered or unreachable.

2. `components/tools/WordToPdf.tsx`
- Runtime script injection from CDNJS:
  - `pdfmake.min.js`
  - `vfs_fonts.min.js`
- Risk:
  - Conversion path hard-depends on remote scripts at runtime.
  - Potential availability failure and external script trust surface.

3. `components/tools/InvoiceGenerator.tsx`
- Same runtime CDNJS injection pattern for pdfmake/vfs fonts.
- Risk:
  - Same integrity/availability concerns for invoice PDF generation.

## Changes Applied

1. Self-host PDF.js worker through bundled module URL
- File: `lib/pdf-utils.ts`
- Changed to:
  - `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()`
- Outcome:
  - Worker is loaded from same-origin bundled assets instead of unpkg.

2. Replaced CDN pdfmake loader with bundled package loader
- New shared utility: `lib/pdfmake-loader.ts`
- Uses dynamic imports from installed package:
  - `pdfmake/build/pdfmake`
  - `pdfmake/build/vfs_fonts`
- Normalizes VFS shape and ensures Roboto font mapping.

3. Updated conversion tools to use shared bundled loader
- `components/tools/WordToPdf.tsx`
- `components/tools/InvoiceGenerator.tsx`
- Removed runtime script injection and CDN constants.

## Residual Runtime Externals
- `components/analytics/DeferredAnalytics.tsx` still loads `googletagmanager.com` by design for analytics.
- Not part of conversion execution paths; unchanged in this phase.

## Verification

Automated:
- `npm run lint` ✅
- `npm run build -- --webpack` ✅
- Code search check:
  - No conversion-path `cdnjs`/`unpkg` script loads remain.
  - No conversion-path `new Worker("https://...")` / `importScripts("https://...")` patterns remain.

Manual conversion smoke:
- Not executable in this sandbox due local server binding restrictions (`listen EPERM`).
- Recommended in normal dev environment:
  1. Open `/convert/word-to-pdf` and convert a normal `.docx`.
  2. Open `/files/invoice-generator` and download generated PDF.
  3. Open `/convert/pdf-to-jpg` and convert one PDF page.
