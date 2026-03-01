import path from "node:path";
import { expect, test } from "@playwright/test";

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
    await page.getByRole("button", { name: /Convert to JPG/i }).click();

    await expect(page.getByText(/converted to JPG successfully/i)).toBeVisible({ timeout: 45_000 });
    await expectDownloadUi(page);
  });

  test("/convert/jpg-to-pdf creates a PDF", async ({ page }) => {
    await upload("/convert/jpg-to-pdf", fixture("sample.jpg"), page);
    await page.getByRole("button", { name: /Create PDF/i }).click();

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
    test.skip(true, "Word to PDF conversion is heavy/flaky in headless CI; covered by route smoke.");
    await upload("/convert/word-to-pdf", fixture("sample.docx"), page);
    await expectDownloadUi(page);
  });
});
