import { expect, test, type Page } from "@playwright/test";

test.use({ timezoneId: "America/Los_Angeles" });

async function openTool(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
}

test.describe("P1 date and schedule calculator remediations", () => {
  test("age uses coherent month-end and DST-stable calendar arithmetic", async ({ page }) => {
    await openTool(page, "/calc/age");
    const birthDate = page.getByLabel("Date of Birth", { exact: true });
    const asOf = page.getByLabel("As of", { exact: true });

    await birthDate.fill("2026-01-31");
    await asOf.fill("2026-03-01");
    await expect(page.getByText("0 years, 1 months, 1 days", { exact: true })).toBeVisible();
    await expect(page.getByText("Elapsed Days", { exact: true }).locator("..")).toContainText("29");

    await birthDate.fill("2026-03-08");
    await asOf.fill("2026-03-09");
    await expect(page.getByText("0 years, 0 months, 1 days", { exact: true })).toBeVisible();
    await expect(page.getByText("Elapsed Days", { exact: true }).locator("..")).toContainText("1");

    await birthDate.fill("2024-02-29");
    await asOf.fill("2025-02-28");
    await expect(page.getByText("1 years, 0 months, 0 days", { exact: true })).toBeVisible();

    await asOf.fill("2023-02-28");
    await expect(
      page.getByText('The "as of" date needs to be on or after the date of birth.', {
        exact: true,
      })
    ).toBeVisible();
  });

  test("date difference keeps elapsed totals exclusive and workday totals inclusive", async ({ page }) => {
    await openTool(page, "/calc/date-difference");
    const start = page.getByLabel("Start Date", { exact: true });
    const end = page.getByLabel("End Date", { exact: true });

    await start.fill("2026-01-31");
    await end.fill("2026-03-01");
    await expect(page.getByText("29 days", { exact: true })).toBeVisible();
    await expect(page.getByText("0y 1m 1d", { exact: true })).toBeVisible();
    await expect(page.getByText("in the future", { exact: true })).toBeVisible();
    await expect(page.getByText("Business Days (inclusive)", { exact: true })).toBeVisible();
    await expect(page.getByText("Weekend Days (inclusive)", { exact: true })).toBeVisible();

    await start.fill("2026-03-01");
    await end.fill("2026-01-31");
    await expect(page.getByText("29 days", { exact: true })).toBeVisible();
    await expect(page.getByText("0y 1m 1d", { exact: true })).toBeVisible();
    await expect(page.getByText("in the past", { exact: true })).toBeVisible();

    await start.fill("2026-03-02");
    await end.fill("2026-03-02");
    await expect(page.getByText("0 days", { exact: true })).toBeVisible();
    await expect(page.getByText("on the same day", { exact: true })).toBeVisible();
    await expect(page.getByText("Business Days (inclusive)", { exact: true }).locator("..")).toContainText("1");
    await expect(page.getByText("Weekend Days (inclusive)", { exact: true }).locator("..")).toContainText("0");
  });

  test("amortization caps the payoff row and reconciles the audit totals", async ({ page }) => {
    await openTool(page, "/calc/amortization");
    await page.getByLabel("Loan Amount ($)", { exact: true }).fill("300000");
    await page.getByLabel("Interest Rate (%)", { exact: true }).fill("6.5");
    await page.getByLabel("Loan Term (years)", { exact: true }).fill("30");
    await page.getByLabel("Extra Monthly Payment ($)", { exact: true }).fill("100");

    await expect(page.getByText("$621,638.68", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Show All 312 Months", exact: true }).click();

    const payoffRow = page.locator("main table tbody").first().locator("tr").last();
    await expect(payoffRow.locator("td").nth(0)).toHaveText("312");
    await expect(payoffRow.locator("td").nth(1)).toHaveText("$819.21");
    await expect(payoffRow.locator("td").nth(2)).toHaveText("$814.80");
    await expect(payoffRow.locator("td").nth(3)).toHaveText("$4.41");
    await expect(payoffRow.locator("td").nth(4)).toHaveText("$0.00");
  });

  test("pace and split displays carry rounded seconds on both sides of rollover", async ({ page }) => {
    await openTool(page, "/calc/pace");
    await page.getByLabel("Distance (miles)", { exact: true }).fill("3");
    await page.getByLabel("Time", { exact: true }).fill("0");
    await page.getByLabel("Time minutes", { exact: true }).fill("17");

    await page.getByLabel("Time seconds", { exact: true }).fill("58");
    await expect(page.getByText("5:59", { exact: true }).first()).toBeVisible();
    let firstSplit = page.locator("main table tbody").first().locator("tr").first();
    await expect(firstSplit.locator("td").nth(1)).toHaveText("0:05:59");

    await page.getByLabel("Time seconds", { exact: true }).fill("59");
    await expect(page.getByText("6:00", { exact: true }).first()).toBeVisible();
    firstSplit = page.locator("main table tbody").first().locator("tr").first();
    await expect(firstSplit.locator("td").nth(1)).toHaveText("0:06:00");

    const splitTimes = await page
      .locator("main table tbody")
      .first()
      .locator("tr td:last-child")
      .allTextContents();
    expect(splitTimes).toEqual(expect.arrayContaining(["0:06:00", "0:11:59", "0:17:59"]));
    for (const splitTime of splitTimes) {
      expect(splitTime).toMatch(/^\d+:[0-5]\d:[0-5]\d$/);
    }
  });
});
