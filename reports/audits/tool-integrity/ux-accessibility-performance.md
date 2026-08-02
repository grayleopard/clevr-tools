# UX, Accessibility, Mobile, Performance, and Design Audit

Audit date: 2026-08-01

Scope: Worker 5 evidence stream; no production code changed.

## Anti-patterns verdict

**FAIL — the interface is usable and more considered than a typical free-tool site, but it still reads as a generated utility template.** The strongest tells are the same rounded card shell repeated across almost every route, cards nested inside the central card, icon-plus-uppercase-eyebrow headings, repeated centered metric grids, ubiquitous soft shadows, and frequent gradients/backdrop blur. The design has a coherent emerald signature and good restraint, but the repetition overwhelms that identity.

Specific evidence:

- The shared tool shell is a rounded, shadowed central surface containing tool-specific rounded bordered surfaces, while both sidebars add more rounded surfaces (`components/layout/ToolPageLayout.tsx:62-118`).
- Related tools can appear in the left rail, the right rail, and again below the tool (`components/layout/ToolPageLayout.tsx:62-86`; `components/tool/ToolLayout.tsx:242-354`). This is redundant interface and weakens the primary task.
- Source search found 471 uses of `rounded-xl`, `rounded-2xl`, `rounded-3xl`, or custom `rounded-[1.xrem]` across `components/` and `app/`; this is a directional signal, not a claim that every use is wrong.
- Source search found 38 uses of `transition-all`; several animate width or other layout-affecting properties (`components/tools/TimerTool.tsx:298-303`, `components/tools/MacroCalculator.tsx:240-242`).
- The UI font is Inter (`app/globals.css:70-72`), and the portfolio repeatedly uses tiny uppercase tracked labels. This combination is competent but highly familiar.
- Glass effects are not everywhere, but global navigation and multiple dialogs use strong backdrop blur (`components/layout/Navbar.tsx:74-76`, `components/layout/MobileNavigation.tsx:83-87`, `components/search/CommandPalette.tsx:229-243`).

Positive distinction remains: the emerald/deep-navy theme is cohesive, privacy context is structural in the shared layout, and motion generally communicates state rather than decorating every element.

## Evidence boundary

The in-app browser runtime reported no available browser sessions, so this worker could not take screenshots or independently perform visual interaction checks. No substitute browser-control surface was used.

Evidence used:

- Source inspection of shared layouts and representative tools in every family.
- The pre-worker production build and full Playwright baseline recorded in `reports/audits/tool-integrity/baseline.md`.
- The existing registry smoke design, which visits every registered route, requires an H1 and interactive control, and collects `pageerror`/console errors (`tests/e2e/tool-audit/registry-smoke.spec.ts:14-58`).
- Current bundle-budget execution by this worker.
- Existing audit evidence for representative functional behavior; correctness conclusions remain owned by the functional workstreams.

Interpretation:

- Portfolio-wide claims below are limited to shared components or mechanically counted source patterns.
- Route-specific claims are source-confirmed samples, not proof about every tool.
- Desktop visual quality, mobile visual quality, color contrast after compositing, screen-reader output, text zoom, and non-Chromium behavior remain partially or fully unverified.

## Executive summary

- Findings: **1 P1, 9 P2, and 4 P3** in this stream. No P0 was found here.
- Overall UX/accessibility verification: **PARTIAL**.
- Current bundle budget: **PASS** for all four monitored routes; each was reported at 553 KiB, with a 223 KiB largest shared app/vendor chunk.
- Existing Chromium registry coverage gives useful evidence that all 114 registered routes load without the registry smoke test detecting a page error or console error. It does not prove accessibility, mobile fitness, or output correctness.
- Most important actions: remove the Keyboard Tester trap; repair light-theme action contrast; make pointer-only tools keyboard operable; standardize accessible dialogs/live states; then simplify the desktop shell.

The product’s best UX trait is immediate orientation: breadcrumb, clear H1, concise description, then the tool. The biggest structural cost is that a simple one-task workflow becomes a three-rail content system at wide widths.

## Sample coverage

