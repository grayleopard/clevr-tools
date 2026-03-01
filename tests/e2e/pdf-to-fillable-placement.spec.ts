import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFDocument, degrees } from "pdf-lib";

function fixture(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", name);
}

async function createRotatedFixture(): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-fillable-"));
  const outputPath = path.join(tempDir, "sample-rotated-90.pdf");
  const source = await fs.readFile(fixture("sample.pdf"));
  const pdf = await PDFDocument.load(source);
  pdf.getPage(0).setRotation(degrees(90));
  await fs.writeFile(outputPath, await pdf.save());
  return outputPath;
}

async function uploadAndPlaceAt(
  page: Page,
  pdfPath: string,
  xRatio: number,
  yRatio: number
): Promise<void> {
  await page.goto("/tools/pdf-to-fillable", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});

  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(pdfPath);

  const overlay = page.locator('[data-testid="pdf-fillable-overlay"]').first();
  await expect(overlay).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });
  await overlay.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => {
      const box = await overlay.boundingBox();
      return box?.height ?? 0;
    })
    .toBeGreaterThan(100);

  const overlayBox = await overlay.boundingBox();
  expect(overlayBox).not.toBeNull();

  const clickX = overlayBox!.width * xRatio;
  const clickY = overlayBox!.height * yRatio;
  await overlay.click({ position: { x: clickX, y: clickY } });

  await expect
    .poll(async () => page.locator("[data-field-id]").count(), { timeout: 10_000 })
    .toBeGreaterThan(0);

  const field = page.locator("[data-field-id]").first();
  const fieldBox = await field.boundingBox();
  expect(fieldBox).not.toBeNull();
  const overlayAfter = await overlay.boundingBox();
  expect(overlayAfter).not.toBeNull();

  const fieldLeftNorm = (fieldBox!.x - overlayAfter!.x) / overlayAfter!.width;
  const fieldTopNorm = (fieldBox!.y - overlayAfter!.y) / overlayAfter!.height;

  expect(Math.abs(fieldLeftNorm - xRatio)).toBeLessThan(0.14);
  expect(Math.abs(fieldTopNorm - yRatio)).toBeLessThan(0.14);

  const fieldHeightNorm = fieldBox!.height / overlayAfter!.height;
  expect(fieldHeightNorm).toBeGreaterThan(0.005);
  expect(fieldHeightNorm).toBeLessThan(0.2);

  await page.getByRole("button", { name: /Export Fillable PDF/i }).click();
  const downloadLink = page.locator('main a[href^="blob:"][download$=".pdf"]').first();
  await expect(downloadLink).toBeVisible({ timeout: 20_000 });
  await expect(downloadLink).toHaveAttribute("href", /blob:/);
}

test("/tools/pdf-to-fillable places a field and exports", async ({ page }) => {
  await uploadAndPlaceAt(page, fixture("sample.pdf"), 0.2, 0.2);
});

test("/tools/pdf-to-fillable handles rotated source pages", async ({ page }) => {
  const rotatedFixture = await createRotatedFixture();
  await uploadAndPlaceAt(page, rotatedFixture, 0.25, 0.25);
  await expect(page.getByText(/Rotation handled automatically/i)).toBeVisible();
});
