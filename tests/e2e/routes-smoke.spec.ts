import { expect, test } from "@playwright/test";
import { TOOL_ROUTES, FILE_TOOL_CATEGORIES, categoryForRoute } from "./tool-routes";

test.describe("tool route smoke", () => {
  test.describe.configure({ mode: "parallel" });

  for (const route of TOOL_ROUTES) {
    test(`loads ${route}`, async ({ page }) => {
      const runtimeErrors: string[] = [];

      page.on("pageerror", (err) => {
        runtimeErrors.push(`pageerror: ${err.message}`);
      });

      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (/(Uncaught|TypeError|ReferenceError)/i.test(text)) {
          runtimeErrors.push(`console: ${text}`);
        }
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response, `missing response for ${route}`).not.toBeNull();
      expect(response!.status(), `bad status on ${route}`).toBeLessThan(400);

      const h1 = page.locator("main h1").first();
      await expect(h1, `missing h1 on ${route}`).toBeVisible();
      const h1Text = (await h1.textContent())?.trim() ?? "";
      expect(h1Text.length, `empty h1 on ${route}`).toBeGreaterThan(0);

      await expect(
        page.getByText(/Application error|Unhandled Runtime Error|Internal Server Error/i),
        `next runtime overlay text shown on ${route}`
      ).toHaveCount(0);

      const main = page.locator("main");
      const category = categoryForRoute(route);

      if (FILE_TOOL_CATEGORIES.has(category)) {
        const fileInputs = await main.locator('input[type="file"]').count();
        const uploadButtons = await main
          .getByRole("button", { name: /upload|browse|choose|select|drag/i })
          .count();
        expect(
          fileInputs + uploadButtons,
          `expected file input/upload control on ${route}`
        ).toBeGreaterThan(0);
      } else {
        const controls = await main
          .locator('input:not([type="hidden"]):not([type="file"]), textarea, select, button')
          .count();
        expect(controls, `expected interactive control on ${route}`).toBeGreaterThan(0);
      }

      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      expect(runtimeErrors, `runtime errors on ${route}:\n${runtimeErrors.join("\n")}`).toEqual([]);
    });
  }
});
