import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import JSZip from "jszip";

for (const name of ["demo-1", "demo-3", "iphone-xr-3578", "iphone-xr-3604", "portrait"]) {
  test(`HEIC ${name} produces an independently verified JPEG`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/convert/heic-to-jpg");
    await page.locator('main input[type="file"]').setInputFiles(path.join(process.cwd(), "tests/fixtures/heic", `${name}.heic`));
    const link = page.locator('main a[download][href^="blob:"]').first();
    await expect(link).toBeVisible({ timeout: 20_000 });
    const pending = page.waitForEvent("download");
    await link.click();
    const download = await pending;
    const output = testInfo.outputPath(`${name}.jpg`);
    await download.saveAs(output);
    const bytes = await fs.readFile(output);
    expect([...bytes.subarray(0, 3)]).toEqual([255, 216, 255]);
    expect([...bytes.subarray(-2)]).toEqual([255, 217]);
    const reference = path.join(process.cwd(), "tests/fixtures/heic", `${name}-reference.jpg`);
    const actualMetadata = await sharp(bytes).metadata();
    const expectedMetadata = await sharp(reference).metadata();
    // Safari may add its own pixel-size/color-space EXIF tags. Original
    // camera identification must not be carried into the canvas output.
    expect(actualMetadata.exif?.toString().includes("Apple") ?? false).toBe(false);
    expect(actualMetadata.exif?.toString().includes("iPhone") ?? false).toBe(false);
    expect([actualMetadata.width, actualMetadata.height]).toEqual([expectedMetadata.width, expectedMetadata.height]);
    const actual = await sharp(bytes).resize(32,32,{fit:"fill"}).removeAlpha().raw().toBuffer();
    const expected = await sharp(reference).resize(32,32,{fit:"fill"}).removeAlpha().raw().toBuffer();
    const meanError = actual.reduce((sum, value, i) => sum + Math.abs(value - expected[i]), 0) / actual.length;
    expect(meanError).toBeLessThan(12);
    expect(errors).toEqual([]);
    await testInfo.attach("output-verification", {body: JSON.stringify({name, width:actualMetadata.width, height:actualMetadata.height, meanError}),contentType:"application/json"});
  });
}

test("HEIC rejects invalid content and can cancel a real conversion", async ({page}) => {
  await page.goto("/convert/heic-to-jpg");
  const input=page.locator('main input[type="file"]');
  await input.setInputFiles({name:"invalid.heic",mimeType:"image/heic",buffer:Buffer.from("not a photo")});
  await expect(page.getByRole("alert").filter({hasText:/does not contain a valid HEIC/})).toBeVisible();
  await input.setInputFiles(path.join(process.cwd(),"tests/fixtures/heic/iphone-xr-3578.heic"));
  await page.getByRole("button",{name:"Cancel conversion"}).click();
  await expect(page.getByRole("button",{name:"Cancel conversion"})).toHaveCount(0);
  await expect(page.locator('main a[download][href^="blob:"]')).toHaveCount(0);
  await input.setInputFiles(path.join(process.cwd(),"tests/fixtures/sample.heic"));
  await expect(page.locator('main a[download][href^="blob:"]').first()).toBeVisible({timeout:20_000});
});

test("speed example, precision, swap and reset preserve the expected quantity", async ({page}) => {
  await page.goto("/calc/convert/speed");
  await page.getByRole("button",{name:/113 km\/h =/}).click();
  await expect(page.getByLabel("From",{exact:true})).toHaveValue("113");
  await expect(page.getByLabel("To",{exact:true})).toHaveValue(/^70\.2149/);
  await page.getByRole("button",{name:"Swap units"}).click();
  await expect(page.getByLabel("To",{exact:true})).toHaveValue("113");
  await page.getByRole("button",{name:"Reset",exact:true}).click();
  await expect(page.getByLabel("From",{exact:true})).toHaveValue("1");
  await expect(page.getByLabel("From unit",{exact:true})).toHaveValue("mph");
});

test("calculator events exclude defaults and all entered values", async ({page}) => {
  await page.addInitScript(() => {
    const events: unknown[][] = [];
    Object.assign(window,{__calculatorEvents: events,gtag:(...args:unknown[])=>events.push(args)});
  });
  await page.goto("/calc/convert/data");
  const events = () => page.evaluate(() => (window as Window & {__calculatorEvents:unknown[][]}).__calculatorEvents.filter(e=>String(e[1]).startsWith("calculator_")));
  expect(await events()).toEqual([]);
  await page.getByLabel("From",{exact:true}).fill("1234567");
  await page.getByLabel("From",{exact:true}).fill("7654321");
  expect(await events()).toEqual([["event","calculator_started",{tool:"data"}],["event","calculator_succeeded",{tool:"data"}]]);
});

test("percentage handles equal values and invalid baselines on mobile", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/calc/percentage");
  await page.getByRole("button",{name:"% Change",exact:true}).click();
  await page.getByLabel("Original Value").fill("200");
  await page.getByLabel("New Value").fill("200");
  await expect(page.getByText("0% — no change",{exact:true})).toBeVisible();
  await page.getByLabel("Original Value").fill("-200");
  await expect(page.getByText("Use a positive original value to calculate percentage change.",{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("HEIC batch ZIP retains photos with duplicate filenames", async ({page}, testInfo) => {
  await page.goto("/convert/heic-to-jpg");
  const buffer = await fs.readFile(path.join(process.cwd(), "tests/fixtures/sample.heic"));
  await page.locator('main input[type="file"]').setInputFiles([
    {name:"photo.heic", mimeType:"image/heic", buffer},
    {name:"photo.heic", mimeType:"image/heic", buffer},
  ]);
  const zipButton = page.getByRole("button", {name:"Download all as ZIP", exact:true});
  await expect(zipButton).toBeVisible({timeout:30_000});
  const pending = page.waitForEvent("download");
  await zipButton.click();
  const download = await pending;
  const output = testInfo.outputPath("photos.zip");
  await download.saveAs(output);
  const zip = await JSZip.loadAsync(await fs.readFile(output));
  expect(Object.keys(zip.files).sort()).toEqual(["photo-2.jpg", "photo.jpg"]);
  for (const file of Object.values(zip.files)) {
    const metadata = await sharp(await file.async("nodebuffer")).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBeGreaterThan(0);
  }
});
