import path from "node:path";
import { promises as fs } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const EVIDENCE_DIR = "/tmp/clevr-p1-remediation";

function fixture(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", name);
}

async function uploadSmartFile(page: Page, file: string, typeLabel: string): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const input = page
    .locator('input[id^="deferred-converter-input-"], input[id^="smart-converter-input-"]')
    .first();
  await expect(input).toBeAttached();
  await input.setInputFiles(file);
  await expect(
    page.locator("p").filter({ hasText: new RegExp(`^${typeLabel} detected`, "i") })
  ).toBeVisible({ timeout: 15_000 });
}

test.beforeAll(async () => {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  await fs.writeFile(path.join(EVIDENCE_DIR, "invalid.heic"), "not a HEIC file");
  await fs.writeFile(path.join(EVIDENCE_DIR, "renamed.pdf"), "not a PDF file");
});

test.describe("P1 file and image remediations", () => {
  test("HEIC route contains the unreliable browser decoder immediately and actionably", async ({ page }) => {
    const started = Date.now();
    await page.goto("/convert/heic-to-jpg", { waitUntil: "domcontentloaded" });
    const notice = page.getByRole("status").filter({ hasText: /temporarily unavailable/i });
    await expect(notice).toContainText(/browser decoder can stall/i);
    await expect(notice).toContainText(/disabled until/i);
    await expect(page.locator('main input[type="file"]')).toHaveCount(0);
    await expect(page.getByText(/Converting HEIC to JPG/i)).toHaveCount(0);
    expect(Date.now() - started).toBeLessThan(5_000);
    const message = (await notice.textContent()) ?? "";
    await fs.writeFile(
      path.join(EVIDENCE_DIR, "heic-browser-outcome.json"),
      JSON.stringify(
        { outcome: "contained-route", elapsedMs: Date.now() - started, message },
        null,
        2
      )
    );
  });

  test("Smart Converter hides unsupported HEIC, JPG, and WebP actions", async ({ page }) => {
    await uploadSmartFile(page, fixture("sample.heic"), "HEIC");
    await expect(page.getByRole("button", { name: /^Convert to JPG/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Convert to PNG/ })).toHaveCount(0);
    await expect(page.getByText(/No tools available for this file type yet/i)).toBeVisible();

    await uploadSmartFile(page, fixture("sample.jpg"), "JPG");
    await expect(page.getByRole("button", { name: /^Convert to PNG/ })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /^Convert to WebP/ })).toHaveCount(0);

    await uploadSmartFile(page, fixture("sample.webp"), "WEBP");
    await expect(page.getByRole("button", { name: /^Convert to PNG/ })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /^Convert to JPG/ })).toHaveCount(0);
  });

  test("Smart Converter rejects renamed content before exposing actions", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const input = page
      .locator('input[id^="deferred-converter-input-"], input[id^="smart-converter-input-"]')
      .first();
    await expect(input).toBeAttached();
    await input.setInputFiles(path.join(EVIDENCE_DIR, "renamed.pdf"));
    await expect(page.locator('[id^="smart-converter-error-"]')).toContainText(
      /contents do not match/i
    );
    await expect(
      page.locator("main button").filter({
        hasText: /^(Compress|Convert to|Merge|Split|Rotate)/i,
      })
    ).toHaveCount(0);
  });

  for (const entry of [
    { input: "sample.jpg", type: "JPG", action: /^Convert to PNG/, route: "/convert/jpg-to-png", output: /\.png$/i },
    { input: "sample.webp", type: "WEBP", action: /^Convert to PNG/, route: "/convert/webp-to-png", output: /\.png$/i },
    { input: "sample.png", type: "PNG", action: /^Convert to WebP/, route: "/convert/png-to-webp", output: /\.webp$/i },
  ]) {
    test(`Smart Converter hands ${entry.type} to a matching processor`, async ({ page }) => {
      await uploadSmartFile(page, fixture(entry.input), entry.type);
      await page.getByRole("button", { name: entry.action }).click();
      await expect(page).toHaveURL(new RegExp(`${entry.route}$`), { timeout: 15_000 });
      const artifact = page.locator('a[download]').first();
      await expect(artifact).toBeVisible({ timeout: 15_000 });
      await expect(artifact).toHaveAttribute("download", entry.output);
      await expect(artifact).toHaveAttribute("href", /^blob:/);
    });
  }
});
