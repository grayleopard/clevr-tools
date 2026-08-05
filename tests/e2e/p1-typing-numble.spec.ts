import { expect, test, type Page } from "@playwright/test";

async function openTool(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
}

async function displayedTypingWords(page: Page): Promise<string[]> {
  return page.locator("main div.font-mono.text-xl > span").allTextContents();
}

test.describe("P1 typing, play, and title-case remediations", () => {
  test("case converter applies honest editorial title case in the browser", async ({ page }) => {
    await openTool(page, "/text/case-converter");
    const input = "élan and O’NEILL: the API story\nstate-of-the-art tools for the web";
    const expected = "Élan and O’Neill: The API Story\nState-of-the-Art Tools for the Web";

    await page.getByPlaceholder("Paste or type your text here…").fill(input);
    await page.getByRole("button", { name: "Title Case", exact: true }).click();

    const output = page
      .getByRole("button", { name: "Copy", exact: true })
      .locator("xpath=../following-sibling::div");
    await expect(output).toHaveText(expected);
    await expect(page.getByText(/English editorial title case keeps common articles/)).toBeVisible();
  });

  test("timed typing results include a partial word and measured accuracy", async ({ page }) => {
    await page.clock.install();
    await openTool(page, "/type/typing-test");
    await page.getByRole("button", { name: "15s", exact: true }).click();
    await page.getByRole("button", { name: "Simple", exact: true }).click();

    const firstWordChars = page.locator('[data-word="0"][data-char]');
    await expect(firstWordChars.first()).toBeVisible();
    const firstWord = (await firstWordChars.allTextContents()).join("");

    await page.getByText(/Click to focus · start typing to begin/).click();
    await page.keyboard.type(`${firstWord} !`);
    await page.clock.fastForward(15_100);

    await expect(page.getByText("Characters", { exact: true })).toBeVisible();
    await expect(page.getByText("Consistency", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Words", { exact: true }).locator("..")).toContainText("1/0/1");

    const wpm = Number(
      await page.getByText("WPM", { exact: true }).first().locator("..").locator("p").first().textContent()
    );
    const accuracy = Number(
      (await page
        .getByText("Accuracy", { exact: true })
        .locator("..")
        .locator("p")
        .first()
        .textContent())?.replace("%", "")
    );
    expect(wpm).toBeGreaterThan(0);
    expect(accuracy).toBeGreaterThan(0);
    expect(accuracy).toBeLessThan(100);
  });

  test("keyboard tester observes Tab and Shift+Tab without trapping focus", async ({ page }) => {
    await openTool(page, "/type/keyboard-tester");
    const reset = page.getByRole("button", { name: "Reset", exact: true });

    await reset.focus();
    await page.keyboard.press("Tab");
    expect(await reset.evaluate((element) => document.activeElement === element)).toBe(false);
    await expect(page.getByText("Code:", { exact: true }).locator("..")).toContainText("Tab");

    await reset.focus();
    await page.keyboard.press("Shift+Tab");
    expect(await reset.evaluate((element) => document.activeElement === element)).toBe(false);
    await expect(page.getByText("Code:", { exact: true }).locator("..")).toContainText("Tab");

    await reset.click();
    await page.keyboard.press("a");
    await expect(page.getByText(/1 of \d+ keys tested/)).toBeVisible();
    await reset.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/0 of \d+ keys tested/)).toBeVisible();

    await page.keyboard.press("a");
    await reset.focus();
    await page.keyboard.press("Space");
    await expect(page.getByText(/0 of \d+ keys tested/)).toBeVisible();
  });

  test("typing test preserves Tab navigation outside the typing surface", async ({ page }) => {
    await openTool(page, "/type/typing-test");
    const settings = page.getByRole("button", { name: "Settings", exact: true });
    const idleHint = page.getByText(/Click to focus · start typing to begin/);
    await expect(idleHint).toBeVisible();
    await settings.focus();
    await page.keyboard.press("Tab");
    await expect(settings).not.toBeFocused();
    await expect(idleHint).toBeVisible();

    await settings.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(settings).not.toBeFocused();
    await expect(idleHint).toBeVisible();
  });

  test("typing race completes rapid input, restarts cleanly, and unmounts safely", async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await page.clock.install();
    await openTool(page, "/type/race");

    let words = await displayedTypingWords(page);
    expect(words.length).toBeGreaterThan(3);
    const passage = words.join(" ");
    const input = page.getByLabel("Type here to race");
    await input.focus();
    await page.keyboard.type(passage.slice(0, 1));
    await page.clock.fastForward(2_000);
    await page.keyboard.type(`${passage.slice(1)} `);

    await expect(page.getByText("You Win!", { exact: true })).toBeVisible();
    const winningElapsed = Number(
      (await page
        .getByText("Time", { exact: true })
        .locator("xpath=preceding-sibling::div[1]")
        .textContent())?.replace("s", "")
    );
    expect(winningElapsed).toBeGreaterThanOrEqual(2);
    // Playwright dispatches every character as its own browser event. Loaded
    // CI runners can add a couple seconds of event-processing time even though
    // the app consumes the input correctly and the user still wins.
    expect(winningElapsed).toBeLessThan(6);

    await page.getByRole("button", { name: "Race Again", exact: true }).click();
    words = await displayedTypingWords(page);
    const restartedInput = page.getByLabel("Type here to race");
    await restartedInput.focus();
    await page.keyboard.type(words[0]);
    await expect(restartedInput).toHaveValue(words[0]);

    await page.goto("/text/case-converter", { waitUntil: "domcontentloaded" });
    await page.clock.fastForward(5_000);
    expect(runtimeErrors).toEqual([]);
  });

  test("typing race ghost loss uses monotonic elapsed time and keeps typed progress", async ({ page }) => {
    await page.clock.install();
    await openTool(page, "/type/race");
    await page.getByRole("button", { name: "expert (120 WPM)", exact: true }).click();

    const words = await displayedTypingWords(page);
    expect(words.length).toBeGreaterThan(4);
    const input = page.getByLabel("Type here to race");
    await input.focus();
    await page.keyboard.type(`${words.slice(0, 3).join(" ")} ${words[3][0]}`);
    await page.clock.fastForward(120_000);

    await expect(page.getByText("Ghost Wins", { exact: true })).toBeVisible();
    const timeText = await page
      .getByText("Time", { exact: true })
      .locator("xpath=preceding-sibling::div[1]")
      .textContent();
    const elapsed = Number(timeText?.replace("s", ""));
    const wpm = Number(
      await page
        .getByText("WPM", { exact: true })
        .locator("xpath=preceding-sibling::div[1]")
        .textContent()
    );
    expect(elapsed).toBeGreaterThan(0);
    // Different browser-clock schedulers may deliver every interval or only
    // the final delayed callback. Either way, elapsed must stay positive,
    // bounded, and nowhere near the epoch-sized value from the original bug.
    expect(elapsed).toBeLessThan(122);
    expect(wpm).toBeGreaterThan(0);
  });

  test("CPS uses actual monotonic duration and supports keyboard activation", async ({ page }) => {
    await page.clock.install();
    await openTool(page, "/type/cps-test");
    await page.getByRole("button", { name: "1s", exact: true }).click();

    const start = page.getByRole("button", { name: "Start CPS test", exact: true });
    await start.focus();
    await page.keyboard.press("Enter");
    const clickSurface = page.getByRole("button", { name: "Register click", exact: true });
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    await page.clock.fastForward(1_000);

    await expect(page.getByText("Actual Duration", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Total Clicks", { exact: true }).locator("xpath=preceding-sibling::div[1]")
    ).toHaveText("4");
    const actualDuration = Number(
      (await page
        .getByText("Actual Duration", { exact: true })
        .locator("xpath=preceding-sibling::div[1]")
        .textContent())?.replace("s", "")
    );
    const displayedCps = Number(
      await page
        .getByText("clicks per second", { exact: true })
        .locator("xpath=preceding-sibling::div[1]")
        .textContent()
    );
    expect(actualDuration).toBeGreaterThanOrEqual(1);
    expect(actualDuration).toBeLessThan(1.5);
    expect(displayedCps).toBe(Math.round((4 / actualDuration) * 10) / 10);
    await expect(clickSurface).toHaveCount(0);
  });

  test("Numble hydrates persisted state without exposing inert settings", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("pageerror", (error) => hydrationErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|did not match|server rendered/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    await page.addInitScript(() => {
      localStorage.setItem("numble_how_to_play_shown", JSON.stringify(true));
      localStorage.setItem(
        "numble_settings",
        JSON.stringify({ colorblindMode: true, soundEnabled: true, hardMode: true })
      );
      localStorage.setItem(
        "numble_stats",
        JSON.stringify({ totalGames: 3, solvedGames: 2, totalStars: 5 })
      );
    });
    await openTool(page, "/play/numble");

    await expect(page.getByText("Loading…", { exact: true })).toHaveCount(0);
    await expect(page.getByText("NUMBLE", { exact: true })).toBeVisible();
    await expect(page.getByText("Target", { exact: true })).toBeVisible();
    await expect(page.getByText(/Next puzzle in \d{2}:\d{2}:\d{2}/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Stats", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tutorial", exact: true })).toBeVisible();

    const plus = page.getByRole("button", { name: "+", exact: true });
    const numberButtons = plus.locator("xpath=../preceding-sibling::div[1]").getByRole("button");
    await numberButtons.nth(0).click();
    await plus.click();
    await numberButtons.nth(1).click();
    const savedStep = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("numble_today") ?? "null");
      return state?.steps?.[0] as { a: number; b: number; result: number } | undefined;
    });
    expect(savedStep).toBeTruthy();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Steps", { exact: true }).locator("..")).toContainText(
      String(savedStep?.result)
    );
    await page.getByRole("button", { name: "Practice Puzzle", exact: true }).click();
    await expect(page.getByText("Practice does not affect your streak or stats", { exact: true })).toBeVisible();
    await expect(page.getByText(/Next puzzle in \d{2}:\d{2}:\d{2}/).first()).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
});
