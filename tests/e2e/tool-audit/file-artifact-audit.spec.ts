import path from "node:path";
import { promises as fs } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import sharp from "sharp";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

const AUDIT_DIR = "/tmp/clevr-p1-remediation/file-artifact-audit";

// This audit file creates and consumes one shared deterministic fixture set.
// Keep its artifact-heavy browser work serial even when the repository enables
// `fullyParallel`, otherwise multiple workers can rewrite the same files while
// another test is decoding or uploading them.
test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

type BrowserBlob = {
  bytes: Buffer;
  filename: string;
  mimeType: string;
};

function fixture(name: string): string {
  return path.join(AUDIT_DIR, name);
}

async function makeFixtures(): Promise<void> {
  await fs.mkdir(AUDIT_DIR, { recursive: true });

  const transparentSvg = Buffer.from(`
    <svg width="160" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="20" width="112" height="80" rx="12" fill="#10b981"/>
      <circle cx="80" cy="60" r="26" fill="#312e81" fill-opacity="0.8"/>
    </svg>
  `);
  await sharp({
    create: { width: 160, height: 120, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: transparentSvg }])
    .png()
    .toFile(fixture("transparent.png"));

  const pixels = Buffer.alloc(800 * 600 * 3);
  let state = 0x12345678;
  for (let index = 0; index < pixels.length; index += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    pixels[index] = state >>> 24;
  }
  await sharp(pixels, { raw: { width: 800, height: 600, channels: 3 } })
    .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
    .toFile(fixture("photo-high-quality.jpg"));
  await sharp(fixture("transparent.png")).webp({ quality: 90 }).toFile(fixture("transparent.webp"));

  await fs.copyFile(path.join(process.cwd(), "tests/fixtures/sample.gif"), fixture("animated.gif"));
  await fs.copyFile(path.join(process.cwd(), "tests/fixtures/sample.docx"), fixture("sample.docx"));
  await fs.writeFile(fixture("corrupt.pdf"), Buffer.from("this is not a PDF"));
  await fs.writeFile(fixture("empty.pdf"), Buffer.alloc(0));
  await fs.writeFile(fixture("renamed-image.jpg"), await fs.readFile(fixture("transparent.png")));

  const single = await PDFDocument.create();
  const font = await single.embedFont(StandardFonts.Helvetica);
  const page = single.addPage([300, 200]);
  page.drawRectangle({ x: 0, y: 0, width: 300, height: 200, color: rgb(0.94, 0.98, 0.96) });
  page.drawText("Clevr audit page one", { x: 28, y: 110, size: 18, font });
  await fs.writeFile(fixture("single.pdf"), await single.save());

  const multi = await PDFDocument.create();
  const multiFont = await multi.embedFont(StandardFonts.Helvetica);
  const first = multi.addPage([320, 220]);
  first.drawText("First page", { x: 24, y: 120, size: 18, font: multiFont });
  const second = multi.addPage([420, 260]);
  second.drawText("Second page", { x: 24, y: 150, size: 18, font: multiFont });
  await fs.writeFile(fixture("multi.pdf"), await multi.save());

  const rotated = await PDFDocument.load(await fs.readFile(fixture("multi.pdf")));
  rotated.getPage(0).setRotation(degrees(90));
  await fs.writeFile(fixture("rotated.pdf"), await rotated.save());
}

async function upload(page: Page, route: string, files: string | string[]): Promise<void> {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const input = page.locator('main input[type="file"]').first();
  await expect(input).toBeAttached();
  await input.setInputFiles(files);
}

async function readBrowserBlob(link: Locator): Promise<BrowserBlob> {
  await expect(link).toHaveAttribute("href", /^blob:/, { timeout: 45_000 });
  const page = link.page();
  const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
  await link.click();
  const download = await downloadPromise;
  const outputPath = await download.path();
  expect(outputPath).toBeTruthy();
  const bytes = await fs.readFile(outputPath!);
  const filename = download.suggestedFilename();

  const mimeType =
    bytes.subarray(0, 5).toString() === "%PDF-" ? "application/pdf" :
    bytes.subarray(0, 6).toString() === "GIF89a" || bytes.subarray(0, 6).toString() === "GIF87a" ? "image/gif" :
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image/png" :
    bytes[0] === 0xff && bytes[1] === 0xd8 ? "image/jpeg" :
    bytes.subarray(8, 12).toString() === "WEBP" ? "image/webp" :
    "application/octet-stream";

  return {
    bytes,
    filename,
    mimeType,
  };
}

