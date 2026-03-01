import path from "node:path";
import { expect, test } from "@playwright/test";

function fixture(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", name);
}

test("/tools/pdf-to-fillable places a field and exports", async ({ page }) => {
  await page.goto("/tools/pdf-to-fillable", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});

  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(fixture("sample.pdf"));

  const overlay = page.locator('[data-testid="pdf-fillable-overlay"]').first();
  await expect(overlay).toBeVisible({ timeout: 20_000 });
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox).not.toBeNull();

  const clickX = overlayBox!.x + overlayBox!.width * 0.25;
  const clickY = overlayBox!.y + overlayBox!.height * 0.25;
  await page.mouse.click(clickX, clickY);

  const field = page.locator("[data-field-id]").first();
  await expect(field).toBeVisible({ timeout: 10_000 });
  const fieldBox = await field.boundingBox();
  expect(fieldBox).not.toBeNull();

  const leftNorm = (fieldBox!.x - overlayBox!.x) / overlayBox!.width;
  const topNorm = (fieldBox!.y - overlayBox!.y) / overlayBox!.height;
  expect(leftNorm).toBeGreaterThan(0.05);
  expect(leftNorm).toBeLessThan(0.45);
  expect(topNorm).toBeGreaterThan(0.05);
  expect(topNorm).toBeLessThan(0.45);

  await page.getByRole("button", { name: /Export Fillable PDF/i }).click();
  const downloadLink = page.locator('main a[href^="blob:"][download$=".pdf"]').first();
  await expect(downloadLink).toBeVisible({ timeout: 20_000 });
  await expect(downloadLink).toHaveAttribute("href", /blob:/);
  await expect(page.locator("main").getByText(/KB|MB|B/).first()).toBeVisible();
});
