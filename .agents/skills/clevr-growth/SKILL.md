---
name: clevr-growth
description: Run evidence-led organic growth for clevr.tools. Use when Codex is asked to improve search rankings, traffic, CTR, indexing, internal linking, content quality, flagship readiness, backlinks, distribution, or a GSC-driven growth sprint. Combine repository integrity evidence with first-party search data, prioritize a small page cohort, implement only defensible improvements, and measure at 7, 28, and 90 days.
---

# Clevr Growth

Operate growth as a reliability-led product program. Earn visibility by making useful tools accurate, citeable, easy to discover, and worthy of direct references.

## Non-negotiables

- Gate promotion on working output, representative tests, truthful limitations, and current sources.
- Treat Google Search Console as the source of truth for Clevr performance. Use third-party estimates only for discovery.
- Never fabricate demand, rankings, benchmarks, reviews, experts, or usage claims.
- Never buy links, exchange ranking credit, mass-submit directories, or automate unsolicited outreach.
- Draft prospect lists and outreach messages for owner review, but never send email, direct messages, form submissions, or publisher pitches without explicit owner approval for that outreach batch.
- Reject thin programmatic pages, generic AI articles, keyword stuffing, bulk title rewrites, and duplicate route families.
- Preserve useful direct routes while keeping broken, unavailable, unsafe, or duplicative surfaces out of discovery and the sitemap.
- Do not read or modify `outputs/` unless the owner explicitly authorizes it.

## Workflow

### 1. Establish release truth

Check the current branch, `origin/main`, open PRs, deployment identity, and working tree before proposing growth work. Read the latest relevant files under:

- `reports/seo/`
- `reports/audits/tool-integrity/`
- `reports/benchmarks/` when present
- `lib/tools.ts`, `lib/site-structure.ts`, sitemap, navigation, and search projections

Do not optimize an unmerged change as if it were live.

### 2. Assemble evidence

Prefer the free evidence stack in `references/evidence-stack.md`. At minimum collect:

- GSC page + query rows for 7, 28, and 90 complete days
- clicks, impressions, CTR, position, device, country, and search appearance where useful
- indexing and sitemap status for the target cohort
- direct referring domains and target URLs
- product events for open, valid input, start, success, download, and process-another when privacy-safe
- reliability status, limitations, and test coverage from the integrity reports

Mark missing values `UNKNOWN`. Do not convert absence of data into a zero or a retirement decision.

### 3. Score opportunities

Use `references/opportunity-scorecard.md`. Apply hard gates before scoring:

- `BLOCKED`: broken, unsafe, misleading, or unverified high-stakes behavior
- `CONTAINED`: direct route may remain, but no promotion or index expansion
- `ELIGIBLE`: task works, claims are bounded, and the page may compete

Select at most three to five URLs per sprint. Prefer existing pages with impressions and positions 4-30 over net-new pages.

### 4. Choose the smallest effective intervention

Match the intervention to evidence:

- Low CTR at a stable competitive position: align title, description, and opening copy with the actual query intent.
- High impressions with intent mismatch: clarify task scope and strengthen the correct route; do not clone pages.
- Weak discovery: add normal HTML links from the relevant hub, related tools, and task-result states.
- Weak trust: add formulas, assumptions, limitations, review date, primary sources, and testing evidence.
- Weak completion: repair the product before adding SEO copy.
- No external references: create one independently useful evidence asset or workflow guide, then perform selective editorial outreach.

Avoid changing multiple variables on many pages at once. Preserve a measurable cohort.

### 5. Delegate bounded work

When subagents are authorized, split work into non-overlapping tasks:

- evidence analyst: page/query cohort and opportunity scoring
- integrity reviewer: calculation, file-output, claims, schema, and route safety
- authority researcher: citeable asset concepts and manually vetted publisher archetypes
- independent reviewer: adversarial review of the final diff

Use Luna Max for bounded research/review and Terra for larger code or data tasks unless the user specifies otherwise. Never silently substitute a model.

Delegation does not authorize external contact. Do not connect or use email, messaging, CRM, or outreach tools to contact prospects until the owner approves the specific prospect list and message batch.

### 6. Implement and verify

Keep edits incremental. Verify calculation or artifact truth independently of screenshots. Run the repository's relevant Node, browser, lint, build, discovery, sitemap, and bundle gates. Record exact passes, skips, failures, and environment limitations.

### 7. Release and measure

Require an identified merged commit and successful deployment. Then:

- Day 0: submit the sitemap and inspect only representative repaired URLs.
- Day 7: verify crawl/index recognition and detect regressions.
- Day 28: compare page/query impressions, CTR, position distribution, and completion quality.
- Day 90: evaluate durable traffic, direct references, and whether the intervention should expand.

Do not judge success from site-wide average position alone. Expanded query coverage can lower the average while increasing opportunity.

## Required Output

For each sprint, produce a concise report under `reports/growth/YYYY-MM-DD-<slug>.md` containing:

1. Baseline and evidence dates
2. Selected URL cohort and scores
3. Reliability and trust gates
4. Implemented interventions
5. Exact verification results
6. Deployment commit and date
7. Day 7, 28, and 90 measurement fields
8. Explicit unknowns and owner actions

Use `references/authority-playbook.md` before recommending outreach or link acquisition.
