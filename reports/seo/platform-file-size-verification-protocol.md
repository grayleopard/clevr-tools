# Primary-source platform-limit verification protocol

Companion to [the platform file-size reference brief](./platform-file-size-reference-brief.md). This protocol records verifiable platform facts; it does not approve a numeric claim by itself.

## Evidence standard

For every publishable value, use the platform's own current help, developer, product-specification, or policy page for the exact surface, tier, device/API, and file type. Record the source's canonical URL and retrieval time in [`platform-file-size-verification-register-template.csv`](./platform-file-size-verification-register-template.csv). A screenshot, search snippet, cached copy, community post, source-code label, or third-party roundup is not primary evidence.

`VERIFIED_PRIMARY` requires all of the following:

1. The source explicitly applies to the requested surface and account tier.
2. The value's scope is unambiguous: per-file versus aggregate, upload versus preview/delivery, and file type.
3. Related constraints (format, dimensions, megapixels, frames, duration, admin override, transformation, and cloud-link behavior) are captured.
4. A reviewer reads the source again within 24 hours of publication and assigns a recheck date no later than 90 days later.

If any condition fails, mark the row `AMBIGUOUS`, `STALE`, or `UNVERIFIED` and omit the number from public copy. When first-party pages conflict, retain both URLs in notes, escalate for editorial review, and publish neither value until resolved.

## Source checks completed for this planning package

On 2026-08-02, the following first-party pages were reachable and confirmed the need to keep their surfaces separate. No numeric value from this spot check is approved for publication.

| Surface | Primary-source observation | Source |
|---|---|---|
| Gmail | Separates personal-account behavior from admin-controlled work/school behavior and cloud-link fallback. | [Gmail Help](https://support.google.com/mail/answer/6584?hl=en) |
| Discord | Subscription benefits are tier-specific and the page has a recent update date; it cannot validate a generic “Discord limit.” | [Discord Support](https://support.discord.com/hc/en-us/articles/115000435108-What-are-Nitro-Nitro-Basic) |
| Slack | Separates file upload constraints from image-preview constraints and notes workspace/admin context. | [Slack Help](https://slack.com/help/articles/201330736-Add-files-to-Slack) |
| Shopify theme images | Separates theme-image rules from product-media rules and documents delivery-time transformations. | [Shopify Help](https://help.shopify.com/en/manual/online-store/images/theme-images) |

This spot check is a workflow validation, not a completed register. Each chosen row still needs its own verification record immediately before publication.

## Reconciliation gate

Before a platform preset, UI label, guide, or FAQ says a platform-specific number, compare it against a `VERIFIED_PRIMARY` register row with matching scope. A mismatch is a content/reliability issue to resolve separately; do not change the register to fit existing copy. For example, the current GIF-compressor UI contains a platform-labelled preset, but that label is not evidence of a platform's current free, paid, or admin-configured limit.

At publication, display the platform, surface, tier, file type, verification date, and direct source link alongside any number. Keep source units as stated; any conversion must be separately labelled as computed.
