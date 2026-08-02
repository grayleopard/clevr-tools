# Files, Images, Compression, PDF, QR, and Background Remover Audit

Audit date: 2026-08-01

Branch inspected: `codex/tool-integrity-audit` at foundation commit `a3bff45`

Scope: 21 registered tools from `lib/tools.ts`

Production code changed: **No**

Ephemeral evidence root: `/tmp/clevr-tool-audit/files`

## Executive verdict

The workstream contains a credible local-first image/PDF core, but it is not uniformly trustworthy yet. Ten tools produced independently parsed artifacts on their tested path. Five are only partially verified, four failed a core or privacy hard gate, and two remain unverified end to end.

Portfolio recommendations in this workstream:

| Recommendation | Count |
|---|---:|
| `FLAGSHIP` | 3 |
| `KEEP` | 10 |
| `FIX` | 6 |
| `HIDE` | 2 |
| `CONSOLIDATE` | 0 |
| `REMOVE` | 0 |

Verification status:

| Verification | Count |
|---|---:|
| `PASS` | 10 |
| `PARTIAL` | 5 |
| `FAIL` | 4 |
| `UNVERIFIED` | 2 |
| `NOT_APPLICABLE` | 0 |

The three proposed flagship candidates are Image Compressor, PDF to JPG, and Merge PDF. This is a workstream proposal, not a claim of measured demand; all demand fields remain `UNKNOWN` because no GSC export was supplied.

## P0 and P1 findings

### P0 — Background Remover privacy contract is not supportable from the implementation

- **Route:** `/tools/background-remover` (`live:false`, direct route still resolves, noindex/excluded from sitemap).
- The browser posts the image to `/api/remove-bg`. The proxy forwards the entire file to `${BG_API_URL}/remove-bg` with `BG_API_KEY`.
- The UI says the image is sent to “our AI server,” is “processed in memory, then discarded,” and elsewhere says “your image never leaves our servers.” The proxy code cannot prove backend ownership, subprocessors, storage, logging, model-training use, retention, deletion timing, or regional handling.
- The local environment has no `BG_API_URL`/`BG_API_KEY`; direct `POST /api/remove-bg` returned `503` with `{"error":"Background removal is not configured yet."}`.
- The in-memory, process-local five-per-day rate limiter is not durable across server instances or cold starts and groups requests under `unknown` when a forwarding IP is absent.
- **Recommendation:** `HIDE`. Keep the route hidden until there is an owned or contractually documented backend, a verified deletion/retention policy, privacy-policy disclosure, operational monitoring, durable abuse control, and real artifact tests. Do not remove the scaffold yet; it has a coherent strategic use if the privacy and operational contract can be made true.

### P1 — HEIC conversion hangs in the real browser path

- **Route:** `/convert/heic-to-jpg`.
- A valid `tests/fixtures/sample.heic` opens independently with ImageMagick as a 40×40 HEIC.
- With `RUN_HEIC_E2E=1`, Chromium remained at “Converting HEIC to JPG…” and produced no result or error before the 90-second assertion timeout.
- This is separate from the Node/Sharp failure. Sharp reports HEIF support but its bundled libheif lacks the HEVC decoder plugin (`Support for this compression format has not been built in`). That is a test-environment codec limitation, not proof of a browser defect.
- The repository fixture is also internally inconsistent: `sample.heic` is 40×40, while `tests/heic-to-jpg-quality.test.mjs` asserts 128×96 and compares it with a 128×96 reference JPG.
- Source copy claims EXIF transfers, but `heic2any` returns a newly encoded image blob and there is no metadata-copy implementation. Metadata retention is therefore unverified and the claim is unsupported.
- **Recommendation:** `FIX`; temporarily hide it from normal discovery until a representative iPhone HEIC corpus completes with timeouts, errors, dimensions, orientation, color, and metadata behavior verified.

### P1 — Image Resizer labels PNG bytes as GIF and drops animation

