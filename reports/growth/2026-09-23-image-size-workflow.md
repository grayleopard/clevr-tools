# Growth sprint: image-size workflow

## Baseline and decision

Search Console's latest available 28 complete days (August 25-September 21, 2026) show 17 organic clicks and 20.6K impressions sitewide. `/convert/pdf-to-jpg` has 29 impressions; Image Compressor is outside the top 50 pages by impressions, so its exact page-level baseline is **UNKNOWN**. The earlier [research brief in PR #35](https://github.com/grayleopard/clevr-tools/pull/35) selected reliable file workflows for a bounded product test, not a new route family.

This sprint improves `/compress/image` for the existing job of meeting a destination's file-size limit. Competitors already offer target-size compression, so this is a completion-quality bet, not an unsupported claim of a new search niche. The existing quality-only flow remains the default. No title, canonical, route, FAQ schema, or metadata was changed.

## Cohort and gate

| URL | Priority / confidence | Reliability gate | Intervention |
| --- | --- | --- | --- |
| `/compress/image` | P2 / medium; first-party demand and completion data unknown | Eligible with documented edge limits | Optional target in KB, actual met/missed feedback, browser test of downloaded bytes |
| `/blog/compress-images` | Index-discovery check / medium | Supporting guide; no unsupported performance claim | Live tool-to-guide link already released; indexing requested in Search Console |
| `/blog/convert-pdf-to-jpg` | Index-discovery check / medium | Supporting guide; no unsupported performance claim | Live tool-to-guide link already released; inspection found discovered-not-indexed |

Search Console URL Inspection still showed both guides as **Discovered - currently not indexed**, with no recorded crawl, after the new contextual links went live. The image guide's indexing request was confirmed as added to a priority crawl queue. The PDF guide request was started, but the Mac locked before its completion could be confirmed; request status is **UNKNOWN**. Do not repeatedly request either URL. This is an indexing signal check, not evidence that Google will index or rank them.

## Implementation and truth boundary

- The Image Compressor sidebar accepts an optional whole-number target from 10 to 50,000 KB. Blank means the prior quality-only behavior.
- The existing browser-only compression library receives the target as `maxSizeMB`; it may adjust quality and dimensions to try to meet the target. The interface deliberately says **aim for**, not **guaranteed**.
- Result status compares the actual output byte count with the requested byte threshold. Single-file results report under/above; batch results report how many outputs met the target. Invalid input blocks processing rather than silently using a different setting.
- One concise on-page paragraph explains the task and limitations. There are no new SEO routes or public benchmark claims.

## Verification

- Production build: passed, 175 pages generated.
- TypeScript: passed.
- ESLint: passed, no warnings or errors in this run.
- Node suite: 120 passed, 2 skipped, 0 failed.
- Focused Chromium E2E: 2 passed. Existing Image Compressor lifecycle/download test still passes; new mobile test covers invalid input, 100 KB success, 10 KB miss, fresh download after changing targets, and horizontal overflow.
- Full Chromium Playwright suite: 397 passed, 6 skipped, 0 failed.
- Deterministic 768×768 JPEG test input: 598,590 bytes. At 100 KB, output was 80,833 bytes and status said under target. At 10 KB, output was 20,884 bytes and status said above target. These are fixture-specific test results, **not** marketing performance claims.
- Bundle budget: passed for all measured routes and shared chunks; `/compress/image` was 1,101.2 KiB against a 2,200 KiB limit.

## Release and measurement

Deployment commit/date: **PENDING**. This branch is not production until reviewed, merged, and a production deployment is verified.

| Checkpoint | Fields |
| --- | --- |
| Day 0 | Production commit, route response, output bytes at success and miss fixtures, canonical and guide links |
| Day 7 | Guide URL inspection state, Image Compressor impressions and query mix, valid-input/start/success/download events, target-setting feedback |
| Day 28 | Page-level clicks, impressions, CTR and position by comparable query/device mix; completed downloads and errors; use of target setting if privacy-safe measurement becomes available |
| Day 90 | Durable qualified organic visits, completed tasks, repeat/direct visits, editorial references and referral visits; decide whether to expand the workflow |

## Unknowns and owner actions

Image Compressor's exact Search Console page metrics, actual product-event counts, target-setting usage, and all future ranking effects are **UNKNOWN**. The image-compression benchmark remains `MEASURED_REVIEW_PENDING`: a named human must review 76 visual cases and a second person must reproduce eight before any public performance claim or evidence-led outreach. Four previously sent publisher pitches should not be resent. The owner should approve a specific new outreach batch only after a reviewed asset is ready.

Reference: the installed [`browser-image-compression` API](https://github.com/Donaldcwl/browser-image-compression/blob/master/README.md) exposes `maxSizeMB`, iteration, and quality options. Its behavior is best-effort; the product checks actual bytes instead of treating the option as proof of a cap.
