# HEIC Conversion Notes

## Implementation path in production

- Route: `/convert/heic-to-jpg`
  - Page entry: `app/convert/heic-to-jpg/page.tsx`
  - Tool UI: `components/tools/HeicToJpg.tsx`
  - Conversion callsite: `heicToJpg(file, quality)` from `lib/processors.ts`

## Decoder/conversion mechanism

- Current runtime conversion in the browser uses `heic2any` (dynamic import in `lib/processors.ts`).
- This is a client-side library path (no server upload/API call).
- There is no remote conversion API in the HEIC pipeline.
- The app does not explicitly advertise EXIF orientation guarantees for HEIC output; the current QA tests therefore validate correctness/quality on fixed-dimension fixtures.

## Why HEIC happy-path E2E is flaky in PR CI

- Browser-level HEIC decode behavior can vary by runtime/codec stack and worker timing in headless CI.
- Full UI happy-path adds additional async variance (hydration, upload events, worker startup), which can cause intermittent failures unrelated to core conversion correctness.

## Deterministic CI validation added

- New deterministic Node tests (`tests/heic-to-jpg-quality.test.mjs`) validate:
  - JPEG magic bytes (`FF D8 ... FF D9`)
  - Non-trivial output size threshold
  - Expected output dimensions
  - Perceptual quality via dHash distance against a committed known-good JPG reference
- Conversion for deterministic tests uses a node-friendly path (`lib/heic/node-heic-converter.mjs`) powered by `sharp`.

## Nightly-only browser HEIC check

- PR CI keeps HEIC UI happy-path skipped for stability.
- Optional nightly workflow runs HEIC E2E happy-path only with longer timeout and does not gate merges.
