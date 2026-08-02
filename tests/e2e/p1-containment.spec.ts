import { expect, test } from "@playwright/test";

const containedRoutes = [
  "/tools/background-remover",
  "/convert/heic-to-jpg",
  "/calc/poker",
  "/calc/take-home-pay",
  "/calc/paycheck",
] as const;

test.describe("P0/P1 direct-route containment", () => {
  for (const route of containedRoutes) {
    test(`${route} is noindexed and exposes no operational control`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/i
      );
      await expect(page.locator("main").getByRole("status")).toBeVisible();
      await expect(page.locator("main input, main textarea, main select")).toHaveCount(0);
      await expect(
        page
          .locator("main")
          .getByRole("button", { name: /upload|browse|choose|submit|process|convert|calculate|generate/i })
      ).toHaveCount(0);
    });
  }
});
