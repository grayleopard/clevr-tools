# Baseline Bundle Analysis (PR A)

## Scope and Method
Measured before PR A changes on routes:
- `/`
- `/compress/image`
- `/convert/pdf-to-jpg`
- `/convert/word-to-pdf`

Data sources:
- `reports/next-steps/baseline-route-deps.txt` (client reference manifest analysis)
- `reports/perf/after-route-bytes.txt` (historical route-byte approximation)

Note: Next.js 16 manifest format under-reports route-specific chunks via the older `route-bytes.mjs` path, so this baseline uses client-module chunk aggregation for route deltas.

## Top Shared JS Chunks (before)
- `static/chunks/ed9f2dc4-82bc85789c334053.js` — **839.9 KiB** (4/4 routes)
- `static/chunks/3578-f9d0ba3040247eb6.js` — **272.2 KiB** (4/4 routes)
- `static/chunks/5459-b3d145f30dbffb13.js` — **267.0 KiB** (4/4 routes)
- `static/chunks/4bd1b696-e5d7c65570c947b7.js` — **193.8 KiB** (4/4 routes)
- `static/chunks/polyfills-42372ed130431b0a.js` — **110.0 KiB** (4/4 routes)

## Biggest Multi-route Dependencies (before)
Observed on all selected routes:
- Broad `@radix-ui/react-*` set (accordion, dialog, dropdown, form, hover-card, tabs, tooltip, toast, etc.)
- `next-themes`
- `components/layout/ClientOverlays.tsx`
- `components/layout/ThemeToggle.tsx`
- `components/home/SmartConverterDeferred.tsx`

## Likely Shared-Baseline Pressure Points
- `components/ui/*` primitives imported from umbrella `radix-ui` package, expanding to many Radix subpackages in shared chunks.
- `components/tool/PostDownloadState.tsx` imported client-side related-tool logic and card rendering (which pulls tool metadata and icon mapping) into conversion route chunks before user download flow is reached.

## Baseline Route JS Totals (manifest chunk aggregation)
- `/`: **1722.6 KiB**
- `/compress/image`: **2368.6 KiB**
- `/convert/pdf-to-jpg`: **1775.8 KiB**
- `/convert/word-to-pdf`: **1876.8 KiB**
