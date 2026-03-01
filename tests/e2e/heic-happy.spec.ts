import path from "node:path";
import { expect, test } from "@playwright/test";

test.skip(process.env.RUN_HEIC_E2E !== "1", "nightly-only HEIC browser happy-path");

test("/convert/heic-to-jpg converts HEIC fixture to downloadable JPG", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/convert/heic-to-jpg", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});

  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();

  const fixture = path.join(process.cwd(), "tests", "fixtures", "sample.heic");
  await input.setInputFiles(fixture);

  await expect
    .poll(
      async () => {
        const blobLinks = await page.locator('main a[href^="blob:"]').count();
        const downloadButtons = await page.getByRole("button", { name: /download/i }).count();
        return blobLinks + downloadButtons;
      },
      { timeout: 90_000 }
    )
    .toBeGreaterThan(0);
});
