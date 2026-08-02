# Removal, Hiding, and Consolidation Plan

This report is recommendation-only. No route, redirect, registry, sitemap, navigation, search, indexation, production logic, or code deletion was implemented.

## Decision summary

| Decision | Tool/route | Replacement | Proposed URL outcome | Preconditions |
|---|---|---|---|---|
| `CONSOLIDATE` | Car Payment `/calc/car-payment` | Auto Loan `/calc/auto-loan` | Permanent redirect after parity review | GSC query/landing data, backlinks, saved/shared URLs, input and result parity |
| `HIDE` | Background Remover `/tools/background-remover` | None yet | Keep current direct noindexed route | Privacy/processor contract, credentials, monitoring, abuse control, economics, artifact/quality tests |
| `HIDE` | PDF to Fillable `/tools/pdf-to-fillable` | None | Keep current direct noindexed route | Rotated/touch/keyboard placement, complex-PDF and cross-reader corpus |
| `HIDE` | Meme Generator `/play/meme-generator` | No direct replacement | Evaluate temporary noindex only after evidence review | Template rights/provenance, GSC/backlinks, demand/retention, product-fit decision |

No portfolio row is currently `REMOVE`. Unknown demand and missing backlink data make irreversible removal recommendations unjustified.

## Car Payment → Auto Loan consolidation

- **Why:** both implement the same payment intent; Auto Loan is the workflow superset with trade-in and comparison capabilities.
- **Replacement:** `/calc/auto-loan` after it preserves or improves every supported Car Payment input, default, label, result, and mobile state.
- **Redirect:** permanent 301/308 from `/calc/car-payment` to `/calc/auto-loan` only after GSC query overlap, landing traffic, backlinks, and parity are reviewed.
- **Sitemap:** remove Car Payment only when redirect ships and the destination is confirmed canonical/indexable.
- **Registry/navigation/category:** remove source entries and point any label/context to Auto Loan in the same release.
- **Internal links/search index:** rewrite all source links and remove the source search entry; do not rely on redirect chains.
- **Traffic/backlinks:** mandatory check first; preserve query-specific explanatory context on the destination if users arrive with car-payment intent.
- **Code:** delete the redundant component only after the redirect has operated safely and regression tests cover migrated inputs.
- **Migration:** preserve bookmarked URLs, equivalent defaults, and result semantics; clearly name trade-in/fees limitations.

## Hidden-tool plans

### Background Remover

Remain noindex, sitemap-excluded, and absent from registry discovery. File X-Ray or any capability recommender must also filter it. Do not delete the scaffold yet. Relaunch requires a truthful privacy data flow, processor/retention/deletion documentation, durable abuse protection, service ownership/monitoring, operational economics, and independently parsed PNG/alpha/quality results. If those requirements are rejected rather than deferred, revisit a `410` after checking backlinks and whether another local-first implementation can replace it.

### PDF to Fillable

Remain noindex and excluded from normal discovery. Ordinary field placement/export produced a real AcroForm, so removal is not justified. Prevent File X-Ray from exposing it while hidden. Graduate only after rotated pages, keyboard/touch placement, field semantics, complex PDFs, and major reader compatibility pass. If abandoned later, redirect to a relevant PDF hub only if that hub satisfies the same user intent; otherwise prefer a clear 410 after traffic/backlink review.

### Meme Generator

The main route is currently indexable and in the sitemap, so `HIDE` is a future action, not a description of current indexation. Before any noindex/removal action, establish rights for all 30 templates, inspect GSC/backlinks, and decide whether repeat use and brand fit justify maintenance. If retained, replace uncertain assets, narrow/curate the library, remove or justify the watermark, and improve flexible layout. If discontinued with no equivalent replacement, a 410 is more truthful than redirecting to an unrelated tool; preserve user-facing notice/migration only if saved template links have meaningful use.

## Alias and redirect recommendations

### `/files/image-resizer`

Keep the existing permanent 308 to canonical `/tools/resize-image`. Keep the alias out of sitemap, registry, category, navigation, and search. Check GSC/backlinks before ever retiring it. It is an alias, not an independent tool or indexable duplicate.

### Former `/generate/*` developer routes

Retain the five permanent redirects to equivalent `/dev/*` destinations pending GSC/backlink review. They are intent-equivalent aliases; avoid chains and ensure all internal links use the destination.

### `/convert/pdf-to-word`

The current permanent redirect to `/files` is not intent-equivalent. Check GSC/backlinks. If meaningful demand exists, restore a truthful, tested replacement before redirecting. If no replacement will exist and evidence shows no important migration need, evaluate `410`; do not silently send users to an unrelated hub.

## Other overlap requiring evidence before action

- **Paycheck / Take-Home Pay:** share one repaired, versioned tax engine; choose a canonical only after query evidence. Both are currently `FIX`, so consolidation cannot precede correctness.
- **JPG to PDF / PNG to PDF:** shared code does not prove duplicate user intent. Retain pending GSC overlap and a truthful unified Image-to-PDF workflow.
- **Unit converters:** broad, dimension, and pair routes may represent distinct tasks. First restore complete directory discovery; then use landing-query evidence to decide whether pair routes deserve independent indexation.
- **Typing Test / WPM Test:** strong naming overlap, but both need behavior repairs/evidence before canonical selection.

## Execution checklist for any future removal or consolidation

1. Export GSC landing pages, queries, clicks, impressions, and positions; inspect backlinks and referral logs.
2. Confirm a relevant replacement and migration parity. If none exists, choose between a truthful 404/410 rather than a generic redirect.
3. Implement redirect/noindex/canonical changes as one reviewed SEO release.
4. Update sitemap, registry, navigation, category data, related links, command-palette index, Smart Converter/File X-Ray capabilities, and tests atomically.
5. Preserve user intent, bookmarks, input defaults, and expected output semantics.
6. Monitor crawl, redirect, error, and destination behavior; delete code/backend infrastructure only after the transition is proven.

## 2026-08-01 containment addendum

This remediation wave executed safe containment, not deletion or consolidation, for five verified P0/P1 tools: Background Remover, HEIC to JPG, Poker, Take-Home Pay, and Paycheck. Their code remains for future repair, but public discovery, sitemap inclusion, indexation, operational forms, structured application data, and inbound public links are disabled. Relaunch still requires the evidence listed in `p1-remediation-report.md`. Car Payment consolidation, Meme Generator disposition, PDF-to-Fillable graduation, alias handling, and irreversible route decisions remain future evidence-gated work; this wave did not merge or redirect them.
