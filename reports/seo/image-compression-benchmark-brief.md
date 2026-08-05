# Original image-compression benchmark brief

Status: ready to implement. No performance result, compression percentage, or quality conclusion should be published until the corpus is frozen and every `input_bytes` / `output_bytes` field in the companion CSV is measured. The reproducible release layout, attempt counts, failure handling, and raw-data contract are in [image-compression-benchmark-execution-spec.md](./image-compression-benchmark-execution-spec.md); no benchmark results are recorded there.

## Research question

How does the current clevr.tools browser implementation change file size, dimensions, processing time, and decoded-image similarity across representative JPG, PNG, WebP, and animated GIF inputs?

This is a product benchmark, not a universal codec ranking. It measures the deployed workflow and its visible settings.

## Implementation under test

Freeze these facts from the tested commit in the run manifest:

- `/compress/image` calls `compressImage` in `lib/processors.ts`, which uses `browser-image-compression` and supports “keep original,” JPEG, and WebP output. The current default slider is 80.
- `/tools/gif-compressor` decodes with `gifuct-js`, encodes with `gifenc`, and exposes compression, maximum colors, frame reduction, and scale.
- The lockfile currently resolves `browser-image-compression` 2.0.2, `gifenc` 1.0.3, and `gifuct-js` 2.1.2. Record the lockfile SHA-256 in every benchmark release.
- Browser serialization matters. The HTML Standard explicitly allows implementations to interpret image “quality” somewhat differently, so browser and version are required fields rather than footnotes. See the WHATWG [canvas bitmap serialization requirements](https://html.spec.whatwg.org/multipage/canvas.html#serialising-bitmaps-to-a-file) and the `browser-image-compression` [package documentation](https://www.npmjs.com/package/browser-image-compression).

## Licensed source corpus

Use four non-person CC0 photographs. Each source page identifies the uploader, dimensions, original file, and CC0 dedication. Keep a local manifest with the exact download URL, source-page revision URL, uploader credit, download timestamp, byte count, and SHA-256.

| ID | Content class | Source page | Uploader credit | Published dimensions | License |
|---|---|---|---|---:|---|
| `cc0-landscape-dense` | Fine foliage and natural texture | [A lush verdant landscape](https://commons.wikimedia.org/wiki/File:A_lush_verdant_landscape.jpg) | Ayyuha Sideeq | 4160 × 3120 | CC0 1.0 |
| `cc0-landscape-gradient` | Sky gradients and dark silhouettes | [Landscape of Nature](https://commons.wikimedia.org/wiki/File:Landscape_of_Nature.jpg) | Yasir 48 | 4032 × 2268 | CC0 1.0 |
| `cc0-architecture-lines` | Repeated edges and geometric detail | [Architecture building](https://commons.wikimedia.org/wiki/File:Architecture_building_.jpg) | Wiki_Ruhan | 4000 × 3000 | CC0 1.0 |
| `cc0-food-texture` | Texture, shallow detail, and a wide crop | [Food photography image](https://commons.wikimedia.org/wiki/File:Food_photography_image.jpg) | Santhosh annakili | 3264 × 1472 | CC0 1.0 |

CC0 permits reuse and modification, but its deed also warns that trademark, privacy, publicity, and endorsement rights are separate. These fixtures avoid identifiable people and brands; still retain source records and never imply uploader endorsement. Use the [CC0 legal code](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en) as the license authority. Wikimedia's [CommonsMetadata API documentation](https://www.mediawiki.org/wiki/Extension:CommonsMetadata/en) describes how to fetch machine-readable license metadata.

### Corpus freeze requirements

Create `corpus-manifest.csv` during implementation with:

`source_id,source_page,source_revision,original_url,uploader,license,license_url,downloaded_at_utc,original_width,original_height,original_bytes,sha256`

The `original_bytes` values must come from the downloaded files (`stat`), not rounded “MB” labels on a webpage. If the file hash or license metadata changes, stop and review before rerunning.

## Deterministic fixture generation

Pin exact versions of ImageMagick, libwebp, and FFmpeg in the run manifest. Store commands in a checked-in script when the benchmark is implemented; do not rely on manual exports.

### Still-image master

For each CC0 source, decode to sRGB, remove metadata, and fit the longest edge within 2560 pixels without enlargement:

```sh
magick source.jpg -auto-orient -colorspace sRGB -resize '2560x2560>' -strip canonical.png
```

Record the actual master dimensions; do not infer them from aspect-ratio math.

From the same canonical pixels, generate three inputs:

```sh
magick canonical.png -strip -define png:compression-level=9 input.png
magick canonical.png -strip -quality 90 input.jpg
cwebp -quiet -q 90 -m 6 -metadata none canonical.png -o input.webp
```

`cwebp` documents `-q`, `-lossless`, and encoder method settings in Google's [official cwebp reference](https://developers.google.com/speed/webp/docs/cwebp). Record the generated input byte count and SHA-256; these are the benchmark “before” sizes.

### Animated GIF input

Generate one 2-second, 24-frame, 800 × 450 pan/zoom animation from each canonical master. Use a deterministic filter graph and a fixed 256-color palette:

```sh
ffmpeg -y -loop 1 -i canonical.png -filter_complex "scale=900:506:force_original_aspect_ratio=increase,crop=900:506,zoompan=z='min(zoom+0.003,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=24:s=800x450:fps=12,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" -frames:v 24 input.gif
```

Verify rather than assume: MIME type `image/gif`, 800 × 450 dimensions, 24 decoded frames, approximately 2 seconds total duration, and looping animation. Record the exact byte count. GIF behavior is defined by the [GIF89a specification](https://www.w3.org/Graphics/GIF/spec-gif89a.txt); the current product libraries are [`gifuct-js`](https://github.com/matt-way/gifuct-js) and [`gifenc`](https://github.com/matt-way/gifenc).

## Test matrix

### JPG, PNG, and WebP inputs

For every source-format pair, run these five cases:

| Case | Tool quality | Output selector | Purpose |
|---|---:|---|---|
| `same-q60` | 60 | Keep original | Smaller same-format result |
| `same-q80` | 80 | Keep original | Current default |
| `same-q95` | 95 | Keep original | Higher-fidelity same-format result |
| `to-webp-q80` | 80 | WebP | Cross-format web output |
| `to-jpeg-q80` | 80 | JPEG | Cross-format compatibility output |

This yields 4 sources × 3 input formats × 5 cases = 60 still-image results. Do not call quality values equivalent across JPG, PNG, and WebP; they are UI inputs to different encoders.

### GIF inputs

For every animated source, run these four cases:

| Case | Compression | Max colors | Frame reduction | Scale |
|---|---:|---:|---:|---:|
| `balanced-current` | 58 | 128 | None (`1`) | 100% |
| `color-reduction` | 82 | 64 | None (`1`) | 100% |
| `frame-and-scale` | 82 | 64 | Every 2nd (`2`) | 75% |
| `aggressive` | 90 | 32 | Every 3rd (`3`) | 50% |

These settings exist in the current UI. They are test labels, not recommendations, until the results and visual review support a recommendation.

## Before/after size reporting

Use [`image-compression-results-template.csv`](./image-compression-results-template.csv). Every result row must include:

- Exact `input_bytes` and `output_bytes` from the filesystem.
- `byte_delta = output_bytes - input_bytes`.
- `size_change_pct = ((output_bytes - input_bytes) / input_bytes) × 100`.
- `compression_ratio = input_bytes / output_bytes`.
- Input and output SHA-256 hashes.
- Input/output MIME type and decoded dimensions.

Positive `size_change_pct` means the output grew. Do not clamp increases to zero. The product UI may describe “bytes saved,” but research data must preserve regressions.

No before/after result is included in this brief because the benchmark has not run. Blank size fields are a publication blocker, not an invitation to estimate.

## Quality and runtime measurements

### Stills

- Decode input and output to the same 8-bit sRGB pixel format.
- If dimensions differ, flag `dimension_changed`; do not resize one result just to obtain a score.
- Calculate per-image SSIM and PSNR only when dimensions match.
- Record alpha separately. For transparent inputs, compare RGBA pixels and also composite both images against light and dark neutral backgrounds before scoring.
- Save a fixed 100% crop from the center and the highest-error region for human review.

FFmpeg documents its [SSIM and PSNR filters](https://www.ffmpeg.org/ffmpeg-filters.html). Store the exact command and FFmpeg version with the results. SSIM/PSNR are supporting signals, not proof that two images “look identical.”

### GIFs

- Record input/output width, height, frame count, total duration, loop behavior, and palette color count.
- Compare matched timestamps at 12 evenly spaced points. When frames are intentionally removed, report temporal change separately from pixel similarity.
- Manually check disposal behavior, transparency, flicker, timing, and whether the loop completes cleanly.

### Runtime

- Use one warm-up run, then five recorded runs per case in the same browser session.
- Report median and range; never publish the fastest single run.
- Record browser/version, headed or headless mode, OS, CPU, memory, power state, and whether developer tools were open.
- Process one file at a time to isolate the case. Add a separate batch test only after single-file results are complete.

## Reproducible execution method

1. Freeze the git commit, lockfile hash, and clean build output.
2. Download source files and verify license metadata, byte counts, and hashes.
3. Generate all derived inputs with the pinned commands.
4. Run a production build locally and serve it on a fixed port.
5. Use Playwright to upload a fixture, set controls, start processing, wait for the completed state, and save the downloaded output.
6. Capture the tool-reported processing time and an external wall-clock measurement.
7. Inspect output metadata and calculate byte/quality metrics.
8. Repeat runtime trials, then write one normalized CSV row per case.
9. Re-run a 10% random sample manually and compare hashes/settings with automation.
10. Publish the corpus manifest, scripts, raw CSV, environment manifest, and a human-readable summary together.

## Acceptance criteria

- 76 expected outputs: 60 still-image cases and 16 GIF cases.
- No missing input/output hashes or byte counts.
- Every file decodes successfully after download.
- Every output MIME type matches the selected format.
- Same-format still outputs retain dimensions unless a documented browser canvas limit intervenes.
- GIF outputs loop and preserve a valid duration.
- All failed or larger-output cases remain in the dataset.
- A second person can reproduce a sampled result from the manifest and scripts.

## Limitations to disclose

- Four CC0 photographs are intentionally small enough to audit; they do not represent every camera, illustration, screenshot, alpha edge, or color profile.
- All still masters originate from already-compressed JPEG photographs, so derived PNG files test re-encoding behavior, not native digital artwork.
- Browser encoders and canvas limits vary; results from one browser/OS are not universal.
- The UI quality number is not a standardized visual-quality scale across codecs.
- SSIM and PSNR can miss perceptually important artifacts; human crops remain necessary.
- GIF frame reduction changes motion, so byte savings cannot be compared with palette-only changes as if quality were one-dimensional.
- Runtime is hardware- and thermal-state-dependent.
- This benchmark evaluates clevr.tools, not competing services, and should not imply superiority without a separate controlled comparison.

## Outreach audiences and evidence package

Only begin outreach after raw results and reproduction assets are public.

- Browser and frontend performance practitioners: emphasize browser-specific encoding behavior and environment disclosure.
- Image optimization and codec maintainers: share raw cases, failures, hashes, and quality crops; invite corrections.
- E-commerce and CMS implementers: report workflow findings by content class without turning platform limits into universal recommendations.
- Open-media/Wikimedia communities: credit the CC0 source pages and share how the audited corpus was used.
- Developer-tool and indie-product communities: focus on methodology and reproducibility, not unverified “up to X%” marketing.

The outreach bundle should contain a one-page findings summary, raw CSV, corpus manifest, scripts, environment manifest, output samples, limitations, correction contact, and a permanent methodology URL.

## Primary references

- [CC0 1.0 legal code](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en)
- [Wikimedia Commons machine-readable metadata](https://www.mediawiki.org/wiki/Extension:CommonsMetadata/en)
- [JPEG-1 / ITU-T T.81 record](https://www.itu.int/ITU-T/recommendations/rec.aspx?id=2633)
- [PNG Specification, Third Edition](https://www.w3.org/TR/png-3/)
- [WebP format and reference tools](https://developers.google.com/speed/webp)
- [cwebp command reference](https://developers.google.com/speed/webp/docs/cwebp)
- [GIF89a specification](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)
- [HTML canvas serialization](https://html.spec.whatwg.org/multipage/canvas.html#serialising-bitmaps-to-a-file)
- [FFmpeg SSIM and PSNR filters](https://www.ffmpeg.org/ffmpeg-filters.html)
- [`browser-image-compression` package](https://www.npmjs.com/package/browser-image-compression)
- [`gifuct-js` source](https://github.com/matt-way/gifuct-js)
- [`gifenc` source](https://github.com/matt-way/gifenc)