| Family | Evidence sampled | Status | Notes |
|---|---|---|---|
| Files/images/compression | Shared `FileDropZone`, `DownloadCard`, `ImagePreviewCard`, Image Resizer source; baseline route/fixture suite | PARTIAL | Clear upload affordance and useful file/result labels; dialog and thumbnail keyboard gaps remain. Large-file mobile memory was not reproduced here. |
| PDF/conversion | Shared processing/download states, PDF tool source, baseline fixture coverage | PARTIAL | Heavy libraries are generally loaded dynamically. Progress text exists, but the shared indicator is not a live status. |
| Calculators | Mortgage Calculator and shared empty state | PARTIAL | Inputs are explicitly labelled in the sample; results update immediately but are not announced. Dense result-card grids and long tables need mobile/text-zoom validation. |
| Text | Word Counter, Base64, Find/Replace, Random Number Generator | PARTIAL | Primary inputs are clear; many compact toolbar actions are below 44 px, and inline results/errors lack consistent live semantics. |
| Developer/generators | UUID and QR source | PARTIAL | Clear actions and output areas; QR is the only tool component found with an explicit alert role. |
| Time | Timer source and baseline state-transition test | PARTIAL | Presets/custom start are obvious. Countdown/completion is visual-first and timer status is not announced. |
| Type | Typing test family, Reaction Time, CPS Test, Keyboard Tester | FAIL | Keyboard trap and pointer-only game surfaces are material accessibility failures. |
| Play | Numble and Meme Generator source; audit-test definitions | PARTIAL | Meme controls are understandable and canvas has a name. Numble modals/switches are not accessible-dialog controls. Direct mobile visual validation was unavailable. |

## Detailed findings

### P1 — Keyboard Tester traps keyboard navigation

- **Location:** `components/tools/KeyboardTester.tsx:136-172`.
- **Category:** Accessibility / keyboard.
- **Description:** A window-level keydown listener calls `preventDefault()` for almost every key, including Tab, Escape, and navigation keys. It is active whenever the route is mounted, not only when a dedicated test surface has focus.
- **Impact:** Keyboard users cannot Tab back to navigation or other controls after opening the page. This is a direct failure of the tool’s own input modality.
- **Standard:** WCAG 2.1.2 No Keyboard Trap (A), and potentially 2.1.1 Keyboard (A).
- **Recommendation:** Scope capture to a focusable keyboard-test region, provide explicit start/stop capture state, never suppress Tab/Escape, and announce pressed-key updates.
- **Suggested follow-up:** `/harden` and `/audit`.

### P2 — Light-theme primary actions fail text contrast

- **Location:** Design tokens at `app/globals.css:85-96`; representative uses at `components/tool/DownloadButton.tsx:27-38`, `components/tools/RandomNumberGenerator.tsx:184-189`, and `components/meme/MemeEditor.tsx:242-254`.
- **Category:** Accessibility / theming.
- **Description:** `--primary: #10b981` with `--primary-foreground: #ecfdf5` measures **2.41:1**. `--primary` as text on `--background: #f5f6f7` measures **2.34:1**. Both fail 4.5:1 for normal text. Source search found the `bg-primary`/`text-primary-foreground` pairing in 53 files.
- **Impact:** Button labels, selected states, and small emerald labels are difficult to read for low-vision users. Because the issue is in shared tokens, it spans multiple families.
- **Standard:** WCAG 1.4.3 Contrast (Minimum) (AA).
- **Recommendation:** Use a darker light-mode action fill or much darker foreground; separate decorative emerald from text/action emerald. Re-test opacity variants and gradient endpoints, not only raw tokens.
- **Suggested follow-up:** `/colorize` plus `/normalize`.

### P2 — Core game surfaces are pointer-only

- **Location:** `components/tools/ReactionTime.tsx:216-227`; `components/tools/CpsTest.tsx:196-200`; the registry test explicitly documents Reaction Time’s click-target div (`tests/e2e/tool-audit/registry-smoke.spec.ts:5-7,44-48`).
- **Category:** Accessibility / interaction.
- **Description:** The primary play surface is a `div` with click/mousedown handling and no role, tab stop, keyboard handler, or accessible state name.
- **Impact:** Keyboard and switch users cannot start or complete these tools.
- **Standard:** WCAG 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A).
- **Recommendation:** Use a semantic button or a focusable custom control with equivalent Space/Enter behavior, stable instructions, and live round-state announcements.
- **Suggested follow-up:** `/harden`.

