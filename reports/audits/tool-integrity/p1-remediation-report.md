# P0/P1 Product-Integrity Remediation

Remediation date: 2026-08-01

Branch: `codex/p1-remediation`

Audit foundation: `5faae384ef0f56ffac6ea3def6d51a15a949f9da` (`codex/tool-integrity-audit`)

## Executive outcome

This wave addresses the audit's one P0 and twenty distinct P1 route or capability findings. The disposition is **16 FIXED, 5 CONTAINED, 0 REMOVED, and 0 BLOCKED**. A contained route is not counted as fixed: its registry status is non-live, discovery projections exclude it, its remaining direct route is noindexed, and its operational form is disabled.

The five contained tools are AI Background Remover, HEIC to JPG, Poker Calculator, Take-Home Pay Calculator, and Paycheck Calculator. Smart Converter no longer advertises HEIC, legacy DOC, or any source/destination pairing the live destination does not accept. The remaining sixteen findings have deterministic regressions; file output and client-API defects also have Chromium browser coverage.

No redesign, new landing page, background-removal service, poker simulation, or speculative payroll model was introduced.

## Branch and baseline

- The completed audit was not merged into `main`, so remediation branched from audit commit `5faae38` as required.
- Baseline production build: passed, 174 generated pages/assets after the Google Fonts fetch was allowed outside the filesystem sandbox.
- Baseline ESLint: zero errors and three warnings.
- Baseline TypeScript: passed.
- Baseline Node suite: 18 passed and four environment-dependent failures: two Sharp/libvips HEIF/HEVC decoder failures and two Node `DOMMatrix` failures in fillable-PDF tests.
- Baseline deterministic Playwright (`--workers=1`): 316 passed, 8 skipped, 3 failed. The failures were stale button labels in two file happy paths and a removed `View upright` checkbox in the rotated fillable-PDF test.
- Baseline route/discovery and bundle-budget checks passed.
- The P0/P1 defects were reproduced from the audit fixtures or source evidence before their production changes.

The Node fillable-PDF path now selects pdf.js's legacy Node build when `DOMMatrix` is unavailable and normalizes Buffer input to `Uint8Array`. Both previously failing fillable-PDF Node tests pass without changing the browser path. The two Sharp HEIF failures remain explicitly environmental; they are not used as evidence that browser HEIC conversion works.

The orchestrator ran as GPT-5.6 Sol with High reasoning. The repository-local configuration already requested Luna Max as the default worker, but Luna was not callable in this runtime. Implementation workers therefore used the exact fallback `gpt-5.6-sol` with `max` or `ultra` reasoning, the strongest settings available on their respective worker surfaces. No global or repository-local configuration was changed.

## Resolution register

