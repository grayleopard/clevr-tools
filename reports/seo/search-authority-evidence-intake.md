# Search, link, and owner evidence intake

Status as of 2026-08-02: no raw Google Search Console (GSC) Performance export, GSC Links export, third-party backlink/referring-domain export, or owner-answer file was located in the accessible repository search, excluding the user-owned `outputs/` directory. The files present here are requests/templates only. This is an availability finding, not evidence that the data does not exist elsewhere.

Until a source file passes the checks below, every demand, backlink, referring-domain, authority, and owner-approved trust value is `UNKNOWN`—never zero, inferred, or estimated from a public tool.

## What is needed

| Evidence | Required scope | Located | Usable now |
|---|---|---:|---:|
| GSC Queries, 28 complete days | Web; unfiltered; exact inclusive dates; property noted | No | No |
| GSC Pages, 28 complete days | Same snapshot and settings as Queries | No | No |
| GSC Queries, 3-month preset | Web; unfiltered; exact displayed dates; same end date | No | No |
| GSC Pages, 3-month preset | Same snapshot and settings as Queries | No | No |
| GSC Links | Top linking sites, top linked pages, latest links, more sample links; current snapshot | No | No |
| Third-party link index, if licensed | Referring domains and backlinks, with vendor/snapshot metadata | No | No |
| Owner answers | Completed, attributable answers to the response form below | No | No |

GSC UI tables are samples, not exhaustive datasets. Google documents a 1,000-row representative-table limit for report exports; the API supports paged requests up to 25,000 rows but still does not guarantee all rows. GSC's Links report is also a sample rather than a complete link inventory. [Google export guidance](https://support.google.com/webmasters/answer/12919797?hl=en), [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), and [Links report](https://support.google.com/webmasters/answer/9049606?hl=en) are the controlling sources.

## Exact request to the owner

> Please provide one unedited SEO evidence package. Do not sort, filter, combine, or overwrite the raw exports. If an item is unavailable, reply `NOT_AVAILABLE` and identify the system/account owner; do not substitute a screenshot, rounded number, or estimate.
>
> **1. GSC Performance.** For the `clevr.tools` Domain property (`sc-domain:clevr.tools`), or the canonical URL-prefix property `https://www.clevr.tools/` if the Domain property is unavailable, export **Performance → Search results** with Search type **Web** and no query, page, country, device, or search-appearance filters. Use the newest finalized end date, and use it for both windows: (a) the last **28 complete, inclusive days** and (b) the **Last 3 months** preset. For each window, provide raw CSV exports of the **Queries** and **Pages** tabs. Include a note or screenshot showing the property, exact start/end dates, search type, filters, account time zone, and export time. Countries, Devices, Search appearance, and Dates tabs are welcome supporting exports but do not replace Queries and Pages.
>
> **2. GSC Links.** From the same property, export the current **Top linking sites**, **Top linked pages**, **Latest links**, and **More sample links** data, plus top linking text if available. Include the export date/time and property. These are point-in-time samples; do not label them as a complete backlink count.
>
> **3. Third-party link data, only if a licensed source is already used.** Export raw backlink and referring-domain data from the named vendor (for example Ahrefs, Semrush, or Moz). Preserve source URL, target URL, referring domain, follow/nofollow or equivalent attribute, first/last-seen fields when supplied, and the vendor's export timestamp/database date, account tier, and report settings. Vendor authority/traffic metrics remain vendor estimates and must retain their vendor name and snapshot date.
>
> **4. Owner answers.** Complete the ten questions in [owner-information-needed.md](./owner-information-needed.md#minimum-owner-response-form). For every answer, identify the responding role, the supporting record or system of record, and any public wording approved for use. Use `UNKNOWN` where a fact has not been established; do not infer it from source code, branding, or an empty policy page.

Suggested package names:

```text
seo-evidence-YYYY-MM-DD/
  README.md                       # property, dates, filters, export timestamps, owner role
  gsc-28d-YYYY-MM-DD_to_YYYY-MM-DD/queries.csv
  gsc-28d-YYYY-MM-DD_to_YYYY-MM-DD/pages.csv
  gsc-3m-YYYY-MM-DD_to_YYYY-MM-DD/queries.csv
  gsc-3m-YYYY-MM-DD_to_YYYY-MM-DD/pages.csv
  gsc-links-YYYY-MM-DD/            # named raw GSC Links exports
  vendor-links-<vendor>-YYYY-MM-DD/ # only if supplied
  owner-response-YYYY-MM-DD.md
```

## Intake and normalization rules

1. Hash every received raw file (SHA-256) and record its original filename, byte size, export time, and access source. Keep raw files read-only.
2. Confirm the Performance property, `Web` type, dates, filters, and date finalization before reading metrics. GSC dates use Pacific Time in the API; retain the source's displayed dates rather than converting them. [API reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
3. Preserve UI Queries and UI Pages as separate grains. They cannot be joined into page-query pairs. Use [`gsc-analysis-template.csv`](./gsc-analysis-template.csv) only for normalized working copies and retain `source_file` and `source_row_number`.
4. Keep chart totals separate from visible-row sums. Missing/anonymized query rows, a `~`/`-` converted to zero in an export, or table truncation must never be treated as no demand. [GSC data notes](https://support.google.com/webmasters/answer/96568?hl=en)
5. Treat GSC Links and third-party link indexes as different datasets. Reconcile duplicates only with documented URL normalization; never sum their totals as if they measured the same crawl.
6. Retain raw vendor labels and dates for any authority metric. Never call a vendor score a Google ranking factor or a fact about all links.
7. An owner answer becomes publishable only through the evidence-register lifecycle in [owner-information-needed.md](./owner-information-needed.md#evidence-register-template): `EVIDENCE_ATTACHED` then `OWNER_APPROVED`.

## Minimum acceptance checks

| Dataset | Accept only when | Otherwise |
|---|---|---|
| 28-day GSC | 28 inclusive completed dates; Queries and Pages share property/end date/settings; raw headers and metrics intact | Mark `INCOMPLETE`; no comparison or demand score |
| 3-month GSC | Exact preset dates recorded; same finalized end date as 28-day window; raw Queries and Pages intact | Mark `INCOMPLETE`; do not invent a matching period |
| GSC Links | Property and snapshot time recorded; source slice names retained | `UNKNOWN` link profile; no removal/redirect decision based on absence |
| Vendor export | Vendor, account tier, database/report date, fields, and raw file retained | `UNKNOWN` for vendor-only fields |
| Owner response | Named responding role, evidence pointer, and approved public wording where applicable | Keep claim `PROPOSED` or `UNKNOWN` |

No route retirement, consolidation, promotional claim, or benchmark-outreach assertion should rely on an absent export.