### P2 — Lightboxes and Numble modals are not accessible dialogs

- **Location:** `components/tool/DownloadCard.tsx:38-59`; `components/tool/ImagePreviewCard.tsx:117-144`; `components/numble/NumbleGame.tsx:308-389,392-535,537-601`.
- **Category:** Accessibility / focus.
- **Description:** These overlays omit `role="dialog"`, `aria-modal`, focus entry/containment/return, and consistent Escape handling. DownloadCard’s thumbnail opener is a click-only `div` (`components/tool/DownloadCard.tsx:68-85`). In contrast, Command Palette implements dialog naming, focus containment, Escape, and restoration (`components/search/CommandPalette.tsx:93-209,229-315`) and is the pattern to reuse.
- **Impact:** Screen-reader users may not know an overlay opened; keyboard focus can remain behind it; some previews cannot be opened without a pointer.
- **Standard:** WCAG 2.1.1 Keyboard, 2.4.3 Focus Order, 4.1.2 Name/Role/Value.
- **Recommendation:** Extract one accessible dialog primitive based on Command Palette’s proven behavior and use semantic preview triggers.
- **Suggested follow-up:** `/extract` then `/harden`.

### P2 — Dynamic results, processing, and errors are inconsistently announced

- **Location:** Shared `ProcessingIndicator` lacks status semantics (`components/tool/ProcessingIndicator.tsx:1-14`); Mortgage results update without a live region (`components/tools/MortgageCalculator.tsx:251-317`); Random Number results/errors lack status/alert roles (`components/tools/RandomNumberGenerator.tsx:191-237`); Base64 and Find/Replace inline errors are visual-only (`components/tools/Base64Tool.tsx:159-166`, `components/tools/FindAndReplace.tsx:187-192`).
- **Category:** Accessibility / result clarity.
- **Description:** Only one of 86 `components/tools/*` default-export files contained `aria-live`, `role="status"`, or `role="alert"` in a mechanical source scan (QR Generator’s alert). Shared FileDropZone, CalculatorEmptyState, PostDownloadState, and ToastContainer do provide good live semantics, so implementation is inconsistent rather than absent.
- **Impact:** Screen-reader users may receive no notification when work starts, results change, or validation fails.
- **Standard:** WCAG 4.1.3 Status Messages (AA), and 3.3.1 Error Identification where applicable.
- **Recommendation:** Define standard result/status/error primitives; use polite status for progress/result changes and alerts only for blocking errors. Avoid announcing countdown changes every 100 ms.
- **Suggested follow-up:** `/extract` and `/harden`.

### P2 — Compact secondary controls miss the 44 px target

- **Location:** Word Counter toolbar buttons (`components/tools/WordCounter.tsx:101-123`), Search close (`components/search/CommandPalette.tsx:266-273`), Stopwatch lap actions (`components/tools/StopwatchTool.tsx:182-191`), Numble switches (`components/numble/NumbleGame.tsx:571-581`), and many `py-2` primary/segmented controls.
- **Category:** Mobile / accessibility.
- **Description:** Representative controls resolve to roughly 24–40 px high rather than 44 CSS px. This is systemic in utility toolbars and segmented choices, though the FileDropZone and several main actions correctly use `min-h-11`/`min-h-12`.
- **Impact:** Small targets increase mis-taps, especially for users with motor impairments and on small phones.
- **Standard:** WCAG 2.5.8 Target Size (Minimum) (AA in WCAG 2.2) and platform touch guidance.
- **Recommendation:** Set a shared 44 px minimum interactive target while allowing compact visual glyphs inside it. Prioritize destructive/reset, copy, close, and segmented-mode controls.
- **Suggested follow-up:** `/adapt` and `/normalize`.

### P2 — Numble settings switches have no accessible name or state

