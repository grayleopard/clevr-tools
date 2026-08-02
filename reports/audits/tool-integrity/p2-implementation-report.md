# P2 implementation and flagship-readiness report

Date: 2026-08-02

Branch: `codex/p2-flagship-readiness`

Accepted foundation: `aa5d1b617825faade573e3cf11d06ca3b98e30e8`

## Release verdict

The local P2 candidate passes the completed build, static, Node, artifact, Chromium, Firefox, and WebKit checks listed below. It is ready for review on the P2 branch, but production is **NO-GO** until this branch is reviewed, promoted, deployed at an identified commit, and its live API and browser smoke tests are rerun.

The existing production deployment still exposes live `/api/remove-bg` and `/api/xray` processing paths that returned HTTP 500 to empty POST probes. The P2 candidate hard-disables both paths with deterministic HTTP 503 responses. No file was sent to either production endpoint.

## Foundation and production verification

- `main`, `origin/main`, the accepted P1 branch, and the P2 branch all began this phase at the accepted P1 commit `aa5d1b617825faade573e3cf11d06ca3b98e30e8`; no redundant merge was necessary.
- GitHub deployment metadata showed a successful Vercel deployment for that accepted foundation commit.
- Fresh production smoke checks passed for the home, Files, Calculate, flagship, sample calculator, Timer, command search, mobile navigation, theme, sitemap, robots, and canonical paths.
- Background Remover, HEIC to JPG, Poker, Take-home Pay, and Paycheck remained absent from navigation, categories, homepage search, related tools, and the sitemap. Their direct status pages remained noindex and non-operational.
- The production Timer overflow defect was reproduced before the P2 fix.
- Production Smart Converter upload handoff could not be completed because the in-app browser file chooser timed out twice. The same flow is verified on the local production-built P2 candidate.

## Implemented reliability work

### Containment and privacy

- `/api/remove-bg` now returns an unconditional JSON 503 and cannot invoke a processor.
- `/api/xray` now returns an unconditional unavailable JSON 503 and cannot invoke a processor.
- File X-Ray compatibility surfaces cannot initiate requests, and PDF-to-JPG no longer exposes its trigger.
- Privacy copy now describes these integrations as disabled pending processor, retention, training, and deletion-policy verification.
- Local production-build probes confirmed both disabled API contracts.

### Smart Converter and file handoff

- Inputs are checked using actual file headers where supported; empty, oversize, and mismatched files are rejected before actions appear.
- Handoffs are target-bound, size-bound, operation-bound, and expire after 30 seconds; destination routes revalidate them before processing.
- Navigation transitions are cancelable and generation-guarded; stale work cannot publish after reset, replacement, unmount, or a superseding action.
- Object URLs are revoked on replacement, reset, stale completion, and unmount in the touched paths.
- Browser tests verify a renamed PDF is rejected and JPG, WebP, and PNG handoffs produce independently checked blob downloads with the expected extension.
- Verdict: **READY for the verified raster and target-bound normal paths; PARTIAL for the complete action graph, DOCX structural validation, PDF password/corruption/large-file boundaries, clipboard/history/back flows, and portfolio-wide lifecycle behavior.**

### PDF reliability

- PDF-to-Fillable now stores canonical raw-PDF rectangles and renders/exports from that same coordinate system, removing double rotation.
- Both ordinary and rotated source-page widget placement pass parsed-artifact browser checks.
- PDF.js loading/rendering helpers now destroy documents in `finally` blocks.
- PDF-to-JPG validates generated JPEG signatures, preserves deterministic page order, uses collision-safe naming, cleans stale work/URLs, and exposes accessible ZIP errors and controls.
- Merge PDF validates inputs, reopens output, verifies page count/order, cleans URLs, and supports keyboard plus mobile reordering.
- Decision: retain PDF-to-Fillable as a hidden future candidate; do not restore it to discovery until its broader rotation, zoom/DPR, corruption, password, large-document, and corpus gates are complete.

### Images and HEIC

- Image Compressor has stale-run protection, validated previews, collision-safe output names, partial-error reporting, URL cleanup, and parsed download coverage.
- HEIC capability detection is explicit. On this machine libvips lacks HEIC decode support, so two quality-output cases skip with a stated capability reason while magic, timeout, and containment coverage still runs.
- HEIC remains contained and undiscoverable; no unsupported conversion was advertised or enabled.

### Cross-browser, mobile, accessibility, and Timer

- Desktop primary navigation now begins at `lg`, avoiding the tablet-width collision between desktop and mobile navigation.
- Timer controls use a responsive three-column layout with a full-width start action, 44 px targets, deterministic focus handoff, timer/progress semantics, reduced-motion handling, and wall-clock-aware 250 ms updates.
- Timer passed Firefox and WebKit at 320, 390, 430, 768, and 1440 px, in dark mode, reduced motion, keyboard/focus, and semantic checks.
- Representative flagship and nine-family smoke coverage passed in Firefox and WebKit at mobile width with dark mode, overflow, artifact, and runtime assertions.
- Exact cross-browser totals: Firefox 21/21; WebKit 21/21. Chromium full suite: 355 passed, 6 explicit capability skips, 0 failures.
- A local development diagnostic measured FCP/LCP 1,372 ms, TBT 218 ms, CLS 0, and 753.6 KiB transferred JavaScript. This is diagnostic lab evidence, not field Core Web Vitals; INP and 75th-percentile field data remain unavailable.

