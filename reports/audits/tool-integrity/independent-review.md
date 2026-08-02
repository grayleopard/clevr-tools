# Independent Adversarial Review

Review date: 2026-08-01

Foundation: `a3bff45bede1f6c0e799d38d7bd4ab20ba94cb70`

Review model: `gpt-5.6-sol` with `max` reasoning, the strongest available fallback because Luna Max was unavailable

## Verdict

**ACCEPTED after corrections, with documented baseline failures and explicit unverified gaps.**

The audit is suitable to commit as an evidence package. It does not establish that the portfolio is broadly production-ready: only 42 of 116 portfolio units are `PASS`, demand is unknown for every row, two tools remain end-to-end unverified, and the proposed flagships still have named compatibility, mobile, accessibility, or corpus gaps.

No unresolved reviewer blocker remains. Final branch-wide gates still govern shipment; any newly introduced failure found after this review must reopen the verdict.

## Material challenges and resolutions

### 1. CSV fields initially passed structure checks without preserving field meaning

The initial matrix duplicated combined report prose into `tested_inputs`, `expected_output`, and `actual_output` for many rows. All 116 rows had identical expected and actual fields; calculator product actions repeated observed results instead of stating a remedy. This made the CSV dimensionally valid but semantically weak.

Resolution:

- The matrix was regenerated with distinct expected and actual fields.
- Every actionable row now has an imperative remedy, with bespoke actions for every P0/P1, hidden, and consolidated item.
- Clean rows use a clear no-confirmed-defect summary rather than a recommendation token as a defect.
- `tests/tool-integrity-matrix.test.mjs` now rejects expected/actual duplication, tested/expected duplication, repeated actions, underspecified actionable remedies, invalid enums, missing evidence, and hard-gate recommendation violations.
- Independent rerun: 116 rows, 37 columns, zero expected/actual duplicates, zero repeated action/actual or action/defect values.

### 2. Executive summary misstated crawl discovery

The initial wording said three converter orphans were “outside the sitemap,” contradicting the route audit. They are in the sitemap but have no crawlable internal inbound link beyond it.

Resolution: the summary now says the three routes rely on the sitemap alone for crawl discovery.

### 3. Required representative mobile/dark coverage was missing

The initial reports correctly admitted that the UX worker lacked an in-app browser session, but the brief required representative mobile, dark-theme, console, and hydration checks. Playwright remained available.

Resolution:

- Added `tests/e2e/tool-audit/representative-ux.spec.ts` covering nine representative families at 390×844.
- The suite activates the real theme toggle, confirms persisted dark state, checks body foreground/background contrast, requires a primary control surface, measures document overflow, and collects page/console/hydration errors.
- Seven routes pass the sampled contract.
- Two genuine product defects are preserved as expected failures rather than hidden as harness failures.

### 4. Timer mobile primary action is clipped

The new mobile gate measured 6 px of document-level overflow on `/time/timer`. The screenshot and source show the fixed no-wrap row of three `w-20` inputs, separators, gaps, and a padded Start button pushing the primary action beyond the right viewport edge.

Resolution: Timer changed from `PASS`/`KEEP` to `PARTIAL`/`FIX`, severity P2, and `mobile_status=FAIL`. The executive, text/play, UX, coverage-gap, and matrix records agree. Wall-clock countdown/pause/resume evidence remains valid.

### 5. Returning Numble visits produce a hydration mismatch

With `numble_how_to_play_shown=true`—a normal repeat-visit state—the production build emits React hydration error #418. This is consistent with persisted state influencing the client’s initial render while the server renders the first-visit state.

Resolution: the P2 runtime finding is recorded beneath Numble’s existing P1 settings defect. Numble remains `FAIL`/`FIX`, highest severity P1, and `mobile_status=FAIL`. The representative suite asserts the current error as an expected product failure.

## Matrix and recommendation review

Independent parsing confirmed:

| Dimension | Result |
|---|---:|
| Portfolio rows | 116 |
| CSV columns | 37 |
| `FLAGSHIP` | 3 |
| `KEEP` | 57 |
| `FIX` | 52 |
| `HIDE` | 3 |
| `CONSOLIDATE` | 1 |
| `REMOVE` | 0 |
| `PASS` | 42 |
| `PARTIAL` | 49 |
| `FAIL` | 23 |
| `UNVERIFIED` | 2 |
| P0 rows | 1 |
| P1 rows | 19 |
| P2 rows | 38 |
| P3 rows | 28 |

All 114 registered routes are present exactly once, along with Numble and Meme Generator. `/files/image-resizer` correctly remains an alias finding rather than a portfolio row. Recommendation, verification, and severity enums are valid. Every GSC field, demand status, demand score, and 100-point total remains `UNKNOWN`; no absence of demand evidence was converted to zero.

The 19 P1 rows plus the non-row Smart Converter HEIC-to-PNG routing defect account for the executive summary’s 20 distinct P1 findings. The P0/P1 set is complete across the worker reports:

