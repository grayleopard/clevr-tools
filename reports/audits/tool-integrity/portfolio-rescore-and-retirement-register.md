# Portfolio Re-score and Retirement Register

Audit state: 2026-08-02

This is a portfolio decision record only. It does not change a route, registry,
sitemap, navigation surface, canonical, redirect, indexation setting, product
behavior, or source file.

## Decision outcome

| Recommendation | Count |
|---|---:|
| FLAGSHIP | 3 |
| KEEP | 37 |
| FIX | 48 |
| HIDE | 13 |
| CONSOLIDATE | 14 |
| REMOVE | 1 |
| Total | 116 |

The three flagships remain Image Compressor, PDF to JPG Converter, and Merge
PDF. They are the most defensible local-first, parsed-artifact workflows; this
is a strategic call, not a demand ranking.

The matrix is re-scored on exactly these weighted dimensions:

| Dimension | Maximum |
|---|---:|
| Functional correctness | 30 |
| Demonstrated demand | 25 |
| Differentiation | 20 |
| Strategic fit | 15 |
| Maintainability | 10 |

GSC, referrals, conversions, and backlink exports were not supplied. Every
GSC field, demand status, demand score, backlink evidence field in the
companion ledger, and 100-point total therefore remains UNKNOWN. The companion
ledger's known_non_demand_subtotal_75 is only C + differentiation + fit +
maintainability; it is not an overall score and must not be used as a demand
proxy.

The existing matrix's functional and verification fields remain historical
evidence. A P0/P1 remediation result can support a later promotion, but it
does not silently turn a historical FAIL or UNVERIFIED row into a KEEP. Failed
or unverified core functions are never classified KEEP or FLAGSHIP in this
rescore.

## High-confidence portfolio calls

### File and PDF core

- Image Resizer remains FIX. The canonical route is /tools/resize-image.
  /files/image-resizer is an existing permanent 308 alias, not a second
  implementation or a second portfolio row. Keep that alias/canonical
  relationship; do not create, consolidate, or score a duplicate route. The
  prior GIF/MIME defect was remediated by rejection, but cross-browser static
  image and memory evidence is still needed before a later KEEP decision.
- PDF to Fillable PDF remains HIDE, rather than REMOVE. The ordinary AcroForm
  fixture is useful evidence, but rotated placement, keyboard/touch operation,
  cross-reader behavior, and maintenance burden are not ready for public
  discovery. Keep its current hidden/noindex posture unless a dedicated
  evidence tranche proves it can graduate.
- AI Background Remover remains HIDE. The unconfigured backend scaffold has
  strategic adjacency to the local file portfolio, but no verified processor,
  retention/deletion, abuse-control, operating-economics, or parsed
  output-quality contract. It is not a valid flagship or re-launch candidate.
- HEIC to JPG, like Background Remover, is HIDE while contained. It must not
  be redirected to a non-equivalent conversion route or promoted on dormant
  decoder code.

### Play and templates

- Numble is HIDE from public promotion. Its P1 settings/hydration defects were
  remediated, but it remains an unregistered Play product without demonstrated
  retention, demand, or a committed product owner. A current-build core-game
  regression gate is required before reconsidering it.
- Meme Generator is the one REMOVE recommendation. Its exported PNG can be
  valid; removal is driven by undocumented template provenance/rights, a
  30-template maintenance surface, fixed zones and watermark, very weak
  strategic fit, and no demand evidence. Its 30 template URLs are variants of
  the one product, not extra portfolio rows.

### Sensitive and advisory-shaped tools

The rescore is deliberately conservative where an apparently correct formula
can still be inappropriate or misleading without review.

