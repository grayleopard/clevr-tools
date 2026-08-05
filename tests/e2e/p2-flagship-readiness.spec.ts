import path from "node:path";
import { promises as fs } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import JSZip from "jszip";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const EVIDENCE_DIR = "/tmp/clevr-p2-readiness";

type CapturedEvent = ["event", string, Record<string, unknown>];

test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

function fixture(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", name);
}

function evidence(name: string): string {
  return path.join(EVIDENCE_DIR, name);
}

async function makeFixtures(): Promise<void> {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  await fs.writeFile(evidence("invalid.pdf"), "not a PDF");

  const first = await PDFDocument.create();
  first.addPage([210, 310]);
  await fs.writeFile(evidence("first.pdf"), await first.save());

  const second = await PDFDocument.create();
  second.addPage([420, 240]);
  await fs.writeFile(evidence("second.pdf"), await second.save());
}

async function monitorAnalytics(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const monitoredWindow = window as unknown as {
      __p2SafeToolEvents: unknown[][];
      gtag: (...args: unknown[]) => void;
    };
    monitoredWindow.__p2SafeToolEvents = [];
    monitoredWindow.gtag = (...args: unknown[]) => {
      monitoredWindow.__p2SafeToolEvents.push(args);
    };
  });
}

async function capturedToolEvents(page: Page): Promise<CapturedEvent[]> {
  return page.evaluate(() => {
    const monitoredWindow = window as unknown as { __p2SafeToolEvents?: unknown[][] };
    return (monitoredWindow.__p2SafeToolEvents ?? []).filter(
      (event): event is CapturedEvent =>
        Array.isArray(event) && event[0] === "event" && typeof event[1] === "string"
    );
  });
}

async function upload(page: Page, route: string, files: string | string[]): Promise<void> {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(files);
}

async function downloadFrom(locator: Locator, outputName: string): Promise<Buffer> {
  const page = locator.page();
  const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
  await locator.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(outputName);
  const outputPath = evidence(outputName);
  await download.saveAs(outputPath);
  return fs.readFile(outputPath);
}

function expectSafeLifecycleEvents(
  events: CapturedEvent[],
  tool: string,
  requiredNames: string[]
): void {
  const toolEvents = events.filter(([, , payload]) => payload.tool === tool);
  const names = toolEvents.map(([, name]) => name);

  for (const requiredName of requiredNames) {
    expect(names).toContain(requiredName);
  }

  for (const [, name, payload] of toolEvents) {
    const allowedKeys =
      name === "tool_failed"
        ? ["failure_category", "tool"]
        : name === "tool_duration"
          ? ["duration_ms", "tool"]
          : ["tool"];
    expect(Object.keys(payload).sort()).toEqual(allowedKeys);
  }

  const serialized = JSON.stringify(toolEvents);
  expect(serialized).not.toContain("sample.jpg");
  expect(serialized).not.toContain("sample.pdf");
  expect(serialized).not.toContain("clipboard");
}

test.beforeAll(async () => {
  await makeFixtures();
});

test("Image Compressor emits a parseable JPG and safe lifecycle events", async ({ page }) => {
  await monitorAnalytics(page);
  await upload(page, "/compress/image", fixture("sample.jpg"));

  const downloadLink = page.locator('main a[download="sample-compressed.jpg"][href^="blob:"]');
  await expect(downloadLink).toBeVisible({ timeout: 45_000 });
  const bytes = await downloadFrom(downloadLink, "sample-compressed.jpg");
  const metadata = await sharp(bytes).metadata();

  expect(metadata.format).toBe("jpeg");
  expect([metadata.width, metadata.height]).toEqual([2, 2]);
  expect(bytes[0]).toBe(0xff);
  expect(bytes[1]).toBe(0xd8);

  await page.getByRole("button", { name: "Process Another" }).click();
  await expect(page.getByRole("button", { name: /Browse Files/i })).toBeVisible();

  expectSafeLifecycleEvents(await capturedToolEvents(page), "image-compressor", [
    "tool_opened",
    "tool_valid_input",
    "tool_started",
    "tool_succeeded",
    "tool_duration",
    "tool_download",
    "tool_process_another",
  ]);
});

