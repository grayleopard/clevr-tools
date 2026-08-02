import { expect, test } from "@playwright/test";

const routes = ["/", "/files", "/compress/image", "/convert/pdf-to-jpg", "/tools/merge-pdf"];

test.describe("North Star production direction", () => {
  test("home leads with an immediate task and a scoped privacy contract", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Tools that get out of your way"
    );
    await expect(page.getByRole("button", { name: /Browse Files/i })).toBeVisible();
    await expect(page.getByText(/Privacy is a tool-by-tool contract/i)).toBeVisible();
    await expect(page.getByText(/Nothing leaves your device/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Browse by task" })).toBeVisible();
  });

  test("file discovery explains processing boundaries before the catalogue", async ({ page }) => {
    await page.goto("/files", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Files & Assets");
    await expect(page.getByText(/Each tool states where processing happens/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Image Compressor/i }).first()).toBeVisible();
  });

  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`${viewport.name} keeps the selected direction usable without overflow`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const route of routes) {
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response?.status(), `${route} should load`).toBeLessThan(400);
        await expect(page.locator("main h1").first()).toBeVisible();

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${route} should not overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
      }
    });
  }

  test("flagship workspace preserves readiness, action, theme, and focus visibility", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/compress/image", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Ready to use")).toBeVisible();
    const browse = page.getByRole("button", { name: /Browse Files/i });
    await expect(browse).toBeVisible();
    await browse.focus();
    await expect(browse).toBeFocused();

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(browse).toBeVisible();
  });
});