async function firstBlobDownload(page: Page): Promise<BrowserBlob> {
  return readBrowserBlob(page.locator('main a[download][href^="blob:"]').first());
}

async function expectPdf(bytes: Buffer, pages: number): Promise<PDFDocument> {
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  const pdf = await PDFDocument.load(bytes);
  expect(pdf.getPageCount()).toBe(pages);
  return pdf;
}

test.beforeAll(async () => {
  await makeFixtures();
});

test.describe("file and image artifact integrity", () => {
  test("Image Compressor emits a smaller, valid JPG with unchanged dimensions", async ({ page }) => {
    await upload(page, "/compress/image", fixture("photo-high-quality.jpg"));
    const output = await firstBlobDownload(page);
    const metadata = await sharp(output.bytes).metadata();
    const source = await fs.stat(fixture("photo-high-quality.jpg"));

    expect(output.mimeType).toBe("image/jpeg");
    expect(output.filename).toBe("photo-high-quality-compressed.jpg");
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(600);
    expect(output.bytes.length).toBeLessThan(source.size);
  });

  test("PNG to JPG composites transparent pixels onto white", async ({ page }) => {
    await upload(page, "/convert/png-to-jpg", fixture("transparent.png"));
    const output = await firstBlobDownload(page);
    const image = sharp(output.bytes);
    const metadata = await image.metadata();
    const corner = await image.extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();

    expect(output.mimeType).toBe("image/jpeg");
    expect(output.filename).toBe("transparent.jpg");
    expect(metadata.format).toBe("jpeg");
    expect([metadata.width, metadata.height]).toEqual([160, 120]);
    expect([...corner.subarray(0, 3)].every((channel) => channel >= 245)).toBe(true);
  });

  test("WebP to PNG and PNG to WebP preserve alpha and dimensions", async ({ page }) => {
    await upload(page, "/convert/webp-to-png", fixture("transparent.webp"));
    const png = await firstBlobDownload(page);
    const pngMetadata = await sharp(png.bytes).metadata();
    expect(png.mimeType).toBe("image/png");
    expect(pngMetadata.format).toBe("png");
    expect(pngMetadata.hasAlpha).toBe(true);
    expect([pngMetadata.width, pngMetadata.height]).toEqual([160, 120]);

    await upload(page, "/convert/png-to-webp", fixture("transparent.png"));
    const webp = await firstBlobDownload(page);
    const webpMetadata = await sharp(webp.bytes).metadata();
    expect(webp.mimeType).toBe("image/webp");
    expect(webpMetadata.format).toBe("webp");
    expect(webpMetadata.hasAlpha).toBe(true);
    expect([webpMetadata.width, webpMetadata.height]).toEqual([160, 120]);
  });

  test("JPG to PNG emits a real PNG with unchanged dimensions", async ({ page }) => {
    await upload(page, "/convert/jpg-to-png", fixture("photo-high-quality.jpg"));
    const output = await firstBlobDownload(page);
    const metadata = await sharp(output.bytes).metadata();
    expect(output.mimeType).toBe("image/png");
    expect(output.filename).toBe("photo-high-quality.png");
    expect(metadata.format).toBe("png");
    expect([metadata.width, metadata.height]).toEqual([800, 600]);
  });

  test("GIF Compressor keeps a decodable animated GIF", async ({ page }) => {
    await upload(page, "/tools/gif-compressor", fixture("animated.gif"));
    await expect(page.getByRole("button", { name: /^Compress GIF$/ }).first()).toBeEnabled({ timeout: 20_000 });
    await page.getByRole("button", { name: /^Compress GIF$/ }).first().click();
    const output = await firstBlobDownload(page);
    const metadata = await sharp(output.bytes, { animated: true }).metadata();

    expect(output.mimeType).toBe("image/gif");
    expect(output.filename).toBe("animated-compressed.gif");
    expect(metadata.format).toBe("gif");
    expect(metadata.pages).toBeGreaterThan(1);
    expect([metadata.width, metadata.pageHeight]).toEqual([40, 40]);
  });

  test("Image Resizer creates requested dimensions for a registered format", async ({ page }) => {
    await upload(page, "/tools/resize-image", fixture("photo-high-quality.jpg"));
    await expect(page.locator("#target-width")).toHaveValue("800", { timeout: 20_000 });
    await page.locator("#target-width").fill("400");
    await page.getByRole("button", { name: /Resize to 400 × 300/ }).click();
    const output = await firstBlobDownload(page);
    const metadata = await sharp(output.bytes).metadata();

    expect(output.mimeType).toBe("image/jpeg");
    expect(output.filename).toBe("photo-high-quality-400x300.jpg");
    expect([metadata.width, metadata.height]).toEqual([400, 300]);
  });

  test("Image Resizer keeps PNG and WebP magic, MIME, extension, and dimensions aligned", async ({ page }) => {
    for (const entry of [
      { input: "transparent.png", extension: "png", mimeType: "image/png", format: "png" },
      { input: "transparent.webp", extension: "webp", mimeType: "image/webp", format: "webp" },
      { input: "renamed-image.jpg", extension: "png", mimeType: "image/png", format: "png" },
    ]) {
      await upload(page, "/tools/resize-image", fixture(entry.input));
      await expect(page.locator("#target-width")).toHaveValue("160", { timeout: 20_000 });
      await page.locator("#target-width").fill("80");
      await page.getByRole("button", { name: /Resize to 80 × 60/ }).click();
      const output = await firstBlobDownload(page);
      const metadata = await sharp(output.bytes).metadata();
      const baseName = entry.input.replace(/\.[^.]+$/, "");

      expect(output.filename).toBe(`${baseName}-80x60.${entry.extension}`);
      expect(output.mimeType).toBe(entry.mimeType);
      expect(metadata.format).toBe(entry.format);
      expect([metadata.width, metadata.height]).toEqual([80, 60]);
    }
  });

  test("Image Resizer rejects GIF before processing", async ({ page }) => {
    await upload(page, "/tools/resize-image", fixture("animated.gif"));
    await expect(page.getByText(/Animated GIFs are not supported here/i)).toBeVisible();
    await expect(page.getByText(/not a supported format/i)).toBeVisible();
    await expect(page.locator("#target-width")).toHaveValue("");
    await expect(page.getByRole("button", { name: /^Resize to/ })).toHaveCount(0);
    await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);
  });

  test("Image Cropper circle output is a square PNG with alpha", async ({ page }) => {
    await upload(page, "/files/image-cropper", fixture("transparent.png"));
    await page.getByRole("button", { name: "Circle", exact: true }).click();
    await expect(page.getByRole("button", { name: "Crop Image", exact: true })).toBeEnabled({ timeout: 20_000 });
    await page.getByRole("button", { name: "Crop Image", exact: true }).click();
    const output = await firstBlobDownload(page);
    const metadata = await sharp(output.bytes).metadata();

    expect(output.mimeType).toBe("image/png");
    expect(output.filename).toBe("transparent-cropped.png");
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(metadata.height);
    expect(metadata.hasAlpha).toBe(true);

    const decoded = await sharp(output.bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alphaAt = (x: number, y: number) =>
      decoded.data[(y * decoded.info.width + x) * decoded.info.channels + 3];
    expect(alphaAt(0, 0)).toBe(0);
    expect(alphaAt(decoded.info.width - 1, 0)).toBe(0);
    expect(alphaAt(0, decoded.info.height - 1)).toBe(0);
    expect(alphaAt(decoded.info.width - 1, decoded.info.height - 1)).toBe(0);
    expect(alphaAt(Math.floor(decoded.info.width / 2), Math.floor(decoded.info.height / 2))).toBeGreaterThan(0);
  });

  test("Image Cropper rejects GIF before reducing it to a still frame", async ({ page }) => {
    await upload(page, "/files/image-cropper", fixture("animated.gif"));
    await expect(page.getByText(/Animated GIFs are not supported because cropping would remove animation/i)).toBeVisible();
    await expect(page.getByText(/not a supported format/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Crop Image", exact: true })).toHaveCount(0);
    await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);
  });

  test("corrupt and renamed inputs fail without offering an output", async ({ page }) => {
    await upload(page, "/compress/pdf", fixture("corrupt.pdf"));
    await expect(page.getByText(/Compressing PDFs/i)).toHaveCount(0, { timeout: 20_000 });
    await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);

    await upload(page, "/compress/pdf", fixture("empty.pdf"));
    await expect(page.getByText(/Compressing PDFs/i)).toHaveCount(0, { timeout: 20_000 });
    await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);

    await upload(page, "/convert/png-to-jpg", fixture("renamed-image.jpg"));
    await expect(page.getByText(/not a supported format/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);
  });
});

