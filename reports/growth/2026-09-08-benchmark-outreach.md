# Image Benchmark Outreach Package

Date: 2026-09-08  
Status: **HOLD — owner review required; no benchmark claim or outreach is approved**

Scope: Image Compressor (`/compress/image`), GIF Compressor (`/tools/gif-compressor`), and the supporting image-size workflow guide. This package is for owner review only. It does not publish results, identify prospects, send messages, or authorize a link request.

This report intentionally omits exact private Google Search Console metrics, property/account details, and query exports. The prior owner-provided GSC link snapshot is qualitatively shallow: the reported sources are Product Hunt and saaslet.io, the links point to the homepage, and no benchmark/tool target URL is recorded. Treat that as a reason to earn a useful direct reference, not as a public authority claim.

## Decision

Do not start outreach. The automated benchmark run is substantial, but the release is not publication-ready. The owner must resolve the release identity, complete the human review gates, approve a public evidence package and exact claims, and approve a manually vetted message batch before any contact.

The useful asset is the reproducible benchmark plus a practical image-size budget workflow, not a generic SEO article or a request for backlinks. No measured percentage, quality conclusion, platform limit, superiority statement, or universal recommendation is included in the drafts below.

## Evidence Reviewed

| Evidence | Verified finding | Decision state |
| --- | --- | --- |
| `reports/seo/image-compression-benchmark-results-2026-08-04.md` | Release `2026-08-04-release-04` reports 76 frozen cases, 380 recorded runs, and passing automated output-contract checks, but is explicitly `MEASURED_REVIEW_PENDING`. | Internal evidence only |
| `benchmark-artifacts/image-compression/2026-08-04-release-04/manifest/run-manifest.json` | The package records a clean measured build and a verified served build for `e52c2202479ae9dae6556b465508840308df7d22`; the automated operator is recorded and the independent reviewer is pending. | Complete automated run; not approved |
| `benchmark-artifacts/image-compression/2026-08-04-release-04/review/visual-review-manifest.csv` | All 76 review rows are `PENDING_HUMAN`. | Open human gate |
| Release approval files | `review/release-approval.json` and `review/publication-gate.json` are absent. | Open owner gate |
| `reports/seo/ethical-benchmark-outreach-plan.md` and the Authority Playbook | Outreach must be selective, relevant, ownership-disclosed, correction-oriented, and free of paid, reciprocal, or mass-link tactics. | Process control |
| Current branch | `codex/september-growth-cohort` is at `c731d9618c0931ede4e828fccfb3c61d5a963394`, which is newer than and does not descend from the measured benchmark commit. The worktree also contains existing user changes. | Release-identity blocker |
| Existing image workflow changes | The branch contains an uncommitted image-size budget guide/linking update. It is not a deployed or approved asset yet; preserve it and do not describe it as live. | Owner review |

The release directory's README says “prepared, not run,” while its run manifest, raw/derived results, review manifest, and separate benchmark report describe a measured run. Reconcile that contradiction inside the immutable public package before approval. The root `outputs/` directory was not read or changed.

## Cohort And Scorecard

Demand, ranking proximity, and CTR gap are `UNKNOWN` for every row in this public report. No absence of page/query evidence is converted to zero, and no aggregate opportunity total is calculated.

| URL or asset | Task value | Reliability/trust evidence | Linkability | Internal-link state | Outreach disposition |
| --- | ---: | --- | ---: | --- | --- |
| `/compress/image` | 4/4: clear file-compression task | 4/5 for tested normal JPG/PNG/WebP, batch, partial-error, download, and stale-run paths; broader corpus remains partial. Trust is 1/4 until the benchmark and owner claims pass. | 3/3 if the immutable evidence package is public | Partial until the current branch content is committed, deployed, and inspected | **Eligible after release gates; hold now** |
| `/tools/gif-compressor` | 3/4: clear animated-GIF task | Structural output checks pass, but motion/appearance review is still open. Trust is 1/4 until visual review and owner approval. | 3/3 if contact sheets, original animations, and limitations are public | Partial; no demand or target-page link evidence is recorded here | **Eligible after GIF review; hold now** |
| `/blog/reduce-image-file-size` | 4/4: practical byte-budget workflow | The branch copy distinguishes upload budgets from web-performance budgets and avoids universal platform limits. It remains uncommitted and needs owner/editor review. | 3/3 as a useful companion guide, not as a substitute for the benchmark | Branch-only links; deployment unknown | **Support asset after merge/review** |

The cohort is intentionally small. Do not expand to calculator, platform-limit, or unrelated converter outreach from this package. Platform-limit content remains separately gated by the primary-source verification protocol.

## Exact Human Gates

