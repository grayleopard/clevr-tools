import { expect, test } from "@playwright/test";
import { ALL_TOOLS } from "./registry";
import { UNIT_CONVERTER_SLUGS } from "./fixtures";

// All 32 unit-converter tools (the 17 generic /calc/convert/* pages, the 14
// single-pair shortcuts like cm-to-inches, and the standalone /calc/unit-
// converter) render one of two components (UnitConverterPage or
// UnitConverter) that both share the same From/To numeric-input shape. One
// generic driver covers the whole family instead of 32 near-identical
// fixture entries.

const UNIT_CONVERTER_TOOLS = ALL_TOOLS.filter((t) => UNIT_CONVERTER_SLUGS.has(t.slug));

test.describe("unit converter family — generic From/To smoke", () => {
  test.describe.configure({ mode: "parallel" });

  test("registry has all 32 expected unit-converter slugs", () => {
    const found = new Set(UNIT_CONVERTER_TOOLS.map((t) => t.slug));
    const missing = [...UNIT_CONVERTER_SLUGS].filter((s) => !found.has(s));
    expect(missing, `expected unit-converter slugs missing from lib/tools.ts: ${missing.join(", ")}`).toEqual([]);
  });

  for (const tool of UNIT_CONVERTER_TOOLS) {
    test(`${tool.route} converts a value`, async ({ page }) => {
      await page.goto(tool.route, { waitUntil: "networkidle" });

      // "From"/"To" are now properly associated with their value <input>
      // (the unit <select> gets its own hidden "From unit"/"To unit" label)
      // — see the accessibility fix. Same wiring in both UnitConverterPage
      // (30 tools) and the standalone UnitConverter (1 tool), so one
      // getByLabel() call works for the whole family.
      const fromInput = page.getByLabel("From", { exact: true });
      const toInput = page.getByLabel("To", { exact: true });
      await expect(fromInput, `no "From" input on ${tool.route}`).toBeVisible();
      await expect(toInput, `no "To" input on ${tool.route}`).toBeVisible();

      // Baseline: default value (usually "1") should already produce a
      // non-empty, finite "To" value — proves the tool isn't dead on load.
      const initialTo = await toInput.inputValue();
      expect(initialTo.trim().length, `"To" field empty on load at ${tool.route}`).toBeGreaterThan(0);
      expect(Number.isFinite(Number(initialTo.replace(/,/g, ""))), `"To" field not numeric on load at ${tool.route}: "${initialTo}"`).toBe(true);

      // Change "From" and confirm "To" updates to a different, still-finite value.
      await fromInput.fill("10");
      await expect
        .poll(async () => toInput.inputValue(), { timeout: 5000 })
        .not.toBe(initialTo);

      const updatedTo = await toInput.inputValue();
      expect(Number.isFinite(Number(updatedTo.replace(/,/g, ""))), `"To" field not numeric after edit at ${tool.route}: "${updatedTo}"`).toBe(true);
    });
  }
});
