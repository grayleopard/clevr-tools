# Search and product review: September 26, 2026

## Decision

Do not treat a sitewide position number as the diagnosis. The latest complete week improved versus the prior week, but organic traffic is still tiny. Focus one short sprint on task-first tool presentation and the two converter URLs already showing page-two proximity. Preserve the recently released Speed and Data Size changes long enough to measure them. Earn direct references to a verified resource; do not manufacture backlinks or publish the pending image benchmark.

## Baseline and evidence dates

Source: owner-authenticated Google Search Console, Web Search, clevr.tools domain property, inspected September 26. Search data was last updated approximately 4.5 hours before inspection. Windows below use complete days through September 24.

| Window | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Sep 18-24 | 6 | 3.38K | 0.2% | 22.3 |
| Sep 11-17 | 1 | 2.08K | 0% | 31.8 |
| Aug 28-Sep 24 | 19 | 17.2K | 0.1% | 34.6 |
| Jun 25-Sep 24 | 42 | 58K | 0.1% | 43.2 |

The week-over-week rise is real in Search Console's like-for-like comparison: approximately 63% more impressions and five additional clicks. It is not proof that every ranking improved: new Cups to mL impressions and changing query mix affect the average. Six clicks in a week are far below a defensible ad-revenue base.

| Page | Last 7-day clicks / impressions | Prior 7-day clicks / impressions | 28-day clicks / impressions / position | Interpretation |
| --- | --- | --- | --- | --- |
| `/calc/convert/data` | 3 / 1,273 | 0 / 1,171 | 8 / 6,749 / 16.2 | Strongest measured existing opportunity; recent SI/IEC and answer corrections need observation, not another broad copy rewrite. |
| `/calc/convert/cups-to-ml` | 0 / 851 | 0 / 0 | 0 / 851 / 14.6 | Newly visible near page one; query rows cluster around fractional cups and milk/water. The tool only accepts numeric input, while useful fraction answers sit below the tool. |
| `/calc/convert/speed` | 1 / 219 | 0 / 81 | 2 / 1,578 / 20.7 | Directional opportunity; km/h to mph default was just deployed. Wait for comparable 7/28-day evidence. |
| `/calc/amortization` | 0 / 406 | 0 / 542 | 0 / 2,412 / 77.3 | High impressions but poor proximity; not a quick CTR fix. Verify assumptions and query intent before promotion. |
| `/calc/odds-calculator` | 0 / 126 | 0 / 15 | UNKNOWN | Emerging visibility, but small sample and a policy-sensitive topic. Observe, do not prioritize ad placement or expansion yet. |

Top observed Cups query rows include `1/4 cup milk in ml` (28 impressions), `1/8 cup in ml` (22), and `1/8 cup to ml` (12). Page-filtered query rows do not sum to page totals because Search Console withholds some query detail; no missing rows are inferred. Data Size's visible queries include `4k mb to gb` and `4.7gb to mb`, but the sampled query counts are small relative to total page impressions.

Device mix in the latest week: desktop 5 clicks / 1,780 impressions, mobile 1 / 1,569, tablet 0 / 29. Mobile impressions rose by 889 week over week without a click increase. The US accounted for 3 clicks / 1,602 impressions; UK 0 / 333 and Canada 0 / 189. These are too small for device- or country-specific ranking conclusions, but mobile task visibility matters.

## Indexing and authority

The Page indexing report was last updated September 20: 102 indexed and 87 not indexed, including 50 crawled-not-indexed, 16 redirects, 11 discovered-not-indexed, 7 intentional noindex, 2 404, and 1 alternate canonical. Several crawled-not-indexed examples were last crawled in April-July, and that list still includes Cups to mL despite 851 impressions in the last week. Treat these as historical examples; inspect current status on selected URLs before attempting any bulk fix or validation. The submitted sitemap was successful, last read September 20, with 129 discovered pages.

