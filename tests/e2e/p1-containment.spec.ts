import { expect, test } from "@playwright/test";
import { CONTAINED_ROUTES } from "./tool-routes";

test.describe("P0/P1 direct-route containment", () => {
  for (const route of CONTAINED_ROUTES) {
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