- **Route:** `/tools/resize-image`.
- Registry support is JPG/PNG/WebP, but the actual file picker also accepts `.gif` and visibly advertises GIF.
- The implementation requests `canvas.toBlob(..., "image/gif")`; browser Canvas does not encode GIF and falls back to PNG. The filename is still derived from the original extension and ends in `.gif`.
- Browser artifact evidence confirmed the expected failure: the output was PNG bytes under a `.gif` download name, with animation lost.
- The registered JPG path did work: 800×600 input resized to a valid 400×300 JPEG.
- **Recommendation:** `FIX`. Remove GIF from the picker immediately or route animated GIFs to a real GIF-resize encoder; validate magic bytes before assigning filename/MIME.

### P1 — Image Cropper’s Circle option exports a rectangle

- **Route:** `/files/image-cropper`.
- A 160×120 transparent PNG was loaded, Circle selected, and the downloaded PNG parsed with Sharp.
- Expected: square PNG with transparent corners. Actual: 128×96 PNG. The component updates the displayed crop but leaves `completedCrop` stale, then applies circular clipping inside the old rectangular canvas.
- GIF is also accepted. Canvas-based export reduces an animated GIF to a still frame; this is not disclosed.
- **Recommendation:** `FIX`. Synchronize the completed crop when presets change, force a square output canvas for Circle, add corner-alpha assertions, and either disclose still-frame GIF behavior or stop accepting GIF.

## Evidence and test method

### Direct browser artifact audit

Audit-specific test: `tests/e2e/tool-audit/file-artifact-audit.spec.ts`.

The test creates all temporary fixtures under `/tmp/clevr-tool-audit/files`, drives the production build with Playwright/Chromium, downloads artifacts through the user-visible controls, and parses outputs with Sharp or `pdf-lib`. It does not treat a visible “success” message as output verification.

Final focused run after marking the two confirmed defects as expected failures:

```text
npm run test:e2e -- tests/e2e/tool-audit/file-artifact-audit.spec.ts \
  --project=chromium --workers=1 \
  --output=/tmp/clevr-tool-audit/files/playwright-artifacts-final

Expected result after the final test annotation: 17/17 accounted for,
including expected failures for GIF resize and Circle crop.
```

The immediately preceding evidence run reported 16 passed and one unexpected failure; that failure was the newly discovered Circle-crop defect. GIF resize was already an expected failure. The test now marks Circle crop as an expected product failure so the audit suite documents existing behavior without creating a new quality-gate regression.

### Additional focused evidence

| Command/evidence | Result |
|---|---|
| `RUN_HEIC_E2E=1 npm run test:e2e -- tests/e2e/heic-happy.spec.ts --project=chromium --workers=1` | **FAIL**: no output after 90 seconds; processing state never completes. |
| `node --test tests/heic-to-jpg-quality.test.mjs` | **0/2 pass**: environment lacks HEVC decode plugin in Sharp/libheif. |
| `magick identify tests/fixtures/sample.heic` | Valid 40×40 HEIC; exposes the 40×40 vs 128×96 test/reference mismatch. |
| `npm run test:e2e -- tests/e2e/pdf-to-fillable-placement.spec.ts --project=chromium --workers=1` | **1/2 pass**: ordinary field placement/export creates a parsed AcroForm; rotated test expects a removed “View upright” control and is stale, so rotated placement is `PARTIAL`, not declared broken. |
| Source inspection of `lib/processors.ts`, `lib/gif-compression.ts`, `lib/pdf-utils.ts`, and tool components | Establishes client-side processing model and identifies untested compatibility branches. |

Earlier helper attempts to fetch page-owned `blob:` URLs from Playwright’s evaluation realm failed with `TypeError: Failed to fetch`. Those were audit-harness failures, not product failures. The final helper uses the real browser download event and parses the downloaded bytes.

## Matrix-ready portfolio rows

