import { expect, test } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  permissions: ["clipboard-read", "clipboard-write"],
});

test("Data Size exposes truthful modes, precision, copy, and a clean mobile route", async ({ page }) => {
  await page.goto("/calc/convert/data", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

  await expect(page.getByRole("button", { name: /SI decimal/i })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByText(/Default · kB, MB, GB, TB and PB use powers of 1,000/)).toBeVisible();

  await page.getByRole("button", { name: /Compare both/i }).click();
  await page.getByLabel("From unit").selectOption("TB");
  await page.getByLabel("To unit").selectOption("GiB");
  await page.getByLabel("Result precision").selectOption("15");
  await page.locator("#from-value").fill("1");

  await expect(page.locator("#to-value")).toHaveValue("931.322574615479");
  await page.getByRole("button", { name: "Copy converted result" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "931.322574615479 GiB"
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.clevr.tools/calc/convert/data"
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(new URL(page.url()).pathname).toBe("/calc/convert/data");
  expect(new URL(page.url()).search).toBe("");
});

test("Mbps to Gbps stays limited to transfer-rate units", async ({ page }) => {
  await page.goto("/calc/convert/mbps-to-gbps", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

  await expect(page.getByRole("button", { name: /SI decimal/i })).toHaveCount(0);
  await expect(page.getByLabel("From unit").locator("option")).toHaveText(["Megabits (Mbit)", "Gigabits (Gbit)"]);
  await expect(page.getByLabel("To unit").locator("option")).toHaveText(["Megabits (Mbit)", "Gigabits (Gbit)"]);

  await page.locator("#from-value").fill("1000");
  await expect(page.locator("#to-value")).toHaveValue("1");
});