| Portfolio action | Routes | Why |
|---|---|---|
| HIDE | Body Fat, Due Date, Ovulation, Ideal Weight | Clinical, fitness, reproductive-health, or framing risk requires qualified review and explicit boundaries before public discovery. |
| HIDE | Odds, Poker | A responsible-gambling policy and scope are missing; Poker is also contained for its prior unreliable equity model. |
| HIDE | Take-Home Pay, Paycheck | Both are contained. A current, sourced, year-specific, jurisdiction-explicit shared payroll engine is a relaunch prerequisite. |
| HIDE | Invoice Generator | PDF artifact, tax/discount ordering, negative-total guardrails, persistence disclosure, and legal/tax review are still missing. |
| FIX | BMI, Calories Burned | Retain only as bounded estimates after qualified review, source/version labels, and non-diagnostic public copy. |
| FIX | Compound Interest, Loan, Savings Goal, Retirement, Investment Return, Down Payment | Preserve useful basic arithmetic, but repair input guards, assumptions, update ownership, and estimate-only financial boundaries before promotion. |

This does not treat ordinary arithmetic as regulated advice. It does prevent
the portfolio from promoting health, reproductive, gambling, tax/payroll,
financial-estimate, or invoice flows whose safety boundary is not evidenced.

## Consolidation register

Traffic, query, backlink, saved-link, and conversion evidence is UNKNOWN for
every source below. Functional evidence is from the matrix's tested status.
Each is a recommendation for a later, approved migration; no redirect,
registry edit, sitemap change, or source deletion is included in this work.

| Source | Functional evidence | Traffic/backlink evidence | Replacement | Proposed post-approval URL outcome |
|---|---|---|---|---|
| Car Payment /calc/car-payment | PARTIAL; same payment intent with less capability | UNKNOWN / UNKNOWN | Auto Loan /calc/auto-loan | One direct 301; no intentional 404 or 410 |
| CM to Inches /calc/convert/cm-to-inches | PASS | UNKNOWN / UNKNOWN | Length Converter /calc/convert/length | One direct 301; no intentional 404 or 410 |
| KG to Pounds /calc/convert/kg-to-lbs | PASS | UNKNOWN / UNKNOWN | Weight Converter /calc/convert/weight | One direct 301; no intentional 404 or 410 |
| Miles to Kilometers /calc/convert/miles-to-km | PASS | UNKNOWN / UNKNOWN | Length Converter /calc/convert/length | One direct 301; no intentional 404 or 410 |
| Fahrenheit to Celsius /calc/convert/fahrenheit-to-celsius | PARTIAL; absolute-zero guard still needed | UNKNOWN / UNKNOWN | Temperature Converter /calc/convert/temperature | One direct 301 after destination repair; no intentional 404 or 410 |
| Feet to Meters /calc/convert/feet-to-meters | PASS | UNKNOWN / UNKNOWN | Length Converter /calc/convert/length | One direct 301; no intentional 404 or 410 |
| Ounces to Grams /calc/convert/oz-to-grams | PASS | UNKNOWN / UNKNOWN | Weight Converter /calc/convert/weight | One direct 301; no intentional 404 or 410 |
| Liters to Gallons /calc/convert/liters-to-gallons | PASS | UNKNOWN / UNKNOWN | Volume Converter /calc/convert/volume | One direct 301; no intentional 404 or 410 |
| Inches to Feet /calc/convert/inches-to-feet | PASS | UNKNOWN / UNKNOWN | Length Converter /calc/convert/length | One direct 301; no intentional 404 or 410 |
| Meters to Feet /calc/convert/meters-to-feet | PASS | UNKNOWN / UNKNOWN | Length Converter /calc/convert/length | One direct 301; no intentional 404 or 410 |
| Cups to Milliliters /calc/convert/cups-to-ml | PASS | UNKNOWN / UNKNOWN | Cooking Converter /calc/convert/cooking | One direct 301; no intentional 404 or 410 |
| Pounds to KG /calc/convert/lbs-to-kg | PARTIAL; unsafe medical-dosing copy boundary | UNKNOWN / UNKNOWN | Weight Converter /calc/convert/weight | One direct 301 after copy parity; no intentional 404 or 410 |
| Millimeters to Inches /calc/convert/mm-to-inches | PASS | UNKNOWN / UNKNOWN | Length Converter /calc/convert/length | One direct 301; no intentional 404 or 410 |
| Acres to Square Feet /calc/convert/acres-to-sq-ft | PARTIAL; exact-factor correction needed | UNKNOWN / UNKNOWN | Area Converter /calc/convert/area | One direct 301 after destination parity; no intentional 404 or 410 |

