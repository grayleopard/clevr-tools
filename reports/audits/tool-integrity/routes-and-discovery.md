# Routes, Discovery, Duplication, and Search Audit

Audit date: 2026-08-01

Scope: route/registry integrity and discovery surfaces only. Production code was not changed. Demand is `UNKNOWN` for every portfolio item because no GSC export was supplied to this workstream.

## Verdict

The route registry itself is internally consistent: all 114 registered routes are unique, all have an `app/**/page.tsx`, all declare a self-canonical, and every related-tool slug resolves to a registered tool. The sitemap projects all 112 live registered tools and the two Play products while excluding the two hidden tools. Search projects all 112 live registered tools and excludes both hidden tools.

Discovery is not complete, however. Twenty-two live converter routes are missing from the Calculate category data; three of those have no crawlable internal inbound link outside the sitemap. The homepage Smart Converter advertises three format actions by sending users to a tool whose declared input does not match the detected file, including a HEIC-to-PNG action with no HEIC-to-PNG implementation. File X-Ray can also surface the hidden PDF-to-Fillable route even though registry, sitemap, category, navigation, and search filtering all hide it.

## Exact merge fields for the 116-row portfolio matrix

The following rules are exhaustive and uniquely determine the requested route/discovery columns for every portfolio row. Here, `navigation_discoverable` means a direct global-navigation featured link, not merely reaching a category from the nav. `category_discoverable` means a rendered card/link on the relevant category directory. The command palette is client-rendered and is recorded separately as `search_discoverable`.

### Base groups

| Portfolio group | Rows | registry_status | indexable | sitemap_included | navigation_discoverable | category_discoverable | search_discoverable | Canonical |
|---|---:|---|---|---|---|---|---|---|
| Registered and live (`live !== false`) | 112 | `live` | `true` | `true` | `false` unless listed below | `true` unless listed below | `true` | self |
| AI Background Remover `/tools/background-remover` | 1 | `hidden` | `false` | `false` | `false` | `false` | `false` | self; `noindex,follow` |
| PDF to Fillable PDF `/tools/pdf-to-fillable` | 1 | `hidden` | `false` | `false` | `false` | `false` | `false` | self; `noindex,follow` |
| Numble `/play/numble` | 1 | `unregistered-live-product` | `true` | `true` | `true` | `true` (Play) | `false` | self |
| Meme Generator `/play/meme-generator` | 1 | `unregistered-live-product` | `true` | `true` | `true` | `true` (Play) | `false` | self |

The 30 Meme Generator template variants are intentionally not portfolio rows. Each variant is `noindex,follow`, has a self-canonical, and is absent from the sitemap.

### Direct global-navigation overrides (`navigation_discoverable=true`)

All other registered rows retain `navigation_discoverable=false`.

| Surface | Routes |
|---|---|
| Files | `/compress/image`, `/tools/gif-compressor`, `/tools/resize-image`, `/convert/pdf-to-jpg`, `/tools/merge-pdf`, `/compress/pdf` |
| Text & Code | `/text/word-counter`, `/dev/json-formatter`, `/generate/password`, `/generate/qr-code`, `/dev/base64`, `/dev/color-picker` |
| Calculate | `/calc/salary`, `/calc/calorie`, `/calc/take-home-pay`, `/calc/sleep`, `/calc/auto-loan`, `/calc/credit-card-payoff`, `/calc/odds-calculator` |
| Time | `/time/timer`, `/time/stopwatch`, `/time/pomodoro` |
| Type | `/type/typing-test`, `/type/wpm-test`, `/type/keyboard-tester`, `/type/typing-practice` |

This is 26 direct navigation links among the 112 live registered tools. Numble and Meme Generator are additionally linked directly from the Play menu.

### Category-directory overrides (`category_discoverable=false`)

The following 22 live registered routes are in the registry, sitemap, and command-palette search, but are absent from every `siteCategories[].subcategories[].slugs` list and therefore from `/calculate`:

| Tool | Route |
|---|---|
| Time Converter | `/calc/convert/time` |
| Pressure Converter | `/calc/convert/pressure` |
| Energy Converter | `/calc/convert/energy` |
| Frequency Converter | `/calc/convert/frequency` |
| Fuel Economy Converter | `/calc/convert/fuel-economy` |
| Angle Converter | `/calc/convert/angle` |
| Power Converter | `/calc/convert/power` |
| Force Converter | `/calc/convert/force` |
| CM to Inches Converter | `/calc/convert/cm-to-inches` |
| KG to Pounds Converter | `/calc/convert/kg-to-lbs` |
| Miles to Kilometers Converter | `/calc/convert/miles-to-km` |
| Fahrenheit to Celsius Converter | `/calc/convert/fahrenheit-to-celsius` |
| Feet to Meters Converter | `/calc/convert/feet-to-meters` |
| Ounces to Grams Converter | `/calc/convert/oz-to-grams` |
| Liters to Gallons Converter | `/calc/convert/liters-to-gallons` |
| Inches to Feet Converter | `/calc/convert/inches-to-feet` |
| Meters to Feet Converter | `/calc/convert/meters-to-feet` |
| Cups to Milliliters Converter | `/calc/convert/cups-to-ml` |
| Pounds to KG Converter | `/calc/convert/lbs-to-kg` |
| Millimeters to Inches Converter | `/calc/convert/mm-to-inches` |
| Acres to Square Feet Converter | `/calc/convert/acres-to-sq-ft` |
| Mbps to Gbps Converter | `/calc/convert/mbps-to-gbps` |

