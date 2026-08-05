# Image compression benchmark harness

This harness implements the frozen corpus and browser-run contract in `reports/seo/image-compression-benchmark-brief.md`. Generated releases go under ignored `benchmark-artifacts/`; they are evidence packages, not application assets.

1. Build and serve a clean production commit on a fixed local URL. Set `CLEVR_BUILD_COMMIT=<the exact 40-character Git commit>` during `npm run build`; the runner verifies that value from the served page before measuring anything.
2. Prepare an immutable release:

   `npm run benchmark:image:prepare -- --version 2026-08-04-release-01 --operator NAME --reviewer NAME`

3. Prove the pipeline with one case, one warm-up, and five recorded runs:

   For an intentionally dirty dry run only, add `--allow-dirty-pilot` to preparation and add both `--allow-dirty-pilot` and `--allow-unverified-build-pilot` to execution. These flags permanently disqualify that release from approval.

   `npm run benchmark:image:run -- --release benchmark-artifacts/image-compression/2026-08-04-release-01 --base-url http://127.0.0.1:3101 --case-limit 1`

4. Prepare a new release version before the complete 76-case run. Never overwrite or present a pilot as benchmark evidence.

The runner targets each slider's accessible control and verifies its resulting `aria-valuenow`. It also verifies every settings button's selected `aria-pressed` state before attaching an input. A manifest setting is not accepted as evidence unless the live UI confirms it.

The runner always marks generated work as not publication-ready. After a 380-row passing run, generate the review package with `npm run benchmark:image:review -- --release <release-directory>`. A complete automated run still requires a human to inspect those crops/sheets, second-reviewer reproduction, correction contact, and release approval. Copy `release-approval.template.json` into the release as `review/release-approval.json`, fill it with real evidence, and run `npm run benchmark:image:approve -- --release <release-directory>`. The approval command re-hashes every artifact and refuses approval unless every gate passes.
