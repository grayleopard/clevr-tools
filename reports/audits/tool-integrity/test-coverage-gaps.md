# Test Coverage Gaps and Verification Plan

## What the audit established

- Every one of the 114 registered routes loaded in the registry smoke suite and exposed an H1 and interactive control without a collected page error/console error.
- All 66 calculators/converters rendered and reacted to a fixture; independent arithmetic or source validation distinguishes `PASS` from shape-only evidence.
- File audit tests downloaded and parsed JPEG, PNG, WebP, animated GIF, and PDF artifacts for dimensions, MIME/magic bytes, transparency, animation, page count/order/geometry, and rotation.
- Text/play audit tests independently reproduced Unicode, stale-state, crypto-range, keyboard, timing, settings, and PNG-export behavior.
- The 116-row matrix has an automated completeness/enum/hard-gate test and was independently loaded/rendered with the spreadsheet artifact runtime.

## Baseline failures that remain

- Node unit suite: two HEIC tests fail because installed Sharp/libvips lacks an HEVC decoder plugin; two fillable-PDF tests fail because Node lacks `DOMMatrix` for pdf.js.
- Full Playwright baseline: two old conversion tests wait for stale button labels even though newer artifact tests validate both conversions; the rotated fillable-PDF test expects a removed `View upright` control.
- `reports/qa/tool-smoke-matrix.md` contains pre-existing merge-conflict markers. It was not changed because this audit is scoped to new integrity artifacts.

These are baseline repository/test-environment issues. They are not newly introduced failures and must not be used to claim the underlying product paths pass or fail without independent evidence.

## Final audit regression results

- Production build: pass, 174 generated pages/assets.
- ESLint: pass with zero errors and the same three pre-existing warnings.
- TypeScript: pass.
- Node tests: 18 pass, four baseline environment failures (two HEIC codec, two missing `DOMMatrix`).
- Bundle budgets: pass; route chunks remain within the configured 553 KiB limit and shared JS within 223 KiB.
- Matrix and discovery integrity: 6/6 pass.
- Focused new artifact plus text/play coverage: 31/31 accounted for; the two confirmed file defects are expected product failures.
- Representative mobile/dark/runtime coverage: 9/9 accounted for; Timer overflow and returning-Numble hydration are expected product failures.
- Full deterministic Playwright suite (`--workers=1`): 316 passed, 8 skipped, three failed out of 327. The failures are exactly the three baseline cases listed above; there are no newly introduced failures.

## Highest-priority missing coverage

### P0/P1 regressions

Add mandatory regression tests before any production repair for Background Remover privacy/configuration, HEIC timeout/error and artifact output, GIF Resizer MIME/extension/animation, Circle Crop geometry/alpha, eight calculator defects, Password/RNG distribution claims, typing/keyboard/timing defects, Numble settings, and Smart Converter capability routing.

### Files and images

- Safari/Firefox/iOS/Android and low-memory devices.
- EXIF orientation, ICC/wide-gamut color, metadata, HDR, HEIC alpha/Live Photos, and representative iPhone HEIC corpus.
- Animated GIF duration/disposal/transparency and animated WebP behavior.
- Batch ZIP contents, duplicate names, cancellation, decoded-memory ceilings, and 20–50 MP sources.
- Image Compressor PNG/WebP alpha, already-optimized growth cases, and visual-difference thresholds.
- Independent QR decoding under size, payload, error-correction, color, and print constraints.
- Word-to-PDF artifacts for DOCX tables/images/lists/page breaks/Unicode/RTL/long documents; legacy `.doc` cannot be claimed without a decoder.
- Invoice PDF text/totals, pagination, logos, localization, negative-value guards, and jurisdictional tax assumptions.

### PDF

- Complex corpus: AcroForms, annotations, outlines, attachments, layers, unusual fonts, malformed xref, encryption, and digital signatures.
- Visual raster comparisons and explicit disclosure that rewriting invalidates signatures.
- PDF Compressor image-heavy inputs and cases where output grows; current structural rewrite does not prove consumer-expected image compression.
- PDF-to-Fillable rotated, touch, keyboard, field semantics, and major-reader compatibility.
- Large-document memory, cancellation, and mobile behavior.

### Calculators and sensitive content

- Exact oracle coverage for every normal/boundary path; current route fixtures often assert only result shape.
- Shared finite/range/domain policy for negative, empty, huge, and overflow inputs.
- Mobile editing, virtual keyboard, copy/reset, locale/currency, rounding, and screen-reader result announcements.
- Versioned primary-source fixtures and owners for tax, payroll, state rates, MET data, and formula assumptions.
- Qualified review for financial, tax, lending, health, nutrition, reproductive-health, sleep, and gambling tools. The audit does not supply professional credentials.
- World time zones, DST transitions, month-end/leap-year conventions, and explicit date-only semantics.

### Text, developer, time, type, and Play

- Grapheme/Unicode/locale matrices for counters, slugging, sorting, regex whole-word behavior, and title case.
- Clipboard permission denial and success paths.
- Statistical/distribution validation for Password and Random Number Generators after repair.
- Real background-tab suspension, notifications/audio, reload persistence, and full Pomodoro cycles.
- Deterministic WPM/accuracy/completion/restart tests across all typing modes and mobile virtual keyboards.
- Keyboard/switch/screen-reader operation for Reaction Time, CPS, overlays, switches, and play surfaces.
- Numble first-visit and persisted return-visit hydration stability; the latter currently raises React error #418.
- Meme template provenance/rights and responsive visual tests beyond the validated 390 px export.

### Routes and discovery

- GSC landing/query export and external backlink evidence; all demand fields remain `UNKNOWN`.
- Automated completeness between registry and category-directory data.
- Smart Converter actions generated/validated against actual accepted formats and processors.
- File X-Ray results filtered against live registry status.
- Runtime tests for all seven redirect aliases, no redirect chains, canonical targets, and the non-equivalent PDF-to-Word redirect decision.

### UX, accessibility, and performance

- The audit now samples nine families at 390×844 with actual dark-theme activation, body contrast, primary controls, overflow, and runtime/hydration collection; exhaustive desktop/mobile visual QA, 320/375 px, 200%/400% zoom, orientation, safe areas, and mobile keyboard effects remain.
- Safari, Firefox, Edge, iOS Safari, and Android Chrome.
- VoiceOver, NVDA, JAWS, TalkBack, voice/switch control, Braille, axe-core, forced colors, and composited contrast.
- Current LCP, CLS, INP, long tasks, per-route chunks, low-end CPU/GPU, and memory pressure.
- Dynamic result/status/error live-region behavior without over-announcing timers.

## External blockers

- No `BG_API_URL` or `BG_API_KEY`; Background Remover returned 503 and no artifact could be tested.
- No GSC/analytics/backlink exports; demand, traffic, and canonical/removal decisions remain unknown.
- No qualified clinical, tax, financial, reproductive-health, sleep, or gambling reviewer was supplied.
- The installed Sharp/libvips build lacks HEVC decoding; this blocks Node HEIC oracles but does not explain the separate browser hang.
- Node lacks the `DOMMatrix` environment required by the current fillable-PDF test path.
- The in-app browser runtime exposed no session to the UX worker; direct screenshots, dark/mobile visual review, and assistive-technology checks remain conservative gaps. Playwright evidence was used where available.

## Completion rule for the next phase

A repair may be called complete only when the defect has an independently computed or parsed-output regression, the user-visible promise matches the implementation, and the relevant mobile/accessibility/privacy/sensitive-domain boundary is explicitly tested or still marked unverified. A route load or success message alone is not proof.
