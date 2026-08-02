# Image-compression benchmark execution specification

Companion to [the original benchmark brief](./image-compression-benchmark-brief.md). Status as of 2026-08-02: no frozen corpus, run manifest, raw results, or derived benchmark findings were located outside the user-owned `outputs/` directory. This document defines a reproducible run; it reports no results.

## Unit of work

The brief defines 76 unique case specifications: 60 still-image cases and 16 GIF cases. Each case receives one unreported warm-up and five recorded executions.

- Expected executions: `76 × 6 = 456`.
- Expected raw result rows: `76 × 5 = 380`, with `run_number` 1–5.
- Expected case keys: `source_id + input_format + case_id`; a run key adds `run_number`.

A browser run may produce a different byte stream across browsers or releases. Keep every recorded attempt; do not retain only the smallest, fastest, or visually preferred output.

## Immutable release package

Create one new release directory per run; never overwrite a previous release.

```text
image-compression-benchmark/<benchmark_version>/
  README.md
  manifest/run-manifest.json
  manifest/corpus-manifest.csv
  manifest/case-manifest.csv
  scripts/                         # exact fixture and browser-run scripts
  inputs/                          # generated fixtures, keyed by input SHA-256
  outputs/                         # one artifact per execution, keyed by run key
  results/raw.csv                  # 380 recorded rows, including failures
  results/derived-summary.csv      # computed medians/ranges; never hand-entered
  review/                          # fixed crops, GIF timestamp frames, reviewer notes
```

`run-manifest.json` must record: `benchmark_version`, UTC start/end times, Git commit and dirty-state flag, package-lock SHA-256, source fixture tool versions and commands, browser name/version/channel/mode, OS/version, CPU model, memory, display/power state, serving command and URL, automation version, locale/time zone, corpus-manifest SHA-256, case-manifest SHA-256, and operator/reviewer identifiers. An incomplete manifest blocks publication.

`case-manifest.csv` freezes one row per unique case before execution:

```text
case_key,tool_route,source_id,input_format,input_sha256,case_id,quality_setting,output_selector,gif_compression,gif_max_colors,gif_frame_reduction,gif_scale_pct,expected_mime,expected_width,expected_height,expected_frames,expected_duration_ms
```

The case manifest records pre-run inputs, selected controls, and testable output-contract fields. It must not predict output size, quality score, runtime, or success.

## Raw-results data contract

Use [`image-compression-results-template.csv`](./image-compression-results-template.csv) unchanged for the raw observation fields, and add a release-local sidecar mapping from `benchmark_version` to `run-manifest.json` and `case-manifest.csv`.

For each recorded row:

- `input_*` is measured from the immutable fixture; `output_*` is measured from the downloaded artifact, never the UI label.
- `processing_ms_tool` is the tool-visible `performance.now()` interval; `processing_ms_wall` is an external automation monotonic-clock interval. They are distinct measurements.
- `byte_delta = output_bytes - input_bytes`; `size_change_pct = (output_bytes - input_bytes) / input_bytes × 100`; `compression_ratio = input_bytes / output_bytes`. Do not round stored values before calculation.
- `ssim` and `psnr_db` are blank when dimensions differ or decoding fails. `dimension_changed` is a boolean fact, not a quality judgment.
- `decode_status` is `PASS`, `FAIL`, or `NOT_PRODUCED`; `visual_review_status` is `PENDING`, `PASS`, `CONCERN`, or `NOT_REVIEWABLE`. Record failure reason, browser error, and retry decision in `warning`/`notes`.

No field may be backfilled from a screenshot, a rounded UI estimate, or another run. An absent output retains blank output metrics and a failure status; it is still a required row.

## Execution protocol

1. Freeze the case manifest, Git commit, lockfile hash, fixture-generator versions, and browser environment before the warm-up.
2. Verify source-license metadata and every input SHA-256 against the corpus manifest. Stop if either changes.
3. Serve the frozen build on a recorded local URL. Run one case at a time in a fresh documented browser context; set only the controls in the case manifest.
4. Download and hash every warm-up artifact separately. Exclude it from `raw.csv`, but retain it for audit.
5. Execute and record runs 1–5 in order. Capture the downloaded file, UI state, tool time, wall time, browser console/page errors, and output metadata for each.
6. Decode every output independently. Generate still-image crops or GIF timestamp frames from decoded outputs, not browser previews.
7. Generate `derived-summary.csv` by script from `raw.csv`: per-case median/min/max runtime and per-case byte/quality summaries. Keep failed and larger-output rows in both raw and summary counts.
8. Have a second reviewer reproduce a preregistered random 10% sample from a clean checkout and compare manifests, settings, hashes, and decoded metadata.

## Publication gates

Publish only if all 76 case keys have five recorded rows, all row-to-artifact hashes reconcile, all successful outputs independently decode, and the release contains its manifests, scripts, raw data, derived data, review assets, limitations, and correction contact. Otherwise publish no aggregate claim; an implementation progress note may state only the documented failure or missing artifact.

The benchmark evaluates this implementation and environment, not a universal codec ranking or a competitor comparison. Follow [the ethical outreach plan](./ethical-benchmark-outreach-plan.md) only after the gates pass.
