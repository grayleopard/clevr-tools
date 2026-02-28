# Lint Notes

## Baseline (before)
- Command: `npm run lint`
- Result: **10 errors, 20 warnings**
- Baseline output saved at `reports/lint/lint-baseline.txt`.
- Primary failures:
  - React hooks violations (`react-hooks/refs`, `react-hooks/set-state-in-render`, `react-hooks/set-state-in-effect`, `react-hooks/immutability`)
  - TypeScript/eslint correctness (`prefer-const`)
  - Next lint/perf warnings and unused code warnings

## What Changed
- Hook safety fixes:
  - Moved ref assignments out of render into effects in:
    - `components/tool/PageDragOverlay.tsx`
    - `lib/useAutoLoadFile.ts`
    - `lib/usePasteImage.ts`
  - Removed `setState` calls from render-time memo path in `components/tools/FindAndReplace.tsx` by deriving regex parse state via memoized values.
  - Removed mount `setState` effect pattern in `components/tools/UUIDGenerator.tsx` by using lazy state initialization.
  - Fixed stopwatch RAF recursion callback shape in `components/tools/StopwatchTool.tsx`.
- Type/lint correctness:
  - Fixed `prefer-const` cases in `components/tools/TypingTest.tsx` and password generation logic.
  - Removed/cleaned unused imports and variables in several files (`AgeCalculator`, `DateDifference`, `PdfToJpg`, `QrCodeGenerator`, `types.d.ts`, etc.).
  - Kept `AdSlot` prop signature for compatibility while consuming the prop to satisfy lint.
- Next.js image lint handling:
  - Added narrow, line-level disables for `@next/next/no-img-element` where rendering is intentionally from local object URLs/data URLs:
    - `components/tool/ImagePreviewCard.tsx`
    - `components/tools/QrCodeGenerator.tsx`
  - This avoids behavioral changes and keeps preview/download flows unchanged.

## Final Status (after)
- `npm run lint` => **0 errors, 0 warnings**
- `npm run build -- --webpack` => **passes**

## Remaining Warning Debt
- None in current lint run.
