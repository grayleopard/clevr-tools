# Performance Summary (Mobile, Local)

## Baseline report

- LCP element (homepage):
  - `main.flex-1 > section.border-b.border-border > div.mx-auto.max-w-4xl > div.mb-8.text-center > h1.text-3xl.font-semibold`
  - Text: `Fast, free, private tools for everyday tasks.`
- Primary LCP blockers observed:
  - Render-blocking stylesheet: `/_next/static/chunks/40b8750f7ed9d6d3.css` (~17.6 KiB, ~695 ms in trace)
  - High initial homepage JS transfer (~421.9 KiB)
  - Eager homepage converter and client navbar hydration path

## Before vs After (from local mobile traces)

| URL | Metric | Before | After | Delta |
|---|---:|---:|---:|---:|
| `/` | FCP | 1012 ms | 412 ms | -600 ms |
| `/` | LCP | 1012 ms | 412 ms | -600 ms |
| `/` | TBT | 25 ms | 27 ms | +2 ms |
| `/` | JS transfer | 421.9 KiB | 296.0 KiB | -125.9 KiB |
| `/` | Render-blocking CSS | 1 request | 0 | eliminated |
| `/compress/image` | FCP | 976 ms | 364 ms | -612 ms |
| `/compress/image` | LCP | 976 ms | 364 ms | -612 ms |
| `/compress/image` | TBT | 42 ms | 38 ms | -4 ms |
| `/compress/image` | Render-blocking CSS | 1 request | 0 | eliminated |
| `/convert/pdf-to-jpg` | FCP | 996 ms | 360 ms | -636 ms |
| `/convert/pdf-to-jpg` | LCP | 996 ms | 360 ms | -636 ms |
| `/convert/pdf-to-jpg` | TBT | 13 ms | 16 ms | +3 ms |
| `/convert/pdf-to-jpg` | Render-blocking CSS | 1 request | 0 | eliminated |

## Bundle/route bytes (build output approximation)

| Route | Before JS | After JS | Delta |
|---|---:|---:|---:|
| `/` | 695.3 KiB | 615.6 KiB | -79.7 KiB |
| `/compress/image` | 1220.3 KiB | 1281.5 KiB | +61.2 KiB |
| `/convert/pdf-to-jpg` | 718.0 KiB | 694.4 KiB | -23.6 KiB |

## Verification commands

```bash
npm run perf:baseline
npm run perf:after
```

Artifacts:
- `reports/perf/baseline-web-vitals.json`
- `reports/perf/after-web-vitals.json`
- `reports/perf/baseline-route-bytes.txt`
- `reports/perf/after-route-bytes.txt`
