# Product Integrity Audit — Executive Summary

Audit date: 2026-08-01

Branch: `codex/tool-integrity-audit`

Foundation: `a3bff45bede1f6c0e799d38d7bd4ab20ba94cb70`

## Executive verdict

Clevr.tools has a credible local-first file/PDF core, but the portfolio is not yet trustworthy enough for broad promotion. Only 42 of 116 portfolio units are verified `PASS`; 49 are `PARTIAL`, 23 `FAIL`, and two are end-to-end `UNVERIFIED`. The audit recommends repairing 52 tools, hiding three, and consolidating one. No tool is recommended for removal without traffic/backlink evidence.

The most serious issue is a privacy hard gate: Background Remover sends files to a configurable server while the interface makes retention and ownership claims the proxy cannot establish. Twenty distinct P1 defects also affect core output, routing, tax/health/date calculations, security generators, typing metrics, keyboard access, and Numble settings.

The initial flagship portfolio should be deliberately small: Image Compressor, PDF to JPG, and Merge PDF. Smart Converter is strategically promising but cannot be the central proposition until every offered action is backed by a route whose accepted input, copy, reset behavior, filename handling, and artifact tests match the detected file.

## Exact scope

- 116 canonical portfolio units: 114 registered tools plus Numble and Meme Generator.
- 153 tool-facing URL patterns inspected: the 116 canonical product routes, 30 noindexed Meme Generator template variants, and seven permanent redirect aliases.
- 114/114 registered routes have page sources and self-canonicals.
- 112 registered live tools plus both Play products are in the sitemap; the two hidden registered tools are excluded and noindexed.
- `/files/image-resizer` is not a second implementation. It is a permanent 308 alias to canonical `/tools/resize-image`.
- Demand evidence was unavailable. GSC impressions, clicks, position, demand score, and 100-point total are `UNKNOWN`, not zero.

## Portfolio classifications

| Recommendation | Count |
|---|---:|
| `FLAGSHIP` | 3 |
| `KEEP` | 57 |
| `FIX` | 52 |
| `HIDE` | 3 |
| `CONSOLIDATE` | 1 |
| `REMOVE` | 0 |

| Verification | Count |
|---|---:|
| `PASS` | 42 |
| `PARTIAL` | 49 |
| `FAIL` | 23 |
| `UNVERIFIED` | 2 |
| `NOT_APPLICABLE` | 0 |

The 116-row, 37-column source of truth is `tool-integrity-matrix.csv`. It was parsed, dimension-checked, and rendered with the workspace spreadsheet runtime; an automated repository test also asserts row count, route coverage, uniqueness, enums, unknown-demand handling, and hard-gate consistency.

## P0 and P1 register

### P0

1. **AI Background Remover — privacy and operational contract.** The route posts the full image through `/api/remove-bg` to `BG_API_URL`, but the interface's ownership, in-memory processing, and deletion claims cannot be proven from the proxy. No service credentials were available and the API returned 503. Recommendation: `HIDE` pending a documented processor/owner, retention and deletion guarantees, privacy disclosure, durable abuse control, monitoring, economics, and real output tests.

### P1

1. **HEIC to JPG:** a valid 40×40 HEIC stayed in “Converting” for more than 90 seconds without output or error; the Node Sharp failure is separately an environment codec limitation.
2. **Image Resizer:** accepted animated GIF becomes PNG bytes named `.gif`, losing animation and mismatching MIME/extension.
3. **Image Cropper:** Circle preset exported a 128×96 rectangle instead of a square transparent-corner PNG.
4. **Poker Calculator:** prominent “heads-up win rates” are an ad hoc heuristic; representative hands differ from independent simulation by roughly 10–24 percentage points.
5. **Age Calculator:** month-end decomposition can display negative days, and local-midnight elapsed-day math is DST-sensitive.
6. **Date Difference:** month-end decomposition can display negative days; shortcuts mix local time and UTC date construction.
7. **Take-Home Pay:** stale 2025 federal tables and Social Security base plus omitted Additional Medicare Tax produce materially wrong 2026 results.
8. **Paycheck:** shares the same stale and incomplete payroll model as Take-Home Pay.
9. **Body Fat:** converts imperial inputs to centimeters, then applies U.S. Navy constants defined for inches; errors reached +26.6 percentage points.
10. **Amortization:** an extra-payment schedule overstates the final payment and total paid by charging a full base payment in the payoff month.
11. **Pace:** seconds round independently without carry, producing displays such as `5:60` instead of `6:00`.
12. **Case Converter:** promises rule-aware title case but capitalizes every word (`The Art Of War`).
13. **Password Generator:** modulo bias plus incorrect entropy/pool assumptions make its security-strength and crack-time claims unreliable.
14. **Random Number Generator:** modulo reduction is biased and ranges wider than 2^32 contain unreachable advertised values.
15. **Typing Test:** raw per-word WPM is stored as zero, so consistency is fabricated as 100%; timed completion also drops the current partial word.
16. **Keyboard Tester:** a global `preventDefault()` traps Tab and other navigation keys, violating the tool's own keyboard-access contract.
17. **Typing Race:** the ghost-loss callback closes over `startTime=0`, producing epoch-scale elapsed time and 0 WPM.
18. **CPS Test:** interval callback count, not elapsed wall time, controls duration; throttling can lengthen a nominal five-second test while the score still divides by five.
19. **Numble:** visible Hard, colorblind, and sound settings persist but do not alter gameplay or rendering. A normal returning visit with the tutorial state persisted also raises React hydration error #418 (P2).
20. **Smart Converter:** its HEIC-to-PNG action routes to the JPG-to-PNG tool even though no HEIC-to-PNG implementation exists. Two additional action routes declare the wrong source format at P2.

