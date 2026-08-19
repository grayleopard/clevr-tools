# Growth foundation sprint

Date: 2026-08-18

Branch: `codex/growth-foundation`

## Baseline

The latest committed GSC evidence in `reports/seo/indexing-priority-plan-2026-08-04.md` records:

- 21 clicks and 38,680 impressions over three months
- 9 clicks and 10,995 impressions over the latest complete 28 days in that export
- nine known external links, all targeting the homepage
- no API-level page + query export, so query ownership, cannibalization, and page-level position remain unknown

PR 27 contains the separate Data Size, Speed, and Angle recovery cohort. This sprint does not mix its measurement with the calculator cohort below.

## Selected cohort

| Route | Evidence | Confidence | Sprint intervention | Gate |
|---|---|---|---|---|
| `/calc/credit-card-payoff` | Earlier snapshot: 1,407 impressions, 0 clicks | Medium | Stop reporting a successful payoff at the 600-month cap; expose remaining balance and required payment | Deterministic capped and normal-path math tests |
| `/calc/amortization` | Earlier snapshot: 775 impressions, 1 click | Medium | Put base-versus-extra payoff, interest, final payment, and rounding assumptions above the schedule | Existing schedule math remains unchanged and reconciled |
| `/calc/down-payment` | Earlier snapshot: 500 impressions | Medium | Add contextual result-state links from Mortgage and Auto Loan | Links must be relevant, crawlable, and non-duplicative |
| `/calc/savings-goal` | Earlier snapshot: 425 impressions | Medium | State contribution timing beside the result and remove stale market-rate claims | No change to calculation behavior |

Exact page/query rows and current positions are unavailable. These pages must not receive broad metadata rewrites until that evidence exists.

## Free evidence stack

No paid SEO subscription is approved for this stage.

1. Use the Search Console API for dated page + query + device exports. Google documents the Search Analytics method and a maximum of 50,000 exposed rows per day per search type.
2. Verify Clevr in Bing Webmaster Tools for page-query performance, keyword research, top result URLs, backlinks, URL submission, and Site Scan.
3. Verify Clevr in Ahrefs Free for own-site keywords, backlinks, referring pages, and technical crawl findings.
4. Use Google Trends for direction and seasonality only, not absolute volume.
5. Use live result inspection for intent and result-format research, recording date, country, device, and personalization limitations.

References:

- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data
- https://www.bing.com/webmasters/help/search-performance-c680da36
- https://www.bing.com/webmasters/help/keyword-research-628070b6
- https://www.bing.com/webmasters/help/site-scan-623520c9
- https://ahrefs.com/webmaster-tools

## Authority work

The first outreach asset should be a verified flagship evidence package, not another generic article. The existing Image Compressor benchmark remains unpublished until visual review and independent reproduction gates pass. After approval, pair it with one practical image-size budget guide and a manually vetted publisher list. Do not request, purchase, or exchange ranking credit.

## Measurement ledger

| Checkpoint | Required evidence | Status |
|---|---|---|
| Release | merged commit, deployed commit, build and browser gates | Pending |
| Day 7 | crawl/index recognition, page-query impressions, obvious regressions | Pending |
| Day 28 | impressions, CTR, position distribution, task starts/successes | Pending |
| Day 90 | durable clicks, qualified referrals, direct linking domains, task completion | Pending |

Evaluate each route separately. Do not use site-wide average position as the success metric.