- **Location:** `components/numble/NumbleGame.tsx:554-583`.
- **Category:** Accessibility / forms.
- **Description:** The switch buttons are adjacent to visual labels but have no accessible name, `role="switch"`, or `aria-checked`. The surrounding row is not a `<label>` relationship.
- **Impact:** Screen-reader users encounter unnamed buttons and cannot determine the current setting.
- **Standard:** WCAG 3.3.2 Labels or Instructions (A), 4.1.2 Name/Role/Value (A).
- **Recommendation:** Use a checkbox/switch component with programmatic label, description, and checked state.
- **Suggested follow-up:** `/harden` and `/normalize`.

### P2 — The three-column desktop shell competes with the task

- **Location:** `components/layout/ToolPageLayout.tsx:88-151`; related-tool repetition in `components/tool/ToolLayout.tsx:211-354`.
- **Category:** UX / responsive / information architecture.
- **Description:** At `xl`, the shell reserves 220 px left and 280 px right plus gaps; at `2xl`, 240 px and 300 px. The center must then hold dense editors, tables, file previews, and calculator grids. Left navigation and right related links repeat similar destinations, and related cards appear again below.
- **Impact:** Simple consumer tasks feel like a dashboard. Dense tools lose workspace width, while low-complexity tools gain unnecessary chrome. This conflicts with the urgent “get in, do the thing, get out” use case.
- **Standard:** Usability finding; related to WCAG 1.4.10 Reflow if inner tools introduce overflow.
- **Recommendation:** Keep the mobile principle already present (“tool first”), and extend it desktop-first: one dominant workspace, one contextual rail only when it materially helps, and progressive disclosure for navigation/SEO support. Complex editors should receive full width.
- **Suggested follow-up:** `/arrange` and `/distill`.

### P2 — Timer clips its primary Start action at 390 px

- **Location:** `components/tools/TimerTool.tsx:230` custom-time row.
- **Category:** Mobile / reflow.
- **Description:** A production-style Playwright run at 390×844 measured 6 px of document-level horizontal overflow. The fixed no-wrap row of three `w-20` inputs, separators, gaps, and the padded Start button pushes the button beyond the right edge.
- **Impact:** The primary action is visibly clipped on a common phone width, weakening tap accuracy and violating the tool-first mobile promise.
- **Recommendation:** Reflow the Start action below the fields or use a responsive grid/flexible input widths; add 320/375/390 px overflow regressions.
- **Verification:** `PARTIAL`/`FIX`/P2. Wall-clock countdown/pause/resume behavior still passes.

### P2 — Returning Numble visits raise a hydration error

- **Location:** `/play/numble`; persisted first-use state initialized by `components/numble/NumbleGame.tsx`.
- **Category:** Runtime / hydration.
- **Description:** With `numble_how_to_play_shown=true` in local storage—a normal repeat-visit state—the production 390×844 Playwright run captured React hydration error #418 as a `pageerror`.
- **Impact:** Server and client output disagree for returning users. React may regenerate the subtree client-side, adding instability and undermining the no-console/hydration quality gate.
- **Recommendation:** Render a hydration-stable initial shell, then apply persisted tutorial state after mount without changing server/client initial text; add first-visit and return-visit production regressions.
- **Verification:** P2 beneath Numble's existing P1 settings defect; the row remains `FAIL`/`FIX` with highest severity P1.

### P3 — Repeated card-within-card composition flattens hierarchy

- **Location:** Shared shell (`components/layout/ToolPageLayout.tsx:96-146`), Mortgage result cards (`components/tools/MortgageCalculator.tsx:253-317`), Meme controls (`components/meme/TextControls.tsx:33-125`).
- **Category:** Design quality.
- **Description:** Border, rounded rectangle, background fill, and shadow are repeatedly used at adjacent hierarchy levels.
- **Impact:** Everything looks equally important; the primary input/result relationship becomes less obvious, and the site feels templated.
- **Recommendation:** Reserve elevation for state changes and one dominant workspace. Use typography, rules, and whitespace for subordinate grouping.
- **Suggested follow-up:** `/distill` and `/arrange`.

### P3 — Broad transitions include layout properties