- P0: Background Remover privacy/operational contract.
- P1 file/output: HEIC to JPG, Image Resizer, Image Cropper.
- P1 calculators: Poker, Age, Date Difference, Take-Home Pay, Paycheck, Body Fat, Amortization, Pace.
- P1 text/generator/type/play: Case Converter, Password Generator, Random Number Generator, Typing Test, Keyboard Tester, Typing Race, CPS Test, Numble.
- P1 route contract: Smart Converter HEIC-to-PNG.

No `FAIL` or `UNVERIFIED` row is classified `KEEP` or `FLAGSHIP`. No P0/P1 row is retained without `FIX` or `HIDE`.

The three flagships are accepted as **initial candidates**, not as claims of complete readiness:

- Image Compressor is only `PARTIAL`; its nomination is acceptable because the tested JPEG output is parsed and smaller, no hard defect is known, and the reports explicitly block broad promotion pending PNG/WebP, batch, memory, and mobile evidence.
- PDF to JPG and Merge PDF pass their parsed-artifact fixtures, while complex/encrypted/signed/large documents and mobile memory remain clearly unverified.
- Demand remains unknown for all three, so the recommendations are strategic portfolio choices rather than demand-backed ranking claims.

## Evidence sampled

- Read every file under `reports/audits/tool-integrity/`, all three new audit Playwright specs, both new Node audit tests, current source relevant to every P0/P1, and the current worktree state.
- Visually inspected the rendered CSV preview and the generated 1080×1350 Numble share PNG and 1200×1200 Meme Generator PNG.
- Checked temporary fixture metadata and hashes under `/tmp/clevr-tool-audit`; sampled PNG, JPEG, animated GIF, PDF, DOCX, HEIC-related evidence, and corrupt/renamed fixtures without modifying them.
- Independently reran five focused browser assertions: PNG-to-JPG alpha flattening, Merge PDF order/geometry, Case Converter’s incorrect title-case output, Random Number Generator’s unreachable range, and Numble’s no-op Hard mode plus parsed share PNG. Result: **5 passed**.
- Independently reran the nine-family 390×844 light/dark/runtime suite on an isolated production port. Result: **9 accounted for**—seven ordinary passes and two expected product failures for Timer overflow and Numble hydration.
- Independently reran search, discovery, sitemap, redirect, and matrix validation. Result: **10 passed**.

One earlier combined browser rerun was discarded: another concurrent process stopped the shared port after 17 tests had passed, causing later `ERR_CONNECTION_REFUSED` failures. Isolated-port reruns separated that harness collision from product evidence.

## Safety and scope review

- `git status` contains only the pre-existing user-owned `outputs/`, audit reports, and audit tests.
- No production component, processor, calculator, route, canonical, redirect, indexation rule, SEO copy, or interface file is modified.
- `git diff --check` passes.
- `outputs/` was untracked at baseline and remains untracked. The reviewer did not read, modify, stage, or delete its contents.
- Temporary fixtures, downloads, screenshots, videos, and reviewer test output remain under `/tmp/clevr-tool-audit` for the intentional audit runs.

## Accepted limitations

- No GSC, analytics, backlink, or conversion export; every demand field remains unknown.
- No configured Background Remover service or credentials, so output quality and the backend privacy contract are unverified.
- No qualified clinical, tax, financial, reproductive-health, sleep, nutrition, or gambling reviewer was supplied.
- Node Sharp/libvips lacks the HEVC decoder plugin; Node HEIC failures are environmental and separate from the browser hang.
- Node lacks the `DOMMatrix` environment required by the current fillable-PDF test path.
- Non-Chromium browsers, assistive technologies, 320/375 px widths, text zoom, forced colors, low-end memory/CPU, complex PDF/DOCX corpora, and exhaustive mobile behavior remain partial or unverified as stated in `test-coverage-gaps.md`.
- Existing stale-label conversion tests, the stale rotated fillable-PDF test, and the pre-existing conflict markers in `reports/qa/tool-smoke-matrix.md` remain baseline debt rather than audit-introduced failures.

## Final reviewer conclusion

The reports now tell the same conservative story as the executable evidence. Passes are scoped, hard gates are not hidden by scores, unknown demand stays unknown, removal decisions remain reversible pending traffic/backlink evidence, and the newly discovered mobile/runtime defects are included rather than optimized away. Subject to the orchestrator’s final no-new-failures gate, the audit package is ready to commit and push on `codex/tool-integrity-audit` without merging.

## 2026-08-01 remediation review addendum

A fresh adversarial reviewer audited the integrated remediation branch rather than relying on the original audit verdict. It identified and drove fixes for payroll and HEIC discovery leaks, stale typing/password/RNG/body-fat/age/title-case public claims, CPS visible-value rounding, Typing Test Tab capture, and Keyboard Tester suppression of native Enter/Space activation. Regression coverage now scans rendered public registries/FAQs and public Markdown as well as components. The remediation review disposition and exact final gate counts are preserved in `p1-remediation-report.md`; the historical audit findings above remain unchanged.
