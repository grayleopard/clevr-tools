# Search recovery release — September 6, 2026

This release restores the HEIC to JPG route after replacing the unreliable decoder, and improves data, speed, weight, and percentage calculators. Historical HEIC containment findings remain valid records of the old implementation; the relaunch evidence is the new search-recovery browser suite.

## Product and search changes

- HEIC to JPG runs in an owned worker with a 15-second deadline, cancellation, cleanup, signature validation, a 50 MB input limit, a 50-megapixel output cap, JPEG preview, and sequential batch downloads. Duplicate filenames remain separate in ZIP output.
- A pinned heic-to 1.5.2 decoder replaces heic2any. HEIC is restored to the sitemap, site search, and image-conversion category. Its page has a self-canonical and public metadata through the registry. The homepage Smart Converter continues to omit HEIC actions; this release enables the dedicated route.
- Visible HEIC copy and FAQs describe still-image output and explicitly exclude Live Photo motion, depth data, and original metadata preservation. Browser/format compatibility is bounded by the tested corpus, not a promise for every HEIF variant. Source and license notices are at `/third-party/heic-to/NOTICE.txt`.
- Data, speed, and weight tools have useful single-click examples with server-rendered answers. Existing canonical URLs are retained. Speed wording covers km/h, kmh, and kph. Weight uses exact pound, ounce, and stone definitions, has stronger category links, and avoids duplicated supporting copy.
- Converter parsing rejects partial or nonfinite values. Swap preserves the quantity; Reset restores defaults. Speed and weight expose precision and copy controls.
- Percentage change correctly labels equal values and explains unsupported baselines and overflow.
- Calculator analytics emit only allowlisted started, succeeded, and copy events plus tool ID. No entered values or calculated results are sent; defaults do not count as successful use. A success event means the first valid result after interaction, not proof the visitor finished their task.

## Validation

The regression suite independently parses downloaded JPGs and compares dimensions and reduced-resolution pixels with macOS-decoded references. It covers small HEICs, two 12-megapixel iPhone XR images, a portrait image, invalid input, cancellation, and duplicate-name ZIP contents. Fixtures retain their MIT/CC0 license notices. Browser runs cover Chromium, Firefox, and WebKit. Unit tests check arithmetic, parsing, worker termination, and the analytics payload contract.

Run `npm run lint`, `npm test`, `npm run build -- --webpack`, `npm run test:e2e`, and `npm run test:bundle-budget`. Run the focused suite with `PLAYWRIGHT_BROWSER=firefox` or `PLAYWRIGHT_BROWSER=webkit` for cross-browser checks.

## Release and measurement

After deployment, verify the HEIC route returns 200, has no noindex directive, is present in the sitemap, and creates valid JPGs. Inspect its live URL in Search Console and request indexing. This requests reconsideration; it does not guarantee indexing or rankings.

Compare complete seven-day windows with matching weekdays in Search Console. Track page/query impressions, clicks, and position separately for data, speed, weight, percentage, and HEIC, split by device and country. Use the new calculator events to judge tool use alongside search exposure. Account-specific Search Console data stays outside this public repository.

Rollback: revert the release commit and redeploy. If only HEIC fails, contain that route again and remove it from the manual search index and category list, updating the discovery assertions together.
