# Dependency Audit (Phase 4)

## Environment Result
Network access to npm registry is blocked in this sandbox, so registry-backed audit tooling could not complete.

## Commands Attempted

1. `npm audit --json`
- Result: failed
- Error: `getaddrinfo ENOTFOUND registry.npmjs.org`

2. `npx depcheck`
- Result: not reliable in this environment (network/package resolution constrained)

3. `npm ls --depth=0`
- Result: succeeded (local tree inspection only)
- Observed extraneous packages in local install:
  - `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`, `@types/pdfkit`, `semver`

## Runbook for Normal Network-Capable Environment

Run from repo root:

```bash
npm ci
npm audit --production
npm audit
npx depcheck
npm outdated
```

## What to Triage First

1. Vulnerabilities
- Prioritize `critical` and `high` from `npm audit`.
- Patch direct deps first, then transitive overrides where needed.

2. Unused dependencies
- Validate `depcheck` output manually before removing packages.
- Pay extra attention to dynamic imports and CLI-only tooling.

3. Supply-chain risk
- Flag packages loading remote scripts/workers at runtime.
- Confirm converter stack remains same-origin at runtime (addressed in PR B).

4. Drift and lockfile hygiene
- Reconcile extraneous packages via clean `npm ci` and lockfile review.
- Keep lockfile changes scoped and reviewable.

## Recommended Follow-up PR (when online)
- `chore(deps): audit + cleanup`
  - include `npm audit` findings,
  - remove confirmed unused deps,
  - update vulnerable packages with changelog notes,
  - include verification: `lint`, `test`, `build --webpack`, conversion smoke.
