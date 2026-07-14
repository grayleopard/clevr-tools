import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export function fixture(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", name);
}

/** Collect runtime JS errors + the Next.js error-overlay text for a page. Call before navigating. */
export function watchForErrors(page: Page): { errors: string[] } {
  const state = { errors: [] as string[] };
  page.on("pageerror", (err) => {
    state.errors.push(`pageerror: ${err.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/(Uncaught|TypeError|ReferenceError)/i.test(text)) {
      state.errors.push(`console: ${text}`);
    }
  });
  return state;
}

export async function assertNoErrorBoundary(page: Page) {
  await expect(
    page.getByText(/Application error|Unhandled Runtime Error|Internal Server Error/i),
    "Next.js error boundary/overlay text is visible"
  ).toHaveCount(0);
}

export async function uploadFiles(page: Page, filePaths: string | string[]) {
  const input = page.locator('main input[type="file"]').first();
  await expect(input, "no input[type=file] found in main").toBeAttached();
  await input.setInputFiles(filePaths);
}

/** Waits for either a blob-URL download link/button, or a real browser download event. */
export async function expectDownloadArtifact(
  page: Page,
  opts: { timeout?: number; triggerClick?: () => Promise<void> } = {}
): Promise<{ kind: "blob-link" } | { kind: "download"; suggestedFilename: string; size: number }> {
  const timeout = opts.timeout ?? 30_000;

  if (opts.triggerClick) {
    const downloadPromise = page.waitForEvent("download", { timeout }).catch(() => null);
    await opts.triggerClick();
    const download = await downloadPromise;
    if (download) {
      const streamPath = await download.path();
      const size = streamPath ? (await import("node:fs/promises")).stat(streamPath).then((s) => s.size) : Promise.resolve(0);
      return { kind: "download", suggestedFilename: download.suggestedFilename(), size: await size };
    }
  }

  await expect
    .poll(
      async () => {
        const links = await page.locator('main a[href^="blob:"]').count();
        const buttons = await page.getByRole("button", { name: /download/i }).count();
        return links + buttons;
      },
      { timeout }
    )
    .toBeGreaterThan(0);

  return { kind: "blob-link" };
}

/** Fill a text-ish input located by its associated <label> text (case-insensitive substring). */
export async function fillByLabel(page: Page, labelPattern: string | RegExp, value: string) {
  const locator = page.getByLabel(toRegExp(labelPattern));
  await locator.first().fill(value);
}

export async function selectByLabel(page: Page, labelPattern: string | RegExp, optionLabel: string) {
  const locator = page.getByLabel(toRegExp(labelPattern));
  await locator.first().selectOption({ label: optionLabel });
}

export function toRegExp(pattern: string | RegExp): RegExp {
  return pattern instanceof RegExp ? pattern : new RegExp(escapeRegExp(pattern), "i");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * innerText() renders static text content only — it does NOT include the
 * current .value of <input>/<textarea> elements (their value isn't a text
 * node). A lot of this app's tools (base64, url-encoder, find-and-replace,
 * color-picker's RGB fields, ...) render their output INTO a form control's
 * value rather than as plain text, which innerText()-only checks silently
 * can never see. Append every input/textarea value in <main> so successPattern
 * checks can match output that lives in a value, not just visible text.
 */
export async function mainText(page: Page): Promise<string> {
  const [text, values] = await Promise.all([
    page.locator("main").innerText(),
    page.locator("main input, main textarea").evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement | HTMLTextAreaElement).value).join(" | ")
    ),
  ]);
  return `${text} ${values}`.replace(/\s+/g, " ");
}

export async function expectMainTextMatches(page: Page, pattern: RegExp, opts: { timeout?: number } = {}) {
  await expect
    .poll(async () => mainText(page), { timeout: opts.timeout ?? 10_000 })
    .toMatch(pattern);
}

export function firstTextarea(page: Page): Locator {
  return page.locator("main textarea").first();
}
