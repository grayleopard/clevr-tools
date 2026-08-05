# Image compression benchmark — measured results

Date: 2026-08-04  
Accepted automated release: `2026-08-04-release-04`  
Measured commit: `e52c2202479ae9dae6556b465508840308df7d22`  
Status: **MEASURED_REVIEW_PENDING — not approved for publication**

## Executive result

The complete automated matrix passed: 76 frozen cases, one warm-up per case, five recorded runs per case, and 380/380 recorded outputs passing format, decode, dimensions, GIF frame-count, duration, and loop checks. The production build commit and every live UI setting were verified before measurement. No recorded output was larger than its input.

The evidence is not yet publication-ready. All 76 representative output comparisons still require human review, and at least eight cases require independent reproduction by a second person under the frozen approval contract.

## Corpus and interpretation

The corpus contains four documented CC0 photographs frozen as PNG, JPG, WebP, and synthetic 24-frame GIF inputs. Each value below is the median of the four source-level case medians. It describes this controlled corpus and browser build; it is not a promise for every user image.

Negative size change means the output is smaller than the input. SSIM is an automated still-image similarity measure where values closer to 1 indicate greater similarity. GIF visual quality is intentionally not reduced to a single automated score.

## Still-image results

| Input and operation | Median size change | Median tool time | Median SSIM | Minimum SSIM |
| --- | ---: | ---: | ---: | ---: |
| JPG → JPG, quality 60 | -66.11% | 110 ms | 0.979356 | 0.971346 |
| JPG → JPG, quality 80 | -39.82% | 105 ms | 0.985972 | 0.979753 |
| JPG → JPG, quality 95 | -16.76% | 128 ms | 0.995169 | 0.988665 |
| JPG → WebP, quality 80 | -69.38% | 267 ms | 0.981246 | 0.979326 |
| PNG → PNG, quality 60 | -22.82% | 1,907 ms | 0.991259 | 0.986244 |
| PNG → PNG, quality 80 | -16.59% | 2,151 ms | 0.992501 | 0.988540 |
| PNG → PNG, quality 95 | -12.85% | 2,224 ms | 0.993032 | 0.989791 |
| PNG → JPEG, quality 80 | -90.35% | 123 ms | 0.978676 | 0.971743 |
| PNG → WebP, quality 80 | -94.70% | 285 ms | 0.979421 | 0.967637 |
| WebP → WebP, quality 60 | -66.20% | 262 ms | 0.980635 | 0.963304 |
| WebP → WebP, quality 80 | -47.56% | 276 ms | 0.987173 | 0.977775 |
| WebP → WebP, quality 95 | -5.69% | 515 ms | 0.996412 | 0.994593 |
| WebP → JPEG, quality 80 | -7.08% | 123 ms | 0.989672 | 0.983352 |

### Still-image conclusions

1. Quality 80 is a defensible general-purpose balance for JPG and WebP in this corpus. Quality 60 saves substantially more but has lower similarity; quality 95 preserves more detail while often giving modest savings.
2. PNG photographs benefit far more from conversion than from same-format compression. PNG → WebP at quality 80 produced a 94.70% median reduction; PNG → JPEG produced 90.35%.
3. Same-format PNG processing was the slowest path and sometimes produced little benefit: the dense landscape at quality 95 improved by only 2.12% and took a 7,698 ms median.
4. WebP → JPEG is not an attractive default size-saving recommendation on this corpus; its median reduction was only 7.08%.

## GIF results

| Preset | Median size change | Median tool time | Automated structural result |
| --- | ---: | ---: | --- |
| Balanced/current | -44.30% | 585 ms | PASS |
| Color reduction | -60.30% | 538 ms | PASS |
| Frame reduction + 75% scale | -87.97% | 470 ms | PASS |
| Aggressive | -96.85% | 211 ms | PASS |

All GIF outputs passed expected frame count, duration tolerance, loop, dimensions, MIME, and decode checks. The larger reductions from frame removal, scaling, and aggressive color reduction necessarily change appearance or motion; no preset should receive a public quality endorsement until the paired contact sheets and original animations pass human review.

## Additional observations

- All JPG, WebP, conversion, and GIF cases were byte-deterministic across their five recorded runs.
- The 12 same-format PNG cases varied slightly between runs. Their largest output-size span was 0.49%, consistent with the dependency's randomized PNG quantization path. Medians remain stable, but deterministic PNG encoding should be investigated before claiming byte-for-byte reproducibility.
- Seven passing rows captured Google Tag Manager image-beacon requests blocked by the site's `img-src` Content Security Policy. These did not affect tool output, but analytics delivery and CSP configuration should be reconciled separately.
- Automated quality metrics and four photographs do not cover transparency-heavy artwork, screenshots, text-heavy graphics, skin tones, gradients at multiple resolutions, or real-world GIF disposal edge cases. These are appropriate candidates for a later corpus expansion, not silent additions to this frozen release.

## Product recommendations from the measured data

1. Keep quality 80 as the default and explain the 60/80/95 tradeoff in plain language.
2. Recommend WebP for web delivery, especially for photographic PNG inputs, while explaining transparency and compatibility considerations.
3. Warn users that same-format PNG compression may be slow and produce small savings on already efficient or highly detailed images.
4. Do not position WebP → JPEG as a size optimization; present it as a compatibility conversion.
5. Keep GIF presets explicit about color, frame, and scale changes. Promote an aggressive preset only after human motion/appearance review.
6. Investigate deterministic PNG encoding and the analytics CSP warning as separate engineering follow-ups.

## Evidence and audit trail

The local immutable evidence package is `benchmark-artifacts/image-compression/2026-08-04-release-04/`. It contains the frozen corpus manifest, raw 380-row CSV, 76-row derived summary, recorded outputs, hashes, scripts, and the generated 76-case visual-review manifest.

Earlier releases remain preserved as non-authoritative audit evidence:

- `release-01`: rejected because the frozen GIF expectation omitted the intentionally retained final frame.
- `release-02`: automated outputs passed, then were superseded when aggregate analysis exposed that the harness had recorded intended slider values without proving the live slider changed.
- `release-03`: 300 still-image rows passed; 80 GIF rows were rejected because the option buttons did not expose a machine-verifiable selected state.
- `release-04`: accepted automated dataset with exact build identity, slider values, and all option states verified.

## Remaining approval gates

1. A named human reviewer must mark every one of the 76 visual-review rows `PASS` or `CONCERN`, with UTC timestamps and notes where needed.
2. A different person must independently reproduce at least eight frozen cases and record matching hashes or documented variance under the approval contract.
3. The correction contact and response commitment must be recorded.
4. The approval script must re-hash the evidence and produce `APPROVED_FOR_PUBLICATION` before any public benchmark claim is used on clevr.tools.