test("PDF to JPG emits ordered, parseable JPG files in a ZIP", async ({ page }) => {
  await monitorAnalytics(page);
  await upload(page, "/convert/pdf-to-jpg", [fixture("sample.pdf"), fixture("sample.pdf")]);

  const convert = page.getByRole("button", { name: /Convert 2 pages to JPG/i });
  await expect(convert).toBeEnabled({ timeout: 45_000 });
  await convert.click();
  await expect(page.getByText(/2 pages converted to JPG successfully/i)).toBeVisible({ timeout: 45_000 });

  const zipBytes = await downloadFrom(page.getByRole("button", { name: "Download ZIP" }), "pdf-pages.zip");
  const zip = await JSZip.loadAsync(zipBytes);
  const filenames = Object.values(zip.files)
    .filter((entry) => !entry.dir)
    .map((entry) => entry.name);

  expect(filenames).toEqual(["1-sample-page-1.jpg", "2-sample-page-1.jpg"]);
  for (const filename of filenames) {
    const jpgBytes = await zip.file(filename)?.async("nodebuffer");
    expect(jpgBytes).toBeTruthy();
    const metadata = await sharp(jpgBytes!).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.height).toBeGreaterThan(0);
  }

  await page.getByRole("button", { name: "Start over" }).click();
  expectSafeLifecycleEvents(await capturedToolEvents(page), "pdf-to-jpg", [
    "tool_opened",
    "tool_valid_input",
    "tool_started",
    "tool_succeeded",
    "tool_duration",
    "tool_download",
    "tool_process_another",
  ]);
});

test("Merge PDF supports keyboard reordering and emits a parseable ordered PDF", async ({ page }) => {
  await monitorAnalytics(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await upload(page, "/tools/merge-pdf", [evidence("first.pdf"), evidence("second.pdf")]);

  const moveSecondUp = page.getByRole("button", { name: "Move PDF 2 up" });
  await expect(moveSecondUp).toBeEnabled({ timeout: 20_000 });
  await moveSecondUp.focus();
  await page.keyboard.press("Enter");

  const orderedRows = page.locator('[role="listitem"]');
  await expect(orderedRows.nth(0)).toContainText("second.pdf");
  await expect(orderedRows.nth(1)).toContainText("first.pdf");

  await page.getByRole("button", { name: /Merge 2 PDFs/i }).click();
  const mergedBytes = await downloadFrom(
    page.locator('main a[download="merged.pdf"][href^="blob:"]'),
    "merged.pdf"
  );
  expect(mergedBytes.subarray(0, 5).toString()).toBe("%PDF-");
  const output = await PDFDocument.load(mergedBytes);
  expect(output.getPageCount()).toBe(2);
  expect(output.getPages().map((item) => item.getSize())).toEqual([
    { width: 420, height: 240 },
    { width: 210, height: 310 },
  ]);

  await page.getByRole("button", { name: "Merge more PDFs" }).click();
  expectSafeLifecycleEvents(await capturedToolEvents(page), "merge-pdf", [
    "tool_opened",
    "tool_valid_input",
    "tool_started",
    "tool_succeeded",
    "tool_duration",
    "tool_download",
    "tool_process_another",
  ]);
});

test("PDF input failures use a safe category and do not create an output", async ({ page }) => {
  await monitorAnalytics(page);
  await upload(page, "/convert/pdf-to-jpg", evidence("invalid.pdf"));

  await expect
    .poll(
      async () => (await capturedToolEvents(page)).some(([, name]) => name === "tool_failed"),
      { timeout: 20_000 }
    )
    .toBe(true);
  await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);

  const failures = (await capturedToolEvents(page)).filter(
    ([, name, payload]) => name === "tool_failed" && payload.tool === "pdf-to-jpg"
  );
  expect(failures).toEqual([
    ["event", "tool_failed", { tool: "pdf-to-jpg", failure_category: "invalid_input" }],
  ]);
  expect((await capturedToolEvents(page)).some(([, name]) => name === "tool_duration")).toBe(false);
});
