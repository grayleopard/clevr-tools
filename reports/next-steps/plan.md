# Next Steps Plan

## Current Verification (Phase 0)
- `npm run build -- --webpack`: pass
- `npm run lint`: pass
- `npm run test`: missing script (expected; to be added in PR C)

## Available Inputs Reviewed
- Perf artifacts read from `reports/perf/*`.
- Audit artifacts expected at `reports/audit/*` are not present in this workspace snapshot.
- `top-js-chunks.txt` and `bundle-route-deps.txt` are also not present; these will be regenerated in PR A.

## Planned PRs

### PR A — `perf: reduce shared JS baseline across routes`
Scope:
- Re-measure route/client manifests and identify shared chunk pressure.
- Reduce always-loaded client JS in shared UI boundaries (layout/navbar/theme islands).
- Confirm tool engines are route/user-intent loaded only.
- Produce before/after reports:
  - `reports/next-steps/baseline-bundle.md`
  - `reports/next-steps/after-bundle.md`
Success metrics:
- Lower shared baseline JS for `/` and at least two heavy tool routes.
- No route behavior regressions in homepage and selected tool flows.
Validation:
- `npm run build -- --webpack`
- `npm run lint`
- route-byte/dependency reports regenerated and diffed

### PR B — `security: remove runtime external deps for converters`
Scope:
- Inventory runtime remote worker/script/wasm loads in conversion flows.
- Replace remote runtime dependencies with same-origin/self-hosted loading where feasible.
- If unavoidable, document residual risk and fallback behavior.
- Report in `reports/next-steps/external-deps.md`.
Success metrics:
- No converter requires runtime external CDN to function.
- At least two conversion paths manually verified.
Validation:
- `npm run build -- --webpack`
- `npm run lint`
- manual conversion smoke on at least 2 affected tools

### PR C — `chore: add tests + CI guardrails`
Scope:
- Add minimal `npm run test` runner.
- Add security sanitization regression coverage + conversion/dynamic-loading smoke coverage where unit-testable.
- Add lightweight bundle budget guard script and wire into CI/local checks.
Success metrics:
- Stable green gate: lint + build + test.
- Budget check fails on clear regression and is documented.
Validation:
- `npm run test`
- `npm run lint`
- `npm run build -- --webpack`
- guard script execution with pass/fail examples in docs

## Environment Constraints
- Network access appears restricted in this sandbox; avoid assumptions requiring package downloads.
- Webpack build path is stable in this environment; Turbopack/network-dependent checks may be unreliable.
- Existing untracked files left untouched: `package-lock.json`, `test-fixture-word-to-pdf.docx`.

## Execution Order
1. PR A (bundle/shared-JS reductions)
2. PR B (external runtime dependency removal)
3. PR C (test + CI guardrails)
4. Dependency audit report (`reports/next-steps/deps-audit.md`) based on available network capability.
