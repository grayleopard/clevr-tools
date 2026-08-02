# Google Search Console analysis request and prioritization framework

Status: implementation-ready; analysis is blocked only on access to raw Search Console exports.

## Copy/paste request to the site owner

> Please export Google Search Console **Performance → Search results** data for the `clevr.tools` Domain property (`sc-domain:clevr.tools`) if available. If the Domain property is unavailable, use the canonical URL-prefix property `https://www.clevr.tools/` and tell us which property was used.
>
> Use **Search type: Web**, with **no query, page, country, device, or search-appearance filters**. Use the newest end date for which Search Console shows finalized data, and use that same end date for both windows:
>
> 1. **Last 28 complete days** (28 dates, inclusive).
> 2. **Last 3 months** using the Search Console date preset. Record the exact start and end dates shown after applying the preset.
>
> For each date window, export the **Queries, Pages, Countries, Devices, Search appearance, and Dates** tabs as CSV. Please do not edit, sort, or combine the raw files. Name the containing folders `gsc-28d-YYYY-MM-DD_to_YYYY-MM-DD` and `gsc-3m-YYYY-MM-DD_to_YYYY-MM-DD`, and include a screenshot or text note showing the property, date range, search type, and active filters.
>
> If API access is available, please also export paginated rows grouped by `page`, `query`, `device`, and `country`, plus a separate export grouped by `date`. Use `type: web`, `dataState: final`, `rowLimit: 25000`, and increment `startRow` until the API returns no rows. Keep the API JSON or CSV unmodified.

Why both paths: the Search Console UI export is capped at 1,000 representative table rows, while the Search Analytics API permits up to 25,000 rows per request and pagination, though Google still does not guarantee every row. See Google's [report export limits](https://support.google.com/webmasters/answer/12919797?hl=en) and [Search Analytics API reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query).

## Intake checklist

- Confirm the property is `sc-domain:clevr.tools` or `https://www.clevr.tools/`.
- Confirm both windows end on the same finalized date.
- Preserve raw exports in a read-only `raw/` folder.
- Record export time and the account time zone. Search Console labels daily performance data using Pacific Time and can lag by several days; see Google's [Search Console data notes](https://support.google.com/webmasters/answer/96568?hl=en).
- Confirm Web search only. Analyze Image, Video, News, and Discover separately if they are later requested.
- Do not treat missing query rows as zero. Google omits anonymized queries and truncates some data.
- Keep chart totals separate from visible-row sums; they can differ because of omitted rows.

## Normalized analysis table

Use [`gsc-analysis-template.csv`](./gsc-analysis-template.csv) as the working table. One row represents one page-query pair when API data exists. When only UI exports exist, keep page-only and query-only rows separate and set `row_grain` accordingly; do not manufacture a page-query join.

Required raw fields:

- `snapshot_label`, `range_start`, `range_end`, `property`, `search_type`
- `row_grain` (`page_query`, `page`, `query`, `date`, `device`, `country`, `appearance`)
- `page`, `query`, `device`, `country`, `search_appearance`
- `clicks`, `impressions`, `ctr`, `position`
- `source_file`, `source_row_number`

Enrichment fields:

- Route and intent: `route_group`, `page_type`, `intent_cluster`, `primary_tool_route`, `canonical_route`, `live_route`
- Comparison: `prior_clicks`, `prior_impressions`, `click_delta`, `impression_delta`, `ctr_delta`, `position_delta`
- Scoring: `intent_fit`, `impression_band`, `position_opportunity`, `ctr_gap`, `route_readiness`, `internal_link_gap`, `effort`, `priority_score`
- Decision: `action_bucket`, `recommended_action`, `evidence_note`, `owner`, `status`

## Scoring framework

The score ranks work; it does not replace judgment. Score each factor with the definitions below, then calculate:

`priority_score = (3 × intent_fit) + (2 × impression_band) + (2 × position_opportunity) + (2 × ctr_gap) + route_readiness + internal_link_gap − effort`

### Factor definitions

| Factor | Values | Rule |
|---|---:|---|
| `intent_fit` | 0–3 | 3 = query exactly matches a live tool or existing guide; 2 = close workflow; 1 = adjacent informational intent; 0 = irrelevant or unsafe to target. |
| `impression_band` | 0–3 | Build quartiles from this site's own 3-month non-zero impression distribution. Top quartile = 3; next = 2; next = 1; bottom = 0. Do not import an external traffic threshold. |
| `position_opportunity` | 0–3 | 3 = average position 4–15; 2 = 16–30; 1 = 1–3 or 31–50; 0 = over 50 or unavailable. Positions 1–3 are a defend/CTR task, not a ranking-growth task. |
| `ctr_gap` | 0–3 | Compare the row with the site's median CTR for the same position bucket and device. 3 = materially below site median; 2 = below; 1 = near; 0 = above or too little data. Store the bucket and median in `evidence_note`. |
| `route_readiness` | 0–2 | 2 = live canonical route directly satisfies intent; 1 = live adjacent route; 0 = hidden, missing, duplicate, or unclear route. |
| `internal_link_gap` | 0–2 | 2 = relevant page has no contextual category/guide/tool path; 1 = weak or generic path; 0 = clear path already exists. |
| `effort` | 1–3 | 1 = metadata/link/copy adjustment; 2 = substantive page section or measured evidence; 3 = new product capability, new research, or owner/legal dependency. |

### Decision buckets

| Score | Bucket | Default action |
|---:|---|---|
| 22+ | P0 | Validate intent manually, then schedule the smallest high-confidence change. |
| 16–21 | P1 | Add to the next SEO iteration with a named owner and success metric. |
| 10–15 | P2 | Keep in backlog; combine with a related P0/P1 when practical. |
| Below 10 | Observe | Recheck after another 28-day window; do not create a page solely for the query. |

No page should be created from a score alone. A new route requires: a distinct user job, a live tool or approved content deliverable, no cannibalization with an existing page, and owner approval.

## Analysis sequence

1. Validate dates, filters, row grain, and export completeness.
2. Map every exported page to its canonical live route. Keep redirects and hidden routes separate.
3. Cluster queries by task intent: compression, image format/resize, PDF, text/dev, typing, calculator subtopic, branded, and irrelevant.
4. Calculate site-owned position and device CTR baselines; do not use generic industry CTR curves.
5. Compare the 28-day window with the matching final 28 days inside the 3-month dataset and with the preceding 28 days when available.
6. Score only rows with enough evidence to explain the recommendation.
7. Produce a decision log containing the query/page evidence, proposed change, risk, owner, and review date.

## Common opportunity patterns

- High impressions, position 1–10, below-site CTR: test title/description alignment and SERP intent before changing body content.
- Position 4–15 with strong intent fit: improve the answer near the top, add contextual internal links, and verify index/canonical state.
- Position 16–30 with exact tool intent: check whether the ranking page is the intended canonical tool route.
- One query split across multiple pages: investigate cannibalization before adding content.
- Informational query ranking on a tool page: link to an existing guide only when the guide genuinely answers the query.
- Query points to a hidden or unfinished tool: keep it in the roadmap; do not link or publish a thin substitute.
- Apparent decline in the latest days: first account for Search Console finalization lag and day-of-week mix.

## Deliverables after data arrives

- Cleaned analysis CSV using the supplied schema.
- Top 20 opportunities with evidence and action type.
- Cannibalization and canonical-route exceptions.
- Topic coverage gaps that are supported by queries, not conjecture.
- A 28-day measurement plan for every approved change.