### Mandatory execution boundary for every CONSOLIDATE row

1. Evidence gate: collect GSC landing/query data, a backlink export, external
   referral data if available, inbound internal-link inventory, and input,
   default, result, copy, mobile, and accessibility parity. UNKNOWN is not
   permission to infer no users or no links.
2. Replacement gate: keep the source live until the named replacement is
   canonical, indexable, and demonstrably accepts the source intent. Preserve
   only query parameters that the destination validates; do not blindly
   transfer form state.
3. URL outcome: after both gates, ship a single direct 301 from each source to
   its exact replacement. Do not use a 404 or 410 for an intent-equivalent
   consolidation, and do not send users through a hub or redirect chain.
4. Discovery boundary: in that same approved release, remove the source from
   the sitemap, tool registry, category/navigation/search projections, and
   every internal link; rewrite content links directly to the replacement.
5. User-migration boundary: the audit has no evidence of account data, saved
   URLs, or local browser state for these routes. Verify those facts first;
   provide a notice, compatible query mapping, or export path if any exists.
6. Code-deletion boundary: keep source implementation and regression coverage
   through direct-redirect and destination-parity verification. Delete a source
   page, registration, tests, and route-specific copy only after the agreed
   observation window shows the redirect and migrated inbound links are sound.

## Removal register

| Source | Functional and policy evidence | Replacement | Proposed URL outcome |
|---|---|---|---|
| Meme Generator /play/meme-generator plus 30 template variants | PARTIAL function evidence: mobile export made a decodable PNG. Demand, GSC, backlinks, referrals, and conversions are UNKNOWN. Asset provenance/rights are unverified; strategic fit and maintainability are low. | None. The Play hub is not intent-equivalent. | Keep current URLs until evidence gate. If approved, return 410 for the canonical and all template variants. Do not use 301 to /play and do not intentionally use 404. |

### Mandatory execution boundary for REMOVE

1. Before approval, collect the same GSC/backlink/referral/internal-link evidence
   as consolidation, and resolve the template asset provenance question. The
   current UNKNOWN evidence does not establish that removal is impact-free.
2. There is no honest replacement, so no 301 is appropriate. A 410 communicates
   intentional retirement once the gate is approved; a 404 is not the planned
   outcome.
3. In the approved removal release, remove the canonical route from sitemap,
   Play navigation/category projections, and all internal links. Template
   variants are already excluded from the sitemap, but every public/template
   link still needs removal. Meme Generator is unregistered, so there is no
   tool-registry entry to delete; confirm all non-registry projections instead.
4. Before returning 410, determine whether uploaded or locally persisted user
   data exists. The audit has no evidence that it does. If users could lose
   access to content, provide an appropriate notice or download window.
5. Do not delete the editor, canvas, template assets, route tests, or related
   content until the 410 behavior, link migration, evidence gate, and agreed
   observation window are complete. Delete only the Meme-specific surface;
   retain the shared Play hub and unrelated utilities.

## Evidence and uncertainty

- Correctness evidence comes from the matrix and its linked file/PDF,
  calculator, text/play, route/discovery, remediation, and independent-review
  reports. It is strong for named test cases, not proof of broad user demand.
- The risk posture is intentionally stricter for contained payroll, unconfigured
  server-side image processing, health/reproductive outputs, gambling, finance,
  invoice creation, and undocumented meme assets.
- The re-score does not claim traffic, backlinks, legal clearance, clinical
  approval, financial review, or cross-browser coverage that was not supplied.
- The detailed machine-readable mirror for all 116 rows is
  portfolio-rescore-ledger.csv. It must remain consistent with the scoring and
  recommendation columns in tool-integrity-matrix.csv.
