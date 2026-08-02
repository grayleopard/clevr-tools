# Tool Integrity Audit Schema

This schema is the shared reporting contract for every audit workstream. Evidence must distinguish direct execution, source inspection, automated assertions, authoritative external sources, and unverified assumptions.

## Portfolio unit

- One matrix row per registered tool in `lib/tools.ts`.
- Add separate rows for tool-like products not in the registry (`/play/numble` and `/play/meme-generator`).
- Treat meme template URLs as route variants of Meme Generator, not separate tools.
- Record `/files/image-resizer` as a route/discovery finding rather than inventing a tool row; the current route tree does not contain that page.

## Required classifications

- Recommendation: exactly one of `FLAGSHIP`, `KEEP`, `FIX`, `HIDE`, `CONSOLIDATE`, `REMOVE`.
- Verification: exactly one of `PASS`, `PARTIAL`, `FAIL`, `UNVERIFIED`, `NOT_APPLICABLE`.
- Severity: `P0`, `P1`, `P2`, `P3`, or blank when no defect applies.
- Demand: `UNKNOWN` unless supported by an actual GSC export or other explicitly identified evidence. Unknown demand never becomes a zero score by implication.

## Evidence standard

Every pass must name the tested input and observed output. Loading a route is not functional verification. A smoke test that only detects text is `PARTIAL` unless it independently validates the calculation or output artifact. File outputs must be opened or parsed before `output_verified=true`.

Environment limitations must not be treated as product failures. Record the environment, command, failure, and any independent browser evidence separately.

## Scoring

| Criterion | Weight |
|---|---:|
| Functional correctness | 30 |
| Demonstrated demand | 25 |
| Differentiation | 20 |
| Strategic fit | 15 |
| Maintainability | 10 |

Functional correctness, misleading privacy behavior, and corrupt output are hard gates. Scores support but do not override the recommendation rationale.

## Required CSV columns

`tool_name`, `route`, `category`, `registry_status`, `indexable`, `sitemap_included`, `navigation_discoverable`, `category_discoverable`, `search_discoverable`, `functional_status`, `verification_status`, `tested_inputs`, `expected_output`, `actual_output`, `output_verified`, `desktop_status`, `mobile_status`, `accessibility_status`, `privacy_model`, `external_dependencies`, `known_limitations`, `gsc_impressions`, `gsc_clicks`, `gsc_position`, `demand_status`, `correctness_score`, `demand_score`, `differentiation_score`, `strategic_fit_score`, `maintainability_score`, `total_score`, `recommendation`, `highest_defect_severity`, `defect_summary`, `evidence`, `recommended_seo_action`, `recommended_product_action`.

## Worker report format

For each assigned tool, provide:

1. Exact name, route, and registry state.
2. Inputs and edge cases exercised.
3. Expected and actual result.
4. Artifact or calculation validation performed.
5. Desktop, mobile, accessibility, privacy, and dependency observations.
6. Verification status, recommendation, severity, and scoring rationale.
7. Evidence references: source files, tests, temporary artifacts, and authoritative URLs.
8. Explicit gaps that remain unverified.
