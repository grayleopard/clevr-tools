import path from "node:path";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { createRequire } from "node:module";

const parsePdf = createRequire(path.join(process.cwd(), "package.json"))("pdf-parse/lib/pdf-parse.js") as
  (bytes: Buffer) => Promise<{ text: string }>;

function fixture(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", name);
}

async function upload(pagePath: string, filePaths: string | string[], page: import("@playwright/test").Page) {
  await page.goto(pagePath, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(filePaths);

  const firstFile = Array.isArray(filePaths) ? filePaths[0] : filePaths;
  const fileName = path.basename(firstFile);
  await expect(page.locator("main").getByText(fileName, { exact: false }).first()).toBeVisible({
    timeout: 10_000,
  });
}

async function expectDownloadUi(page: import("@playwright/test").Page) {
  await expect
    .poll(
      async () => {
        const links = await page.locator('main a[href^="blob:"]').count();
        const buttons = await page.getByRole("button", { name: /download/i }).count();
        return links + buttons;
      },
      { timeout: 30_000 }
    )
    .toBeGreaterThan(0);
}

test.describe("file tool happy paths", () => {
  test("/convert/pdf-to-jpg converts a small PDF", async ({ page }) => {
    await upload("/convert/pdf-to-jpg", fixture("sample.pdf"), page);
    await page.getByRole("button", { name: /Convert \d+ pages? to JPG/i }).click();

    await expect(page.getByText(/converted to JPG successfully/i)).toBeVisible({ timeout: 45_000 });
    await expectDownloadUi(page);
  });

  test("/convert/jpg-to-pdf creates a PDF", async ({ page }) => {
    await upload("/convert/jpg-to-pdf", fixture("sample.jpg"), page);
    await page.getByRole("button", { name: /Download$/i }).click();

    await expectDownloadUi(page);
  });

  test("/compress/image compresses a small JPG", async ({ page }) => {
    await upload("/compress/image", fixture("sample.jpg"), page);

    await expectDownloadUi(page);
  });

  test("/compress/pdf compresses a small PDF", async ({ page }) => {
    await upload("/compress/pdf", fixture("sample.pdf"), page);

    await expect(page.getByText(/^Results$/)).toBeVisible({ timeout: 30_000 });
    await expectDownloadUi(page);
  });

  test("/tools/merge-pdf merges two PDFs", async ({ page }) => {
    const pdf = fixture("sample.pdf");
    await upload("/tools/merge-pdf", [pdf, pdf], page);
    await page.getByRole("button", { name: /Merge\s+\d+\s+PDFs/i }).click();

    await expectDownloadUi(page);
  });

  test("/convert/word-to-pdf converts a tiny DOCX", async ({ page }) => {
    test.setTimeout(60_000);
    await upload("/convert/word-to-pdf", fixture("sample.docx"), page);
    await expect(page.getByText("Document Preview", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Convert to PDF", exact: true }).click();
    const link = page.locator('main a[download][href^="blob:"]').first();
    await expect(link).toBeVisible({ timeout: 35_000 });
    const downloadPromise = page.waitForEvent("download");
    await link.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("sample.pdf");
    const output = await download.path();
    expect(output).not.toBeNull();
    const bytes = await readFile(output!);
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(0);
    expect((await parsePdf(bytes)).text).toContain("clevr.tools sample DOCX");
  });

  test("/files/invoice-generator downloads a readable PDF", async ({ page }) => {
    await page.goto("/files/invoice-generator");
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
    await page.getByPlaceholder("Service or product").first().fill("Synthetic test service");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PDF", exact: true }).first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("invoice-INV-001.pdf");
    const output = await download.path();
    expect(output).not.toBeNull();
    const bytes = await readFile(output!);
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(0);
    expect((await parsePdf(bytes)).text).toContain("Synthetic test service");
  });
});