| Finding | Original defect | Status | Corrective evidence and remaining boundary |
|---|---|---|---|
| AI Background Remover (P0) | External processor, retention, deletion, ownership, and quality claims could not be verified. | `CONTAINED` | Submission is disabled; route is non-live/noindex and absent from search, navigation, categories, related tools, homepage actions, Smart Converter, and sitemap. Privacy and API copy no longer promise deletion, storage behavior, a free quota, or a nonexistent Pro tier. |
| HEIC to JPG | A valid HEIC could remain converting indefinitely. | `CONTAINED` | Direct uploader is disabled and noindexed; discovery and Smart Converter exposure are removed. Dormant code validates the ISO-BMFF signature and JPEG output and has a 15-second error boundary, but non-cancellable `heic2any` work and representative-device compatibility remain unverified. |
| Image Resizer | Animated GIF became PNG bytes named `.gif`. | `FIXED` | GIF is rejected before processing. Parsed JPG/PNG/WebP artifacts, including a renamed PNG, match magic bytes, MIME, extension, and requested dimensions. |
| Image Cropper | Circle preset exported an ordinary rectangle. | `FIXED` | Circle state now drives a square PNG mask; decoded corner alpha is zero and the center is retained. GIF input is rejected before animation can be flattened. |
| Smart Converter | HEIC-to-PNG routed into the JPG-to-PNG implementation; two more P2 source contracts were wrong. | `FIXED` | HEIC and legacy DOC are removed from both loading states. HEIC has no actions; JPG-to-WebP and WebP-to-JPG mismatches are removed. Every remaining action is checked against a live registry route and the destination's declared accept contract. |
| Poker Calculator | Ad hoc starting-hand equities were presented as reliable. | `CONTAINED` | Unsupported equity logic and accuracy copy are removed. The direct route has no calculator and is non-live/noindex/excluded from discovery. A reproducible enumerator or unbiased disclosed simulation is still required for relaunch. |
| Take-Home Pay | Stale 2025 federal tables, old Social Security base, incomplete Medicare and jurisdiction logic. | `CONTAINED` | Stale execution is removed; route is non-live/noindex/excluded and points users to the official IRS estimator. Relaunch requires explicit tax year, filing assumptions, deductions, and sourced federal/state/local rules. |
| Paycheck | Same stale and incomplete payroll engine. | `CONTAINED` | Same containment and relaunch boundary as Take-Home Pay. No universal or “current” estimate remains public. |
| Body Fat | Centimeter measurements were fed to inch-constant equations, causing large errors. | `FIXED` | The published Hodgdon-Beckett body-density equations receive centimeters explicitly. Imperial/metric equivalents match, impossible inputs fail, and the UI names the legacy equation and discloses that it is neither clinical nor the current official Navy BCA. |
| Age | Month-end decomposition could be negative; elapsed totals were DST-sensitive. | `FIXED` | Civil-calendar ordinals and clamped month arithmetic produce `0y 1m 1d` and 29 days for Jan 31 to Mar 1; DST, leap anniversary, and future-birth cases pass. |
| Date Difference | Month-end decomposition and local/UTC shortcuts were inconsistent. | `FIXED` | Date-only arithmetic is timezone-independent; reversed direction is explicit; elapsed totals are exclusive and business/weekend counts are labeled inclusive. Same-day, leap, month-end, and DST cases pass. |
| Amortization | Payoff month charged a full base payment and overstated total paid. | `FIXED` | Final payment is capped to remaining principal plus accrued interest. The audit fixture ends at month 312 with `$819.21`, `$621,638.68` total paid, `$0.00` balance, and exactly `$300,000` principal. |
| Pace | Independent second rounding emitted `5:60`. | `FIXED` | Total rounded seconds carry through minutes/hours. Boundary and split tests never emit `:60`. |
| Password Generator | Modulo bias and inaccurate alphabet/entropy/crack-time claims. | `FIXED` | Web Crypto Uint32 rejection sampling is used. Whole password candidates are rejected unless every enabled class appears, preserving a uniform conditional distribution. Displayed bits are the exact valid-set count via inclusion-exclusion; crack-time claims are removed. |
| Random Number Generator | Modulo bias and unreachable values above the Uint32 space. | `FIXED` | Inclusive integer ranges use rejection sampling, are capped to `2^32` values, and handle equal, negative, reversed, decimal, unsafe, over-wide, and unique-capacity cases. Partial Fisher-Yates samples unique values without allocating the whole range. |
| Case Converter | “Title Case” capitalized every word despite rule-aware copy. | `FIXED` | A documented house style preserves whitespace, Unicode, punctuation, known/intentional acronyms, hyphenation, and multiline boundaries while lowercasing ordinary internal minor words. Registry and FAQ copy describe that same house style; no named style-guide conformance is claimed. |
| Typing Test | Consistency was fabricated at 100%; current partial word was dropped. | `FIXED` | WPM and accuracy use actual typed/expected characters and monotonic elapsed time, including current partial progress and skipped-word penalties. The unsupported consistency metric is removed from UI, navigation, search, registry, and FAQs. The former Tab+Enter restart trap is replaced by Ctrl/Command+Enter. |
| Keyboard Tester | A global `preventDefault()` trapped Tab. | `FIXED` | Tab and Shift+Tab retain browser focus navigation. Enter and Space preserve native activation on focused interactive elements while keys still update the visualization; Reset is covered through mouse, Enter, and Space behavior. |
| Typing Race | Ghost completion closed over `startTime=0`, creating epoch-scale elapsed time and zero WPM. | `FIXED` | Stable monotonic refs govern start, restart, completion, rapid input, ghost completion, and unmount cleanup. |
| CPS Test | Interval callback count controlled duration and score. | `FIXED` | `performance.now()` elapsed duration controls completion. The displayed CPS is derived from the same two-decimal actual duration displayed beside it, so the visible values reconcile at rounding boundaries; the surface is keyboard operable. |
| Numble settings | Hard, colorblind, and sound controls persisted but did nothing; returning state also hydrated inconsistently. | `FIXED` | No-op controls are removed rather than simulated. Persisted state is gated until hydration; daily puzzle, countdown, result, storage, and share paths remain covered. |

## Containment contract

The exact contained slugs are:

- `background-remover`
- `heic-to-jpg`
- `paycheck`
- `poker`
- `take-home-pay`

