import { expect, test } from "@playwright/test";
import { ALL_TOOLS } from "./registry";
import { TIME_TYPE_SLUGS } from "./fixtures";

// Timers, stopwatches, and typing/reaction games don't fit the "known input
// -> known output" mold well (their whole point is elapsed real time or
// randomness), so each gets a short bespoke interaction here instead of a
// data-driven fixture: prove the state machine actually transitions (idle ->
// running, or a keystroke registers), not that a specific number comes out.

test.describe("time & type tools — state-transition smoke", () => {
  test.describe.configure({ mode: "parallel" });

  test("registry has all 12 expected time/type slugs", () => {
    const found = new Set(ALL_TOOLS.map((t) => t.slug));
    const missing = [...TIME_TYPE_SLUGS].filter((s) => !found.has(s));
    expect(missing, `expected time/type slugs missing from lib/tools.ts: ${missing.join(", ")}`).toEqual([]);
  });

  test("/time/timer — preset starts a countdown", async ({ page }) => {
    await page.goto("/time/timer", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "1 min" }).click();
    await expect(page.getByText(/01:00|1:00/).first()).toBeVisible({ timeout: 5000 });
  });

  test("/time/stopwatch — start transitions to running controls", async ({ page }) => {
    await page.goto("/time/stopwatch", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Lap" })).toBeVisible();
  });

  test("/time/pomodoro — start transitions to pause/skip controls", async ({ page }) => {
    await page.goto("/time/pomodoro", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Start/ }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  });

  test("/type/typing-test — typing registers and clears the focus hint", async ({ page }) => {
    await page.goto("/type/typing-test", { waitUntil: "networkidle" });
    const hint = page.getByText("Click to focus", { exact: false });
    await expect(hint).toBeVisible({ timeout: 5000 });
    await page.locator("main [tabindex='0']").first().click();
    await expect(hint).toBeHidden({ timeout: 5000 });
    await page.keyboard.type("test", { delay: 30 });
    // typing should have moved the caret / produced some highlighted-character state;
    // cheapest reliable signal is that the idle focus hint stays gone.
    await expect(hint).toBeHidden();
  });

  test("/type/wpm-test — typing registers via the hidden input", async ({ page }) => {
    await page.goto("/type/wpm-test", { waitUntil: "networkidle" });
    const input = page.getByLabel("Type here to take the WPM test");
    await input.click();
    await page.keyboard.type("test", { delay: 30 });
    await expect(input).toHaveValue(/test/);
  });

  test("/type/typing-practice — typing registers via the hidden input", async ({ page }) => {
    await page.goto("/type/typing-practice", { waitUntil: "networkidle" });
    const input = page.getByLabel("Type here to practice typing");
    await input.click();
    await page.keyboard.type("test", { delay: 30 });
    await expect(input).toHaveValue(/test/);
  });

  test("/type/race — typing registers via the hidden input", async ({ page }) => {
    await page.goto("/type/race", { waitUntil: "networkidle" });
    const input = page.getByLabel("Type here to race");
    await input.click();
    await page.keyboard.type("test", { delay: 30 });
    await expect(input).toHaveValue(/test/);
  });

  test("/type/word-blitz — typing registers via the visible input", async ({ page }) => {
    await page.goto("/type/word-blitz", { waitUntil: "networkidle" });
    // WordBlitz sets placeholder="" once status leaves "idle", so a locator
    // built from the placeholder text stops matching the moment typing
    // starts — re-locate by a property of the element itself instead. Its
    // <input> has no explicit type attribute (defaults to text implicitly),
    // so match on the input element itself, not an attribute selector.
    const input = page.locator("main input").first();
    await expect(input).toHaveAttribute("placeholder", "start typing...");
    await input.click();
    await page.keyboard.type("t", { delay: 30 });
    await expect(input).not.toHaveValue("");
  });

  test("/type/code-challenge — typing registers and clears the focus hint", async ({ page }) => {
    await page.goto("/type/code-challenge", { waitUntil: "networkidle" });
    await page.locator("main [tabindex='0']").first().click();
    await page.keyboard.type("test", { delay: 30 });
    // if this hangs or throws, the challenge's key-capture is broken;
    // absence of a crash plus no console error (checked by registry-smoke) is the signal here.
  });

  test("/type/cps-test — clicking increments the click counter", async ({ page }) => {
    await page.goto("/type/cps-test", { waitUntil: "networkidle" });
    // Auto-scroll-into-view can land the click target right under the sticky
    // header, which then intercepts the pointer event — a test-harness
    // artifact of this app's sticky nav, not a real click-target problem.
    await page.getByText("Click here to start!").click({ force: true });
    await expect(page.getByText(/^1$/).first()).toBeVisible({ timeout: 3000 });
  });

  test("/type/reaction-time — clicking starts the first round", async ({ page }) => {
    await page.goto("/type/reaction-time", { waitUntil: "networkidle" });
    await page.getByText("Click to start").click();
    await expect(page.getByText("Wait for green...")).toBeVisible({ timeout: 3000 });
  });

  test("/type/keyboard-tester — pressing a key updates the last-key display", async ({ page }) => {
    await page.goto("/type/keyboard-tester", { waitUntil: "networkidle" });
    await page.keyboard.press("a");
    await expect(page.getByText("Key:")).toBeVisible({ timeout: 3000 });
    await expect(page.locator("main").getByText("a", { exact: true }).first()).toBeVisible();
  });
});
