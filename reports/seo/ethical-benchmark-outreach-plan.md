# Ethical benchmark outreach plan

Status: do not begin outreach until a benchmark release passes every publication gate in [the execution specification](./image-compression-benchmark-execution-spec.md). No results currently exist in this repository outside the user-owned `outputs/` directory.

## Purpose and boundaries

Share a reproducible, scoped product-methodology result with people who may independently find it useful. The purpose is correction, learning, and transparent product communication—not link acquisition, review manipulation, or a claim of universal superiority.

Never:

- request a backlink, citation, ranking consideration, testimonial, or positive review;
- offer payment, a reciprocal link, free product access, or any other incentive for coverage;
- use mass, automated, or repeated unsolicited messages;
- hide a commercial, affiliate, sponsor, or personal relationship;
- state or imply a compression percentage, quality outcome, or platform limit not present in the published raw evidence;
- use corpus contributors' names or works as endorsements.

## Release gate and approved message

Before any contact, the release owner must confirm that the public package contains the methodology URL, raw CSV, corpus manifest/licenses, scripts, environment manifest, all failed/larger-output cases, limitations, correction contact, and owner approval for the exact summary. The release summary must name the tool route, browser/environment, corpus scope, result window, and material limitations.

The only permitted outcome request is: “If you review this, corrections or reproducibility feedback are welcome.” Recipients decide independently whether to link, cite, cover, or ignore it.

## Audience selection and contact practice

Contact only a small, relevant set of people or communities—such as image-codec maintainers, browser-performance practitioners, Wikimedia/open-media communities connected to the corpus, or practitioners with a clearly related implementation problem. Read each community's rules first.

Each message must be individually written, identify the sender and purpose, link directly to the full evidence package, disclose any relationship with the project, and explain why the recipient is relevant. Send at most one respectful follow-up after a reasonable interval, then stop. Do not collect personal information beyond what is necessary to maintain the outreach log.

## Outreach log and corrections

Maintain a private, minimal log:

```text
release_id,recipient_or_community,contact_date,purpose,relationship_disclosure,community_rule_checked,follow_up_date,outcome,correction_received,correction_status
```

If a material error is found, label the affected claim `STALE`, correct or withdraw it promptly, retain the original release with a clear correction note, and notify any recipient who already received the inaccurate summary. Do not delete failed cases or quietly replace raw data.

Platform-limit content is separately gated by [the primary-source verification protocol](./platform-file-size-verification-protocol.md); a benchmark does not verify a third party's current upload limit.