Automated checks require this exact set to be `live: false` and `contained: true`, absent from command-palette search, navigation feature lists, category data, related-tool targets, and the sitemap. A recursive source check also rejects JSX/TSX links and relative or absolute Markdown links to contained routes across `app`, `components`, and public `content`. Direct pages must use `hiddenToolRobots(tool)` and `ContainedToolNotice`; browser checks require `noindex`, a visible status notice, no input/select/textarea, and no operational submit/upload/process/convert/calculate/generate button.

Contained pages do not emit WebApplication structured data or historical SEO body content. ToolLayout also suppresses processing guidance and privacy badges on a contained route so dormant contracts cannot appear current.

## Background Remover operational dependency record

The retained backend scaffold is not release-ready. The Next.js proxy requires `BG_API_URL` and `BG_API_KEY`, accepts JPG/PNG/WebP up to 10 MiB, forwards the file to `${BG_API_URL}/remove-bg`, and uses a process-local five-request/day map keyed by forwarded IP. The separate `clevr-bg-api` is FastAPI plus `rembg[cpu]`, preloads `birefnet-general`, needs the matching `BG_API_KEY`, and also uses process-local rate-limit state. Multiple workers or restarts do not share durable limits. Service ownership, processors/subprocessors, geographic handling, retention/deletion, model training use, logs, access control, incident response, monitoring, economics, and representative edge-quality outputs are not established.

Recommendation: keep it hidden. Repair or replace only after that contract and a parsed PNG/alpha/edge-quality corpus are independently verified; otherwise evaluate permanent removal in a separately approved portfolio decision with traffic/backlink evidence.

## Calculator sources and assumptions

