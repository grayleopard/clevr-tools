# Speed Converter: default-direction alignment

Date: 2026-09-24. Status: review branch; not deployed.

## Baseline and decision

Source: Google Search Console, Web search, exact page filter for
`https://www.clevr.tools/calc/convert/speed`. Complete data through
September 21, 2026. Query rows are privacy-filtered and do not sum to page totals.

| Window | Clicks | Impressions | Average position |
| --- | ---: | ---: | ---: |
| Sep 15-21 (7 days) | 0 | 183 | 8.2 |
| Aug 25-Sep 21 (28 days) | 1 | 2,199 | 19.8 |
| Jun 22-Sep 21 (3 months) | 5 | 4,510 | 19.3 |

In the visible 28-day query rows, `113 kmh to mph` led with 225 impressions,
followed by `97 kmh to mph` with 70. Nine of the top ten visible queries ask
for km/h or kph to mph; the tenth asks for mph to km/h. The page already has a
matching title, explanatory copy, and clickable 113/97 km/h examples, but its
default controls opened mph to km/h. The change aligns the initial task with
observed intent without creating a new URL or adding query-stuffed copy.

Scorecard: verified demand 3/5, ranking proximity 4/5, task value 3/4,
reliability 4/5, trust readiness 2/4, internal-link readiness 2/3,
linkability 1/3, effort -1. CTR gap is **UNKNOWN** because no comparable
position/device cohort or complete query distribution was established.
Confidence: medium. Gate: eligible; exact conversion vectors and the browser
workflow are tested. A seven-day position of 8.2 with only 183 impressions is
not enough to infer a stable first-page ranking or a title problem.

## Intervention and verification

- Changed only the general Speed Converter's default direction and Reset to
  km/h to mph. Users can still select, swap, and convert all existing units.
- Added browser assertions for the initial units/result and Reset. Formula,
  routes, metadata, examples, and supporting copy are unchanged.
- Focused Node converter suite: 6 passed, 0 failed.
- ESLint: passed, 0 reported errors or warnings.
- Production build and TypeScript: passed, 175/175 pages generated.
- Focused Chromium browser test: 1 passed, 0 failed. The initial sandbox-only
  run could not bind a local test port or write test artifacts; it passed when
  rerun with the isolated worktree permission.

Deployment commit and date: **PENDING**. Do not treat this as a ranking or
traffic win before a reviewed merge and verified production deployment.

## Measurement

| Checkpoint after deployment | Inspect |
| --- | --- |
| Day 7 | Live initial units, Reset, calculation output, page-level GSC impressions/clicks and query mix; note reporting lag |
| Day 28 | Compare page/query impressions, clicks, position distribution and CTR by device against the baseline, not sitewide average position |
| Day 90 | Look for durable task use, qualified referrals, and whether further work on this route is justified |

Unknowns: full anonymized query distribution, completion events by direction,
device-specific CTR benchmark, and any causal ranking effect. Do not create
number-specific conversion pages or promise more clicks from this UI default.