Accordingly, 90 of 112 live registered tools are category-discoverable. This is a **P2 discovery defect** affecting 22 rows. Add an explicit, complete converter section or generated directory later; do not infer removal from absence alone.

## Defects and evidence

### P1 — Smart Converter exposes a HEIC-to-PNG action with no matching implementation

- `components/home/SmartConverter.tsx` declares HEIC actions `to-jpg` and `to-png`.
- `getRoute("heic", "to-png")` falls through to `/convert/jpg-to-png`.
- `/convert/jpg-to-png` declares JPG/JPEG input and its drop zone accepts only `.jpg,.jpeg`; its output naming also strips only `.jpg`/`.jpeg`.
- Independent file-tool evidence in `files-images-pdf.md` records the browser HEIC decoder hanging even on the dedicated HEIC-to-JPG route. There is no separate HEIC-to-PNG processor/route to support the homepage promise.

Recommended product action: remove this action from the Smart Converter until a tested HEIC-to-PNG implementation exists, or route it through a real HEIC decoder and validate the PNG artifact. Recommended SEO action: none; this is a product-routing defect, not a new route request.

### P2 — Smart Converter uses input-mismatched routes for two other actions

- JPG `to-webp` routes to `/convert/png-to-webp`, whose public page and drop zone declare PNG input.
- WebP `to-jpg` routes to `/convert/png-to-jpg`, whose public page and drop zone declare PNG input.
- The module-level file handoff bypasses the drop-zone accept filter, so a browser-decodable handed-off file may still process; after reset or direct arrival, the destination page does not support the same source format it was chosen for. Output naming is also based on the destination page's expected source extension.

Recommended product action: give Smart Converter only actions backed by a route whose accepted input, copy, reset path, filename handling, and artifact tests match the detected file. This is required before treating “drop any file and receive the correct available actions” as the central proposition.

### P2 — 22 live converters are absent from the Calculate directory

Evidence: `lib/site-structure.ts` lists eight broad converter slugs but omits the 22 routes enumerated above; `app/calculate/page.tsx` renders only those configured subcategory slugs. The “See all converters” link points back to `/calculate`, where those tools still do not appear.

Three routes are crawlable-internal-link orphans (present in the sitemap and client-side search, but with no category card, global-nav link, or static/related inbound anchor found):

- `/calc/convert/frequency`
- `/calc/convert/fuel-economy`
- `/calc/convert/angle`

`/calc/convert/miles-to-km` is also absent from category/related data but does have a hard-coded inbound link from the Length Converter page. Search is useful to people but does not substitute for crawlable anchors because the command palette renders buttons and calls `router.push`.

### P2 — hidden PDF-to-Fillable can leak through File X-Ray recommendations

The normal filters work: hidden tools do not appear in the sitemap, site categories, global navigation, registry related-tool panels, or command-palette search. However:

- `lib/xray/claude-prompt.ts` explicitly permits `pdf-to-fillable` as a suggested action.
- `components/xray/FileXRay.tsx` maps that action to `/tools/pdf-to-fillable` and opens it.
- File X-Ray is mounted on eight live PDF-related routes (`/compress/pdf`, `/convert/pdf-to-jpg`, `/convert/jpg-to-pdf`, `/convert/png-to-pdf`, `/convert/word-to-pdf`, `/tools/merge-pdf`, `/tools/split-pdf`, `/tools/rotate-pdf`).

This is not a crawl/indexation leak—the suggestion is a client button and the destination is `noindex`—but it is a user-facing hidden-tool filtering defect. Remove hidden slugs from the model's allowed action set or validate suggestions against the live registry before rendering.

## Sitemap, indexability, canonical, and route-tree evidence

- `app/sitemap.ts` emits 132 URLs: home, About, Privacy, Play, both Play products, five category pages, 112 live registered tools, Blog, and eight blog posts.
- Both `live:false` tools are omitted from the sitemap and use `hiddenToolRobots()` to emit `noindex,follow`.
- `app/robots.ts` otherwise allows crawling and points at the canonical sitemap.
- All 114 registered routes have a corresponding page source and self-canonical. Numble and the Meme Generator also have self-canonicals.
- Registry slug and route values are unique. All registered related-tool slug references resolve, none point to a hidden tool, and none self-reference.
- No broken registry related-tool target was found. This does not claim that every runtime-generated AI recommendation or every future dynamic value is valid.

