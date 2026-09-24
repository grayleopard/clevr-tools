# September 23 growth sprint: indexing and useful discovery

## Baseline and evidence

Source: first-party Google Search Console, `clevr.tools` domain property, Web search, reviewed September 23, 2026. Reporting was current through September 21; indexing report last updated September 20. Query rows are privacy-filtered and do not sum to page totals.

| Complete period | Clicks | Impressions | Average position |
| --- | ---: | ---: | ---: |
| September 15-21 | 3 | 2.33K | 25.1 |
| September 8-14 | 2 | 1.88K | 42.5 |
| Latest 28 days | 17 | 20.6K | 37.4 |
| Previous 28 days | 15 | 24K | 42.4 |
| June 22-September 21 | 41 | 56.9K | 44.5 |

The seven-day trend is up, while the 28-day impression trend is down. Neither sitewide average position nor a single week establishes a ranking cause. Mobile impressions fell from 8,342 to 6,338 over the compared 28-day periods; desktop fell from 15,485 to 14,128. The sitemap was processed successfully September 20 and reported 129 discovered pages. The indexing report showed 102 indexed and 87 not indexed, including 50 crawled-not-indexed and 11 discovered-not-indexed; these counts include redirects, noindex routes, assets, and URLs that are not a promotion target.

## Selected cohort

| URL | Evidence | Gate | Decision |
| --- | --- | --- | --- |
| `/calc/convert/data` | 7,878 impressions and 7 clicks in 28 days; average position 17.3, down from 13.8; 1,332 impressions and 2 clicks in the latest week | ELIGIBLE, covered by data-size truth tests | Inspect query and device intent before changing title or creating narrow conversion pages. |
| `/calc/amortization` | 426 impressions in the latest week versus 707 before; 2,831 versus 1,498 over 28-day periods | ELIGIBLE, but financial-estimate trust review required before promotion | Diagnose query-level changes and assumptions before editing. No claim that the weekly dip is permanent. |
| `/blog/compress-images` | Discovered-not-indexed; URL Inspection reported not on Google, no crawl, and no referring sitemap detected | ELIGIBLE only while tool and guide claims remain accurate | Add a contextual link from Image Compressor; inspect again after deployment. |
| `/blog/convert-pdf-to-jpg` | Discovered-not-indexed; listed with no last crawl | ELIGIBLE, with tested PDF-to-JPG core paths and acknowledged boundary gaps | Add a contextual link from PDF to JPG and remove unsupported numbers from adjacent tool guidance. |

The two tool-to-guide links are a narrow discovery and user-navigation change, not a guaranteed indexing fix. The existing sitemap generator includes both blog posts, and the Files hub and blog index already link to them. A successful sitemap does not guarantee indexing.

## Implemented intervention

- Linked the Image Compressor's practical guidance to the image compression guide.
- Linked the PDF-to-JPG tool's practical guidance to the PDF-to-JPG guide.
- Replaced unverified PDF-to-JPG percentage, DPI-control, and file-size promises with guidance matching the actual quality-only control and fixed render scale.
- Removed the image page's unsupported "no tracking" claim while retaining the local-file-processing description.
- Added primary BIPM and IEC definition links to the Data Size Converter's existing exact-value reference; its calculations and defaults are unchanged.
- No tool logic, metadata, routes, sitemap entries, or index directives changed.

## Live crawl and distribution checks

Checked September 23, before this branch was deployed:

- `https://clevr.tools/sitemap.xml` returns one permanent 308 redirect to `https://www.clevr.tools/sitemap.xml`; the destination returns 200 XML and contains both guides and both flagship tool URLs. Search Console last processed the submitted bare-host sitemap successfully September 20. This is not evidence of a broken sitemap.
- The live `/blog/compress-images` page returns 200 HTML with a self-referencing `www` canonical and a rendered H1. No robots exclusion appeared in the response headers or inspected HTML. The URL Inspection report nevertheless says it has not been crawled. A live Googlebot test and post-release reinspection remain necessary; there is no proven technical root cause yet.
- The Clevr AgentMail inbox had one sent publisher pitch after September 20 and no publisher replies as of this check. No new outreach was sent. Future batches require specific owner review.

## New-page decision

Do not publish a batch of new pages in this sprint. A candidate must solve a distinct user task, have verified demand or repeated user need, pass functionality and trust gates, and add value beyond existing routes. Research candidates, not approved builds: an image-upload size-budget workflow; a PDF-to-image quality and page-selection reference; and a decimal-versus-binary storage-size explainer tied to the data converter. Avoid one page per numeric conversion or upload limit. Published guide discoverability and the current 17 clicks per 28 days take precedence over URL growth.

## Verification and release

- Build: PASS, 175/175 static pages generated. Initial sandboxed attempt failed on Google Fonts DNS; the network-enabled retry passed. The build emitted an existing output-file-tracing-root warning.
- Lint: PASS, zero errors or warnings reported.
- Focused tests: PASS, 11/11 across data-size truth, SEO crawl remediation, and P2 flagship readiness.
- Generated HTML: PASS, the Image Compressor and PDF-to-JPG pages each contain their intended guide link.
- Data-size source test and post-update build: PASS. Focused suite now 12/12, lint again passed, and the production build again generated 175/175 static pages. The existing output-file-tracing-root warning remains.
- Deployment commit/date: not yet released. The review branch `codex/growth-guide-discovery` is based on refreshed `origin/main` at `f6236d4` (the merged security release). Do not describe these edits as live until reviewed and deployed.

## Measurement

| Checkpoint | What to inspect | Result |
| --- | --- | --- |
| Day 7 after deploy | URL Inspection and actual crawl/index status for both guides; referring internal links; tool-page render | Pending |
| Day 28 after deploy | Guide indexing, page-level impressions/clicks, data-converter query cohort and CTR by device, amortization query trend | Pending |
| Day 90 after deploy | Durable organic visits, qualified referrals/editorial links, task completion, revenue readiness | Pending |

Unknown: fresh Googlebot live URL tests, current referring domains, full GSC query coverage, analytics completion events, ad yield, and whether Google will choose to index either guide. Do not request mass indexing or infer an algorithmic penalty from the exclusion count. No outreach is authorized by this report.
