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
| Live, index-eligible tools | 102 | Keep in the sitemap and improve using query evidence. |
| Live, pending trust review | 6 | Keep usable, emit `noindex,follow`, and omit from the sitemap. |
| Unavailable/contained tools | 6 | Keep disabled, emit `noindex,follow`, and omit from discovery and the sitemap. |
| Pair-specific converter candidates | 14 | Keep unchanged until GSC and backlink evidence determines keep versus consolidate. |
| Distinct broad converters newly exposed on `/calculate` | 8 | Keep indexable and monitor discovery/indexing. |

The six live pages pending trust review are Body Fat, Due Date, Ovulation,
Ideal Weight, Odds Calculator, and Invoice Generator. They can graduate only
after the page has the appropriate sources, assumptions and limitations,
review date, and accountable reviewer or owner for its subject matter.

The six contained tools are HEIC to JPG, Background Remover, PDF to Fillable,
Poker, Take-Home Pay, and Paycheck.

## P0: deploy the technical hygiene pass

- Maintain separate `live` and `indexable` route decisions so product utility
  does not automatically become a Google indexation decision.
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
ownership signals before attempting to establish authority in health, finance,
gambling, or tax-adjacent topics.

## P1: obtain the missing decision data

Screenshots are enough to identify the coverage problem, but not to decide the
fate of individual URLs. Export the raw data described in
`reports/seo/gsc-analysis-request.md`, including:

- Search performance for the latest 28 complete days and three months.
- Page and query rows, ideally joined through the Search Analytics API.
- Example URLs from `Crawled - currently not indexed` and
  `Discovered - currently not indexed`.
- Page/query evidence for all 14 pair-specific converter routes, Car Payment
  and Auto Loan, Typing Test and WPM Test, and the six pending-review pages.
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
- After 7 days: confirm Google has seen the new sitemap and noindex changes.
- After 28 complete days: compare indexed URL count by approved cohort, landing
  page impressions, query alignment, CTR by position/device, and crawl status.
- Do not request indexing for every URL. Request it for a small representative
  group of repaired priority pages, then verify the pattern before expanding.

## Google reference points

- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Canonicalization methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

