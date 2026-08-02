import { expect, test } from "@playwright/test";

const representatives = [
  ["image/compression", "/compress/image"],
  ["PDF/conversion", "/convert/pdf-to-jpg"],
  ["calculator", "/calc/percentage"],
  ["text", "/text/word-counter"],
  ["developer", "/dev/json-formatter"],
  ["generator", "/generate/random-number"],
  ["time", "/time/timer"],
  ["typing", "/type/typing-test"],
  ["Play", "/play/numble"],
] as const;

test.use({ viewport: { width: 390, height: 844 }, colorScheme: "light" });

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\(\s*(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/i);
  if (!match) throw new Error(`Unsupported computed color: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function contrast(foreground: string, background: string) {
  const luminance = (color: string) => {
    const [r, g, b] = parseRgb(color).map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

test.describe("representative mobile, dark-mode, and runtime integrity", () => {
  for (const [family, route] of representatives) {
    test(`${family}: 390px layout and actual theme toggle`, async ({ page }) => {
      test.fail(
        route === "/time/timer",
        "Known P2: the custom-time row clips Start and creates 6px document overflow at 390px"
      );
      const runtimeErrors: string[] = [];
      page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        const text = message.text();
        if (
          ["error", "warning"].includes(message.type()) &&
          /(hydration|did not match|uncaught|typeerror|referenceerror)/i.test(text)
        ) {
          runtimeErrors.push(`${message.type()}: ${text}`);
        }
      });
      await page.addInitScript(() => {
        localStorage.setItem("theme", "light");
        localStorage.setItem("numble_how_to_play_shown", "true");
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route} HTTP status`).toBeLessThan(400);
      await expect(page.locator("main h1").first()).toBeVisible();

      const controls = await page
        .locator('main input:not([type="hidden"]), main textarea, main select, main button')
        .count();
      expect(controls, `${route} lacks a mobile primary/control surface`).toBeGreaterThan(0);

      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await page.getByRole("button", { name: "Toggle theme" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

      const darkColors = await page.evaluate(() => {
        const style = getComputedStyle(document.body);
        return { foreground: style.color, background: style.backgroundColor };
      });
      expect(darkColors.foreground).not.toBe(darkColors.background);
      expect(contrast(darkColors.foreground, darkColors.background)).toBeGreaterThanOrEqual(4.5);

      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      expect(runtimeErrors, `${route} runtime/hydration errors`).toEqual([]);
      expect(horizontalOverflow, `${route} has document-level horizontal overflow`).toBeLessThanOrEqual(1);
    });
  }
});
