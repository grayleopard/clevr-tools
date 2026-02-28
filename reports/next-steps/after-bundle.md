# After Bundle Analysis (PR A)

## Changes Applied
1. Replaced umbrella `radix-ui` imports with direct primitive package imports:
- `@radix-ui/react-slot`
- `@radix-ui/react-tabs`
- `@radix-ui/react-slider`
- `@radix-ui/react-tooltip`

2. Deferred post-download related-tools payload:
- Moved related-tools UI/data usage out of the core `PostDownloadState` path via lazy-loaded `RelatedToolsPanel`.

## Route JS Delta (before vs after)
Using client reference manifest chunk aggregation:

| Route | Before | After | Delta |
|---|---:|---:|---:|
| `/` | 1722.6 KiB | 1449.3 KiB | **-273.3 KiB** |
| `/compress/image` | 2368.6 KiB | 2011.1 KiB | **-357.5 KiB** |
| `/convert/pdf-to-jpg` | 1775.8 KiB | 1517.6 KiB | **-258.2 KiB** |
| `/convert/word-to-pdf` | 1876.8 KiB | 1503.3 KiB | **-373.5 KiB** |

## Shared Chunk Improvements
- Removed from 4/4-route shared baseline:
  - `static/chunks/3578-f9d0ba3040247eb6.js` (**272.2 KiB**)
- Remaining large shared chunks are now mostly core runtime/framework assets.

## Multi-route Dependency Improvements
Before:
- Dozens of `@radix-ui/react-*` packages surfaced on all selected routes.

After:
- Cross-route dependency set reduced to:
  - `next`
  - `next-themes`
  - `components/layout/ClientOverlays.tsx`
  - `components/layout/ThemeToggle.tsx`
  - `components/home/SmartConverterDeferred.tsx`
  - `app/globals.css`

## Verification Commands
```bash
npm run lint
npm run build -- --webpack
node scripts/perf/route-bytes.mjs / /compress/image /convert/pdf-to-jpg /convert/word-to-pdf
# detailed route dependency/chunk inspection captured in:
# reports/next-steps/baseline-route-deps.txt
# reports/next-steps/after-route-deps.txt
```