1. **Choose the release identity.** Either rerun the benchmark on a clean, intentionally committed version of the current branch, or approve `release-04` as a historical result scoped only to its exact measured commit. Do not describe the `e52c220...` results as measurements of current `c731d96...` until the owner makes that decision and verifies compatibility or reruns the matrix. Preserve the existing uncommitted branch changes.
2. **Reconcile the evidence package.** Correct the stale release README, confirm the public package has the methodology URL, raw CSV, corpus/license manifest, scripts, environment manifest, derived data, review assets, failed/larger-output cases, limitations, and correction instructions. A local path is not a public evidence URL.
3. **Complete all 76 visual reviews.** A named human reviewer must mark every row `PASS` or `CONCERN`, add a UTC timestamp, and write notes for every concern. For stills, inspect the center and highest-error crops at 100%. For GIFs, inspect the 12 timestamp pairs and the original animation for timing, disposal, transparency, flicker, and loop completion.
4. **Complete independent reproduction.** A different person must reproduce at least 8 valid frozen case keys, preserve the settings and manifest context, and record matching hashes or documented variance in a file inside the release package. The independent reviewer cannot be the release owner or the recorded automation operator.
5. **Assign correction accountability.** Record a real monitored correction contact and the owner's response commitment. Do not use the approval template's placeholder contact unless the owner verifies that it is monitored and approves it for public use.
6. **Fill and run the approval gate.** Create `review/release-approval.json` from the template with the real release owner, approval time, build commit, visual reviewer, all 76 reviewed case keys, the independent reproduction case keys/evidence path, and correction contact. Run the approval script and require `APPROVED_FOR_PUBLICATION` plus a generated `review/publication-gate.json`.
7. **Approve the exact public wording.** The release owner must approve one scoped summary, the limitations, the relationship disclosure, and any claim copied into outreach. No result number from the measured report is approved merely because the automated checks passed.
8. **Approve the outreach batch.** For each recipient, verify an existing relevant page, read the community rules, write a recipient-specific relevance sentence, disclose ownership, and approve the exact message. The owner sends manually; Codex does not send email, forms, direct messages, or pitches.

## Claim Control

| Wording | State | Use |
| --- | --- | --- |
| “A controlled image-compression benchmark is under human review; no performance result is being claimed yet.” | Safe process wording | Internal owner update or an owner-approved progress note only |
| “The package tests four documented CC0 photographs across still-image formats and synthetic animated GIF cases, with repeated runs and disclosed environment details.” | Methodology fact; still requires release-owner approval | Approved release summary after package reconciliation |
| Any measured size reduction, SSIM, runtime, “quality 80” recommendation, or GIF preset endorsement | **BLOCKED** until the release gate passes | Do not place in outreach drafts or public copy now |
| “Works for every image,” “lossless,” “best,” “up to X%,” or competitor superiority | **BLOCKED** by scope and evidence limits | Never use for this sprint |
| Any current Gmail, Discord, Slack, Shopify, WordPress, or other platform upload limit | **BLOCKED** unless separately verified from the named first-party surface | Keep out of benchmark outreach |
| “Files stay in your browser,” “private,” or similar sitewide privacy wording | **BLOCKED** until the owner answers the privacy evidence form | Do not infer from the client-side implementation |

## Owner Review Form

Complete this before a target list is assembled:

```text
Release decision: [ ] rerun on current committed branch  [ ] historical release only  [ ] hold
Approved benchmark release ID:
Measured/build commit:
Public evidence URL:
Methodology URL:
Release owner and role:
Visual reviewer:
Independent reviewer:
Independent reproduction evidence path:
Verified correction contact:
Response commitment:
Approved one-sentence finding, or “no aggregate finding”:
Approved limitations:
Ownership/relationship disclosure:
Approved outreach batch size:
Owner approval date:
```

## Publisher-Type Slots

These are target types, not prospects. No person, publication, domain, or contact is fabricated here. The owner must fill an exact existing page URL before a slot becomes a candidate.

| Slot | Qualifying publisher page | Useful angle | Reject if |
| --- | --- | --- | --- |
| `T1` Web-performance, image-optimization, or CMS educator | Current page about image budgets, format choice, browser encoding, or GIF performance | Reproducible environment and corpus evidence that helps readers inspect tradeoffs rather than trust a universal setting | The page is a generic link roundup, stale, or sells followed placements |
| `T2` Frontend, browser, or codec practitioner | Current documentation, issue, or technical article about Canvas encoding, WebP/PNG behavior, GIF reduction, or browser performance | Raw cases, settings, hashes, and limitations invite technical correction or reproduction | The recipient has no matching technical page or the community bans unsolicited research links |
| `T3` Open-media, Wikimedia, library, or university digital-media maintainer | Current page about CC0 media reuse, image stewardship, or reproducible digital-media workflows | Invite correction of corpus attribution, licensing records, or methodology; make no endorsement implication | The contact has no corpus/licensing relevance or the source page cannot be verified |

For each slot, the owner must record: `recipient_or_community`, exact relevant page URL, one-sentence relevance note, community-rule URL and date checked, sender identity, relationship disclosure, approved release URL, message variant, and send decision. Start with a small manually reviewed batch. Stop a channel if replies show weak relevance; do not scale on silence.

