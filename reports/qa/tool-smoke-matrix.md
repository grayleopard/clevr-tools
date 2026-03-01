# Tool Smoke Matrix

## Scope

This matrix covers all public tool routes with Playwright smoke checks and adds file-tool happy-path checks for core conversion/compression flows.

## Standard Route Smoke Assertions (applied to every route)

- Route responds successfully (`< 400`) and page renders without Next runtime error text.
- `main h1` exists and is non-empty.
- Primary interactivity exists:
  - Convert/Compress/Files/Tools: file input or upload/drop control exists.
  - Text/Dev/Calc/Time/Type: at least one interactive control exists (`input|textarea|select|button`).
- No runtime JS failures captured as `pageerror` or console errors containing `Uncaught`, `TypeError`, or `ReferenceError`.
- Failure artifacts are captured by Playwright (`screenshot/video/trace` on failure).

## Route Matrix

| Category | Route | Route Smoke | Happy Path |
|---|---|---|---|

| convert | `/convert/heic-to-jpg` | yes | nightly-only E2E (PR CI skip) + deterministic Node quality test |
| convert | `/convert/jpg-to-pdf` | yes | yes (`sample.jpg`) |
| convert | `/convert/jpg-to-png` | yes | no |
| convert | `/convert/pdf-to-jpg` | yes | yes (`sample.pdf`) |
| convert | `/convert/png-to-jpg` | yes | no |
| convert | `/convert/png-to-pdf` | yes | no |
| convert | `/convert/png-to-webp` | yes | no |
| convert | `/convert/webp-to-png` | yes | no |
| convert | `/convert/word-to-pdf` | yes | skipped in CI allowlist (heavy/flaky in headless) |
| compress | `/compress/image` | yes | yes (`sample.jpg`) |
| compress | `/compress/pdf` | yes | yes (`sample.pdf`) |
| files | `/files/image-cropper` | yes | no |
| files | `/files/invoice-generator` | yes | no |
| tools | `/tools/merge-pdf` | yes | yes (`sample.pdf` x2) |
| tools | `/tools/pdf-to-fillable` | yes | no |
| tools | `/tools/rotate-pdf` | yes | no |
| tools | `/tools/split-pdf` | yes | no |
| text | `/text/case-converter` | yes | n/a |
| text | `/text/character-counter` | yes | n/a |
| text | `/text/find-and-replace` | yes | n/a |
| text | `/text/lorem-generator` | yes | n/a |
| text | `/text/remove-line-breaks` | yes | n/a |
| text | `/text/sort-lines` | yes | n/a |
| text | `/text/text-to-slug` | yes | n/a |
| text | `/text/word-counter` | yes | n/a |
| dev | `/dev/base64` | yes | n/a |
| dev | `/dev/color-picker` | yes | n/a |
| dev | `/dev/json-formatter` | yes | n/a |
| dev | `/dev/url-encoder` | yes | n/a |
| dev | `/dev/uuid` | yes | n/a |
| calc | `/calc/age` | yes | n/a |
| calc | `/calc/bmi` | yes | n/a |
| calc | `/calc/compound-interest` | yes | n/a |
| calc | `/calc/date-difference` | yes | n/a |
| calc | `/calc/discount` | yes | n/a |
| calc | `/calc/gpa` | yes | n/a |
| calc | `/calc/mortgage` | yes | n/a |
| calc | `/calc/percentage` | yes | n/a |
| calc | `/calc/tip` | yes | n/a |
| calc | `/calc/unit-converter` | yes | n/a |
| time | `/time/pomodoro` | yes | n/a |
| time | `/time/stopwatch` | yes | n/a |
| time | `/time/timer` | yes | n/a |
| type | `/type/typing-test` | yes | n/a |

## Fixtures

Stored in `tests/fixtures/`:

- `sample.pdf` (single-page tiny PDF)
- `sample.jpg` (tiny JPG)
- `sample.png` (tiny PNG)
- `sample.docx` (tiny DOCX)

## Notes on skips

- HEIC UI happy-path conversion is intentionally skipped in PR CI for stability, but a nightly-only Playwright HEIC check runs with longer timeout. Route smoke still validates page health and upload controls in PR CI.
- Word to PDF happy-path conversion is skipped in CI because browser-only conversion stack (`mammoth` + `html-to-pdfmake` + `pdfmake`) is heavy and has unstable timing in headless automation. Route smoke still validates route health, interactivity, and runtime errors.
