# Contextual internal-linking roadmap

Status: implemented for existing content where a natural path exists; future pages require Search Console evidence and owner approval.

## Linking rule

Use the shortest useful path:

`category hub → task guide → primary tool → closely related next step`

Links should answer the sentence they appear in. Do not add sitewide blocks of generic anchors, do not link a tool merely because it shares a broad category, and do not expose tools marked `live: false`.

## Implemented paths

| Topic | Category entry | Existing guide | Primary tool | Contextual next steps |
|---|---|---|---|---|
| Image compression | `/files` | `/blog/compress-images` | `/compress/image` | `/tools/resize-image`, then PNG/JPG-to-PDF only when the guide discusses PDF assembly. |
| Image size workflow | `/files` | `/blog/reduce-image-file-size` | `/compress/image` | `/tools/resize-image`, `/convert/png-to-webp`, and the format comparison guide. |
| Image conversion | `/files` | `/blog/png-vs-jpg-vs-webp` | The converter matching the chosen format | Reverse conversion or resizing only where compatibility, transparency, or dimensions are discussed. |
| PDF to image | `/files` | `/blog/convert-pdf-to-jpg` | `/convert/pdf-to-jpg` | Rotate or merge before conversion; compress the image after conversion; compress the PDF only when retaining PDF format. |
| Images to PDF | `/files` | `/blog/convert-png-to-pdf` | `/convert/png-to-pdf` | Compress images first, merge an existing PDF afterward, or compress removable PDF overhead. |
| Text cleanup | `/text-code` | `/blog/remove-line-breaks` | `/text/remove-line-breaks` | Word count, case conversion, and find/replace; JSON Formatter is linked only as the safer alternative for structured JSON. |
| Typing | `/type` | `/blog/typing-test` | `/type/typing-test` | `/type/wpm-test`, `/type/typing-practice`, `/type/race`, and `/type/keyboard-tester` according to test, practice, competition, or hardware intent. |
| Calculators | `/calculate` | No existing guide | Featured live calculators and subcategory anchors | Tool pages already render their configured related calculators. Do not invent a guide until GSC validates a distinct informational query cluster. |

The shared category scaffold now shows only existing guides for Files, Text & Code, and Type. Calculate uses its existing `featuredSlugs` and subcategories for a stronger route hierarchy without creating URLs.

## Blog index structure

The blog index groups existing posts by user task rather than displaying a date-only card stack:

- Images: compression, file-size workflow, format selection.
- Documents: PDF-to-image and image-to-PDF.
- Text + code: copied-text cleanup, with a contextual JSON escape hatch inside the guide.
- Typing: measurement and practice path.

Each group includes one link back to the relevant category hub. The cleaned `remove-image-background` guide remains discoverable as an informational article, but no longer promotes or links to the hidden tool route.

## Closely related tool clusters

`RelatedToolsCluster` now:

- removes the current page instead of linking a page to itself;
- prioritizes three workflow-specific next steps for known PDF, image, generator, and dev routes;
- caps the rendered cluster at four links;
- uses only routes present in the live tool inventory.

The main `ToolLayout` also resolves configured `relatedTools` through the live tool model. Keep both systems aligned if the cluster is mounted on more priority pages.

## Gaps to validate with GSC

Do not create these pages from intuition alone. Look for repeated queries, a clear non-overlapping intent, and a live primary tool first.

1. Calculator explainers: percentage change, take-home pay inputs, loan vs. auto-loan, calorie vs. macro, and unit conversion.
2. Dev explainers: JSON validation, Base64 vs. encryption, URL encoding, UUID versions.
3. PDF decision guides: merge vs. combine images, compression limitations for scanned PDFs.
4. GIF compression: color count vs. frame reduction vs. scaling, supported by the planned benchmark.

## Anchor-text guardrails

- Prefer task language: “resize the image before compressing,” “rotate PDF pages,” “validate JSON.”
- Avoid repeated exact-match anchors in every paragraph.
- Do not use “click here,” “best,” “guaranteed,” or unsourced outcome language.
- Link the first useful mention; do not link every later repetition.
- Keep guide frontmatter `relatedTools` ordered with the primary tool first.

## QA checklist

- Every internal URL resolves to a live route or an existing blog slug.
- No link targets `background-remover` or `pdf-to-fillable` while either is `live: false`.
- No guide is added to a category shelf before its MDX file exists.
- The link is useful without relying on surrounding navigation.
- The linked tool performs the action described by the anchor.
- Category anchors are stable, unique, keyboard reachable, and preserve normal browser history.
- Re-run the route/link audit after any tool slug or canonical change.