Discovery fields below reflect the current foundation implementation: `live:true` tools are intended to be indexable, sitemap-included, category-discoverable, and search-discoverable; `live:false` tools are noindex, sitemap-excluded, and filtered from normal discovery. The routes/discovery worker should be authoritative if its route-level crawl differs.

`Demand score` and `total score` are `UNKNOWN`. Missing demand evidence is not scored as zero, so a defensible 100-point total cannot be calculated. Numeric entries are only the four evidenced non-demand components.

| Tool / route | Registry, index, discovery | Functional and artifact evidence | Desktop / mobile / a11y | Privacy / dependencies / limitations | Scores: correctness / demand / differentiation / fit / maintainability / total | Recommendation / severity / actions |
|---|---|---|---|---|---|---|
| **Image Compressor** `/compress/image` | live; indexable; sitemap yes; nav/category/search yes | `PARTIAL`; 800×600 high-quality JPG → valid 800×600 JPEG, correct name, smaller than source; output opened with Sharp. PNG alpha, WebP, batch ZIP, 50 MB, and memory pressure unverified. `output_verified=true` | desktop pass on tested path; mobile unverified; a11y partial (labeled shared picker, result link) | browser-local; `browser-image-compression`, Worker/Canvas; already-optimized inputs may grow or show no reduction | 25 / UNKNOWN / 12 / 15 / 7 / UNKNOWN | `FLAGSHIP`; no defect severity; keep indexation, add reproducible multi-format benchmark and mobile memory limits |
| **GIF Compressor** `/tools/gif-compressor` | live; indexable; sitemap yes; nav/category/search yes | `PARTIAL`; 40×40 two-frame GIF → decodable animated GIF with >1 frame and 40×40 frame geometry. Exact duration, transparency, disposal modes, large GIFs, and actual reduction on a representative corpus unverified. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local; `gifuct-js` + `gifenc`; custom palette/re-encode path is maintenance-heavy | 23 / UNKNOWN / 13 / 10 / 6 / UNKNOWN | `KEEP`; no severity; retain, add animation-duration/disposal/transparency and size-reduction corpus |
| **PNG to JPG Converter** `/convert/png-to-jpg` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; 160×120 transparent PNG → real 160×120 JPEG; transparent corner independently decoded as white; sensible `.jpg` name. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local Canvas; alpha intentionally flattened; EXIF not preserved | 28 / UNKNOWN / 5 / 11 / 8 / UNKNOWN | `KEEP`; no severity; retain indexation; disclose metadata stripping if retained in copy |
| **QR Code Generator** `/generate/qr-code` | live; indexable; sitemap yes; nav/category/search yes | `PARTIAL`; source establishes PNG data URL and SVG generation through `qrcode`, with size/color/error-level options and long-input error. No independent scanner decoded the browser output. `output_verified=false` | desktop source-inspected; mobile unverified; a11y partial (color inputs labeled; URL/text input lacks an explicit associated label) | browser-local; `qrcode`; scan success depends on payload length, contrast, print size, and error correction | 22 / UNKNOWN / 4 / 8 / 8 / UNKNOWN | `KEEP`; no severity; add independent QR decode tests at every size/error level and contrast warnings |
| **HEIC to JPG Converter** `/convert/heic-to-jpg` | live; indexable; sitemap yes; nav/category/search yes | `FAIL`; valid 40×40 HEIC hung >90s with no output/error. Node fixture tests separately fail from missing HEVC plugin. `output_verified=false` | desktop fail; mobile unverified; a11y partial | browser-local `heic2any`; codec/browser/worker sensitive; orientation, wide gamut, alpha, Live Photo, EXIF unverified | 5 / UNKNOWN / 8 / 11 / 4 / UNKNOWN | `FIX`; **P1**; temporarily remove from normal discovery after traffic/backlink check, repair timeout/error/codec path, correct fixture corpus |
| **WebP to PNG Converter** `/convert/webp-to-png` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; transparent 160×120 WebP → real 160×120 PNG with alpha. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local Canvas; animation and decoded-pixel equality not tested; output often larger | 28 / UNKNOWN / 5 / 10 / 8 / UNKNOWN | `KEEP`; no severity; retain; add animated-WebP limitation and pixel equality test |
| **PNG to WebP Converter** `/convert/png-to-webp` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; transparent 160×120 PNG → real 160×120 WebP with alpha. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local Canvas; lossy quality; may re-encode at lower quality to avoid growth; exact visual quality unverified | 27 / UNKNOWN / 5 / 11 / 8 / UNKNOWN | `KEEP`; no severity; retain; add visual-difference/quality corpus |
| **JPG to PNG Converter** `/convert/jpg-to-png` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; 800×600 JPEG → real 800×600 PNG with correct extension. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local Canvas; output grows; JPEG artifacts persist; metadata not preserved | 28 / UNKNOWN / 4 / 9 / 8 / UNKNOWN | `KEEP`; no severity; retain, avoid implying quality recovery |
| **AI Background Remover** `/tools/background-remover` | hidden `live:false`; noindex; sitemap/nav/category/search no; direct route resolves | `FAIL`; API returned 503 because unconfigured; no output. Privacy/deletion claims cannot be verified against configured external backend. `output_verified=false` | route UI source-inspected; desktop core fail; mobile unverified; a11y partial | server proxy to `BG_API_URL`; `BG_API_KEY`; full image leaves device; unknown backend retention/subprocessors; weak in-memory rate limit | 0 / UNKNOWN / 12 / 9 / 2 / UNKNOWN | `HIDE`; **P0**; remain noindex/excluded; document and operate backend before any relaunch |
| **PDF Compressor** `/compress/pdf` | live; indexable; sitemap yes; nav/category/search yes | `PARTIAL`; structural one-page fixture → smaller valid one-page PDF. Empty/corrupt inputs produced no download. Image-heavy, forms, annotations, bookmarks, encrypted/signed PDFs and cases that grow are unverified. `output_verified=true` | desktop pass on fixture; mobile unverified; a11y partial | browser-local `pdf-lib`; strips metadata and rewrites object graph; does not resample images; rewriting invalidates digital signatures | 18 / UNKNOWN / 4 / 13 / 8 / UNKNOWN | `FIX`; **P2**; keep route for now but narrow promise or add real image resampling/size targeting and never offer a larger “compressed” file |
| **PDF to JPG Converter** `/convert/pdf-to-jpg` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; two-page PDF (320×220 pt, 420×260 pt) → two valid JPEGs at 640×440 and 840×520 (2× render); page count/order verified. `output_verified=true` | desktop pass; mobile unverified; a11y partial (thumbnail buttons have page labels) | browser-local `pdfjs-dist` + Canvas; text becomes pixels; forms/links lost by design; large-page memory unverified | 28 / UNKNOWN / 7 / 14 / 6 / UNKNOWN | `FLAGSHIP`; no severity; retain indexation; add rotated/encrypted/large PDF and mobile memory coverage |
| **JPG to PDF Converter** `/convert/jpg-to-pdf` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; 800×600 JPG → nonempty, readable one-page PDF parsed with `pdf-lib`. Page content was not independently raster-compared. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local `pdf-lib`; page sizing/margins; batch ordering not exercised | 25 / UNKNOWN / 5 / 12 / 7 / UNKNOWN | `KEEP`; no severity; retain; add multi-image ordering and render comparison |
| **Merge PDF** `/tools/merge-pdf` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; one-page + two-page inputs → valid three-page PDF; page geometry sequence 300×200, 320×220, 420×260 proved order. `output_verified=true` | desktop pass; mobile unverified; a11y partial; reordering is drag-only and keyboard reordering was not found | browser-local `pdf-lib`; forms/outlines/attachments/signatures/encryption unverified; signatures will not remain valid after rewrite | 28 / UNKNOWN / 6 / 13 / 8 / UNKNOWN | `FLAGSHIP`; no severity; retain; add keyboard reorder and complex-PDF preservation suite |
| **Split PDF** `/tools/split-pdf` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; two-page input → two readable one-page PDFs preserving respective 320×220 and 420×260 geometry. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local `pdf-lib` + `pdfjs-dist`; forms/outlines/attachments/encryption/signed inputs unverified | 27 / UNKNOWN / 6 / 12 / 6 / UNKNOWN | `KEEP`; no severity; retain; add range parser/browser edge cases and complex PDF corpus |
| **Rotate PDF** `/tools/rotate-pdf` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; two-page input rotated 90°; output parsed as two pages with `[90,90]` rotations. Existing-rotation combination inspected in source. `output_verified=true` | desktop pass; mobile unverified; a11y partial (page controls are buttons) | browser-local `pdf-lib` + `pdfjs-dist`; signatures/encryption unverified; thumbnail CSS rotation can overflow visually | 28 / UNKNOWN / 5 / 11 / 6 / UNKNOWN | `KEEP`; no severity; retain; add mixed existing rotations and signed/encrypted cases |
| **PDF to Fillable PDF** `/tools/pdf-to-fillable` | hidden `live:false`; noindex; sitemap/nav/category/search no; direct route resolves | `PARTIAL`; ordinary browser placement/export passed; parsed output contained an AcroForm field inside page bounds. Rotated browser test is stale and did not reach export; Node tests fail from missing `DOMMatrix`, an environment issue. `output_verified=true` for ordinary fixture | desktop partial; mobile unverified; a11y partial—placement is primarily pointer-driven and keyboard placement/dragging is unverified | browser-local `pdf-lib` + `pdfjs-dist`; “signature” is a text field, date is plain text; cross-reader/mobile compatibility unverified | 21 / UNKNOWN / 14 / 9 / 3 / UNKNOWN | `HIDE`; no confirmed core severity; keep hidden until rotated, keyboard, touch, and cross-reader corpus passes; then consider `KEEP` |
| **Image Resizer** `/tools/resize-image` | live; indexable; sitemap yes; nav/category/search yes | `FAIL`; JPG 800×600 → valid JPEG 400×300, but accepted GIF → PNG bytes named `.gif`, animation lost. `output_verified=true` | desktop fail for GIF / pass for JPG; mobile unverified; a11y partial | browser-local Canvas + JSZip; batch/sizes >4K/mobile memory unverified; “target file size” is claimed in registry copy but no target-size control exists in component | 14 / UNKNOWN / 10 / 14 / 6 / UNKNOWN | `FIX`; **P1**; keep indexation only after GIF acceptance/claim and target-size promise are reconciled; validate MIME before naming |
| **PNG to PDF Converter** `/convert/png-to-pdf` | live; indexable; sitemap yes; nav/category/search yes | `PASS`; transparent 160×120 PNG → nonempty readable one-page PDF. Page count verified; rendered alpha appearance not independently compared. `output_verified=true` | desktop pass; mobile unverified; a11y partial | browser-local `pdf-lib`; page sizing/margins; batch ordering untested | 25 / UNKNOWN / 5 / 12 / 7 / UNKNOWN | `KEEP`; no severity; retain; add alpha rendering and multi-page order assertions |
| **Word to PDF Converter** `/convert/word-to-pdf` | live; indexable; sitemap yes; nav/category/search yes | `UNVERIFIED`; existing browser test is explicitly skipped. Source path is DOCX → Mammoth HTML → sanitized preview → html-to-pdfmake/pdfmake. Legacy `.doc` is accepted by UI/registry but Mammoth does not provide legacy binary DOC conversion. `output_verified=false` | desktop route source-inspected; mobile unverified; a11y partial | browser-local `mammoth`, `html-to-pdfmake`, `pdfmake`, sanitizer; complex layouts/fonts/headers/footers unsupported; 30s timeout | 15 / UNKNOWN / 9 / 11 / 4 / UNKNOWN | `FIX`; **P2**; stop advertising `.doc` or add a real decoder; add artifact/text/layout corpus before treating as verified |
| **Image Cropper** `/files/image-cropper` | live; indexable; sitemap yes; nav/category/search yes | `FAIL`; Circle on 160×120 PNG produced 128×96 PNG instead of square; alpha present. GIF path collapses animation to a still. `output_verified=true` | desktop fail for Circle; mobile/touch unverified; a11y partial—visual crop adjustment keyboard behavior unverified | browser-local `react-image-crop` + Canvas; stale completed-crop state; animation unsupported | 12 / UNKNOWN / 9 / 13 / 7 / UNKNOWN | `FIX`; **P1**; repair square crop state/output and disclose/remove animated GIF input before promotion |
| **Invoice Generator** `/files/invoice-generator` | live; indexable; sitemap yes; nav/category/search yes | `UNVERIFIED`; formula/source inspected but PDF artifact was not exercised. Allows discounts over subtotal and has no tax-jurisdiction/order model; tax is calculated on pre-discount subtotal, so negative or jurisdictionally wrong totals are possible. `output_verified=false` | desktop/mobile/a11y unverified; fixed five-column line-item grid is a mobile risk | browser-local `pdfmake`; sender details/logo persist in `localStorage`; client details do not; legal/tax requirements vary by jurisdiction | 16 / UNKNOWN / 10 / 9 / 5 / UNKNOWN | `FIX`; **P2**; validate totals, prevent negative invoices, explain tax/discount order, disclose local persistence, then artifact-test PDF text and totals |

