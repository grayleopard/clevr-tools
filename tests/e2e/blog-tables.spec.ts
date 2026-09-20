import { test, expect } from "@playwright/test";

const articles = [
  { path: "/blog/reduce-image-file-size", tables: 2, heading: "Example limit", cell: "100,000 bytes" },
  { path: "/blog/png-vs-jpg-vs-webp", tables: 1, heading: "WebP", cell: "Compare with JPG" },
];

for (const width of [390, 1440]) {
  for (const theme of ["light", "dark"]) {
    for (const article of articles) {
      test(`${article.path} has semantic tables at ${width}px in ${theme} mode`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.addInitScript(value => localStorage.setItem("theme", value), theme);
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto(article.path);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const content = page.locator("article");
        await expect(content.getByRole("table")).toHaveCount(article.tables);
        await expect(content.getByRole("columnheader", { name: article.heading, exact: true })).toBeVisible();
        await expect(content.getByRole("cell", { name: article.cell, exact: true })).toBeVisible();
        const scrollRegion = content.getByRole("group", { name: "Scrollable table" }).first();
        await expect(scrollRegion).toHaveAttribute("tabindex", "0");
        if (width === 390) {
          await scrollRegion.focus();
          await page.keyboard.press("ArrowRight");
          await expect.poll(() => scrollRegion.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
          expect(await content.locator(":scope > div").evaluate(el => el.scrollLeft)).toBe(0);
        }
        await expect(content.locator("p").filter({ hasText: /\|\s*-{3}/ })).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(errors).toEqual([]);
      });
    }
  }
}
