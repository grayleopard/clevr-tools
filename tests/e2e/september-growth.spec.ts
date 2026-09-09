import { test, expect } from "@playwright/test";

const pages = [
  { path: "/calc/salary", text: "Convert hourly pay and annual salary" },
  { path: "/calc/convert/data", text: "Converting MB to GB changes how a size is expressed" },
  { path: "/blog/reduce-image-file-size", text: "Work out your file-size budget" },
  { path: "/blog/compress-images", text: "quantization" },
];

for (const width of [390, 1440]) {
  for (const entry of pages) {
    test(`${entry.path} renders growth copy without overflow at ${width}px`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(entry.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main")).toContainText(entry.text);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("file budget guide and data converter have reciprocal task links", async ({ page }) => {
  await page.goto("/calc/convert/data");
  await page.getByRole("link", { name: "image file-size budget workflow" }).click();
  await expect(page).toHaveURL(/\/blog\/reduce-image-file-size$/);
  await page.getByRole("link", { name: "Data Size Converter", exact: true }).click();
  await expect(page).toHaveURL(/\/calc\/convert\/data$/);
});