## Detailed product findings

### Image processing

Positive findings:

- The four basic format converters emit bytes matching their names and intended formats on tested inputs.
- PNG→JPG correctly composites transparent pixels onto white instead of silently producing black or arbitrary background pixels.
- PNG↔WebP preserves transparency on the tested source.
- Image Compressor produced a materially smaller output for a deliberately high-quality, high-entropy JPEG while preserving dimensions.
- GIF Compressor produced an actual animated GIF rather than a still image with a `.gif` suffix.
- Shared picker errors prevent empty/corrupt/wrong-extension inputs from becoming downloads.

Important gaps:

- Large-file and mobile-memory behavior is not measured. A nominal 50–100 MB input cap is not a memory budget; decoding can multiply resident memory by width × height × four bytes per frame/page.
- Orientation, ICC/wide-gamut color, and EXIF behavior are not covered. Canvas conversion normally strips metadata and can normalize color/orientation differently by browser.
- Batch ZIP contents and duplicate filename collisions are not parsed.
- Animated WebP and animated GIF behavior outside the dedicated GIF Compressor is not safe to infer.
- The Image Resizer registry says “target file size,” but no target-size control or iterative size algorithm exists in the component.

### PDF processing

Positive findings:

- Merge, split, rotate, compress, and PDF→JPG outputs opened and parsed after the browser download.
- Merge order was validated independently via distinct page geometries, not only UI labels.
- Split output page geometry matched the corresponding source page.
- Rotate output metadata contained the requested rotation for every page.
- PDF→JPG output count and pixel dimensions matched the PDF page geometry at the implementation's 2× render scale.
- Ordinary PDF-to-fillable export contained a real AcroForm field, not merely drawn text.

