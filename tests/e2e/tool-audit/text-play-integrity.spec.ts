import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

function stopwatchMilliseconds(value: string | null): number {
  const match = value?.match(/^(\d{2}):(\d{2})\.(\d{2})$/);
  expect(match, `valid stopwatch display: ${value}`).not.toBeNull();
  return (Number(match![1]) * 60 + Number(match![2])) * 1_000 + Number(match![3]) * 10;
}

const ARTIFACT_DIR = "/tmp/clevr-tool-audit/text-play";

test.describe("text, developer, time, typing, and play integrity", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await mkdir(ARTIFACT_DIR, { recursive: true });
  });

  test("Case Converter applies its documented title-case rules", async ({ page }) => {
    await page.goto("/text/case-converter");
    await page.getByPlaceholder("Paste or type your text here…").fill("the art of war");
    await page.getByRole("button", { name: "Title Case", exact: true }).click();

    await expect(page.getByText("The Art of War", { exact: true })).toBeVisible();
  });

  test("Character Counter exposes UTF-16 code units rather than user-perceived characters", async ({ page }) => {
    const sample = "A👩‍💻é\n世";
    const graphemes = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(sample)].length;

    await page.goto("/text/character-counter");
    await page.getByPlaceholder("Type or paste text to count characters...").fill(sample);

    const chip = page.getByText("Characters", { exact: true }).first().locator("..");
    await expect(chip).toContainText(String(sample.length));
    expect(sample.length).toBe(9);
    expect(graphemes).toBe(5);
  });

  test("Word Counter handles multiline large input without losing the word total", async ({ page }) => {
    const input = `${Array.from({ length: 10_000 }, () => "café😀").join(" ")}\n\n終わり`;
    await page.goto("/text/word-counter");
    await page.getByPlaceholder("Start typing or paste your text here…").fill(input);

    const wordsChip = page.getByText("Words", { exact: true }).first().locator("..");
    const paragraphsChip = page.getByText("Paragraphs", { exact: true }).first().locator("..");
    await expect(wordsChip).toContainText("10,001");
    await expect(paragraphsChip).toContainText("2");
  });

  test("Text to Slug makes an all-non-Latin title empty", async ({ page }) => {
    await page.goto("/text/text-to-slug");
    await page.getByPlaceholder("How to Make the Perfect Sourdough Bread").fill("日本語 😀");

    await expect(page.getByText("Your slug will appear here as you type…", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy", exact: true })).toBeDisabled();
  });

  test("Base64 and URL tools round-trip Unicode and emoji", async ({ page }) => {
    const sample = "café 😀\n第二行";
    const expectedBase64 = Buffer.from(sample, "utf8").toString("base64");

    await page.goto("/dev/base64");
    const base64Areas = page.locator("main textarea");
    await base64Areas.nth(0).fill(sample);
    await expect(base64Areas.nth(1)).toHaveValue(expectedBase64);
    await base64Areas.nth(0).fill("");
    await base64Areas.nth(1).fill(expectedBase64);
    await expect(base64Areas.nth(0)).toHaveValue(sample);

    await page.goto("/dev/url-encoder");
    const urlAreas = page.locator("main textarea");
    await urlAreas.nth(0).fill(sample);
    await expect(urlAreas.nth(1)).toHaveValue(encodeURIComponent(sample));
    await urlAreas.nth(0).fill("");
    await urlAreas.nth(1).fill(encodeURIComponent(sample));
    await expect(urlAreas.nth(0)).toHaveValue(sample);
  });

  test("JSON Formatter reports invalid input but leaves a stale prior output", async ({ page }) => {
    await page.goto("/dev/json-formatter");
    const areas = page.locator("main textarea");
    await areas.nth(0).fill('{"emoji":"😀","lines":[1,2]}');
    await page.getByRole("button", { name: "Format", exact: true }).click();
    const priorOutput = await areas.nth(1).inputValue();
    expect(JSON.parse(priorOutput)).toEqual({ emoji: "😀", lines: [1, 2] });

    await areas.nth(0).fill("{");
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await expect(page.getByText("Invalid JSON", { exact: true })).toBeVisible();
    await expect(areas.nth(1)).toHaveValue(priorOutput);
  });

  test("UUID Generator emits valid v4/v7 identifiers and 100 unique bulk values", async ({ page }) => {
    await page.goto("/dev/uuid");
    const primary = page.locator("main p.font-mono").first();
    await expect(primary).toHaveText(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    await page.getByRole("button", { name: "UUID v7", exact: true }).click();
    await expect(primary).toHaveText(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    await page.getByLabel("Bulk Generate").fill("100");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    const values = await page.locator("main .max-h-80 span.font-mono").allTextContents();
    expect(values).toHaveLength(100);
    expect(new Set(values).size).toBe(100);
    for (const value of values) {
      expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    }
  });

  test("Password Generator satisfies selected character constraints at length 128", async ({ page }) => {
    await page.goto("/generate/password");
    await page.getByLabel("Length").fill("128");
    const password = page.locator("main span.font-mono.text-lg").first();
    await expect(password).toHaveText(/^.{128}$/);
    const beforeExclusion = (await password.textContent()) ?? "";
    await page
      .getByRole("checkbox", { name: /Exclude ambiguous characters/ })
      .check();

    await expect(password).not.toHaveText(beforeExclusion);
    await expect(password).toHaveText(/^.{128}$/);
    const value = (await password.textContent()) ?? "";
    expect(value).toMatch(/[A-Z]/);
    expect(value).toMatch(/[a-z]/);
    expect(value).toMatch(/[0-9]/);
    expect(value).toMatch(/[^A-Za-z0-9]/);
    expect(value).not.toMatch(/[0O1lI]/);
  });

  test("Random Number Generator enforces its unbiased inclusive range contract", async ({ page }) => {
    await page.goto("/generate/random-number");
    await page.getByLabel("Min").fill("0");
    await page.getByLabel("Max").fill("5000000000");
    await page.getByLabel("Count").fill("1");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(page.getByText(/cannot contain more than 4294967296 integers/i)).toBeVisible();

    await page.getByLabel("Min").fill("-7");
    await page.getByLabel("Max").fill("-7");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(page.getByText("-7", { exact: true })).toBeVisible();
  });

  test("Timer and Stopwatch use wall-clock deltas across pause/resume", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-08-01T12:00:00Z") });
    await page.goto("/time/timer");
    await page.getByLabel("Sec").fill("2");
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.clock.fastForward(1_100);
    await expect(page.getByText("00:01", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.clock.fastForward(2_000);
    await expect(page.getByText("00:01", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await page.clock.fastForward(1_100);
    await expect(page.getByText("Time's Up!", { exact: true })).toBeVisible();

    await page.goto("/time/stopwatch");
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.clock.fastForward(1_230);
    await page.getByRole("button", { name: "Stop", exact: true }).click();
    const stopwatchDisplay = page.locator("main p.font-mono").first();
    const firstStop = stopwatchMilliseconds(await stopwatchDisplay.textContent());
    expect(firstStop).toBeGreaterThanOrEqual(1_230);
    expect(firstStop).toBeLessThan(2_500);
    await page.clock.fastForward(2_000);
    expect(stopwatchMilliseconds(await stopwatchDisplay.textContent())).toBe(firstStop);
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await page.clock.fastForward(500);
    await page.getByRole("button", { name: "Stop", exact: true }).click();
    const secondStop = stopwatchMilliseconds(await stopwatchDisplay.textContent());
    expect(secondStop - firstStop).toBeGreaterThanOrEqual(500);
    expect(secondStop - firstStop).toBeLessThan(1_500);
  });

  test("Keyboard Tester preserves plain Tab navigation", async ({ page }) => {
    await page.goto("/type/keyboard-tester");
    const reset = page.getByRole("button", { name: "Reset", exact: true });
    await reset.focus();
    await page.keyboard.press("Tab");
    await expect(reset).not.toBeFocused();
  });

  test("Typing Test removes fabricated consistency and reports elapsed-time metrics", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-08-01T12:00:00Z") });
    await page.goto("/type/typing-test");
    await page.getByRole("button", { name: "Words", exact: true }).click();
    await page.getByRole("button", { name: "10", exact: true }).click();
    await expect(page.locator('[data-word="9"]').first()).toBeVisible();

    const words = await page.locator("[data-word]").evaluateAll((nodes) => {
      const grouped = new Map<number, string>();
      for (const node of nodes) {
        const element = node as HTMLElement;
        const index = Number(element.dataset.word);
        grouped.set(index, `${grouped.get(index) ?? ""}${element.textContent ?? ""}`);
      }
      return [...grouped.entries()].sort((a, b) => a[0] - b[0]).slice(0, 10).map((entry) => entry[1]);
    });

    await page.locator("main [tabindex='0']").first().click();
    for (let index = 0; index < words.length; index += 1) {
      await page.keyboard.type(words[index]);
      await page.keyboard.press("Space");
      await page.clock.fastForward(index % 2 === 0 ? 100 : 1_500);
    }

    await expect(page.getByText("Consistency", { exact: true })).toHaveCount(0);
    const resultWpm = Number(
      await page
        .getByText("WPM", { exact: true })
        .first()
        .locator("xpath=preceding-sibling::p[1]")
        .textContent()
    );
    expect(resultWpm).toBeGreaterThan(0);
  });

  test("Numble removes no-op settings, solves the daily puzzle, and exports a valid share PNG", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-08-01T12:00:00Z") });
    await page.addInitScript(() => localStorage.setItem("numble_how_to_play_shown", "true"));
    await page.goto("/play/numble");

    await expect(page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0);
    await expect(page.getByText("Hard mode", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Colorblind mode", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Sound", { exact: true })).toHaveCount(0);

    // Deterministic 2026-08-01 daily puzzle: [50,100,6,1,10,3] -> 980.
    // The ordinary puzzle remains solvable after inert settings are removed.
    await page.getByRole("button", { name: "100", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await page.getByRole("button", { name: "1", exact: true }).click();
    await page.getByRole("button", { name: "101", exact: true }).click();
    await page.getByRole("button", { name: "-", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "10", exact: true }).click();
    await page.getByRole("button", { name: "×", exact: true }).click();
    await page.getByRole("button", { name: "98", exact: true }).click();
    await expect(page.getByText("Solved", { exact: true }).first()).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download share image", exact: true }).click();
    const download = await downloadPromise;
    const outputPath = `${ARTIFACT_DIR}/numble-share.png`;
    await download.saveAs(outputPath);
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1350);
  });

  test("Meme Generator exports a decodable full-resolution PNG on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/play/meme-generator/drake");
    const areas = page.locator("main textarea");
    await areas.nth(0).fill("Unicode 😀\nmultiline");
    await areas.nth(1).fill("SECOND PANEL");
    await expect(page.getByLabel("Drake Hotline Bling meme preview")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PNG", exact: true }).click();
    const download = await downloadPromise;
    const outputPath = `${ARTIFACT_DIR}/drake-meme.png`;
    await download.saveAs(outputPath);
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(1200);
  });
});
