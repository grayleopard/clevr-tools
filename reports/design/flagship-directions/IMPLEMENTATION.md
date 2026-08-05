# North Star production implementation

Date: 2026-08-02

Branch: `codex/north-star-production`

Foundation: P2 candidate `4a6d267a68c83c7cb7ac33042236be76e80ab27e`

## Decision and outcome

Industrial Precision is implemented as the production direction, borrowing Editorial Utility's prose restraint. The governing North Star is the persistent project design context: trustworthy, effortless, and warm for nontechnical visitors arriving with one urgent task.

The shared production UI now uses:

- a warm paper and deep-navy palette with a single confident emerald signal;
- a ruled, square-edged inspection-bench grammar rather than a generic rounded-card wall;
- condensed, high-impact display typography with readable Inter body copy;
- immediate file-first orientation on Home;
- a compact ledger for the 116-tool catalogue;
- consistent category, flagship workspace, navigation, theme, and result-state treatment;
- scoped privacy language that states where processing happens before a user begins.

Home, Files, shared category pages, global navigation/footer, file drop zones, shared tool workspaces, Smart Converter states, Image Compressor settings/results, and responsive/dark-mode surfaces now use the selected grammar. Existing processing, containment, SEO, discovery, analytics, and artifact contracts remain intact.

## Trust and reliability corrections

- Removed two universal "nothing leaves your device" claims from Home metadata/copy and the global footer. Privacy is now presented as a tool-by-tool contract.
- Kept browser-local claims on the specific Image Compressor and verified Smart Converter paths where they are true.
- Fixed Stopwatch pause accounting so Stop captures the exact wall-clock interaction boundary instead of the most recent animation-frame sample.
- Added a reproducible `PLAYWRIGHT_BROWSER=firefox|webkit` selector while retaining Chromium as the default project.

## Verification

- Production build: 174/174 routes generated.
- TypeScript: pass.
- ESLint: pass with zero warnings.
- Node: 84 passed, 2 explicit HEIC capability skips, 0 failed.
- Chromium full serial ledger before the Stopwatch boundary fix: 355 passed, 6 declared skips, 1 actionable failure, 4 serial-tail cases not run.
- Exact post-fix Chromium verification: all 27 North Star, Timer, Stopwatch, text/play tail, dark-mode, responsive, and focus cases passed.
- Independent serial rerun of the earlier contention cases: 45/45 passed, including all file/PDF artifacts, Smart Converter handoffs, both disabled API 503 contracts, Body Fat, and the full text/play tail.
- Firefox selected cross-browser ledger: 22/22 passed.
- WebKit selected cross-browser ledger: 22/22 passed.
- North Star layouts: Home, Files, Image Compressor, PDF to JPG, and Merge PDF passed at 390x844 and 1440x900 with no document overflow.
- Bundle budget: Home and named flagship routes remain 553 KiB; largest shared chunk remains 223 KiB; all budgets pass.
- `git diff --check`: pass.

Together, the post-fix targeted ledger and the completed full-suite ledger cover every non-declared-skip Chromium case. No failed behavior remains open locally.

## Promotion verdict

**GO for exact-SHA branch review. NO-GO for production promotion until that SHA is reviewed, deployed, identified in Vercel, and live-smoked.**

The live smoke must verify the two deterministic 503 APIs, Smart Converter handoff, parsed flagship artifacts, tablet/mobile layouts, containment, sitemap/canonicals, theme, console/hydration, and accessibility. Search-demand decisions still require GSC/backlink exports, and owner trust answers remain external inputs rather than code blockers.

The user-owned `outputs/` directory and preexisting untracked P2 reliability register were not read, modified, or staged.
