# Opportunity Scorecard

Score each eligible existing URL. Keep raw evidence beside every score.

| Dimension | Range | Guidance |
|---|---:|---|
| Verified demand | 0-5 | GSC impressions and trend; `UNKNOWN` if unavailable |
| Ranking proximity | 0-5 | Highest for stable positions 4-20, then 21-30 |
| CTR gap | 0-4 | Compare CTR within similar position/device cohorts |
| Task value | 0-4 | Clear user job and useful completion |
| Reliability | 0-5 | Representative calculation/artifact and failure-path evidence |
| Trust readiness | 0-4 | Sources, assumptions, limits, ownership, review date |
| Internal-link readiness | 0-3 | Relevant hubs, tools, guides, and result-state links |
| Linkability | 0-3 | Original evidence, reference value, or workflow utility |
| Effort | 0 to -3 | Penalize broad rewrites, new systems, and external dependencies |

Do not rank an `UNKNOWN` as zero. Present a confidence level:

- High: page + query evidence, reliable product, narrow intervention
- Medium: page or query evidence only, or a remaining trust gap
- Low: third-party estimate, unclear route ownership, or unverified behavior

Tie-break in this order: reliability, verified demand, proximity, task value, effort.
