# Platform file-size reference brief

Status: research plan only. **No numeric platform limit in this document is approved for publication.** Every value must be opened on the named first-party source, checked for the exact product surface and account tier, recorded with a verification date, and reviewed again immediately before publishing.

## Why this needs a verification gate

“Platform limit” is rarely one number. Limits can differ by:

- individual file vs. total message or post;
- image, animated GIF, PDF, document, video, or archive;
- web, desktop, iOS, Android, API, or advertising upload;
- free, paid, enterprise, admin-configured, or regional account;
- profile image, feed post, article, ad creative, product image, theme asset, or email attachment;
- file bytes, encoded message bytes, megapixels, pixel dimensions, frame count, duration, or page count.

A number without those qualifiers is likely to mislead. Third-party roundups, search-result snippets, old screenshots, and support-forum answers are discovery aids only and cannot be cited as evidence.

## Verification workflow

1. Define the exact user job and product surface (for example, “personal Gmail web attachment,” not “email”).
2. Open the first-party help or developer page in the matrix below.
3. Confirm the page applies to that surface, tier, device, and file type.
4. Record the limit exactly as the source states it, including whether units are decimal MB or binary MiB if specified.
5. Record related constraints: aggregate size, dimensions, megapixels, formats, frames, duration, page count, and automatic cloud-link behavior.
6. Record source title, canonical URL, page “last updated” date if present, reviewer, and `verified_at_utc`.
7. Save a short supporting excerpt of no more than 25 words for internal review; publish a paraphrase with a direct link.
8. Reopen every source within 24 hours of publication. If a source is unavailable or ambiguous, omit the number.
9. Set a 90-day recheck date. Reverify sooner after product/pricing changes.

## Required evidence fields

Use one row per surface/tier/file-type combination:

`platform,product_surface,account_tier,device_or_api,file_type,limit_scope,limit_value,limit_unit,aggregate_limit,pixel_limit,dimension_limit,format_limit,other_constraints,source_title,source_url,source_last_updated,verified_at_utc,verified_by,recheck_at,status,notes`

Allowed `status` values:

- `UNVERIFIED` — do not publish.
- `VERIFIED_PRIMARY` — first-party page checked for the exact surface.
- `AMBIGUOUS` — conflicting or incomplete first-party guidance; omit numeric claim.
- `STALE` — verification older than the recheck window; remove or reverify.

## Source matrix

All numeric fields are intentionally omitted here. The linked page is a starting point, not a permanent guarantee.