- **Location:** 38 `transition-all` occurrences; width transitions in Timer and macro charts (`components/tools/TimerTool.tsx:298-303`, `components/tools/MacroCalculator.tsx:240-242`).
- **Category:** Performance / motion.
- **Description:** `transition-all` expands maintenance and rendering risk, while width animation can trigger layout. The global reduced-motion rule is a strong mitigation (`app/globals.css:364-372`).
- **Impact:** Usually minor on modern hardware, but can cause avoidable work on older mobile devices and makes future changes less predictable.
- **Recommendation:** Transition only transform/opacity/color where possible; use scale transforms for progress visualization when semantics permit.
- **Suggested follow-up:** `/optimize` and `/animate`.

### P3 — Performance guardrails are too narrow to establish responsiveness

- **Location:** `scripts/perf/check-bundle-budget.mjs`; Playwright configuration (`playwright.config.ts:28-33`).
- **Category:** Performance / verification.
- **Description:** The bundle gate monitors four routes and permits 1.6–2.2 MiB, while the current aggregation reports the same 553 KiB total for each route. The browser suite runs only Desktop Chrome. There is no current audit evidence for INP, low-end CPU, large-file memory pressure, or Safari/Firefox mobile behavior.
- **Impact:** A passing budget can coexist with interaction stalls in canvas/PDF/GIF tools.
- **Recommendation:** Add per-route chunk attribution, representative flagship mobile lab traces, and large-but-safe interaction benchmarks. Track INP/long tasks and memory-sensitive operations rather than bytes alone.
- **Suggested follow-up:** `/optimize`.

### P3 — Mobile overflow is managed in shared content but not proven in complex tools

- **Location:** SEO prose deliberately scrolls wide tables (`components/tool/ToolLayout.tsx:326-330`); Keyboard Tester deliberately scrolls a 520–700 px virtual keyboard (`components/tools/KeyboardTester.tsx:232-265`).
- **Category:** Responsive.
- **Description:** Intentional local scrolling is preferable to page overflow, but direct 320/375 px testing, 200% text zoom, and dense editor/result inspection were unavailable.
- **Impact:** Potential clipped labels or nested horizontal scroll remains a risk, not a confirmed portfolio defect.
- **Recommendation:** Add automated assertions for document-level horizontal overflow at 320/375 px and manual review at 200% zoom. Preserve local scroll only where the content truly requires spatial width.
- **Suggested follow-up:** `/adapt`.

## Shared UX assessment

### Time to primary action

**Good in the shared shell, sampled as PARTIAL.** Breadcrumb, category badge, H1, and a one-sentence description precede the workspace (`components/tool/ToolLayout.tsx:253-316`). On mobile the tool is explicitly ordered before navigation (`components/layout/ToolPageLayout.tsx:104-127`). The header block adds some vertical cost but does not bury the action.

### Input and result clarity

- FileDropZone provides explicit accepted state, error association, upload/paste actions, and privacy copy. This is a strong reusable pattern (`components/tool/FileDropZone.tsx:175-365`).
- Sampled calculator fields use programmatic labels, and their default results are legible. Result cards are over-fragmented and lack live semantics.
- DownloadCard makes the final action visually obvious and includes filename/size/reduction; its preview interaction undermines otherwise strong output clarity.
- Command Palette is the strongest interaction pattern in the codebase: named dialog/combobox/listbox, keyboard movement, focus containment, and focus return.

### Error recovery, loading, and empty states

- Good: FileDropZone alerts, ConversionErrorNotice, CalculatorEmptyState, PostDownloadState, and aria-live toasts.
- Partial: many individual tools render styled red text without alert association; processing labels are visible but not status regions.
- File tools generally disable actions and show progress labels. Large-result and cancellation behavior varies and was not exhaustively verified.

### Dark mode and reduced motion

- Reduced motion is a portfolio-wide positive: the global rule suppresses animations/transitions (`app/globals.css:364-372`), and important animated components also use `motion-reduce` utilities.
- Dark tokens use deep navy and achieve strong contrast for core foreground/muted colors. Direct composited contrast testing of every opacity/hard-coded color was not performed.
- Hard-coded blue/amber/green/red accents in Smart Converter, tool charts, and Numble weaken token consistency. Numble’s `text-white` on the dark-theme light emerald accent is a particular contrast risk requiring browser verification.

## Performance verdict

Current command result:

