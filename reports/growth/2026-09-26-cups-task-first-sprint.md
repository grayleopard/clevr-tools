# Cups and task-first tool layout sprint

## Baseline and selected cohort

Source: owner-authenticated Search Console Web Search data inspected September 26, 2026, complete days through September 24. Full baseline and query evidence: [September 26 review PR](https://github.com/grayleopard/clevr-tools/pull/40) (not yet merged when this sprint began).

| URL | Seven-day clicks / impressions | 28-day clicks / impressions / average position | Gate and opportunity score | Intervention |
| --- | ---: | ---: | --- | --- |
| `/calc/convert/cups-to-ml` | 0 / 851 | 0 / 851 / 14.6 | ELIGIBLE; 21/33, high confidence. New demand and fractional queries; reliable US-cup conversion; narrow UX fix. | Fraction presets, one reference table, shared compact header. |
| `/calc/convert/data` | 3 / 1,273 | 8 / 6,749 / 16.2 | ELIGIBLE after SI/IEC repair; 21/33, high confidence. Strongest measured demand, but recent content release needs isolation. | Shared compact header only; no title or unit-definition change. |
| `/calc/convert/speed` | 1 / 219 | 2 / 1,578 / 20.7 | ELIGIBLE; 18/33, medium confidence. Recent default change needs measurement. | Shared compact header only; no task/copy change. |

Scores apply the skill's demand, proximity, CTR gap, task value, reliability, trust, internal-link readiness, linkability, and effort dimensions. They are directional prioritization, not estimates of future traffic or stable rank. Cups' 851 impressions all occurred in the latest week; its 14.6 average position may shift as the query mix grows.

## Implementation and trust gates

- Added six common US-cup fraction buttons adjacent to the existing converter input. They set numeric values through the existing conversion path; they do not create new routes or change the conversion constants. The UI distinguishes the 236.588 mL US cup from the 250 mL metric cup.
- Removed the duplicate page-level Cups table and explanatory sections. The existing tool-registry copy now supplies the single fraction reference table below the converter; metadata and FAQ schema remain unchanged.
- Reduced shared tool-page breadcrumb/header spacing and display-title scale so the interactive workspace is visible earlier. Kept the existing `Ready to use` cue in a quieter style after a flagship regression test confirmed it is part of the current interface contract. Tool names, links, metadata, processing behavior, and category navigation are unchanged.
- Checked the PDF-to-JPG guide's discovery path without changing it: it is generated into the sitemap, has a canonical in the blog template, and is linked from the PDF tool, category, and blog index. Search Console still reported `Discovered - currently not indexed` with no recorded crawl on September 26. A code change is not justified from this evidence alone.
- No benchmark claims or outreach were published. Data Size and Speed content remain unchanged so their recent releases can be measured.

## Verification and release state

| Gate | Result |
| --- | --- |
| Production build | PASS; 175/175 static pages generated, including Cups and the PDF guide. |
| TypeScript | PASS as part of production build. |
| ESLint | PASS; zero warnings/errors. |
| Focused Cups browser tests | 2/2 PASS: 1920x1080 tool/input visibility, fraction values, one table; 390x844 no horizontal overflow. |
| Converter-family browser tests | 32/32 PASS. |
| Full browser regression suite | 399 PASS, 6 intentional skips, 0 failures on the final build. An earlier pre-fix run caught the removed readiness cue; it was restored and the full suite rerun. |
| Converter recovery and discovery/sitemap Node tests | 14/14 PASS. |
| Bundle budgets | PASS for all monitored routes and shared chunk. |
| Diff whitespace | PASS. |
| Live deployment | PENDING REVIEW; no deployed commit/date yet. Do not attribute future GSC changes to this sprint until merged and deployed. |

## Measurement

- **Day 7 after deployment:** confirm new layout and presets live; compare Cups/Data/Speed page-query impressions, clicks, CTR, and device mix with the pre-release windows; check PDF guide URL Inspection for first crawl and indexing status. Do not infer success from sitewide average position.
- **Day 28:** compare matched query/device cohorts and task completion, especially fraction-preset use if privacy-safe event tracking is available. Look for clicks, not just ranking shifts.
- **Day 90:** retain or revert the header treatment based on task completion and qualified organic sessions; assess relevant direct references to useful tool/reference URLs before widening work to more pages.

## Unknowns and owner actions

- GA4 task-start/success/download and fraction-preset usage are UNKNOWN; access to the analytics property or a privacy-safe aggregate export would let us judge completion rather than appearances alone. No new tracking was introduced in this sprint.
- The owner should assign someone to monitor the interim `clevr-tools@agentmail.to` correction/privacy inbox regularly and set up a durable monitored domain address when practical.
- The image-compression benchmark remains review-gated: the owner must designate a named human visual reviewer and an independent reproducer before any public claims or outreach based on it.
- If outreach resumes, the owner must approve the specific recipient list and message batch before anything is sent. No paid or reciprocal links.
- The owner can review the implementation PR and authorize deployment. After deployment, no manual sitemap resubmission or bulk `Validate Fix` action is warranted on current evidence.