## Image Resizer route determination

`/files/image-resizer` is not a second implementation and must not receive a portfolio row. It is a legacy alias in `next.config.ts` that permanently redirects to the sole registered implementation, `/tools/resize-image`. A runtime HEAD request returned `308 Permanent Redirect` with `Location: /tools/resize-image`.

Recommendation:

- Keep `/tools/resize-image` as the canonical/indexable route.
- Keep `/files/image-resizer` out of the registry, sitemap, navigation, category cards, and search index.
- Retain the permanent redirect while backlinks or old URLs may exist. A 308 is semantically permanent; use a 301 later only if deployment/SEO operations require that exact status.
- Check GSC and backlink exports before ever removing the alias.
- Update the stale internal `reports/seo/tool-inventory.md`, which still describes both as tools; this is report debt, not a production duplicate.

## Other redirects and broken-route candidates

The five former `/generate/*` developer-tool routes permanently redirect to their `/dev/*` canonicals. Their destinations are semantically equivalent; retain them pending GSC/backlink review. `/convert/pdf-to-word` permanently redirects to `/files`, but the destination does not perform PDF-to-Word conversion. If the removed route has meaningful demand/backlinks, restore a truthful replacement; otherwise prefer a deliberate `410` over an unrelated hub redirect. Do not change it without traffic/backlink evidence.

## Duplicate-intent recommendations

Demand data is unavailable, so only implementation/intent evidence supports these recommendations:

| Routes | Finding | Recommendation |
|---|---|---|
| `/calc/car-payment` and `/calc/auto-loan` | Same core payment formula and same user intent; Auto Loan is a strict workflow superset with trade-in and term comparison. | `CONSOLIDATE` Car Payment into Auto Loan after GSC/backlink review; preserve equivalent inputs and use a permanent redirect. |
| `/calc/paycheck` and `/calc/take-home-pay` | Same net-pay/tax intent with pay-period versus annual entry framing. | Plan one calculator with input-mode switching; choose the canonical only after GSC/backlink review. Both require formula repair before consolidation. |
| `/convert/jpg-to-pdf` and `/convert/png-to-pdf` | Shared `ImagesToPdf` implementation, but format-specific landing intent and different declared acceptance remain. | Do not consolidate on code reuse alone. Verify GSC query overlap and conversion paths; if unified later, migrate both to a truthful Image-to-PDF workflow with permanent redirects. |
| `/calc/unit-converter`, broad `/calc/convert/{dimension}`, and pair-specific converter routes | Overlapping capabilities but potentially distinct task/query intent. | Retain provisionally; repair directory discovery first, then use GSC landing/query data to decide whether pair-specific routes deserve independent indexation or should 301 to preconfigured broad converters. |
| `/type/typing-test` and `/type/wpm-test` | Strong naming/search-intent overlap. | Defer product classification to behavior evidence; compare GSC queries before selecting a canonical. |

## Discovery surface summary

- Registry: 114 rows, 112 live and 2 hidden; unique slugs/routes.
- Actual portfolio: 116 rows after Numble and Meme Generator.
- Search: 112/112 live registered tools; 0/2 hidden tools; neither unregistered Play product.
- Category directories: 90/112 live registered tools; both Play products appear on Play.
- Direct global navigation: 26/112 live registered tools plus both Play products.
- Sitemap/indexable: 112/112 live registered tools plus both Play products; hidden tools excluded/noindexed.
- Related-tool data: every referenced slug is valid and live; hidden tools are not referenced. Three live converters remain crawlable-link orphans because they are omitted from category data and have no other static inbound anchor.
- Smart Converter: useful central concept, but not yet trustworthy enough to be the central product proposition because three advertised action/destination contracts are inconsistent and HEIC-to-PNG has no matching implementation.

## Verification and remaining gaps

Evidence used: direct source inspection of `lib/tools.ts`, `lib/site-structure.ts`, `lib/navigation.ts`, `lib/search-index.ts`, `lib/search.ts`, `app/sitemap.ts`, `app/robots.ts`, `next.config.ts`, tool pages, Smart Converter, File X-Ray, and shared related-tool components; registry projections executed through TypeScript transpilation; runtime HEAD verification of the Image Resizer alias.

No new repository test was added by this workstream. Existing `tests/search-navigation.test.mjs` already asserts that search contains every live tool, exact-name searches resolve, key aliases select the expected route, and header featured entries are live. Runtime GSC coverage, external backlinks, production crawl logs, public ranking/query overlap, and every dynamic File X-Ray response remain `UNVERIFIED`.
