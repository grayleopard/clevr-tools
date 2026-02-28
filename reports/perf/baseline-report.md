# Baseline Report (Mobile, Local)

Captured with:
- `npm run perf:baseline`
- Headless Chrome mobile emulation + CDP trace (`scripts/perf/measure-web-vitals.mjs`)

## Homepage (`/`)
- FCP: 1012 ms
- LCP: 1012 ms
- TBT: 25 ms
- CLS: 0.001
- JS transfer: 421.9 KiB
- LCP node: `main.flex-1 > section.border-b.border-border > div.mx-auto.max-w-4xl > div.mb-8.text-center > h1.text-3xl.font-semibold`
- Render-blocking CSS: `/_next/static/chunks/40b8750f7ed9d6d3.css` (17.6 KiB, ~695 ms)

## Tool pages
- `/compress/image`: FCP 976 ms, LCP 976 ms, TBT 42 ms
- `/convert/pdf-to-jpg`: FCP 996 ms, LCP 996 ms, TBT 13 ms

Artifacts:
- `reports/perf/baseline-web-vitals.json`
- `reports/perf/baseline-route-bytes.txt`