Current URL Inspection resolves the apparent Cups contradiction: the exact `www` Cups URL is indexed. Image Compressor, PDF to JPG, Merge PDF, and the image-compression guide are also indexed. The PDF-to-JPG guide is **Discovered - currently not indexed**, with no recorded crawl or referring sitemap in URL Inspection (a referring page is shown as `https://clevr.tools/sitemap.xml`). Verify that guide's live availability, sitemap inclusion/canonical, and internal links before considering an indexing request; this status alone does not prove a technical defect.

Search Console's Links report showed 9 external links from two sites: 8 from Product Hunt and 1 from saaslet.io. All reported external links target the homepage, not a tool or guide. This is a concrete authority/distribution gap, though the report is not a complete real-time backlink index. Internal links are numerous (13,481 reported); more sitewide links alone are unlikely to solve the gap.

## Product and design findings

Live desktop review of Home, Data Size, Cups to mL, and Speed in Chrome, with a dark-mode spot check:

1. **The task is pushed down.** Shared tool headers use a display H1 up to 6.25rem, large breadcrumb/header padding, a heavy rule, and a 2.5rem gap before the three-column workspace. On Data Size and Cups, the converter controls start toward or below the first screen even in a large desktop window. The badge `READY TO USE` adds little information. Keep the industrial visual identity, but shrink the tool-page header to a compact editorial scale and put the primary task into the first viewport. Verify at 1920x1080 and mobile before rollout.
2. **Cups has duplicate support content.** The page component renders a fraction table and explanatory sections; `lib/tools.ts` supplies another quick-reference table and overlapping `When to use this` / `Good to know` sections that ToolLayout appends. Consolidate to one accurate, helpful reference. Provide common fraction presets near the input (1/8, 1/4, 1/3, 1/2, 3/4, 1 1/4) or safely parse fractions. Do not create separate numeric landing pages. Keep the explicit US-cup versus metric-cup distinction.
3. **Data Size is more useful after the SI/IEC correction.** Its explicit system toggle, worked examples, and primary standards links are strengths. The shared header still delays the tool; avoid another title or unit-definition change while the correction is fresh. Measure whether common-conversion buttons are used and whether visitors complete a conversion.
4. **The palette is not the bottleneck.** Light emerald and dark indigo are coherent and readable in the sampled pages. The stronger improvement is less title shouting, less tertiary navigation on task pages, more central workspace prominence, and removal of repetitive support copy. Test the same hierarchy on mobile; no blanket theme replacement is justified.
5. **Homepage messaging is honest but abstract.** `Clear processing boundaries` is trustworthy language, not an immediately legible consumer task. Test a task-led subheading or example without sacrificing accurate privacy disclosures or changing all SEO copy at once. Preserve the current useful search, file drop, and task links.

## Selected cohort and gates

Scores are directional, not a fabricated league table. They use the growth scorecard's verified demand, proximity, CTR opportunity, task value, reliability, trust, linkability, and effort dimensions.

| URL | Gate | Priority / confidence | Next controlled intervention |
| --- | --- | --- | --- |
| `/calc/convert/data` | Eligible after recent SI/IEC repair; current browser output and sourced definitions observed | P1 / high | Measure completed conversions and page/query CTR by device. Apply the shared task-first header change, then wait before changing title/copy again. |
| `/calc/convert/cups-to-ml` | Eligible for US-cup volume conversion; fraction input and duplicate content are UX/content gaps | P1 / high | Consolidate duplicated tables; add fraction presets adjacent to the tool; validate all values and mobile behavior. Re-evaluate CTR after recognition settles. |
| `/calc/convert/speed` | Eligible within tested scope; recent default change | P2 / medium | No new copy changes now. Verify the km/h to mph default remains live and measure Sep 24 release at days 7 and 28. |
| `/calc/amortization` | Calculator was repaired, but broad finance intent/assumptions and ranking distance need review | Watch / medium | Keep source and formula checks current; inspect specific page-query rows before any SEO expansion. |
| Image Compressor, PDF to JPG, Merge PDF | All three URLs indexed; 28-day GSC exposure is only 4, 23, and 6 impressions respectively, each with 0 clicks | Discovery gate / high | Preserve tested functionality. Check relevant query demand and direct editorial references before choosing another feature or assuming a CTR problem; add privacy-safe start/success/download measurement when available. |

