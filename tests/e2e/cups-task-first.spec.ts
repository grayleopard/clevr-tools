import { expect, test } from "@playwright/test";

test("Cups to mL presets keep the converter accurate and easy to reach", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/calc/convert/cups-to-ml", { waitUntil: "networkidle" });

  const from = page.getByLabel("From", { exact: true });
  const to = page.getByLabel("To", { exact: true });
  const bounds = await from.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThan(1080);

  await page.getByRole("button", { name: "1/8 cup", exact: true }).click();
  expect(await from.inputValue()).toBe("0.125");
  expect(Number(await to.inputValue())).toBeCloseTo(29.5735, 4);

  await page.getByRole("button", { name: "1/3 cup", exact: true }).click();
  expect(Number(await to.inputValue())).toBeCloseTo(236.588 / 3, 6);
  await expect(page.getByRole("table")).toHaveCount(1);
});

test("Cups to mL remains usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/calc/convert/cups-to-ml", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "1 1/4 cups", exact: true }).click();
  expect(Number(await page.getByLabel("To", { exact: true }).inputValue())).toBeCloseTo(295.735, 3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
