# Research-led growth sprint: September 23, 2026

## Decision

Make Clevr better at completing a small number of real tasks, then earn references to the evidence. Do not respond to a lower sitewide average position by publishing dozens of near-duplicate answer pages. The present bottleneck is not one universal SEO defect: short-answer calculators dominate impressions, reliable file workflows have little search exposure, and external references are sparse.

Traffic growth is a goal, not a guaranteed outcome. Use qualified organic clicks and completed tool tasks as the primary measures; treat average position as a diagnostic by page and query, not the success metric.

## Baseline and evidence

Search Console, Google Web Search, 28 complete days August 25-September 21, 2026: **17 clicks, 20.6K impressions, 0.1% CTR, average position 37.4**. The 3-month comparison (June 22-September 21) is **41 clicks, 56.9K impressions, average position 44.5**. This does not establish a causal trend by itself because query mix and date windows differ.

| Page | 28-day clicks | 28-day impressions | Gate / interpretation |
| --- | ---: | ---: | --- |
| `/calc/convert/data` | 7 | 7,878 | Eligible; strongest measured search exposure. Page-filtered position 17.3. |
| `/calc/amortization` | 0 | 2,831 | Review calculation assumptions and query intent before promotion. |
| `/calc/convert/speed` | 1 | 2,199 | Eligible, but mostly exact numeric answer queries; clicks may be hard to win. Page-filtered position 19.8. |
| `/calc/poker` | 1 | 665 | Contained; do not promote. |
| `/convert/heic-to-jpg` | 0 | 392 | Contained; do not promote. |
| `/convert/pdf-to-jpg` | 0 | 29 | Reliable flagship, but present search visibility is very small. |

Image Compressor and Merge PDF are below the top 50 pages by impressions in this report. Their exact impression totals, page-filtered query sets, and positions are **UNKNOWN**. The previous Search Console indexing review showed 102 indexed and 87 not indexed URLs; `/blog/compress-images` and `/blog/convert-pdf-to-jpg` were discovered-not-indexed. A processed sitemap does not guarantee indexation. The prior Links report showed nine external links from two sites, mostly to the homepage; this report is not a complete backlink inventory.

Product analytics for tool opens, valid inputs, completions, and downloads are instrumented for flagships, but their actual values were not available during this review: **UNKNOWN**. No demand or conversion estimates have been invented.

The PDF-to-JPG market includes Adobe and iLovePDF, and target-size / local image compressors already exist. Browser privacy alone is not an unoccupied niche. A defensible distinction must come from a reliably completed task, honest output constraints, clear file handoffs, and independently checkable evidence.

## Selected cohort and opportunity scores

Scores use the growth skill's demand, proximity, CTR gap, task value, reliability, trust, internal-link readiness, linkability, and effort dimensions. Where page-level GSC or product analytics is missing, a numeric total would imply false precision; the score is a provisional priority tier plus an explicit confidence level.

| URL | Gate | Score / confidence | Next intervention |
| --- | --- | --- | --- |
| `/calc/convert/data` | Eligible | P1 / high confidence: measured demand and proximity | Release the already-reviewed answer correction. Monitor the exact query mix and CTR before another copy change. |
| `/compress/image` | Eligible with documented edge limits | P2 / medium confidence: high task value, demand unknown | Release the tool-to-guide link, then measure index recognition, task completion, and download. Choose one tested end-to-end image-size workflow before creating another landing page. |
| `/convert/pdf-to-jpg` | Eligible with documented edge limits | P2 / medium confidence: high task value, low current exposure | Release the tool-to-guide link; check guide indexing and page-level queries. Promote only with verified conversion and download evidence. |
| `/tools/merge-pdf` | Eligible with documented edge limits | P3 / low confidence: page/query and completion data unknown | Keep as a comparison flagship, but defer copy or content expansion until page/query and completion data are captured. |

Do not compare these as a strict ordered league table. Amortization and Speed Converter are diagnostic watch pages, not part of the intervention cohort: the former needs an extra trust review and the latter primarily answers arithmetic snippets already visible in search results.

## Interventions and release status