test.describe("PDF artifact integrity", () => {
  test("PDF Compressor emits a readable one-page PDF and reduces the structural fixture", async ({ page }) => {
    await upload(page, "/compress/pdf", fixture("single.pdf"));
    const output = await firstBlobDownload(page);
    const source = await fs.stat(fixture("single.pdf"));
    expect(output.mimeType).toBe("application/pdf");
    expect(output.filename).toBe("single-compressed.pdf");
    await expectPdf(output.bytes, 1);
    expect(output.bytes.length).toBeLessThan(source.size);
  });

  test("Merge PDF preserves source page order and page geometry", async ({ page }) => {
    await upload(page, "/tools/merge-pdf", [fixture("single.pdf"), fixture("multi.pdf")]);
    await page.getByRole("button", { name: /Merge 2 PDFs/ }).click();
    const output = await firstBlobDownload(page);
    const pdf = await expectPdf(output.bytes, 3);
    expect(pdf.getPages().map((item) => item.getSize())).toEqual([
      { width: 300, height: 200 },
      { width: 320, height: 220 },
      { width: 420, height: 260 },
    ]);
  });

  test("Split PDF emits one valid PDF per source page", async ({ page }) => {
    await upload(page, "/tools/split-pdf", fixture("multi.pdf"));
    await expect(page.getByRole("button", { name: "Split PDF", exact: true })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: "Split PDF", exact: true }).click();
    const links = page.locator('main a[download][href^="blob:"]');
    await expect(links).toHaveCount(2, { timeout: 30_000 });
    const first = await readBrowserBlob(links.nth(0));
    const second = await readBrowserBlob(links.nth(1));
    const firstPdf = await expectPdf(first.bytes, 1);
    const secondPdf = await expectPdf(second.bytes, 1);
    expect(firstPdf.getPage(0).getSize()).toEqual({ width: 320, height: 220 });
    expect(secondPdf.getPage(0).getSize()).toEqual({ width: 420, height: 260 });
  });

  test("Rotate PDF preserves page count and applies the selected rotation", async ({ page }) => {
    await upload(page, "/tools/rotate-pdf", fixture("multi.pdf"));
    await expect(page.getByRole("button", { name: /90° CW/ }).first()).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: /90° CW/ }).first().click();
    await page.getByRole("button", { name: /Apply Rotations/ }).click();
    const output = await firstBlobDownload(page);
    const pdf = await expectPdf(output.bytes, 2);
    expect(pdf.getPages().map((item) => item.getRotation().angle)).toEqual([90, 90]);
  });

  for (const entry of [
    { route: "/convert/jpg-to-pdf", input: "photo-high-quality.jpg", name: "JPG" },
    { route: "/convert/png-to-pdf", input: "transparent.png", name: "PNG" },
  ]) {
    test(`${entry.name} to PDF emits a readable one-page PDF`, async ({ page }) => {
      await upload(page, entry.route, fixture(entry.input));
      const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
      await page.getByRole("button", { name: /Download|Create PDF/ }).last().click();
      const download = await downloadPromise;
      const outputPath = await download.path();
      expect(outputPath).toBeTruthy();
      const bytes = await fs.readFile(outputPath!);
      await expectPdf(bytes, 1);
    });
  }

  test("PDF to JPG emits one decodable JPEG per page", async ({ page }) => {
    await upload(page, "/convert/pdf-to-jpg", fixture("multi.pdf"));
    await expect(page.getByRole("button", { name: /Convert 2 pages to JPG/i })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: /Convert 2 pages to JPG/i }).click();
    const links = page.locator('main a[download][href^="blob:"]');
    await expect(links).toHaveCount(2, { timeout: 45_000 });
    for (const [index, expected] of [[0, [640, 440]], [1, [840, 520]]] as const) {
      const output = await readBrowserBlob(links.nth(index));
      const metadata = await sharp(output.bytes).metadata();
      expect(output.mimeType).toBe("image/jpeg");
      expect(metadata.format).toBe("jpeg");
      expect([metadata.width, metadata.height]).toEqual(expected);
    }
  });
});

test("Background Remover direct API is unconfigured and unavailable", async ({ request }) => {
  const response = await request.post("/api/remove-bg");
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ error: "Background removal is not configured yet." });
});