## Outreach Drafts

These drafts are conditional templates. Replace every bracketed field, delete the optional finding line unless it is in the approved release summary, and obtain batch approval before sending.

### T1: Web-performance, image-optimization, or CMS educator

**Subject:** Scoped image-compression benchmark for `[specific page topic]`

```text
Hi [name],

I read your [specific article/page] and the section about [specific point]. I maintain clevr.tools, and we prepared a controlled image-compression benchmark because that exact workflow question is easy to answer too broadly.

The release documents its corpus, browser/environment, settings, repeated runs, raw observations, review assets, and limitations. It evaluates clevr.tools in a defined setup; it is not a universal codec ranking or a platform-limit reference.

[Optional: Insert only the exact one-sentence finding approved in the release summary.]

Evidence: [public evidence URL]
Methodology: [permanent methodology URL]
Correction contact: [verified public contact]

I am sharing this for scrutiny, not asking for a link, favorable coverage, or a ranking consideration. If you review it, corrections or reproducibility feedback are welcome. Please ignore it if it is not useful for your audience.

[sender name and role]
Relationship: I maintain clevr.tools.
```

### T2: Frontend, browser, or codec practitioner

**Subject:** Reproduction/correction request for `[specific encoding topic]`

```text
Hi [name],

Your [specific issue, documentation page, or technical article] covers [specific encoding/browser behavior]. I maintain clevr.tools and am sharing a scoped benchmark package that records the exact browser, input corpus, controls, raw outputs, hashes, and review method.

The purpose is to make the result reproducible and correctable. It does not claim that one browser or setting represents all encoders, hardware, images, or GIFs.

Evidence: [public evidence URL]
Methodology and case manifest: [permanent methodology URL]
Correction contact: [verified public contact]

If you inspect it, corrections or a reproduction note would be useful. I am not requesting coverage, a backlink, or a favorable conclusion. Please disregard this if it falls outside your scope or community rules.

[sender name and role]
Relationship: I maintain clevr.tools.
```

### T3: Open-media, Wikimedia, library, or university maintainer

**Subject:** Corpus attribution and reproducibility review for `[specific page/community]`

```text
Hi [name/community],

I am writing because your [specific page or community rule] addresses [specific open-media or digital-preservation topic]. We used documented CC0 photographs as benchmark fixtures and retained source-page, uploader-credit, license, and hash records in the evidence package.

The package is about testing a browser-based workflow. It does not imply endorsement by the photographers, Wikimedia, your institution, or any source community. I would especially value a correction if the attribution, license handling, or stated scope is unclear.

Corpus and method: [public methodology URL]
Full evidence: [public evidence URL]
Correction contact: [verified public contact]

This is not a request for a link, coverage, or favorable treatment. If you review it, corrections or reproducibility feedback are welcome; otherwise please ignore it.

[sender name and role]
Relationship: I maintain clevr.tools.
```

## Private Outreach Log

Keep the contact log outside this public report unless the owner explicitly chooses to publish it. Use minimal data and never include scraped personal information.

```text
batch_id,release_id,recipient_or_community,exact_relevant_page,contact_date,purpose,relevance_note,relationship_disclosure,community_rule_checked,follow_up_date,outcome,correction_received,correction_status,owner_approved
```

Operational rule: no message is sent until the release is approved, the exact recipient page and rule check are recorded, the message is personalized, and `owner_approved` is `YES`. Send at most one respectful follow-up, then stop. Do not offer payment, reciprocal links, free access, sponsored followed links, testimonials, or ranking consideration.

## Measurement Fields

| Checkpoint | Record privately or in an owner-approved evidence package | Status |
| --- | --- | --- |
| Day 0 | Approved release ID, deployed commit, public evidence URL, representative route checks, sitemap/canonical check, and outreach batch approval | Pending owner gate |
| Day 7 | Crawl/index recognition for the selected route cohort, any task or rendering regression, substantive correction/reproduction replies, and whether the evidence URL is reachable | Pending deployment |
| Day 28 | Same page/query cohort's impressions, clicks, CTR, position distribution, privacy-safe task starts/successes, and qualified referrals; keep raw GSC exports private | Pending measurement |
| Day 90 | Durable relevant referrals, editorial mentions, direct linking domains, completion quality, corrections, and channel-level relevance; stop channels that do not produce useful signals | Pending measurement |

## Verification Record

- Read the benchmark results, benchmark brief/execution specification, ethical outreach plan, Authority Playbook, GSC evidence-intake rules, current integrity reports, and current branch state.
- Verified the release manifest/status, case/raw/derived file shapes, 76 pending visual-review rows, absent approval artifacts, and the current branch/release identity mismatch.
- Ran `node --test tests/image-benchmark-contract.test.mjs`: 3 passed, 0 failed.
- This bounded benchmark worker modified only this report. The parent sprint has separate content changes; the worker did not modify production code, other reports, or root `outputs/` files.