- Legacy circumference estimate: Hodgdon and Beckett's male report ([DTIC ADA143890](https://apps.dtic.mil/sti/tr/pdf/ADA143890.pdf)) and female report ([DTIC ADA146456](https://apps.dtic.mil/sti/tr/pdf/ADA146456.pdf)). The implementation uses the reports' centimeter body-density form and Siri conversion `495 / density - 450`. The current [Navy Body Composition Assessment Guide](https://www.mynavyhr.navy.mil/Portals/55/Support/Culture%20Resilience/Physical/Guide-4%20Body%20Composition%20Assessment.pdf) is linked specifically to make clear that this legacy equation is not the current official process.
- Payroll containment: the direct status code links to the [IRS Tax Withholding Estimator](https://www.irs.gov/individuals/tax-withholding-estimator), [2026 Publication 15-T](https://www.irs.gov/publications/p15t), and [2026 Publication 15](https://www.irs.gov/publications/p15). These are relaunch inputs, not claims that Clevr implements their rules.
- Calendar tools use proleptic Gregorian civil dates, largest whole end-of-month-clamped months plus remaining calendar days, and Feb 28 as the non-leap anniversary for Feb 29. Date Difference's elapsed total excludes an added endpoint; its business/weekend counts include both endpoints and exclude no holidays.
- Amortization keeps full precision internally and rounds displayed money; a lender that rounds every monthly transaction can differ by cents. The payoff row is capped to accrued interest plus remaining principal.
- Pace is rounded to the nearest whole second after computing total pace seconds, so carry is applied before formatting.

## Randomness implementation boundary

`crypto.getRandomValues()` supplies unsigned 32-bit values. For a width `w`, samples at or above `floor(2^32 / w) × w` are rejected before modulo mapping. Inclusive integer width is computed with `BigInt` and limited to `2^32`; endpoints remain JavaScript safe integers. Unique lists use a sparse partial Fisher-Yates map.

Passwords are sampled from the full enabled alphabet. A whole candidate is rejected unless it contains every enabled class, so accepted strings are uniform over the valid conditioned set. Search-space bits are `log2` of the exact valid-string count computed by inclusion-exclusion. They are not a prediction of crack time and do not account for reuse, phishing, storage, leakage, or service-side throttling.

## Regression coverage

New focused coverage includes:

- `tests/p1-files-images.test.mjs` and `tests/e2e/p1-files-images.spec.ts`
- parsed image artifacts in `tests/e2e/tool-audit/file-artifact-audit.spec.ts`
- `tests/p1-date-schedule.test.mjs` and `tests/e2e/p1-date-schedule.spec.ts`
- `tests/p1-high-risk-calculators.test.mjs` and `tests/e2e/p1-high-risk-calculators.spec.ts`
- `tests/p1-generator-randomness.test.mjs`
- `tests/p1-typing-numble.test.mjs` and `tests/e2e/p1-typing-numble.spec.ts`
- `tests/e2e/p1-containment.spec.ts`
- expanded discovery, route smoke, functional smoke, legacy happy-path, PDF placement, text/play, and matrix invariants.

Temporary fixtures, downloads, screenshots, videos, and CSV renders are under `/tmp/clevr-p1-remediation`.

## Independent adversarial review

**Verdict: ACCEPT.** The separate high-reasoning reviewer had no implementation assignment and found no remaining release blocker in the P0/P1 scope. It accepted the five `CONTAINED` and sixteen `FIXED` dispositions after the following adversarial findings were resolved:

- A live Salary link and FAQ copy leaked the contained payroll tool; the link/claim were removed and recursive inbound-link coverage was added.
- A public blog Markdown link exposed contained HEIC conversion; it was removed, and the detector now proves coverage for JSX attributes plus relative and absolute Clevr.tools Markdown links.
- Typing, Password, RNG, Body Fat, Age, Case Converter, and BMI retained stale or unsupported public claims; registry, navigation, search, FAQ, component, and article copy now match the implemented boundaries, with source-level regressions.
- CPS computed its visible rate from more precision than its displayed duration; both now use the same two-decimal duration source.
- Typing Test first trapped Tab through its restart shortcut, then still started the timer as a side effect after focus navigation was restored. Restart is now Ctrl/Command+Enter, and Tab/Shift+Tab return before any mutation; a final-build browser check proves focus moves while the test remains idle.
- Keyboard Tester still suppressed native Enter/Space activation on focused controls. It now preserves native behavior on interactive targets while observing the key; Reset works by Enter and Space, and Tab/Shift+Tab navigate normally.

The reviewer independently sampled containment projections and direct routes, image magic/MIME/dimensions/alpha/GIF rejection, calculator outputs, random mapping, mobile/dark/hydration behavior, matrix preservation, build, TypeScript, lint, and final typing navigation. Its focused integrated Node set passed 64/64, its last Typing/Numble set passed 16/16, and its production build generated 174/174 pages. Reviewer output stayed under `/tmp`; it did not read or modify `outputs/`.

The reviewer explicitly classified the rotated PDF-to-Fillable placement failure, two Sharp HEVC codec failures, known Timer 390 px overflow, non-Chromium image coverage, and HEIC relaunch validation as nonblocking residuals outside or safely contained from this P0/P1 release.

## Final quality gates

- Production build: passed; all 174 pages/assets generated.
- TypeScript: passed with `npx tsc --noEmit`.
- ESLint: zero errors and two pre-existing warnings (`ImagesToPdf` hook dependencies and unused `WordToPdf` messages), improved from three baseline warnings.
- Node: 72 of 74 passed. The only failures are the two baseline Sharp/libvips HEIF/HEVC decoder tests; the installed codec reports that support was not built in. Both baseline fillable-PDF `DOMMatrix` failures now pass through the Node-safe pdf.js path.
- Deterministic full Playwright (`--workers=1`): 339 passed, 6 skipped, 1 failed out of 346. Every P0/P1 regression passed. The single failure is the same baseline rotated PDF-to-Fillable placement case; after its stale `View upright` harness step was repaired, it reaches the existing product defect and measures normalized X error `0.25` against the `<0.14` assertion. The non-rotated path passes, this hidden P2 tool was not changed, and the unresolved case is not release evidence for any P0/P1 fix.
- Final affected-route browser rerun: all 18 containment, date/schedule, body-fat, title-case, typing, keyboard, race, CPS, and Numble cases passed after the independent accessibility checks were integrated.
- Bundle budgets: all pass (`553 KiB` route aggregation; `223 KiB` largest shared chunk).
- Discovery/search/sitemap and matrix integrity: pass. The CSV remains 116 rows; its original 37 columns are byte-for-value identical by cell, with seven appended remediation columns (44 total), and status counts are 96 `NOT_IN_SCOPE`, 15 `FIXED`, and 5 `CONTAINED`.
- `git diff --check`: passed. Temporary browser artifacts were moved under `/tmp/clevr-p1-remediation`; user-owned `outputs/` remained untouched.

## Portfolio recommendation after this wave

The initial flagships remain Image Compressor, PDF to JPG, and Merge PDF. This wave does not promote a new flagship. Smart Converter is materially safer because its actions now come from an explicit live-route/source contract, but it remains a controlled candidate rather than the central proposition until broader handoff, reset, mobile, and artifact coverage is complete. The five contained tools must remain out of promotion and indexation.

## Scope and safety

Production changes are limited to the registered P0/P1 defects, their containment/discovery surfaces, a safe Node pdf.js compatibility path, truth-correcting privacy/SEO copy, and regression tests. Global Codex configuration was not modified. Repository-local worker configuration was already present and was not changed. The user-owned untracked `outputs/` directory was not read, modified, staged, deleted, or overwritten. The branch will be pushed for review and will not be merged by this task.