## Specific product decisions

### Background Remover

`HIDE`, not remove. Keep the scaffold because the workflow fits the local-first file portfolio, but keep it noindex and absent from discovery until the privacy and operational contract is demonstrably true. A future relaunch requires processor ownership, retention/deletion documentation, disclosure, durable rate limits, monitoring, a funded operating model, and artifact/edge-quality tests.

### Meme Generator

`HIDE` pending template-rights provenance and demand evidence. The editor does produce a decodable 1200×1200 PNG at a 390 px viewport, so this is not a claim that export is broken. Its fixed zones, watermark, 30-template maintenance surface, uncertain rights, and weak strategic differentiation currently dilute the trust proposition. Check GSC/backlinks before changing indexation or routes.

### Duplicate and alias routes

- Keep `/tools/resize-image` canonical and retain the `/files/image-resizer` permanent redirect; do not create a second portfolio row.
- `CONSOLIDATE` `/calc/car-payment` into the more capable `/calc/auto-loan` after query, backlink, and input-parity review; use a permanent redirect only in a separately approved implementation phase.
- Plan one shared repaired engine for `/calc/paycheck` and `/calc/take-home-pay`, but choose a canonical only after GSC query evidence.
- Keep format-specific image-to-PDF and converter routes provisionally; code reuse alone is not evidence of duplicate intent.
- The existing `/convert/pdf-to-word` redirect to `/files` is not intent-equivalent. If it has meaningful traffic/backlinks, restore a truthful replacement; otherwise evaluate a 410 rather than an unrelated hub redirect.

## Initial flagship portfolio

### 1. Image Compressor

- **Need:** consumers repeatedly need to meet upload limits and reduce page/email payloads.
- **Why Clevr can compete:** local processing, privacy context, before/after size proof, and format workflows fit the brand.
- **Works now:** the tested 800×600 JPEG remained valid, kept its dimensions, and became smaller.
- **Must improve:** verify PNG/WebP alpha, batch ZIPs, large-file memory, mobile, duplicate filenames, and already-optimized inputs.
- **Differentiation:** prove privacy and outcome, not merely “free/no signup.”
- **Supporting content:** format choice, visual-quality inspection, destination limits, and metadata/orientation behavior.
- **Original evidence:** publish a reproducible multi-format corpus with decoded dimensions, visual-difference metrics, size ratios, and device memory/latency.
- **Workflow:** Resizer → Compressor → format converter.

### 2. PDF to JPG

- **Need:** extracting pages for sharing, previews, presentations, and image workflows is common and concrete.
- **Why Clevr can compete:** local rendering plus independently verified page count/order/dimensions is a trust advantage.
- **Works now:** a two-page PDF produced two valid JPEGs at the expected 2× render dimensions.
- **Must improve:** encrypted, rotated, malformed, large, and mobile-memory cases; make rasterization tradeoffs explicit.
- **Differentiation:** show page geometry, render scale, expected pixel dimensions, and a parsed-artifact check.
- **Supporting content:** DPI/render-scale guidance, privacy, text-vs-image limitations, and page-selection workflows.
- **Original evidence:** benchmark fidelity, memory, latency, and failure behavior across a published safe PDF corpus.
- **Workflow:** PDF Compressor / Split PDF → PDF to JPG → Image Compressor.

