# QA Audit Report — clevr-tools

**Date:** 2026-02-25
**Scope:** Full codebase audit of all 44 tool components, shared components, tool registry, and build validation.

---

## 1. Tool Inventory

### Registry (`lib/tools.ts`)
- **43 tools defined** in the `tools` array
- **42 live tools** (`live !== false`)
- **1 dead tool:** `base64-encoder` (slug: `base64-encoder`, route: `/generate/base64`, `live: false`) — hidden from homepage and sitemap; the live replacement is `base64` (slug: `base64`, route: `/dev/base64`)
- **9 categories:** compress (2), convert (11), tools (4), generate (3), time (3), text (8), dev (5), calc (8), ai (0)

### Routes (from build output)
54 page routes + robots.txt + sitemap.xml = 56 total static routes. All pre-rendered successfully.

---

## 2. Component Audit Summary

All 44 tool components in `components/tools/` were read and audited against these criteria:

| Check                                 | Result  | Notes                                                        |
|---------------------------------------|---------|--------------------------------------------------------------|
| `"use client"` directive              | PASS    | All 44 components have it                                    |
| Import errors / missing deps          | PASS    | No broken imports found                                      |
| State bugs / stale closures           | PASS    | Callbacks use proper dependencies                            |
| Null / undefined guards               | PASS    | All tools guard against NaN, empty strings, null files       |
| Error handling (try/catch)            | PASS    | All file-processing tools wrap async ops in try/catch        |
| Copy button correctness               | PASS    | All copy buttons copy the correct output value               |
| Output state clarity                  | PASS    | Clear separation of input/output/processing states           |
| Reset / clear correctness             | PASS    | All tools clear both input and output on reset               |
| Dark mode (`dark:text-emerald-500`)   | PASS    | All primary output values use the correct dark mode class    |
| Division by zero guards               | PASS    | PercentageCalculator, UnitConverter, MortgageCalculator      |
| Timer cleanup (`document.title`)      | PASS    | Timer, Stopwatch, Pomodoro all restore title on unmount      |
| Interval/RAF cleanup on unmount       | PASS    | Timer, Stopwatch, Pomodoro all clear timers on unmount       |

---

## 3. Issues Found & Fixed

### Issue 1: WordToPdf off-screen rendering produces blank/crushed PDFs

**File:** `components/tools/WordToPdf.tsx`
**Root Cause:** The off-screen container used `position: absolute; left: -9999px` which caused `html2canvas` to render at an unpredictable width (often 0px or the viewport edge), producing blank or compressed output.

**Fix Applied:**
1. Added `PAGE_WIDTH_PX` constant mapping page sizes to pixel widths (96 DPI: A4 portrait = 794px, letter portrait = 816px, etc.)
2. Changed off-screen positioning from `position: absolute; left: -9999px` to `position: fixed; top: -99999px; left: 0` so the element gets a real layout
3. Set explicit `container.style.width` to the page pixel width
4. Added `width` and `windowWidth` to `html2canvas` options to match the container width

**Before:**
```js
container.style.position = "absolute";
container.style.left = "-9999px";
container.style.top = "0";
// ...
html2canvas: { scale: 2, logging: false, useCORS: true }
```

**After:**
```js
const contentWidthPx = PAGE_WIDTH_PX[pageSize][orientation];
container.style.position = "fixed";
container.style.top = "-99999px";
container.style.left = "0";
container.style.width = `${contentWidthPx}px`;
// ...
html2canvas: { scale: 2, logging: false, useCORS: true, width: contentWidthPx, windowWidth: contentWidthPx }
```

### Issue 2: PdfToJpg lacks clear input/output visual separation

**File:** `components/tools/PdfToJpg.tsx`
**Problem:** Input thumbnails and output results had no section headers or visual containers, making it hard to distinguish the before/after states.

**Fix Applied:**
1. Wrapped input thumbnails in a bordered card with a header: "Input -- N pages loaded"
2. Added a success banner at the top of results section with a green border and icon
3. Wrapped output image grid in a bordered card with header: "Output -- N JPG images" and an inline "Download ZIP" button
4. Added page count display in the input header

---

## 4. Items Reviewed With No Issues Found

### Tool Components (all 44)
- **File converters (13):** ImageCompressor, PdfCompressor, HeicToJpg, JpgToPng, PngToJpg, PngToWebp, WebpToPng, ImagesToPdf (shared by jpg-to-pdf and png-to-pdf), ImageResizer, PdfToJpg, PdfToWord, WordToPdf, MergePdf, SplitPdf, RotatePdf
- **Generator tools (3):** QrCodeGenerator, PasswordGenerator, RandomNumberGenerator
- **Text tools (9):** WordCounter, CaseConverter, LoremGenerator, RemoveLineBreaks, TextToSlug, CharacterCounter, FindAndReplace, SortLines, JsonFormatter
- **Dev tools (4):** Base64Tool, UrlEncoderDecoder, UUIDGenerator, ColorPicker
- **Calculator tools (8):** PercentageCalculator, UnitConverter, AgeCalculator, DateDifference, BmiCalculator, MortgageCalculator, TipCalculator, DiscountCalculator, CompoundInterestCalculator, GpaCalculator
- **Time tools (3):** TimerTool, StopwatchTool, PomodoroTool

### Shared Components
- `components/tool/FileDropZone.tsx` — Proper validation, drag/drop, format pills, privacy line. No issues.
- `components/tool/ToolLayout.tsx` — Server component with JSON-LD, breadcrumb, related tools. No issues.
- `components/tool/ToolCard.tsx` — Icon mapping, badge support, hover states. No issues.

### Tool Registry (`lib/tools.ts`)
- All slugs are unique
- All routes match the file structure
- `getToolsByCategory()` correctly filters `live !== false`
- `getRelatedTools()` correctly filters and slices to 4
- One dead tool (`base64-encoder`) is properly excluded from homepage and sitemap
- `relatedTools` arrays reference valid slugs

---

## 5. Build Status

```
bun run build — PASS
- Next.js 16.1.6 (Turbopack)
- Compiled successfully in 3.4s
- TypeScript: No errors
- 56 static routes generated
- All pages pre-rendered without errors
```

---

## 6. Recommendations (Not Blocking)

1. **Remove dead tool entry:** The `base64-encoder` tool with `live: false` can be removed from `lib/tools.ts` entirely since `base64` (slug: `base64`) fully replaces it. This avoids any confusion in the registry.

2. **Minor: GpaCalculator uses module-level `let nextId`:** The `nextId` counter at line 31 is a module-level mutable variable. If two instances of the component ever mounted (unlikely but possible in development with HMR), IDs could collide. Consider using `useRef` for the counter instead.

3. **Minor: DateDifference unused variable `d`:** Line 8 declares `const d = new Date(start)` but it's never used (the function uses `dd` instead). The variable can be removed for clarity.

4. **Minor: DateDifference unused variable `endTime`:** Line 9 declares `const endTime = end.getTime()` but it's never used. Can be removed.

5. **Minor: FileDropZone `accept` in dependency array:** Line 77 includes `accept` in the `validate` callback's dependency array but the function only uses `acceptedExtensions` (derived from `accept`). This is harmless but redundant.
