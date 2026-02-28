# Security Header Baseline

This document describes the baseline headers added in `next.config.ts` and why they were chosen.

## Threat Model (Short)
- The app processes user-provided files client-side and renders preview/content in the same origin.
- A successful script injection in that origin could exfiltrate file-derived content or manipulate conversion UX.
- Baseline browser-enforced policies reduce injection impact and block framing/clickjacking vectors.

## Headers Added

- `Content-Security-Policy`
  - `default-src 'self'`
  - `base-uri 'self'`
  - `form-action 'self'`
  - `frame-ancestors 'none'`
  - `object-src 'none'`
  - `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com` (`'unsafe-eval'` only in non-production)
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: blob: https://www.google-analytics.com https://stats.g.doubleclick.net`
  - `font-src 'self' data:`
  - `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com`
  - `worker-src 'self' blob:`
  - `child-src 'self' blob:`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (legacy defense-in-depth; CSP `frame-ancestors` is primary)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (production only)

## Compatibility Notes
- `script-src` currently keeps `'unsafe-inline'` for compatibility with existing inline scripts (JSON-LD and analytics queue stub). Follow-up should migrate to nonce/hash-based CSP.
- Analytics endpoints are explicitly allowlisted to preserve tracking behavior.
- Worker policy allows same-origin and blob workers needed by conversion flows.

## Follow-ups
1. Replace inline scripts with nonce/hash strategy and remove `'unsafe-inline'` from `script-src`.
2. Add CSP report-only endpoint during tightening to catch breakage safely.
3. Re-check analytics endpoints periodically and keep allowlist minimal.
