# Tests + CI Guardrails (Phase 3)

## What Was Added

1. Minimal test runner (no new dependencies)
- `npm run test` → `node --test tests/**/*.test.mjs`

2. Critical-path tests
- `tests/sanitize-preview-html.test.mjs`
  - Confirms `<script>` and inline event handlers are removed.
  - Confirms `javascript:` URLs are removed.
  - Confirms allowed formatting tags remain.
- `tests/parse-page-range.test.mjs`
  - Confirms conversion page-range parsing behavior (`all`, ranges, lists, dedupe, bounds).

3. Bundle budget guard
- Script: `scripts/perf/check-bundle-budget.mjs`
- Command: `npm run test:bundle-budget`
- Enforced route JS budgets (manifest chunk aggregation):
  - `/` <= 1600 KiB
  - `/compress/image` <= 2200 KiB
  - `/convert/pdf-to-jpg` <= 1700 KiB
  - `/convert/word-to-pdf` <= 1700 KiB
- Enforced largest shared app/vendor chunk budget:
  - <= 900 KiB
- Escape hatch:
  - `SKIP_BUNDLE_BUDGET=1 npm run test:bundle-budget`

4. CI workflow
- Added `.github/workflows/ci.yml` to run:
  - `npm ci`
  - `npm run lint`
  - `npm run test`
  - `npm run build -- --webpack`
  - `npm run test:bundle-budget`

## Local Verification
```bash
npm run lint
npm run test
npm run build -- --webpack
npm run test:bundle-budget
```
