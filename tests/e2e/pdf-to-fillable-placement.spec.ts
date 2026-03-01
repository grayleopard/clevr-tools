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
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });
  await expect
    .poll(async () => {
      const box = await overlay.boundingBox();
      return box?.height ?? 0;
    })
    .toBeGreaterThan(100);
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox).not.toBeNull();

  const clickX = overlayBox!.width * 0.5;
  const clickY = overlayBox!.height * 0.5;
  await overlay.click({ position: { x: clickX, y: clickY } });

  await expect
    .poll(async () => page.locator("[data-field-id]").count(), { timeout: 10_000 })
    .toBeGreaterThan(0);

  const field = page.locator("[data-field-id]").first();
  const fieldBox = await field.boundingBox();
  expect(fieldBox).not.toBeNull();
  const overlayAfter = await overlay.boundingBox();
  expect(overlayAfter).not.toBeNull();

  const fieldCenterX = fieldBox!.x + fieldBox!.width / 2;
  const fieldCenterY = fieldBox!.y + fieldBox!.height / 2;
  const fieldCenterXNorm = (fieldCenterX - overlayAfter!.x) / overlayAfter!.width;
  const fieldCenterYNorm = (fieldCenterY - overlayAfter!.y) / overlayAfter!.height;
  expect(Math.abs(fieldCenterXNorm - 0.5)).toBeLessThan(0.2);
  expect(Math.abs(fieldCenterYNorm - 0.5)).toBeLessThan(0.2);

  const fieldHeightNorm = fieldBox!.height / overlayBox!.height;
  expect(fieldHeightNorm).toBeGreaterThan(0.005);
  expect(fieldHeightNorm).toBeLessThan(0.2);

  await page.getByRole("button", { name: /Export Fillable PDF/i }).click();
  const downloadLink = page.locator('main a[href^="blob:"][download$=".pdf"]').first();
  await expect(downloadLink).toBeVisible({ timeout: 20_000 });
  await expect(downloadLink).toHaveAttribute("href", /blob:/);
  await expect(page.locator("main").getByText(/KB|MB|B/).first()).toBeVisible();
});