```text
bundle-budget: / 553 KiB PASS
bundle-budget: /compress/image 553 KiB PASS
bundle-budget: /convert/pdf-to-jpg 553 KiB PASS
bundle-budget: /convert/word-to-pdf 553 KiB PASS
largest shared app/vendor chunk 223 KiB PASS
```

Positive implementation evidence:

- PDF, ZIP, HEIC, image-compression, Word, and fillable-PDF libraries are generally dynamically imported at the point of use (`lib/processors.ts`, `lib/pdf-utils.ts`, `lib/pdfmake-loader.ts`, and relevant tool components).
- Homepage Smart Converter search/icon payloads are deferred.
- Baseline build and bundle checks pass, and the registry smoke suite detected no route-wide runtime/console failure among its registered-route checks.

Limits:

- Earlier `reports/perf/performance-summary.md` is historical and its bundle numbers do not match the current build; it is not treated as current Web Vitals proof.
- No direct current LCP/CLS/INP run was performed by this worker.
- GIF, HEIC, PDF rendering, ZIP generation, invoice generation, and meme canvas behavior on low-memory phones remain unverified.

## Patterns and systemic issues

1. Shared tokens create a cross-portfolio light-theme contrast defect.
2. Accessibility quality is bifurcated: recent shared primitives are strong, while older standalone tools and play experiences use visual-only status and ad hoc controls.
3. Touch targets are generous for new main actions but compact for utility actions and segmented controls.
4. The single shared shell creates consistency but applies the same density and sidebar model to fundamentally different jobs.
5. The portfolio lacks an explicit accessible dialog/switch/result-state system even though Command Palette provides a credible foundation.

## Positive findings to preserve

- Tool-first ordering on small screens.
- Semantic breadcrumbs, one clear H1, and concise task framing.
- FileDropZone labels, described-by/error wiring, and live file state.
- Command Palette keyboard and focus behavior.
- Visible focus rings on newer shared components.
- Global reduced-motion handling.
- Deep-navy dark theme rather than pure black.
- Local processing/privacy context integrated into the workspace.
- Dynamic loading of the heaviest processing dependencies.
- Explicit empty states for invalid/zero calculator inputs.

## Three future visual directions

### 1. Industrial Precision

- **Typography:** Narrow, engineered display face for route titles paired with a highly legible humanist sans for controls; tabular numerals and restrained monospace only for data/output.
- **Color:** Graphite and warm off-white foundation, emerald as the single operational signal, amber/red reserved for warnings/errors.
- **Geometry:** Squarer 6–10 px radii, crisp rules, inset work surfaces, almost no decorative shadow.
- **Navigation:** Compact command bar with category switcher; one optional utility rail.
- **Categories:** Dense, filterable indexes with capability/format tags instead of identical cards.
- **Workspace:** Instrument-panel clarity: input left/top, action at the seam, verified output right/below.
- **Results:** Strong status strip, artifact metadata, validation marks, and one unmistakable download/copy action.
- **Mobile:** Single-column control stack; sticky action/status zone; advanced options in disclosure panels.
- **Motion:** 100–180 ms state confirmation, progress movement only, no ambient bobbing.
- **Tradeoffs:** Excellent for trust, files, and serious calculators; can feel cold or technical to casual users and Play tools.

### 2. Editorial Utility

- **Typography:** A warm editorial serif for H1/explanatory moments paired with a distinctive, highly legible sans for controls and data; stronger size contrast and fewer uppercase micro-labels.
- **Color:** Warm paper-like neutral, deep ink, signature emerald, and one muted indigo secondary; avoid gradients except meaningful data ramps.
- **Geometry:** Mostly flat sections with rules and whitespace; rounded surfaces reserved for the active workspace and completed result.
- **Navigation:** Quiet masthead, global command search, and a concise category index. Related workflows appear once after completion.
- **Categories:** Curated collections with short editorial rationale, not equal-weight card grids.
- **Workspace:** A generous central column with an optional contextual note rail only for privacy, assumptions, or formats.
- **Results:** Clear headline result/artifact followed by provenance, assumptions, and secondary actions; long explanations read like a reference publication.
- **Mobile:** Reading order is action, result, assumptions, then related tools; no sidebars, with sticky download only when needed.
- **Motion:** Subtle fades/slides for accepted input and completed output; otherwise calm, always reduced-motion safe.
- **Tradeoffs:** Best balance of trust, consumer warmth, SEO content, and cross-category adaptability; requires strong editorial discipline to avoid becoming a content site with tools embedded inside it.