Important gaps:

- No complex corpus covers AcroForms, annotations, bookmarks/outlines, attachments, layers, embedded media, unusual fonts, malformed xref tables, password protection, or digital signatures.
- Any rewrite of a digitally signed PDF invalidates the signature. The compressor’s copy currently says content is preserved “exactly”; that is not safe for signed documents.
- Merge and split use `copyPages`; form-field dictionaries and document-level structures need explicit validation before promising preservation.
- `pdfjs-dist` thumbnail/render paths can be memory-intensive because documents/pages are rendered sequentially into Canvas without an explicit decoded-pixel budget.
- PDF Compressor only strips metadata and rewrites objects; it is not the image-downsampling compressor most consumers expect. It needs either a narrower name/promise or a real image-resampling mode.
- Optional “X-Ray” is a separate server/AI action. Primary transforms remain local, and upload alone does not invoke X-Ray. The user must explicitly trigger it; that distinction should remain clear.

### QR, Word, and Invoice

- QR generation is a sensible, maintainable client-side feature, but valid image generation is not the same as scan success. Add independent decode assertions and fail/warn on low contrast.
- Word conversion is a lossy document reconstruction, not Word’s rendering engine. It needs representative DOCX artifacts (headings, lists, tables, images, page breaks, hyperlinks, Unicode, RTL, long documents) and must not claim legacy `.doc` support without a decoder.
- Invoice generation needs product constraints, not only arithmetic. Prevent negative totals, define whether discounts reduce the taxable base, disclose that tax treatment varies, and test extracted PDF text/totals before calling the output verified.

