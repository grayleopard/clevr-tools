import { expect, test } from "@playwright/test";

test.describe("converter recovery discovery and support content", () => {
  test("Calculate exposes the focused conversion hub", async ({ page }) => {
    await page.goto("/calculate", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Common conversions" })).toBeVisible();
    const conversionHub = page.locator("#section-common-conversions");
    await expect(conversionHub.getByRole("link", { name: /Data Size Converter/ })).toHaveAttribute(
      "href",
      "/calc/convert/data"
    );
    await expect(conversionHub.getByRole("link", { name: /Speed Converter/ })).toHaveAttribute(
      "href",
      "/calc/convert/speed"
    );
    await expect(conversionHub.getByRole("link", { name: /Angle Converter/ })).toHaveAttribute(
      "href",
      "/calc/convert/angle"
    );
  });

  for (const route of [
    "/calc/convert/data",
    "/calc/convert/speed",
    "/calc/convert/angle",
  ]) {
    test(`${route} renders verified FAQs and FAQ schema`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
      expect(
        await page.evaluate(() =>
          Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(
            (script) => JSON.parse(script.textContent ?? "{}")["@type"] === "FAQPage"
          )
        )
      ).toBe(true);
    });
  }

  test("the conversion hub stays within a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/calculate", { waitUntil: "domcontentloaded" });

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(
      page.locator("#section-common-conversions").getByRole("link", { name: /Data Size Converter/ })
    ).toBeVisible();
  });
});
