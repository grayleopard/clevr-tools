# Ahrefs crawl remediation sprint

Date: 2026-08-19

Branch: `codex/growth-foundation`

## Baseline

The owner-provided Ahrefs Webmaster Tools exports dated 2026-08-19 reported:

- one indexable page without an H1: `/play/numble`
- 127 pages with incomplete Open Graph metadata
- 19 pages with only one dofollow inlink
- one short title (`/privacy`) and one long title (`/calc/odds-calculator`)
- 12 short and 21 long meta descriptions

Current page-plus-query GSC rows remain unavailable. Description warnings were therefore not bulk-rewritten.

## Selected cohort

| Route | Gate | Intervention |
|---|---|---|
| `/convert/word-to-pdf` | Eligible | Add links from two relevant PDF workflows |
| `/files/image-cropper` | Eligible | Add links from Image Compressor and Image Resizer |
| `/files/invoice-generator` | Eligible | Add links from two PDF-creation workflows |
| `/calc/sales-tax` | Eligible | Add links from Tip and Discount calculators |
| `/calc/net-worth` | Eligible | Add links from Savings Goal and Retirement calculators |

The other 14 one-inlink URLs remain a measured backlog rather than expanding this sprint without demand evidence.

## Implemented interventions

1. Numble now emits one visible H1 in its server-rendered loading shell and reuses the same heading after hydration.
2. All 129 page-level Open Graph objects now define exactly one type and one image. Existing page-specific metadata remains intact, and blog posts retain the `article` type.
3. The homepage and About page now expose explicit Open Graph URLs.
4. The Privacy title is now `Privacy Policy & Data Handling | clevr.tools`.
5. The Odds Calculator title is now `Odds Calculator — Convert Odds & Parlays | clevr.tools`.
6. Each selected internal-link target is present on three rendered pages: its category hub plus two relevant peer pages.
7. A regression suite now checks SSR heading presence, Open Graph completeness and uniqueness, title contracts, and the production four-link related-tool limit.

## Verification

- Node tests: 109 passed, 2 skipped because installed Sharp/libvips lacks optional HEIC decoding, 0 failed.
- ESLint: 0 errors; only the existing stale Browserslist data notice.
- Production build: passed; 175 pages/assets generated.
- Playwright Numble/typing suite: 8 passed.
- Generated HTML audit: 134 Open Graph pages checked, 0 incomplete or duplicate type/image/URL sets.
- Generated Numble HTML: exactly one visible H1 (`NUMBLE`).
- Rendered internal links: all five cohort targets appear on three distinct pages.
- `git diff --check`: passed.

## Release and measurement

| Checkpoint | Required evidence | Status |
|---|---|---|
| Release | committed branch, reviewed merge, deployed commit | Pending review |
| Day 7 | rerun the same Ahrefs exports; expect H1 and Open Graph findings cleared and five target inlink warnings cleared | Pending deployment |
| Day 28 | compare page/query impressions, clicks, CTR, and position distribution for the five URLs | Pending GSC export |
| Day 90 | evaluate durable clicks, additional indexed queries, referrals, and completion quality | Pending |

## Explicit unknowns

- Current GSC query ownership and page-level positions are unknown.
- Demand scores for the 14 deferred one-inlink URLs are unknown.
- Description length alone does not establish a search problem; the 33 warnings remain unchanged pending GSC evidence.
- Open Graph completeness improves sharing and crawl hygiene but is not expected to directly increase rankings.