## Background Remover recommendation and operational requirements

**Recommendation: `HIDE` pending repair and operational ownership.**

Required before relaunch:

1. Identify whether `BG_API_URL` is first-party or a processor; document owner, hosting region, logging, subprocessors, model provider, training use, retention, and deletion timing.
2. Make UI and privacy-policy wording match the verified data flow. Do not promise “processed in memory, then discarded” unless the backend and all downstream processors enforce it.
3. Add a real health check, deployment configuration ownership, latency/error budgets, timeouts, content-type/magic-byte validation, and maximum decoded-pixel controls.
4. Replace the in-memory limiter with durable per-client abuse control appropriate to the deployment topology. Do not advertise “5 per day” until it is actually enforceable.
5. Test edge quality on people, hair, products, pets, transparent input, shadows, low contrast, and multiple subjects. Parse output as PNG, verify alpha, dimensions, nonempty foreground, and absence of original background on a labeled fixture set.
6. Decide and document economics. Every successful request consumes external compute; the current hidden UI references a future Pro plan that does not establish an operating model.

The direct route should remain noindex and absent from sitemap/navigation/search until these conditions are satisfied. There is no reason to delete the scaffold during this audit.

## Explicit unverified gaps

- Safari, Firefox, iOS, Android, and low-memory devices.
- Mobile viewport interaction for every tool in this workstream.
- Screen-reader execution beyond source inspection of labels/roles.
- Batch ZIP contents, collision handling, and many-file cancellation.
- Clipboard paths and browser permission denial beyond source inspection.
- HEIC orientation, HDR/wide-gamut, alpha, Live Photos, and metadata.
- GIF duration/disposal/transparency fidelity and representative size reduction.
- Image Compressor PNG/WebP alpha and batch behavior.
- QR scanning/decoding, print scaling, low contrast, and maximum payloads.
- Image-heavy PDF compression and output-growing cases.
- Encrypted, signed, malformed, form-heavy, annotated, bookmarked, and attachment-bearing PDFs.
- PDF-to-fillable rotated placement after the UI/test contract diverged, plus cross-reader compatibility.
- Word-to-PDF downloadable artifact, legacy `.doc`, complex DOCX, Unicode/RTL, and long-document timeout behavior.
- Invoice PDF artifact, extracted totals/text, logos, page overflow, localization, jurisdictional validity, and negative-value handling.
- Background-removal output quality and privacy contract because no service/credentials were available.

## Recommended next test tranche

1. Repair and make mandatory the three P1 paths: HEIC completion/error timeout, Image Resizer GIF handling, and Circle crop geometry.
2. Add a 15–25 document complex-PDF corpus and assert page count, forms, annotations, outlines, attachments, signatures, encryption errors, and visual raster diffs.
3. Add a representative image corpus with alpha, EXIF orientation, wide gamut, animated formats, duplicate names, 20–50 MP sources, and explicit decoded-memory ceilings.
4. Add independent QR decoding and DOCX/PDF text extraction assertions.
5. Add mobile Chromium/WebKit runs with memory monitoring for the flagship candidates.

No production logic, route, canonical, indexation, or user-owned `outputs/` content was modified by this workstream.
