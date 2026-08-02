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

  for (const entry of [
    { input: "sample.jpg", type: "JPG", action: /^Convert to PNG/, route: "/convert/jpg-to-png" },
    { input: "sample.webp", type: "WEBP", action: /^Convert to PNG/, route: "/convert/webp-to-png" },
    { input: "sample.png", type: "PNG", action: /^Convert to WebP/, route: "/convert/png-to-webp" },
  ]) {
    test(`Smart Converter routes ${entry.type} through a matching input contract`, async ({ page }) => {
      await uploadSmartFile(page, fixture(entry.input), entry.type);
      await page.getByRole("button", { name: entry.action }).click();
      await expect(page).toHaveURL(new RegExp(`${entry.route}$`), { timeout: 15_000 });
    });
  }
});