### 3. Playful Instrument

- **Typography:** Characterful geometric display face with a calm sans for controls; oversized numerals and friendly microcopy.
- **Color:** Emerald base with category-coded but contrast-tested accents; tactile light surfaces and deep-navy play zones.
- **Geometry:** Distinct physical metaphors—dials, tracks, paper, tiles—rather than generic cards; larger touch surfaces.
- **Navigation:** Visual category launcher plus command search; recently used tools can appear locally without accounts.
- **Categories:** Each category gets a recognizable instrument motif and interaction language.
- **Workspace:** Direct-manipulation controls, obvious draggable/upload zones, and richer previews.
- **Results:** Celebratory but concise completion state with before/after proof and a large action.
- **Mobile:** Thumb-zone controls, swipe-safe comparisons, responsive virtual keyboards/game boards.
- **Motion:** Tactile 120–220 ms feedback and one completion moment; never bounce-heavy and always reduced-motion safe.
- **Tradeoffs:** Most memorable and strongest for Numble, typing, and image tools; hardest to scale consistently and risks weakening trust for tax, health, finance, and document workflows.

## Recommended direction

**Recommend Editorial Utility, borrowing Industrial Precision for the workspace and Playful Instrument only for Play.** It best fits the stated “warm precision” brand, removes dashboard/card-grid residue, gives privacy and assumptions credible space, and supports both quick actions and trustworthy explanatory content. The differentiator should be a publication-quality result: users see what happened, why it is trustworthy, and what to do next without a sidebar maze.

## Prioritized follow-up

1. **Immediate:** fix Keyboard Tester’s global capture; do not promote the route while it can trap keyboard users.
2. **Immediate:** change light-theme primary action/text tokens and verify all states to WCAG AA.
3. **Short term:** make Reaction Time/CPS surfaces keyboard operable; standardize dialog, switch, live-result, processing, and error primitives.
4. **Short term:** enforce 44 px targets for compact actions; add 320/375 px and 200% zoom checks.
5. **Medium term:** simplify the tool shell to one dominant workspace and one optional contextual rail.
6. **Medium term:** expand performance gates to current Web Vitals, low-end interaction, per-route chunks, and large safe fixtures.
7. **Long term:** evolve toward Editorial Utility and reserve richer instrument-like interaction for tools whose task benefits from it.

Suggested skill sequence for later implementation: `/harden` → `/normalize` → `/adapt` → `/distill`/`/arrange` → `/optimize` → `/polish`.

## Untested and partially tested behavior

Post-worker orchestrator addendum: a production-style Chromium test subsequently sampled nine families at 390×844, activated dark mode through the real `next-themes` toggle, checked core body contrast, primary control presence, document overflow, and console/page/hydration errors. Seven routes passed; Timer reproduced the 6 px overflow above, and Numble's normal persisted return-visit state reproduced hydration error #418. Both are explicit expected product failures in the audit suite. This remains representative automation, not visual/accessibility conformance.

- Exhaustive desktop/mobile visual inspection beyond the nine representative routes.
- Safari, Firefox, Edge, iOS Safari, and Android Chrome.
- VoiceOver, NVDA, JAWS, TalkBack, voice control, switch control, and Braille display behavior.
- Automated axe-core coverage.
- 200%/400% text zoom and Windows high-contrast/forced-colors mode.
- Composited contrast for every opacity, gradient, image overlay, and disabled state.
- Mobile virtual keyboard effects on forms and typing tools.
- Orientation changes, safe-area insets, and foldable/tablet layouts.
- Real low-end CPU/GPU responsiveness and memory pressure.
- Large-result layout for thousands of random numbers, long tables, invoices, PDFs, GIFs, and multi-image ZIPs.
- Background-tab timer behavior in this worker stream.
- Hydration inspection beyond the nine representative routes and existing Chromium registry smoke coverage.

These gaps must remain `PARTIAL` or `UNVERIFIED`; none is treated as a pass.
