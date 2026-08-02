# Owner information needed before adding trust claims

Status: blocked on owner answers. This is a collection checklist, not public copy. Do not fill gaps with assumptions, biographies, stock identities, inferred credentials, or generic “our team” language. The exact response and GSC/link-evidence package request is in [search-authority-evidence-intake.md](./search-authority-evidence-intake.md).

## P0: identity and accountability

| Needed from owner | Why it is needed | Acceptable evidence | Do not publish until answered |
|---|---|---|---|
| Legal operator or individual owner name | Identifies who is responsible for the service and policies | Registered entity record or explicit individual-owner statement | Company/person name, “founded by,” or ownership claims |
| Public-facing brand/operator relationship | Explains whether `clevr.tools` is a product, DBA, or independent project | Owner-approved wording | “Operated by …” language |
| Country/state or jurisdiction of operation | Supports accurate legal/privacy/contact language | Owner statement and entity record where applicable | Location claims or jurisdiction-specific promises |
| Support/contact email monitored by a real person | Gives users a correction and problem-reporting path | Verified inbox test and named internal owner | “Contact us,” response-time, or availability claims |
| Legal notice address, if required | Needed for jurisdiction-specific disclosures | Counsel/owner-provided address | Public address |

## P0: file handling and privacy boundaries

The code shows many browser-local workflows and marks the unfinished background-removal tool with a server privacy context. That is not enough to write a universal privacy promise.

Ask the owner to confirm:

- Which live tools process entirely in the browser, and whether any current exception sends file contents or entered data to a server.
- Whether analytics, error reporting, logs, CDN/WAF services, or hosting providers receive URLs, IP addresses, user agents, filenames, tool inputs, or file metadata.
- Whether downloaded/generated files are ever persisted by clevr.tools infrastructure.
- Retention periods for application logs, analytics, support emails, and any future server-side processing.
- Subprocessors and their purposes.
- Whether clipboard, local storage, IndexedDB, or service-worker caches store user content.
- What happens when a browser crashes or a tab is restored.
- Whether minors or sensitive files are in scope and what warning should be shown.
- A verified data-deletion/request contact and process.
- The exact wording legal counsel or the owner approves for “files stay in your browser.”

Do not publish “100% private,” “no tracking,” “nothing is uploaded,” “zero retention,” “anonymous,” or “we cannot access your files” as sitewide claims until every live route and infrastructure dependency is verified.

## P0: high-impact calculator governance

Financial, health, pregnancy, nutrition, and betting calculators need named source and review ownership even when the arithmetic runs locally.

For each calculator, collect:

- Formula source and primary reference URL.
- Assumption set, default values, rounding behavior, units, and effective date.
- Geography/jurisdiction where relevant (tax, payroll, mortgage, lending).
- Medical/health source and scope where relevant; clarify that outputs are informational, not diagnosis.
- Regulatory or rate data source and update cadence.
- Named internal maintainer and last verification date.
- Qualified reviewer name/credential only if a real person reviewed it and consented to attribution.
- Known exclusions and edge cases.
- Correction/escalation process.

Do not invent an expert reviewer, medical review board, accountant, engineer, author biography, or editorial team. If no qualified reviewer exists, say less and prioritize source/limitation disclosure.

## P1: editorial ownership and corrections

Ask the owner to choose and document:

- Who writes, edits, fact-checks, and publishes guides.
- Whether “clevr.tools” is the byline or whether named authors will be used.
- What a byline promises (firsthand testing, subject expertise, editing only).
- Required sourcing standard for technical, financial, health, platform-limit, and benchmark claims.
- Correction policy, public correction contact, and whether material changes get a changelog.
- Review cadence for evergreen guides and fast-changing reference pages.
- Policy for AI-assisted drafting and human verification, if applicable.
- Whether sponsored, affiliate, or partner content will ever appear and how it will be disclosed.

Do not add `Person` schema, author credentials, “expert reviewed,” or `dateModified` solely for appearance. Structured data must match visible, truthful page content and a real review event.

## P1: product testing and reliability

Collect:

- Supported browser/device matrix and who maintains it.
- Test cadence and release checklist.
- Maximum file/input limits derived from current UI and actual stress tests.
- Known browser-specific behavior, especially image encoder differences and large-canvas limits.
- Accessibility testing method and last audit date.
- Security-reporting contact and vulnerability-handling process.
- Incident/status communication process, if one exists.
- Whether outputs are deterministic and what metadata may be removed or transformed.

Do not claim “works on every device,” “unlimited,” “pixel-perfect,” “lossless,” “instant,” “secure,” or a compression percentage without a test that defines environment, corpus, settings, and limitations.

## P1: business model and independence

Ask the owner to state:

- Current revenue model: donations/tips, ads, subscriptions, affiliate links, sponsorships, or none.
- Whether tool ordering or recommendations can be paid.
- Whether any third party receives uploaded/input content as part of monetization.
- Whether benchmark or comparison coverage includes sponsors or affiliates.
- Trademark ownership and approved brand usage.

Only publish “independent,” “ad-free,” “no affiliate links,” or “free forever” if the owner explicitly commits to it and assigns a review trigger when the model changes.

## P2: proof that can be added later

These can strengthen trust only when genuine and documented:

- Original benchmark results with raw CSV, corpus licenses, environment, method, and limitations.
- Public changelog tied to shipped releases.
- Named case studies with participant permission and reproducible context.
- User testimonials with consent, original wording, date, and conflict disclosure.
- Open-source repository or auditable source excerpts, if the owner chooses to publish them.
- Uptime/performance data from a defined monitoring source and window.
- Accessibility conformance statement backed by an audit.

Do not invent usage counts, customers, countries, files processed, time saved, ratings, awards, press mentions, testimonials, or performance statistics.

## Minimum owner response form

The owner can unblock a first trust pass by answering this exact set:

1. Who legally operates clevr.tools, and what public operator wording is approved?
2. What public support/correction email should be used, and who monitors it?
3. Which live tools, if any, send file contents or entered data off-device?
4. What analytics, logging, hosting, and error-reporting services receive user data, and for how long?
5. Who owns calculator formula/source reviews, especially financial and health tools?
6. What public editorial/correction policy can the site commit to?
7. What is the current business model, and are recommendations ever paid or affiliate-linked?
8. Which claims may be published now with evidence, and which should remain internal?
9. Who signs off on the image benchmark corpus, methodology, and release?
10. Who owns the 90-day re-verification of platform-limit references?

## Answer and approval protocol

For each answer, record the responder's role, answer date, evidence or system-of-record location, approved public wording (if any), and the next review date. Use `UNKNOWN` or `NOT_AVAILABLE` instead of leaving a blank or extrapolating from repository code. A response establishes a publishable claim only after the evidence-register status reaches `OWNER_APPROVED`.

## Evidence register template

For each approved trust statement, record:

`claim_id,public_claim,scope,evidence_type,evidence_location,evidence_owner,verified_at_utc,review_due,approved_by,status,notes`

Allowed statuses: `PROPOSED`, `EVIDENCE_ATTACHED`, `OWNER_APPROVED`, `PUBLISHED`, `STALE`, `RETRACTED`.

A claim becomes publishable only at `OWNER_APPROVED`; it becomes removable at `STALE` until reverified.
