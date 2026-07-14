import { expect, test } from "@playwright/test";
import { ALL_TOOLS, isFileTool } from "./registry";
import { assertNoErrorBoundary, watchForErrors } from "./helpers";

/** Tools whose idle-state "control" is a click-target <div>, not a real form element. */
const NO_INITIAL_FORM_CONTROL = new Set(["reaction-time"]);

// Level 1: every tool in lib/tools.ts, driven straight off the registry.
// This can never drift out of sync with the site — no hand-maintained route
// list to forget to update. Does NOT feed input or check output shape; that's
// functional-smoke.spec.ts. This just proves the page loads, renders a
// heading, has some interactive control, and doesn't throw.

test.describe("registry smoke — every tool loads clean", () => {
  test.describe.configure({ mode: "parallel" });

  for (const tool of ALL_TOOLS) {
    const label = tool.live === false ? `${tool.route} (hidden)` : tool.route;

    test(`loads ${label}`, async ({ page }) => {
      const { errors } = watchForErrors(page);

      const response = await page.goto(tool.route, { waitUntil: "domcontentloaded" });
      expect(response, `no response for ${tool.route}`).not.toBeNull();
      expect(response!.status(), `bad HTTP status on ${tool.route}`).toBeLessThan(400);

      const h1 = page.locator("main h1").first();
      await expect(h1, `missing h1 on ${tool.route}`).toBeVisible();
      const h1Text = (await h1.textContent())?.trim() ?? "";
      expect(h1Text.length, `empty h1 on ${tool.route}`).toBeGreaterThan(0);

      await assertNoErrorBoundary(page);

      const main = page.locator("main");
      if (isFileTool(tool)) {
        const fileInputs = await main.locator('input[type="file"]').count();
        const uploadButtons = await main
          .getByRole("button", { name: /upload|browse|choose|select|drag/i })
          .count();
        expect(
          fileInputs + uploadButtons,
          `expected a file input/upload control on ${tool.route}`
        ).toBeGreaterThan(0);
      } else if (NO_INITIAL_FORM_CONTROL.has(tool.slug)) {
        // Its only "control" in the idle state is a plain onMouseDown/onClick
        // <div> click-target (a click-to-start game area), not a real form
        // element — the generic heuristic below can't see that, so this is a
        // documented gap in the check, not a claim the tool is uninteractive.
      } else {
        const controls = await main
          .locator('input:not([type="hidden"]):not([type="file"]), textarea, select, button')
          .count();
        expect(controls, `expected an interactive control on ${tool.route}`).toBeGreaterThan(0);
      }

      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      expect(errors, `runtime errors on ${tool.route}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("registry coverage", () => {
  test("every route is unique", () => {
    const routes = ALL_TOOLS.map((t) => t.route);
    const dupes = routes.filter((r, i) => routes.indexOf(r) !== i);
    expect(dupes, `duplicate routes in lib/tools.ts: ${dupes.join(", ")}`).toEqual([]);
  });

  test("every slug is unique", () => {
    const slugs = ALL_TOOLS.map((t) => t.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    expect(dupes, `duplicate slugs in lib/tools.ts: ${dupes.join(", ")}`).toEqual([]);
  });
});
