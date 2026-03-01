import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
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
  await placeAndExport(page, overlay, xRatio, yRatio);
}

async function placeAndExport(
  page: Page,
  overlay: Locator,
  xRatio: number,
  yRatio: number
): Promise<void> {
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
  const fieldWidthNorm = fieldBox!.width / overlayAfter!.width;
  const longSideNorm = Math.max(fieldHeightNorm, fieldWidthNorm);
  expect(longSideNorm).toBeGreaterThan(0.02);
  expect(longSideNorm).toBeLessThan(0.85);

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20_000 }),
    page.getByRole("button", { name: /Download Fillable PDF/i }).click(),
  ]);

  const outputPath = await download.path();
  expect(outputPath).toBeTruthy();
  const outputBytes = await fs.readFile(outputPath!);
  const outputPdf = await PDFDocument.load(outputBytes);
  const fields = outputPdf.getForm().getFields();
  expect(fields.length).toBeGreaterThan(0);

  const firstFieldRect = fields[0].acroField.getWidgets()[0].getRectangle();
  const firstPage = outputPdf.getPage(0);
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  expect(firstFieldRect.x).toBeGreaterThanOrEqual(0);
  expect(firstFieldRect.y).toBeGreaterThanOrEqual(0);
  expect(firstFieldRect.x + firstFieldRect.width).toBeLessThanOrEqual(pageWidth + 1);
  expect(firstFieldRect.y + firstFieldRect.height).toBeLessThanOrEqual(pageHeight + 1);
}

test("/tools/pdf-to-fillable places a field and exports", async ({ page }) => {
  await uploadAndPlaceAt(page, fixture("sample.pdf"), 0.2, 0.2);
});

test("/tools/pdf-to-fillable handles rotated source pages", async ({ page }) => {
  const rotatedFixture = await createRotatedFixture();
  const canvasRenderErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("Cannot use the same canvas during multiple render() operations")) {
      canvasRenderErrors.push(text);
    }
  });
  page.on("pageerror", (error) => {
    const text = String(error?.message || "");
    if (text.includes("Cannot use the same canvas during multiple render() operations")) {
      canvasRenderErrors.push(text);
    }
  });

  await page.goto("/tools/pdf-to-fillable?debug=1", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});

  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(rotatedFixture);

  const overlay = page.locator('[data-testid="pdf-fillable-overlay"]').first();
  await expect(overlay).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });

  const uprightToggle = page.getByRole("checkbox", { name: /View upright/i });
  await expect(uprightToggle).toBeChecked();
  await expect(page.getByText(/page\.rotate 90°/i)).toBeVisible();
  await expect(page.getByText(/sourceRotation 90°/i)).toBeVisible();
  await expect(page.getByText(/cancelRotation 270°/i)).toBeVisible();
  await expect(page.getByText(/viewUpright true/i)).toBeVisible();
  await expect(page.getByText(/viewportRotation 270°/i)).toBeVisible();

  await uprightToggle.uncheck();
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByText(/viewUpright false/i)).toBeVisible();
  await expect(page.getByText(/viewportRotation 90°/i)).toBeVisible();

  await uprightToggle.check();
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });
  await uprightToggle.uncheck();
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });
  await uprightToggle.check();
  await expect(page.getByText(/Rendering page…/i)).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByText(/viewUpright true/i)).toBeVisible();
  await expect(page.getByText(/viewportRotation 270°/i)).toBeVisible();
  await expect
    .poll(async () => {
      const box = await overlay.boundingBox();
      return box?.height ?? 0;
    })
    .toBeGreaterThan(100);

  await placeAndExport(page, overlay, 0.25, 0.25);
  expect(canvasRenderErrors).toHaveLength(0);
});