- PR [#33](https://github.com/grayleopard/clevr-tools/pull/33) merged to `main` as `6e7d35ad6764a80cb98bbe6ec5956a3130c51ee0` on September 24 UTC. It adds contextual flagship-to-guide links and bounds related claims.
- PR [#34](https://github.com/grayleopard/clevr-tools/pull/34) merged to `main` as `31539e2c7643c01c8219a237419515ab423caef7` on September 24 UTC. It replaces unsupported typical file-size ranges with calculated answers on Data Size Converter.
- Both PRs had successful PR CI and Vercel preview checks before merge. Vercel reported a successful production deployment for `31539e2` at September 24, 01:37 UTC. Direct requests to the live site returned HTTP 200 and confirmed the new Data Size answer table and both flagship guide links. Post-merge `main` CI was still running at this report's final check.
- No new keyword pages, public benchmark claims, or outreach messages were published in this sprint.

## Reliability and authority gates

Image Compressor, PDF to JPG, and Merge PDF are the three tested flagships, with documented edge limits. Background Remover, HEIC to JPG, Poker, Take-Home Pay, and Paycheck remain contained; do not draw traffic to them until their own gates pass. The image-compression benchmark is `MEASURED_REVIEW_PENDING`: 76 visual cases need named human review and eight need independent reproduction. Do not publish superiority or savings claims from it yet.

Four pitches were already sent to Frontend Focus, CSS Weekly, Web Design Weekly, and Smashing Magazine. Do not resend them or scale outreach without tracking response and referral quality. Future outreach requires owner approval for a specific recipient/message batch and should lead with a useful, verified workflow or reviewed evidence, not a link request. Do not buy links or mass-submit directories.

## Next execution sequence

1. Verify production deployed `31539e2` and that both flagship guide links and the Data Size correction render. Check two guide URLs in Search Console after the release; request inspection only if still discovered-not-indexed.
2. Review the 76 benchmark cases and arrange independent reproduction of eight. If review passes, publish one transparent method/results asset with corpus, limitations, correction contact, and update owner. If it does not pass, repair the benchmark before promotion.
3. Use first-party completion data and a small moderated user test to choose **one** image or PDF workflow improvement. Candidate: an explicit target-size workflow or a better follow-on action after download. Do not build it based on keyword volume alone; existing competitors already offer target-size compression.
4. After the asset is approved, prepare a small, named publisher batch for owner review, including each page's audience fit and a unique factual pitch. Track actual editorial references and qualified referral visits rather than domain-rating movement.
5. Only then consider a new page: require measured user demand, an independently useful task, a verified product, an owner for maintenance, and a differentiated result. Do not create programmatic numeric-conversion pages.

## Measurement contract

| Checkpoint | Required fields | Decision |
| --- | --- | --- |
| Day 0 after deployment | Production commit, response status, page content, canonicals, sitemap, two guide inspections | Stop if release or indexing signals are broken. |
| Day 7 | Crawl/index state of two guides, page/query impressions for cohort, tool-start and download events, external references | Diagnose recognition; do not declare SEO success from one week. |
| Day 28 | Cohort clicks, impressions, CTR at comparable query/device mix, position distribution, completed tasks, qualified referrals | Keep, revise, or roll back individual interventions. |
| Day 90 | Durable cohort traffic, conversion to completed downloads, editorial linking domains, referral visits, ad-eligible sessions | Decide whether to scale this workflow or test another. |

## Unknowns and owner actions

- Exact page-level visibility for Image Compressor and Merge PDF; GA4 completion and download counts; device/country splits; full referring-domain inventory; and Search Console inspection outcomes are **UNKNOWN**.
- Owner action: approve the benchmark review owner and a second independent reviewer before any public claim. Approve specific future outreach batches separately.
- Monetization should wait for material, repeatable traffic and a good ad experience. No revenue forecast can be justified from 17 organic clicks in 28 days.

## Source and evidence notes

First-party: Search Console Performance, Pages and Queries tabs, 28-day and 3-month windows as dated above; prior Indexing and Links views; repository integrity reports and benchmark review protocol. External primary guidance: [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [sitemap limitations](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview), and [spam policies](https://developers.google.com/search/docs/essentials/spam-policies). Competitor feature checks: [iLovePDF PDF to JPG](https://www.ilovepdf.com/pdf_to_jpg) and [Adobe PDF to JPG](https://www.adobe.com/acrobat/online/pdf-to-jpg.html). Competitor findings are directional, not a complete market census.
