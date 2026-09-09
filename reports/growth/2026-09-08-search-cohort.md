# September search growth cohort

Date: 2026-09-08
Branch: `codex/september-growth-cohort`
Base: `c731d96` (the current main release at sprint start).

## Evidence and limits

The owner's signed-in Search Console was inspected. Recent complete-week impressions declined while aggregate clicks and average position improved. This does not establish that rankings are healthy: changes in the query mix can mask losses. Page-level converter visibility warrants attention, but many impressions cannot be attributed to visible query rows. The cause of the decline remains unproven.

The indexing report contains eligible pages not currently indexed. Manual-action and security reports showed no issues; that does not rule out algorithmic ranking changes. Core Web Vitals had insufficient data, not a passing assessment. External-reference evidence is limited and is not a complete backlink census.

Private account identifiers, exact search metrics and exports are intentionally excluded from this public repository. Complete-day page/query comparisons, device/country segments and privacy-safe completion analytics remain necessary. Do not use site-wide average position as the success metric.

## Small cohort and interventions

| URL | Eligibility / confidence | Intervention |
| --- | --- | --- |
| `/calc/convert/data` | Eligible; medium | Explain that changing units does not compress a file; link to a concrete file-budget workflow. Preserve existing SI/IEC math and examples. |
| `/calc/salary` | Eligible for gross-pay conversions; medium | Explain formula, full-time/part-time examples and gross-versus-net limits below the functioning calculator. No tax claims or metadata experiment. |
| `/blog/reduce-image-file-size` | Eligible after accuracy review; medium | Add exact byte budgets, required-reduction arithmetic, MB/MiB explanation and a contextual link back to Data Size. Correct pixel-count versus byte-size claims. |
| `/blog/compress-images` | Eligible after accuracy correction; medium | Correct the false implication that this tool's PNG quantization preserves every pixel. Explain visual checks and retention of originals. |

Numeric opportunity scores are UNKNOWN: the inputs are not sufficiently complete to justify them. No new routes, bulk articles, fake recency dates, tool logic changes or artificial link placements were added. Speed and weight already received example-driven improvements in the base release; those are preserved and should be measured rather than immediately rewritten.

## Authority work

See `2026-09-08-benchmark-outreach.md` for the review and outreach packet. Benchmark automated results are not a substitute for the required human visual review and independent reproduction. Do not publish unapproved savings claims. No outreach has been sent, no links purchased and no paid SEO subscription is required for this sprint.

## Verification

- Production build with webpack: passed, 175/175 generated pages. Initial sandbox attempt failed to resolve Google Fonts; the network-enabled build passed. Existing multiple-lockfile warning remains.
- Targeted Node conversion/search/crawl tests: 22/22 passed.
- Final ESLint: passed, zero errors; existing Browserslist freshness notice remains.
- Chromium browser checks: 16/16 passed, including four changed routes at 390px and 1440px, one H1 per page, no page errors or horizontal overflow, reciprocal links, converter behavior and FAQ/schema regression checks.
- Bundle budgets: all existing route and shared-chunk budgets passed. This is not a field Core Web Vitals assessment.
- Full portfolio browser suite was not rerun for this content-only patch; no claim of full-site recertification is made.
- Calculation logic, routes, metadata and structured data are unchanged.
- Independent Luna Max review prompted explicit daily/biweekly/monthly salary assumptions and clearer 2x image-source wording; both were corrected. PNG quantization was verified in the installed browser-image-compression encoder (`UPNG.encode` with a quality-dependent palette); MB/MiB definitions were checked against the shared data-size registry and passing conversion tests.

## Release and measurement

Production deployment: PENDING. This report is not evidence that local changes are live. Merge/deployment and public-page checks must precede indexing requests for changed content.

After deployment, inspect representative cohort URLs and confirm the sitemap is fetched successfully. Request indexing only for useful repaired pages, not repeatedly for the whole site. Inspect `/text/word-counter` separately to distinguish current eligibility from an old crawl snapshot; do not blindly rewrite all unindexed pages.

| Checkpoint | Measurement | Status |
| --- | --- | --- |
| Day 0 | Record deployed commit/date; check public copy, canonical, indexing eligibility and sitemap | Pending deployment |
| Day 7 | Recrawl/index recognition; same-page query and device/country losses; regressions | Pending deployment |
| Day 28 | Complete-period page/query clicks, impressions, CTR at comparable positions and task completion | Pending deployment |
| Day 90 | Durable non-brand traffic, relevant editorial references and useful task completions | Pending deployment |

No traffic uplift or first-page outcome is guaranteed. These are bounded usefulness and trust improvements, not an explanation of the entire impression decline. The next larger distribution step requires approved human-reviewed evidence and a small owner-approved pitch batch.

## Primary guidance

- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: crawlable links and descriptive anchor text](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: requesting recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