### 3. Merge PDF

- **Need:** assembling application packets, receipts, scans, and document bundles is a durable workflow.
- **Why Clevr can compete:** local processing and independently verified page order/geometry directly answer trust concerns.
- **Works now:** one-page plus two-page inputs produced a readable three-page PDF in the intended order.
- **Must improve:** keyboard reordering and preservation tests for forms, outlines, attachments, annotations, encryption, and signatures.
- **Differentiation:** pre-download structural validation and a transparent preservation report.
- **Supporting content:** signatures, form preservation, ordering, privacy, and when merging rewrites document structure.
- **Original evidence:** a complex-PDF compatibility matrix across major readers.
- **Workflow:** Rotate / Split / Compress → Merge → Fillable only after that hidden tool graduates.

## Smart Converter decision

The concept—“drop any file and immediately receive the correct available actions”—can become the central proposition, but it is not ready. Three current action/destination contracts are inconsistent, including one nonexistent HEIC-to-PNG path. It should become central only when actions are generated from the live registry/processor capability graph, hidden tools cannot leak through recommendations, every handoff survives reset/direct use, and each action has parsed-artifact tests.

## Design direction

Adopt **Editorial Utility**, borrow **Industrial Precision** for the active workspace, and reserve **Playful Instrument** for Play. Editorial Utility best expresses warm precision: quiet navigation, strong typographic hierarchy, one dominant work surface, a publication-quality result with provenance and assumptions, and related workflows only after completion. The current three-column shell, repeated nested cards, duplicated related-tool rails, tiny uppercase labels, 471 rounded-surface usages, broad `transition-all`, and familiar Inter/soft-shadow/gradient vocabulary make the product feel templated. The full three-direction specification is in `ux-accessibility-performance.md`.

## Discovery and portfolio gaps

- 22 live converters are absent from the Calculate directory; three rely on the sitemap alone for crawl discovery because they have no crawlable inbound link outside it.
- Direct global navigation links only 26/112 live registered tools; that is acceptable as curation, but the directory must be complete.
- File X-Ray can surface hidden PDF-to-Fillable; validate model suggestions against the live registry.
- Light-theme primary action/text pairings measure roughly 2.41:1 and 2.34:1, below WCAG AA for normal text.
- Reaction Time and CPS primary surfaces are pointer-only; overlays, live results, switches, and compact touch targets need systemic accessibility primitives.
- Timer's custom-time row creates 6 px document overflow at 390 px and clips its primary Start button; classify it `FIX`/`PARTIAL`/P2 even though wall-clock timing passes.

## Evidence boundary

No production processing, calculator logic, route, canonical, redirect, indexation, SEO copy, or interface was changed. Audit-only reports and tests were added. Temporary fixtures, browser outputs, and the rendered CSV preview stayed under `/tmp/clevr-tool-audit`. The user-owned untracked `outputs/` directory was not read, modified, staged, or committed.

Luna Max was unavailable in the runtime. Every worker was explicitly assigned the strongest available disclosed fallback: `gpt-5.6-sol` with `max` reasoning. Global configuration was not modified.

## Final regression gate

The final audit-only worktree passed build (174 generated pages/assets), TypeScript, bundle-budget checks, matrix/discovery checks (6/6), the focused artifact and text/play suite (31/31 accounted for), and the representative mobile/dark/runtime suite (9/9 accounted for, including the two expected product failures recorded above). Lint finished with zero errors and the same three pre-existing warnings. The Node suite finished with 18 passes and the same four baseline environment failures. The deterministic one-worker Playwright run finished with **316 passed, 8 skipped, and the same three baseline failures**: two stale conversion-button labels and the removed PDF-to-Fillable `View upright` control. No new regression was introduced.

## 2026-08-01 P0/P1 remediation addendum

The first remediation wave implemented the audit decisions without rewriting this historical baseline. The one P0 and twenty P1 route/capability findings now resolve to **16 `FIXED` and 5 `CONTAINED`**, with no `REMOVED` or `BLOCKED` item. Background Remover, HEIC to JPG, Poker, Take-Home Pay, and Paycheck are non-live, noindexed, operationally disabled, and excluded from discovery; the remaining findings have deterministic regressions. Exact implementation evidence, independent review findings, final gates, and remaining boundaries are recorded in `p1-remediation-report.md` and the appended matrix columns.
