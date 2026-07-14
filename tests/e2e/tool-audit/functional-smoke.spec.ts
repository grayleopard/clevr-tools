import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { LIVE_TOOLS, HIDDEN_TOOLS, type Tool } from "./registry";
import { FIXTURES, UNIT_CONVERTER_SLUGS, TIME_TYPE_SLUGS, type Step, type FormFixture, type FileFixture } from "./fixtures";
import { fixture, mainText, expectDownloadArtifact, toRegExp } from "./helpers";

// Level 2: feed each tool a known input, assert a known-shape output. Unlike
// registry-smoke.spec.ts, this can't run itself off the registry alone — it
// needs per-tool interaction knowledge, which lives in fixtures.ts. This file
// just walks that table and a coverage check makes sure nothing in the
// registry (outside the unit-converter/time/type families, which have their
// own generic/bespoke specs) is missing an entry.

const TOOLS_NEEDING_FIXTURES = [...LIVE_TOOLS, ...HIDDEN_TOOLS].filter(
  (t) => !UNIT_CONVERTER_SLUGS.has(t.slug) && !TIME_TYPE_SLUGS.has(t.slug)
);

test.describe("fixture coverage", () => {
  test("every non-converter, non-time/type tool has a fixture entry", () => {
    const missing = TOOLS_NEEDING_FIXTURES.filter((t) => !FIXTURES[t.slug]).map((t) => t.slug);
    expect(missing, `tools in lib/tools.ts with no fixture in fixtures.ts:\n${missing.join("\n")}`).toEqual([]);
  });

  test("no orphaned fixture entries for tools that no longer exist", () => {
    const knownSlugs = new Set(TOOLS_NEEDING_FIXTURES.map((t) => t.slug));
    const orphans = Object.keys(FIXTURES).filter((slug) => !knownSlugs.has(slug));
    expect(orphans, `fixtures.ts has entries for slugs not in lib/tools.ts:\n${orphans.join("\n")}`).toEqual([]);
  });
});

async function runStep(page: Page, step: Step) {
  switch (step.type) {
    case "fill": {
      // Labels are now properly associated (htmlFor/id) app-wide — see the
      // accessibility fix. getByLabel() is the standard, a11y-tree-based
      // locator; if this can't find an input, the label isn't associated.
      // exact: true — getByLabel()'s default substring match can also hit an
      // unrelated control whose own accessible name happens to contain the
      // same text (e.g. a "Copy HEX value" button next to a "HEX" input).
      await page.getByLabel(step.label, { exact: true }).fill(step.value);
      break;
    }
    case "fillPlaceholder": {
      await page.getByPlaceholder(toRegExp(step.placeholder)).first().fill(step.value);
      break;
    }
    case "select": {
      await page.getByLabel(step.label, { exact: true }).selectOption({ label: step.optionLabel });
      break;
    }
    case "selectCss": {
      await page.locator(`main ${step.css}`).first().selectOption({ label: step.optionLabel });
      break;
    }
    case "check": {
      await page.getByLabel(step.label, { exact: true }).check();
      break;
    }
    case "click": {
      // A few tools (e.g. poker's tab switcher) use a Radix Tabs component,
      // whose triggers are role="tab", not role="button" — try both.
      const target = page
        .getByRole("button", { name: step.name })
        .or(page.getByRole("tab", { name: step.name }));
      await target.first().click();
      break;
    }
  }
}

async function runFormFixture(page: Page, tool: Tool, fx: FormFixture) {
  await page.goto(tool.route, { waitUntil: "domcontentloaded" });
  // domcontentloaded fires before React hydrates client components — interacting
  // immediately after can update the DOM (Playwright's .fill() dispatches real
  // input/change events) without React's onChange handler being attached yet
  // to see it, silently leaving component state stale. Wait past hydration.
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

  // fixtures.ts's defaultsProduceResult is documentation (does this tool show
  // a plausible result before any interaction?), not something to assert here
  // — successPattern targets the POST-steps state, which differs from the
  // default state for most fixtures (e.g. salary's default is $52,000 but
  // successPattern checks for $104,000 after the fill step). Asserting
  // successPattern before running steps was a bug, not a real check.

  for (const step of fx.steps) {
    await runStep(page, step);
  }

  await expect
    .poll(() => mainText(page), { timeout: 10_000 })
    .toMatch(fx.successPattern);
}

async function runFileFixture(page: Page, tool: Tool, fx: FileFixture) {
  await page.goto(tool.route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

  const filePaths = fx.fixtureFiles.map((f) => fixture(f));
  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(filePaths.length === 1 ? filePaths[0] : filePaths);

  const firstFileName = path.basename(filePaths[0]);
  await expect(page.locator("main").getByText(firstFileName, { exact: false }).first()).toBeVisible({
    timeout: 15_000,
  });

  if (fx.expectsBrowserDownload) {
    const button = fx.actionButton
      ? page.getByRole("button", { name: fx.actionButton }).first()
      : page.getByRole("button", { name: /download/i }).first();
    await expectDownloadArtifact(page, {
      timeout: 45_000,
      triggerClick: () => button.click(),
    });
    return;
  }

  if (fx.actionButton) {
    await page.getByRole("button", { name: fx.actionButton }).first().click();
  }

  if (fx.successPattern) {
    await expect.poll(() => mainText(page), { timeout: 45_000 }).toMatch(fx.successPattern);
  } else {
    await expectDownloadArtifact(page, { timeout: 45_000 });
  }
}

test.describe("functional smoke — known input, known-shape output", () => {
  test.describe.configure({ mode: "parallel" });

  for (const tool of TOOLS_NEEDING_FIXTURES) {
    const fx = FIXTURES[tool.slug];
    if (!fx) continue; // reported by the coverage check above, don't double-fail here

    if (fx.kind === "custom") {
      test.skip(`${tool.route} — custom (${fx.note})`, () => {});
      continue;
    }

    if (fx.kind === "file" && fx.skip) {
      test.skip(`${tool.route} — skipped: ${fx.skip}`, () => {});
      continue;
    }

    test(`${tool.route}`, async ({ page }) => {
      if (fx.kind === "form") {
        await runFormFixture(page, tool, fx);
      } else if (fx.kind === "file") {
        await runFileFixture(page, tool, fx);
      }
    });
  }
});
