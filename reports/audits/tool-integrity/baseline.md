# Product Integrity Audit Baseline

Recorded on 2026-08-01 before audit-worker delegation.

## Repository state

- Foundation branch: `codex/seo-foundation`
- Foundation commit: `a3bff45bede1f6c0e799d38d7bd4ab20ba94cb70`
- Audit branch: `codex/tool-integrity-audit`
- Initial worktree: only `?? outputs/`; treated as user-owned and untouched.
- Project-local model configuration matched the requested Sol High / Luna Max defaults. Global configuration was not inspected or modified.

## Rebuilt inventory

- Registered tools: 114.
- Live registered tools: 112.
- Hidden/noindexed registered tools: 2 (`/tools/background-remover`, `/tools/pdf-to-fillable`).
- Additional tool-like products outside the registry: 2 (`/play/numble`, `/play/meme-generator`).
- App page definitions: 128.
- Blog posts generated from the dynamic route: 8.
- Noindexed Meme Generator template variants: 30.
- Production build output: 174 generated pages/assets.
- `/files/image-resizer` does not exist in the current route tree; `/tools/resize-image` is the registered implementation.

## Baseline gates

- `npm run build`: PASS; 174 pages generated.
- `npm run lint`: PASS with 0 errors and 3 warnings in `ImagesToPdf.tsx`, `PokerCalculator.tsx`, and `WordToPdf.tsx`.
- `npx tsc --noEmit`: PASS.
- `npm test`: 12 passed, 4 failed. The HEIC tests fail because the installed Sharp/libvips lacks HEIF decoding; the fillable-PDF tests fail because Node lacks `DOMMatrix` for pdf.js.
- `npm run test:bundle-budget`: PASS. Each monitored route was 553 KiB; largest shared chunk was 223 KiB.
- `npm run test:e2e`: 276 passed, 3 failed, 8 skipped out of 287. Failures: two older file-happy tests time out waiting for button labels that differ from the current UI, and the rotated fillable-PDF test expects a removed `View upright` control. The newer registry/fixture audit coverage passed those two file conversions.
- `git diff --check`: PASS.

These failures predate audit artifacts and are the comparison point for the final gate run.
