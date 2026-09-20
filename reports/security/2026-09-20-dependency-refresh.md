# Dependency security refresh

Date: 2026-09-20
Base: production commit `9f0f721e97603a520fa44575d92e970abea9bc83` (PR #31).
Branch: `codex/security-dependency-refresh`.
Release status: review branch only; not merged or deployed.

## Scope

Address the dependency findings identified during the outreach-readiness release. No route, SEO copy, metadata, discovery, or visual redesign changes. The existing local configuration and owner-owned `outputs/` are excluded from this change.

Direct updates:

| Package | Before | After |
| --- | --- | --- |
| next / eslint-config-next | 16.1.6 | 16.3.5 |
| sharp | 0.34.5 | 0.35.4 |
| dompurify | 3.3.1 | 3.4.15 |
| pdfmake | 0.3.5 | 0.3.11 |

Flagged transitive dependencies were refreshed within their parents' supported ranges. No blanket `npm audit fix --force`, major framework migration, or new production dependency was used. Install/update steps used `--ignore-scripts`. The lockfile records all resolutions, including platform-specific optional image/framework binaries.

The existing Bun lockfile was regenerated from the verified npm lockfile using `bun pm migrate --force`, not independently resolved to a different dependency set. Bun frozen-lockfile/lockfile-only validation passed. `bun pm scan` could not run because this project has no configured Bun security scanner; no scanner was installed or granted access. The zero-advisory result is from npm, not a claimed Bun scan result.

## Security evidence

- Before: `npm audit` reported 26 affected package entries: 1 critical, 17 high, 5 moderate, 3 low.
- After: full dependency audit and production-only audit report zero known vulnerabilities at the time of this check.
- These are registry advisory results, not a penetration test, proof of compromise, or guarantee that the application is vulnerability-free.
- Next.js's AVIF image-optimization advisory affects releases before 16.3.3 on the 16.x line. The selected release is newer and resolves the currently flagged framework findings.
- Sharp's selected release updates the affected native image stack. HEIC support remains environment-dependent; no HEIC capabilities are newly advertised.

Sources checked:

- https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
- https://github.com/lovell/sharp/releases/tag/v0.35.4
- https://github.com/cure53/DOMPurify/releases
- https://github.com/bpampuch/pdfmake/releases/tag/0.3.11
- https://pdfmake.github.io/docs/0.3/getting-started/client-side/
- https://pdfmake.github.io/docs/0.3/getting-started/client-side/methods/
- npm registry version/engine metadata and audit response on 2026-09-20.

## Compatibility fixes

- Explicit webpack development/build scripts preserve existing `experimental.cssChunking: "strict"`. Next 16.3.5 rejects that option with default Turbopack. CI already used webpack; its command now uses the shared build script.
- Disabled the new optional `agentRules` generation after a development smoke test created AGENTS.md/CLAUDE.md. Removed only those newly generated files; pre-existing project instructions/configuration remain untouched.
- Corrected one test-only Window type assertion exposed by the updated build/type check.
- Replaced pdfmake's legacy callback-based `getBlob` integration with its 0.3 promise API, aligned the local type declarations, and registered bundled fonts through `addVirtualFileSystem`.
- Await invoice downloads so existing error handling and busy state cover asynchronous generation.
- Replaced the permanently skipped DOCX happy-path test with upload, preview, conversion, download, PDF signature and page-count verification. The new test failed before the compatibility fix (no download after 35 seconds).
- Added equivalent readable-PDF download coverage for Invoice Generator, which shares the same loader.
- Both PDF tests now extract text and assert actual source content, not merely a nonempty valid PDF. Invoice editing waits for page hydration using the existing test convention.
- Switched from the prebundled `mammoth/mammoth.browser` artifact (whose header records embedded xmldom 0.8.6) to `mammoth`'s package entry and browser mappings. This lets the application bundle the patched lockfile-resolved xmldom 0.8.15. The independently identified stale embedded parser would not have been fixed by a lockfile update alone.
- Replaced shared on-disk invalid-input fixtures in `p1-files-images.spec.ts` with per-upload buffers. A parallel run reported a file-read error instead of the expected content-mismatch error; the focused rerun passed. Shared beforeAll writes were a plausible race, so the fixture collision was removed without weakening assertions or changing Smart Converter code.

## Verification

- Initial dependency-only build: 175/175 routes generated, TypeScript passed after the test assertion correction.
- Initial full Chromium suite: 394 passed, 7 skipped. This was before the PDF integration fix and before enabling the DOCX artifact test; it is not final acceptance evidence.
- Node tests: 118 passed, 2 skipped, 0 failed. Both skips identify missing optional Sharp/libvips HEIC support.
- Word preview sanitizer checks: passed.
- Dependency audit: zero current findings, including production-only audit.
- PDF compatibility build: 175/175 pages; lint and bundle budgets passed.
- Expanded browser run: 395 passed, 6 skipped, 1 Smart Converter fixture-read failure. Focused rerun: 13/13 passed, including actual DOCX and invoice PDF downloads. Full run after fixture isolation: 396 passed, 6 skipped, 0 failed.
- Final revision after changing Mammoth's entry point and strengthening PDF-content assertions: build 175/175 pages, standalone TypeScript, lint, and bundle budgets passed. All 7 focused file-tool happy-path tests passed; the full Chromium run passed 396 tests with 6 skips and zero failures. The remaining generic DOCX smoke-test skip now correctly points to the active artifact/content regression rather than claiming DOCX coverage is skipped. Final hosted CI is still required for the published revision.
- Development startup: passed with webpack, including `agentRules: false`; test server stopped.
- Independent Luna Max exposure/diff review completed; reviewer closed. It identified the embedded parser issue, stale ambient declarations (already corrected during the review), missing PDF-content assertions, and stale Bun lockfile. All were addressed by the parent and reverified as noted above. This is not a separate final reviewer acceptance after those corrections.

## Exposure notes and residual limits

The review found no application-provided user image URL passed to `next/image`; current uses are static meme registry paths. Direct Sharp imports occur in test/benchmark tooling, while Next also declares Sharp as an optional dependency. This narrows observed exposure but does not prove a framework advisory unreachable. DOCX parsing and pdfmake run client-side; no server-side DOCX conversion path was identified.

The sanitizer's existing Node check exercises its fallback rather than the browser DOMPurify hook path. The DOCX browser export test exercises normal document preview/conversion, not a comprehensive malicious-document corpus. Browser sanitation fuzzing and arbitrary document/resource exhaustion remain separate follow-up work. No Firefox/WebKit suite was run for this patch.

## Release gates and limitations

Require final build, lint, full browser suite, PDF artifact checks, bundle budgets, independent review, and CI before production release. Do not weaken bundle budgets or hide failing tests to ship. No external exploitation or private-file tests were performed. Existing contained tools remain contained. No unsolicited outreach was sent as part of this security work.