| Platform / surface to separate | First-party verification entry point | What must be recorded | Current status |
|---|---|---|---|
| Gmail personal web attachments; Google Workspace separately | Google [Send attachments with your Gmail message](https://support.google.com/mail/answer/6584?hl=en) | Per-message aggregate attachment behavior, personal vs. Workspace/admin behavior, Drive fallback, blocked formats | UNVERIFIED |
| Outlook.com; Outlook desktop with internet mail; Exchange organization | Microsoft [Reduce attachment size to send large files with Outlook](https://support.microsoft.com/en-us/outlook/reduce-attachment-size-to-send-large-files-with-outlook) | Whether the limit is file or total message, account type, organization override, OneDrive behavior | UNVERIFIED |
| Discord free, Nitro Basic, and Nitro | Discord [What are Nitro & Nitro Basic?](https://support.discord.com/hc/en-us/articles/115000435108-What-are-Nitro-Nitro-Basic) | Tier, per-file upload, server boost/admin effects if any, mobile/web parity | UNVERIFIED |
| Slack message file upload and image preview | Slack [Add files to Slack](https://slack.com/help/articles/201330736-Add-files-to-Slack) | Per-file upload, number of files per action, preview-only pixel constraints, Slack Connect/admin restrictions | UNVERIFIED |
| X feed photo; animated GIF on web; animated GIF on mobile | X [How to post photos or GIFs](https://help.x.com/en/using-x/posting-gifs-and-pictures) | Static vs. animated, web vs. mobile, accepted formats, loop requirement, per-file vs. post | UNVERIFIED |
| LinkedIn feed photo | LinkedIn [Share photos on LinkedIn](https://www.linkedin.com/help/linkedin/answer/a527229/sharing-photos-or-videos?lang=en) | Upload size, minimum dimensions, aspect ratio, single vs. multi-photo behavior | UNVERIFIED |
| LinkedIn article image | LinkedIn [Publishing Platform FAQ](https://www.linkedin.com/help/linkedin/answer/a522463) | Article body vs. cover image, accepted formats, dimensions, update date | UNVERIFIED |
| LinkedIn profile/featured media and documents | LinkedIn [Media file types supported](https://www.linkedin.com/help/linkedin/answer/a564109/media-file-types-supported-on-linkedin?lang=en) | Media type, document page/word limits, image resolution, GIF frames/pixels, device-specific format support | UNVERIFIED |
| Shopify theme/content image | Shopify [Uploading images](https://help.shopify.com/en/manual/online-store/images/theme-images) | File bytes and megapixels, accepted/converted formats, automatic optimization, theme-specific behavior | UNVERIFIED |
| Shopify product/collection image | Shopify [Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types) | Product-specific dimensions/megapixels and bytes, animation support, CDN behavior | UNVERIFIED |
| WordPress.com media | WordPress.com [Troubleshooting image and file uploads](https://wordpress.com/support/images/troubleshooting-images/) | Hard upload ceiling vs. performance recommendation, plan/storage context, supported formats | UNVERIFIED |
| Self-hosted WordPress | Hosting control panel, PHP configuration, WordPress Site Health, and host documentation | `upload_max_filesize`, `post_max_size`, server/proxy limits, host/account plan | AMBIGUOUS — no universal limit |
| Google Ads uploaded display image/GIF | Google Ads [Uploaded display ads specifications](https://support.google.com/google-ads/answer/1722096?hl=en) | Campaign/ad type, file format, bytes, exact dimensions, animation duration/FPS | UNVERIFIED |
| Google Ads other image assets | Google Ads [format and size overview](https://support.google.com/google-ads/answer/13676244?hl=en) plus the linked campaign-specific page | Campaign type, aspect ratio, min/recommended dimensions, bytes; do not reuse display-ad limits | UNVERIFIED |
| Instagram feed/Reels/Stories organic upload | Current Meta/Instagram Help page for the exact surface | App surface, static/GIF/video behavior, aspect ratio, dimensions, bytes, account/API differences | SOURCE REQUIRED — do not publish |
| Instagram Graph API content publishing | Current Meta for Developers content-publishing reference | Supported media type, remote URL requirements, bytes/dimensions, account eligibility, API version | SOURCE REQUIRED — do not publish |

## Publication format

Publish only verified rows. Every displayed limit should include enough scope in the label:

> Platform — surface — account/tier — file type: verified limit, plus the most important non-byte constraint. Verified YYYY-MM-DD from [first-party source].

Do not convert a provider's units unless both are shown. If a calculator is useful, show the source value first and put any byte conversion in a separate, labeled computed field.

## Editorial guardrails

- Never say “all platforms” or “universal limit.”
- Distinguish “maximum accepted upload” from “recommended for performance.”
- Distinguish “file is accepted” from “preview is generated.”
- Distinguish a per-file limit from the total encoded email/message size.
- Do not infer a free-tier value from a paid-tier marketing page.
- Do not generalize WordPress.com guidance to self-hosted WordPress.
- Do not generalize one Google Ads format to every campaign type.
- When a platform automatically uploads to cloud storage or transforms an image, describe the behavior separately from the raw attachment limit.
- Remove, rather than guess, a value when two first-party pages conflict.

## Owner/editor sign-off before use

- [ ] Exact platforms and surfaces chosen from observed GSC queries or support demand.
- [ ] Each row has `VERIFIED_PRIMARY` status and a named reviewer.
- [ ] Every source was reopened within 24 hours of publication.
- [ ] No numeric value was copied from existing clevr.tools marketing copy without independent first-party verification.
- [ ] The article states its verification date and correction contact.
- [ ] A 90-day recheck owner and date are assigned.