The flagship figures are too small for meaningful average-position comparisons (Image Compressor 9.3, PDF to JPG 41.3, Merge PDF 5.0). The image-compression guide is indexed but has 0 impressions in 28 days. The PDF-to-JPG guide has 0 impressions and is not yet indexed. Neither guide currently supports an evidence-backed traffic forecast or outreach performance claim.

The historical integrity matrix marks Cups for possible consolidation into Cooking Converter, but current page-specific impressions and distinct fractional-cup intent argue against a redirect now. Retain the direct URL until a separate evidence-led parity and migration review. Historical Data Size matrix limitations predate the recent SI/IEC repair; use current code and tests to assess it.

## Next sprint sequence

1. **Ship a narrow product-first header experiment** on the shared tool shell, preserving H1/metadata and desktop/mobile accessibility. Goal: the interactive task and a result/example are visible without an initial scroll on representative tool pages. Do not alter every category or the color system.
2. **Improve Cups to mL as the near-page-one page:** consolidate redundant support content and add direct fraction entry/presets. Regression-test US and metric distinctions, common fractions, keyboard/mobile behavior, and canonical/FAQ output.
3. **Preserve Data and Speed release measurability:** no simultaneous title rewrites. Record exact deployment commits and day-7/day-28 page-query/device comparisons plus task completion events.
4. **Close the authority gap with one vetted asset:** the image-compression benchmark remains `MEASURED_REVIEW_PENDING` until all 76 cases receive named visual review, at least eight independent reproductions are documented, and the correction contact has a monitoring owner. If those gates cannot be met soon, develop a smaller, directly useful, source-backed reference or workflow on an existing page rather than publishing unsupported performance claims. Any new publisher batch requires owner approval for recipients and message text.
5. **Investigate the specific uncrawled guide, not the 87-page total:** inspect the PDF-to-JPG guide's live response, sitemap/canonical, and contextual links; compare with its indexed tool page and indexed image guide. Do not click `Validate Fix` on a stale category without a specific fix. Recheck its URL Inspection status after crawl time.
6. **Monetization readiness:** keep ads subordinate to task completion. At six organic clicks per week, ad revenue cannot be responsibly forecast. Review page uniqueness and usability before applying or expanding ad placements, then measure qualified sessions and completed tasks, not domain rating alone.

Google's current guidance emphasizes people-first utility, crawlable contextual links, and unique content with usable navigation rather than volume of pages or purchased signals: [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [AdSense site readiness](https://support.google.com/adsense/answer/7299563?hl=en).

## Verification, release, and measurement

- PR #39, the interim privacy/correction contact fix, was merged September 26 UTC as `ec7a47f067c970e164eb3c075b217a2003983c8d`. PR CI and Vercel passed; the merged commit's Vercel status is `success`, and the live Privacy page served `clevr-tools@agentmail.to`. This contact is an interim inbox, not a promised continuous-response SLA.
- This report makes no product or SEO code change. No outreach or benchmark publication was performed. The original dirty checkout and `outputs/` were not touched.

| Checkpoint | Measurement |
| --- | --- |
| Day 7 | Recheck the PDF guide's index state; Data/Cups/Speed page-query clicks, impressions, position by device; task-start and success/download events if available; PR #39 contact reachability. |
| Day 28 | Comparable query/device cohort CTR and ranking distribution; conversion completion and retention; direct references to specific assets; Cups fraction usage if shipped. |
| Day 90 | Durable qualified clicks, repeat task use, editorial linking domains to tool/reference URLs, referral visits, and ad-eligible sessions. Expand only interventions with demonstrated value. |

**Unknowns / owner actions:** GA4 task completions, Search Console's full anonymized query mix, mobile visual QA at standard viewport sizes, an inbox monitoring owner, named benchmark visual reviewer, and independent reproducer. URL-level GSC performance and index checks were completed after the Mac was unlocked. The owner should arrange the two human benchmark reviewers and a reliable interim-inbox monitoring routine; do not promote the benchmark before those gates are satisfied.
