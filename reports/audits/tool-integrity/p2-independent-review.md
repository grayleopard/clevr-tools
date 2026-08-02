# P2 independent adversarial review

Date: 2026-08-02  
Candidate: `codex/p2-flagship-readiness` (working tree based on `aa5d1b617825faade573e3cf11d06ca3b98e30e8`)

## Verdict

| Decision | Result | Basis |
| --- | --- | --- |
| P2 branch review readiness | **GO** | No unresolved P0/P1 implementation, containment, privacy, artifact-integrity, or cross-browser blocker was found in the reviewed candidate. The two evidence/contract issues identified during this review were corrected and rechecked. |
| Current production promotion | **NO-GO** | The reviewed P2 candidate is not yet an approved, identified, deployed commit. Production must be re-probed after deployment; the prior production deployment was observed to expose the two legacy processor paths, whereas this candidate intentionally returns 503. |

This is a go for code review, not an authorization to merge or promote. Approval must name the final committed SHA rather than the foundation SHA above.

## Scope and method

- Reviewed the P2 brief, changed source/tests/reports, P1 ancestry, repository refs, and the candidate's containment, Smart Converter, PDF, flagship, Timer, analytics, portfolio, design, and search-evidence work.
- Independently reran the focused source-compatible checks:

  ```text
  node --test tests/p1-files-images.test.mjs \
    tests/pdf-to-fillable.test.mjs \
    tests/pdf-to-fillable-mapping.test.mjs

  16 passed, 0 failed, 0 skipped
  ```

- `git diff --check` passed. `main`, `origin/main`, and both P1 refs resolve to `aa5d1b6`; P1 SEO (`a3bff45`) and audit (`5faae38`) are ancestors of `main`.
- I did not read, modify, delete, stage, or otherwise inspect user-owned `outputs/`. No configuration-file diff was present.
- The implementation report's completed verification ledger was also reviewed: production build 174/174, TypeScript and zero-warning lint pass; Node 86 total, 84 pass plus 2 explicit HEIC-capability skips; Chromium 355 pass plus 6 explicit capability skips; Firefox 21/21; WebKit 21/21; bundle budget pass. Those suite totals are implementation evidence, not a substitute for the focused rerun above or post-deploy checks.

## Findings

### Open actionable defects

None found at review close.

### Resolved during this review

| Prior severity | Finding | Resolution and evidence |
| --- | --- | --- |
| P1 — evidence integrity | The rotated PDF-to-Fillable browser test previously proved only that a parsed widget was in bounds, not that the parsed output landed at the clicked visual target. | `tests/e2e/pdf-to-fillable-placement.spec.ts` now independently converts the parsed AcroForm widget rectangle through the exact rendered counter-rotation and asserts normalized left/top against the click target. Ordinary and rotated-source runs are recorded as 2/2 passing; the mapping/unit suite also passed in the focused rerun. |
| P2 — input-contract accuracy | Word-to-PDF's UI advertised legacy `.doc` acceptance although the implemented contract is DOCX. | `components/tools/WordToPdf.tsx` now accepts only `.docx`; `tests/p1-files-images.test.mjs` asserts that exact contract. The focused rerun passed. |

## Adversarial checks that passed

- **P1 foundation and containment:** P1 ancestry is present in `main`. `app/api/remove-bg/route.ts` and `app/api/xray/route.ts` are unconditional 503 contracts with no processor call path. The five contained direct routes are exercised as noindex, status-only pages with no operational controls in `tests/e2e/p1-containment.spec.ts`; discovery/sitemap coverage is included in the Node and Chromium evidence.
- **Smart Converter:** input headers, type/name agreement, byte limits, target-bound envelopes, 30-second expiry, cancellation generations, and object-URL cleanup are present in `components/home/SmartConverter.tsx`, `lib/file-handoff.ts`, and `lib/useAutoLoadFile.ts`. The claim is correctly limited to verified normal raster/target paths rather than the entire converter graph.
- **PDF integrity:** canonical raw-PDF rectangles are retained through preview and export; `lib/pdf/fillable-pdf.mjs` does not apply a second rotation. The corrected browser assertion closes the prior semantic-placement gap. PDF-to-JPG and Merge PDF tests independently parse emitted JPEG/ZIP/PDF artifacts and check order/geometry.
- **Flagship privacy and behavior:** `lib/analytics/safe-tool-events.ts` emits only allowlisted tool slugs, lifecycle names, bounded success duration, and coarse failure category. It excludes filenames, file contents, clipboard data, exception text, and arbitrary metadata; `tests/e2e/p2-flagship-readiness.spec.ts` asserts the payload keys and real artifacts.
- **Responsive/cross-browser work:** the primary navigation breakpoint avoids the tablet collision, and Timer has semantic roles, focus behavior, reduced-motion behavior, 44 px controls, and viewport overflow checks. The focused Firefox/WebKit results cover five widths, dark mode, keyboard/focus, semantics, and reduced motion.
- **Portfolio, design, and search work:** retirement/consolidation actions are evidence-gated rather than executed; the design directions are isolated prototypes, not a broad production redesign; benchmark, platform-reference, and authority documents explicitly avoid unverified result, limit, traffic, or backlink claims.
- **Scope control:** reviewed changes are targeted product reliability, tests, and reports. No P2 global configuration change or deployment mutation was present; no unrelated production visual rewrite was found.

## Residuals and promotion conditions (not defects in the reviewed normal-path scope)

| Area | Residual boundary | Required before promotion or expansion |
| --- | --- | --- |
| Deployment | Candidate is a working tree at review time, not an approved deployed SHA. | Commit and approve the exact candidate, deploy it, verify deployment identity, then rerun live API and browser smoke checks. |
| Contained processors | Existing production behavior is not proof of the P2 503 contracts. | Re-probe live `/api/remove-bg` and `/api/xray`; retain containment until processor, retention, training, deletion, and consent terms are approved. |
| Smart Converter | Full action graph, structural DOCX parsing, PDF password/corruption/large-file boundaries, clipboard/history/back flows, and portfolio-wide lifecycle behavior remain partial. | Keep readiness claims limited; add those artifact and cancellation cases before broadening discovery or support. |
| PDF/flagships | Fillable PDF needs broader 0/90/180/270, user rotation, zoom/DPR, and corpus coverage. Image/PDF flagships still need EXIF/ICC/animation, encrypted/signed/corrupt, and large-document boundaries. | Maintain the hidden/future-candidate posture where documented and complete the stated corpus gates before wider release claims. |
| HEIC | Two quality-output cases are explicit environment capability skips because local libvips lacks HEIC decode. | Run those cases in a HEIC-capable environment before making output-quality claims. |
| Search and field performance | GSC/backlink/owner inputs and field CWV/INP data remain unavailable. | Obtain the evidence before retirement, traffic, authority, or field-performance decisions. |

## Required release sequence

1. Resolve review feedback and commit the exact approved P2 SHA.
2. Deploy that SHA and verify the deployment identity.
3. Recheck both disabled API contracts, containment/discovery/sitemap/canonical behavior, Smart Converter handoffs, parsed flagship artifacts, Timer/tablet layout, console/hydration, and accessibility in production.
4. Record the live results with the deployment SHA before changing this production verdict to GO.
