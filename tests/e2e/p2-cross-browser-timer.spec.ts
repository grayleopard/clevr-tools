import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "320px phone", width: 320, height: 720 },
  { name: "390px phone", width: 390, height: 844 },
  { name: "430px phone", width: 430, height: 932 },
  { name: "768px tablet", width: 768, height: 1024 },
  { name: "1440px desktop", width: 1440, height: 900 },
] as const;

function trackRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    const text = message.text();
    if (
      ["error", "warning"].includes(message.type()) &&
      /(hydration|did not match|uncaught|typeerror|referenceerror)/i.test(text)
    ) {
      errors.push(`${message.type()}: ${text}`);
    }
  });
  return errors;
}

async function openTimer(page: Page) {
  const runtimeErrors = trackRuntimeErrors(page);
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  const response = await page.goto("/time/timer", { waitUntil: "domcontentloaded" });
  expect(response?.status(), "Timer HTTP status").toBeLessThan(400);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  return runtimeErrors;
}

function contrast(foreground: [number, number, number], background: [number, number, number]) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (color: [number, number, number]) =>
    0.2126 * channel(color[0]) + 0.7152 * channel(color[1]) + 0.0722 * channel(color[2]);
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

test.describe("P2 Timer cross-browser readiness", () => {
  for (const viewport of viewports) {
    test(`fits and keeps 44px custom controls at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const runtimeErrors = await openTimer(page);

      const controls = [
        page.getByLabel("Hours"),
        page.getByLabel("Minutes"),
        page.getByLabel("Seconds"),
        page.getByRole("button", { name: "Start", exact: true }),
      ];
      for (const control of controls) {
        const box = await control.boundingBox();
        expect(box, `${viewport.name} control is rendered`).not.toBeNull();
        expect(box!.height, `${viewport.name} control height`).toBeGreaterThanOrEqual(44);
        expect(box!.x, `${viewport.name} control starts in viewport`).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, `${viewport.name} control ends in viewport`).toBeLessThanOrEqual(viewport.width + 1);
      }

      const timerSection = page.getByText("Custom time", { exact: true }).locator("..");
      const timerOverflow = await timerSection.evaluate(
        (element) => element.scrollWidth - element.clientWidth
      );
      expect(timerOverflow, `${viewport.name} custom-time section overflow`).toBeLessThanOrEqual(1);

      const documentOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(documentOverflow, `${viewport.name} document-level horizontal overflow`).toBeLessThanOrEqual(1);
      expect(runtimeErrors).toEqual([]);
    });
  }

  test("has named keyboard controls, retains focus after start, and exposes timer progress", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const runtimeErrors = await openTimer(page);
    await expect(page).toHaveTitle(/Timer/i);

    await page.getByLabel("Minutes").fill("1");
    const start = page.getByRole("button", { name: "Start", exact: true });
    // WebKit on macOS follows the host's Full Keyboard Access preference for
    // Tab navigation. Focus the named control explicitly, then exercise the
    // same keyboard activation and focus-handoff behavior in every engine.
    await start.focus();
    await expect(start).toBeFocused();
    await page.keyboard.press("Enter");

    const pause = page.getByRole("button", { name: "Pause", exact: true });
    await expect(pause).toBeFocused();
    await expect(page.getByRole("timer", { name: /remaining/ })).toBeVisible();
    const progress = page.getByRole("progressbar", { name: "Timer progress" });
    await expect(progress).toHaveAttribute("aria-valuemax", "60");
    await expect(progress).toHaveAttribute("aria-valuenow", /60|59/);
    await expect(page).toHaveTitle(/01:00|00:59/);

    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeFocused();
    expect(runtimeErrors).toEqual([]);
  });

  test("keeps dark mode legible", async ({ page }) => {
    const runtimeErrors = await openTimer(page);
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      const parse = (value: string) => value.match(/\d+(?:\.\d+)?/g)!.slice(0, 3).map(Number) as [number, number, number];
      return { foreground: parse(style.color), background: parse(style.backgroundColor) };
    });
    expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(runtimeErrors).toEqual([]);
  });

  test("disables timer motion when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const runtimeErrors = await openTimer(page);
    await page.getByLabel("Seconds").fill("1");
    await page.getByRole("button", { name: "Start", exact: true }).click();

    const progressFill = page.getByRole("progressbar", { name: "Timer progress" }).locator("div");
    const transitionDurationMs = await progressFill.evaluate((element) => {
      const value = getComputedStyle(element).transitionDuration.split(",")[0].trim();
      return value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1_000;
    });
    expect(transitionDurationMs).toBeLessThanOrEqual(1);
    const done = page.getByRole("alert");
    await expect(done).toBeVisible({ timeout: 2_500 });
    await expect(done).toHaveCSS("animation-name", "none");
    expect(runtimeErrors).toEqual([]);
  });
});
