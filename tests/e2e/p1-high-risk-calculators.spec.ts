import { expect, test } from "@playwright/test";

test("Body Fat uses equivalent centimeter inputs for the legacy circumference equation", async ({ page }) => {
  await page.goto("/calc/body-fat", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Legacy Circumference Estimate", { exact: true })).toBeVisible();
  await expect(page.getByText("17.2%", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/not the Navy's current official Body Composition Assessment/i).first()
  ).toBeVisible();

  await page.getByRole("button", { name: "Metric", exact: true }).click();
  await page.getByLabel("Height (cm)").fill("177.8");
  await page.getByLabel("Neck (cm)").fill("38.1");
  await page.getByLabel("Waist (cm)").fill("86.36");
  await expect(page.getByText("17.2%", { exact: true })).toBeVisible();

  await page.getByLabel("Waist (cm)").fill("30");
  await expect(page.getByText(/Waist must be larger than neck/i)).toBeVisible();
});