## Flagship verdicts and analytics

- **Image Compressor: READY for the tested JPG/PNG/WebP normal, batch, partial-error, download, and stale-work paths; PARTIAL for a broader EXIF/ICC/animation/large-memory corpus.**
- **PDF to JPG: READY for the tested valid PDF, page selection/order, JPEG magic, ZIP, reset, and failure paths; PARTIAL for password-protected, signed, corrupt, and large-document boundaries.**
- **Merge PDF: READY for the tested validation, order, parsed output, keyboard, mobile, and reset paths; PARTIAL for encrypted/signed/complex-document preservation and large-memory boundaries.**
- Privacy-safe events implemented for `opened`, `valid_input`, `started`, `succeeded`, `download`, and `process_another`, with bounded success-only duration. Failure reasons are restricted to `invalid_input`, `processing`, `rendering`, and `download`. Filenames, file contents, user text, clipboard data, exception strings, and raw inputs are excluded.

## Portfolio, search evidence, benchmark, and authority

- All 116 tools were rescored: 3 FLAGSHIP, 37 KEEP, 48 FIX, 13 HIDE, 14 CONSOLIDATE, and 1 REMOVE.
- The consolidation candidates are gated proposals, primarily exact single-unit converters plus car-payment routes; any future execution requires evidence/parity, direct 301 mapping, and discovery cleanup.
- Meme Generator plus 30 templates is the sole removal candidate, also gated on demand evidence and asset provenance; if approved, removal uses 410 rather than a false redirect.
- 28-day and 3-month GSC Queries/Pages exports, GSC Links, backlink/referring-domain exports, and owner trust answers were not available outside the prohibited `outputs/` directory. Demand, backlink, and aggregate opportunity scores therefore remain UNKNOWN; no bulk title rewrite, irreversible retirement, or traffic projection was made.
- A 76-case benchmark methodology is specified: 456 total executions including warmups, 380 recorded runs, five repetitions, reproducible schemas/corpus licensing, independent 10% verification, and publication gates. No benchmark result or superiority claim is asserted.
- Platform-reference work is a primary-source-only verification protocol with a 90-day review cycle; no unverified numeric limits are approved for publication.
- The authority plan is ethical and evidence-led: publish reproducible research and useful methodology, then conduct selective relevant outreach with no link incentives, mass outreach, or fabricated claims.

## Design checkpoint

Three isolated prototypes cover Home, Files, Image Compressor empty/settings/results, desktop/mobile, and light/dark. No broad production redesign was applied.

| Direction | Trust | Clarity | Distinct | Mobile | A11y | Memory | Extensibility | Performance | Generic risk (lower is better) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Industrial Precision | 9.4 | 9.6 | 8.6 | 9.2 | 9.2 | 8.4 | 9.8 | 9.7 | 1.5 |
| Editorial Utility | 9.2 | 8.8 | 9.3 | 8.9 | 9.0 | 9.4 | 8.8 | 9.8 | 1.3 |
| Playful Instrument | 8.5 | 8.9 | 9.5 | 8.9 | 8.8 | 9.6 | 9.1 | 9.6 | 2.4 |

Recommendation: select **Industrial Precision**, borrowing Editorial Utility's prose restraint. Production implementation awaits explicit user selection.

## Verification ledger

- Production build: PASS, 174/174 static routes.
- TypeScript: PASS.
- ESLint with zero warnings allowed: PASS.
- Node: 86 total, 84 passed, 2 explicit HEIC capability skips, 0 failures.
- Chromium: 361 total, 355 passed, 6 explicit capability skips, 0 failures.
- Firefox: 21/21 targeted cross-browser cases passed.
- WebKit: 21/21 targeted cross-browser cases passed.
- PDF-to-Fillable parsed placement: 2/2 passed, including an independent projection of the emitted AcroForm widget back to the browser click target on a rotated source page.
- Local disabled-route probes: both returned the expected HTTP 503 contract.
- Sitemap/discovery/containment: PASS through the Node discovery and full Chromium registry/sitemap coverage.
- Bundle budget: PASS — `/`, Image Compressor, PDF to JPG, and Word to PDF each total 553 KiB against budgets of 1,600/2,200/1,700/1,700 KiB; largest shared chunk is 223 KiB against 900 KiB.
- `git diff --check`: PASS.
- Independent adversarial review: **GO for P2 branch review; NO-GO for current production promotion.** Its two findings were resolved and rechecked: semantic parsed placement for rotated Fillable PDF, and removal of unsupported legacy `.doc` acceptance from Word-to-PDF. No open actionable defect remained at review close.

## Residual risk and required promotion steps

1. Review and approve this P2 branch; do not merge it merely from this report.
2. Resolve any independent-review findings.
3. Deploy the exact approved commit and verify the deployment identity.
4. Rerun live `/api/remove-bg` and `/api/xray` 503 probes, production Smart Converter file handoff, flagship parsed artifacts, Timer/tablet layouts, containment, sitemap/canonicals, console/hydration, and accessibility smoke.
5. Supply GSC/backlink exports and the ten owner trust answers before evidence-based retirement, SEO, or authority decisions.
6. Select a visual direction before any production-wide visual implementation.

Unrelated functionality was preserved. Global configuration was not changed. The user-owned `outputs/` directory was neither read nor modified and must not be staged.
