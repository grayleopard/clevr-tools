# Indexing and content-quality priority plan

Date: 2026-08-04

## North Star

Google should discover and index the pages that complete a real user task, while
duplicate, unavailable, or insufficiently reviewed pages are deliberately kept
out of the index. The target is not a 100% coverage number. The target is a
high-confidence index in which every submitted URL deserves to rank.

## Current route disposition

| Cohort | Count | Current action |
|---|---:|---|
| Live, index-eligible tools | 108 | Keep in the sitemap and improve using query evidence. |
| Indexable trust-upgrade priorities | 6 | Keep indexable while adding stronger sources, limitations, review dates, and ownership. |
| Unavailable/contained tools | 6 | Keep disabled, emit `noindex,follow`, and omit from discovery and the sitemap. |
| Pair-specific converter candidates | 14 | Keep unchanged until GSC and backlink evidence determines keep versus consolidate. |
| Distinct broad converters newly exposed on `/calculate` | 8 | Keep indexable and monitor discovery/indexing. |

Body Fat, Due Date, Ovulation, Ideal Weight, Odds Calculator, and Invoice
Generator are distinct user tasks and remain indexable. They are also the first
trust-upgrade cohort: add appropriate sources, assumptions and limitations,
review dates, and accountable review or ownership without withholding their
useful functionality from search.

The six contained tools are HEIC to JPG, Background Remover, PDF to Fillable,
Poker, Take-Home Pay, and Paycheck.

## P0: deploy the technical hygiene pass

- Maintain separate `live` and `indexable` route decisions so product utility
  does not automatically become a Google indexation decision.
- Keep all six useful health, odds, and invoice pages indexable; use page-level
  evidence and trust improvements instead of a blanket subject-matter gate.
- Keep the sitemap limited to canonical URLs that are intended for search.
- Expose the eight distinct broad converters through crawlable HTML links:
  Time, Pressure, Energy, Frequency, Fuel Economy, Angle, Power, and Force.
- Keep PDF to Fillable disabled until its reader compatibility, rotated-page
  placement, keyboard/touch operation, accessibility, and privacy claims pass.
- Let the removed `/convert/pdf-to-word` URL return a real not-found response
  instead of redirecting it to the non-equivalent Files directory.

## P1: make the core portfolio visibly trustworthy

Prioritize the local-first file workflows, text/dev utilities, timers, typing
tools, and workflow guides. For each retained page:

1. Verify that the tool completes the advertised job on representative inputs.
2. Put task-specific instructions, limitations, and output expectations near
   the working interface.
3. Remove generic or repeated copy that does not help the user complete or
   evaluate the task.
4. Show who owns the page, how it was tested, and when it was last materially
   reviewed where a reader would reasonably expect those details.
5. Link contextually from the relevant hub, related tools, and guides using
   normal crawlable anchors.

Add a public testing/editorial-methodology page and expand the About/footer
ownership signals while strengthening health, finance, gambling, and
tax-adjacent pages with subject-appropriate sourcing and boundaries.

## GSC evidence received on 2026-08-04

The three-month export contains 21 clicks and 38,680 impressions. The six
trust-upgrade pages account for 1,745 impressions (4.5% of the site total), and
Ovulation earned two clicks. Exact-intent queries include `ovulation
calculator`, `fertile window calculator`, `ideal weight calculator`, `implied
probability calculator`, `betting odds calculator`, and `pdf invoice
generator`. This is enough evidence to keep the six pages indexable while their
trust presentation improves.

The latest 28 complete days (2026-07-06 through 2026-08-02) contain 9 clicks
and 10,995 impressions. Odds Calculator, Ideal Weight, Due Date, and Body Fat
continue to receive impressions in this window. Low or missing rows for the
other two pages are not retirement evidence because GSC omits anonymized and
low-volume queries.

The Coverage export reports 106 indexed and 117 not indexed as of 2026-07-23.
The largest unresolved cohorts are 59 `Crawled - currently not indexed` and 11
`Discovered - currently not indexed` URLs. The supplied Coverage archive
contains aggregate reason counts but not the URL examples, so the page-level
classification of those 70 URLs remains open.

## P1: obtain the missing decision data

The three-month and 28-day performance exports and the aggregate Coverage
export have been received. The remaining data request is:

- Example URLs from `Crawled - currently not indexed` and
  `Discovered - currently not indexed`, plus the 404, redirect, noindex, and
  alternate-canonical cohorts.
- API-level page/query rows if available; the UI exports provide page-only and
  query-only tables and cannot prove which query belongs to which landing page.
- Backlink/referring-domain data for every proposed redirect or retirement.

## P2: consolidate only when evidence supports it

The 14 pair-specific converters overlap with broad converters. Retain a pair
page only when it has distinct query demand, backlinks, or a genuinely distinct
user experience. Otherwise redirect it directly to the matching broad
converter. Evaluate Car Payment versus Auto Loan using the same rule.

Do not redirect retired URLs to a generic category page. A redirect should
represent a genuine equivalent replacement; otherwise return `404` or `410`.

## Measurement cadence

- After deployment: submit the updated sitemap and inspect representative URLs.
- After 7 days: confirm Google has seen the new sitemap and containment changes.
- After 28 complete days: compare indexed URL count by approved cohort, landing
  page impressions, query alignment, CTR by position/device, and crawl status.
- Do not request indexing for every URL. Request it for a small representative
  group of repaired priority pages, then verify the pattern before expanding.

## Google reference points

- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Canonicalization methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
