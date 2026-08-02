import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function loadTypeScript(relativePath) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    () => {
      throw new Error("Unexpected test dependency");
    }
  );
  return transpiledModule.exports;
}

const raster = loadTypeScript("lib/image-remediation/raster-formats.ts");
const heic = loadTypeScript("lib/image-remediation/heic-validation.ts");
const smart = loadTypeScript("lib/image-remediation/smart-converter-contracts.ts");
const registry = loadTypeScript("lib/tools.ts");

test("raster format detection follows magic bytes instead of filenames", () => {
  assert.equal(
    raster.detectRasterFormatFromBytes(Uint8Array.from([0xff, 0xd8, 0xff, 0xdb])),
    "jpeg"
  );
  assert.equal(
    raster.detectRasterFormatFromBytes(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    ),
    "png"
  );
  assert.equal(
    raster.detectRasterFormatFromBytes(Buffer.from("GIF89a", "ascii")),
    "gif"
  );
  assert.equal(
    raster.detectRasterFormatFromBytes(
      Uint8Array.from(Buffer.from("RIFF0000WEBP", "ascii"))
    ),
    "webp"
  );
  assert.equal(raster.rasterMimeType("jpeg"), "image/jpeg");
  assert.equal(raster.rasterExtension("jpeg"), "jpg");
});

test("HEIC validation accepts the committed HEIF container and rejects renamed junk", () => {
  const fixture = fs.readFileSync(path.join(projectRoot, "tests/fixtures/sample.heic"));
  assert.equal(heic.hasHeicFileSignature(fixture), true);
  assert.equal(heic.hasHeicFileSignature(Buffer.from("not a HEIC file")), false);
});

test("invalid HEIC input is rejected before the browser decoder starts", async () => {
  await assert.rejects(
    heic.assertHeicInput(new Blob([Buffer.from("not a HEIC file")])),
    (error) => error.code === "invalid-input" && /valid HEIC or HEIF/i.test(error.message)
  );
});

test("HEIC timeout and output validation fail with bounded, actionable errors", async () => {
  const started = Date.now();
  await assert.rejects(
    heic.withHeicTimeout(new Promise(() => {}), 25),
    (error) => error.code === "timeout" && /browser's local HEIC decoder/i.test(error.message)
  );
  assert.ok(Date.now() - started < 1_000);

  const jpeg = await heic.normalizeValidatedJpeg(
    new Blob([Uint8Array.from([0xff, 0xd8, 0xff, 0xdb, 0xff, 0xd9])])
  );
  assert.equal(jpeg.type, "image/jpeg");
  await assert.rejects(
    heic.normalizeValidatedJpeg(new Blob([Buffer.from("not jpeg")])),
    (error) => error.code === "invalid-output"
  );
});

test("every Smart Converter action has an explicit compatible source route", () => {
  const acceptedSourcesByRoute = new Map([
    ["/compress/image", new Set(["png", "jpg", "webp"])],
    ["/convert/png-to-jpg", new Set(["png"])],
    ["/convert/png-to-webp", new Set(["png"])],
    ["/convert/png-to-pdf", new Set(["png"])],
    ["/tools/resize-image", new Set(["png", "jpg", "webp"])],
    ["/files/image-cropper", new Set(["png", "jpg", "webp"])],
    ["/convert/jpg-to-png", new Set(["jpg"])],
    ["/convert/jpg-to-pdf", new Set(["jpg"])],
    ["/tools/gif-compressor", new Set(["gif"])],
    ["/convert/webp-to-png", new Set(["webp"])],
    ["/compress/pdf", new Set(["pdf"])],
    ["/convert/pdf-to-jpg", new Set(["pdf"])],
    ["/tools/merge-pdf", new Set(["pdf"])],
    ["/tools/split-pdf", new Set(["pdf"])],
    ["/tools/rotate-pdf", new Set(["pdf"])],
    ["/convert/word-to-pdf", new Set(["docx"])],
  ]);
  const liveRoutes = new Set(
    registry.tools.filter((tool) => tool.live !== false).map((tool) => tool.route)
  );
  const contractSourceByRoute = new Map([
    ["/compress/image", "components/tools/ImageCompressor.tsx"],
    ["/convert/png-to-jpg", "components/tools/PngToJpg.tsx"],
    ["/convert/png-to-webp", "components/tools/PngToWebp.tsx"],
    ["/convert/png-to-pdf", "app/convert/png-to-pdf/page.tsx"],
    ["/tools/resize-image", "components/tools/ImageResizer.tsx"],
    ["/files/image-cropper", "components/tools/ImageCropper.tsx"],
    ["/convert/jpg-to-png", "components/tools/JpgToPng.tsx"],
    ["/convert/jpg-to-pdf", "app/convert/jpg-to-pdf/page.tsx"],
    ["/tools/gif-compressor", "components/tools/GifCompressor.tsx"],
    ["/convert/webp-to-png", "components/tools/WebpToPng.tsx"],
    ["/compress/pdf", "components/tools/PdfCompressor.tsx"],
    ["/convert/pdf-to-jpg", "components/tools/PdfToJpg.tsx"],
    ["/tools/merge-pdf", "components/tools/MergePdf.tsx"],
    ["/tools/split-pdf", "components/tools/SplitPdf.tsx"],
    ["/tools/rotate-pdf", "components/tools/RotatePdf.tsx"],
    ["/convert/word-to-pdf", "components/tools/WordToPdf.tsx"],
  ]);
  const extensionByFileType = {
    png: ".png",
    jpg: ".jpg",
    gif: ".gif",
    webp: ".webp",
    pdf: ".pdf",
    docx: ".docx",
  };

  for (const [fileType, contracts] of Object.entries(smart.SMART_CONVERTER_CONTRACTS)) {
    const actionIds = new Set();
    for (const contract of contracts) {
      assert.equal(actionIds.has(contract.actionId), false, `${fileType}/${contract.actionId}`);
      actionIds.add(contract.actionId);
      assert.ok(acceptedSourcesByRoute.has(contract.route), contract.route);
      assert.ok(liveRoutes.has(contract.route), `${contract.route} is not a live tool`);
      const contractSourcePath = contractSourceByRoute.get(contract.route);
      assert.ok(contractSourcePath, `missing contract source for ${contract.route}`);
      const contractSource = fs.readFileSync(path.join(projectRoot, contractSourcePath), "utf8");
      const expectedExtension = extensionByFileType[fileType];
      assert.ok(expectedExtension, `missing extension for ${fileType}`);
      const escapedExtension = expectedExtension.replace(".", "\\.");
      assert.match(
        contractSource,
        new RegExp(`accept[\\s\\S]{0,160}${escapedExtension}`),
        `${contract.route} does not declare ${fileType} input`
      );
      assert.ok(
        acceptedSourcesByRoute.get(contract.route).has(fileType),
        `${fileType}/${contract.actionId} does not match ${contract.route}`
      );
      assert.equal(smart.getSmartConverterRoute(fileType, contract.actionId), contract.route);
    }
  }

  assert.deepEqual(smart.getSmartConverterActions("heic"), []);
  assert.equal(smart.getSmartConverterRoute("heic", "to-jpg"), null);
  assert.equal(smart.getSmartConverterRoute("heic", "to-png"), null);
  assert.equal(smart.getSmartConverterRoute("jpg", "to-webp"), null);
  assert.equal(smart.getSmartConverterRoute("webp", "to-jpg"), null);
  assert.equal(smart.detectSmartConverterFileType({ name: "legacy.doc", type: "application/msword" }), "unknown");
});

test("both Smart Converter loading states omit contained and legacy formats", () => {
  for (const relativePath of [
    "components/home/SmartConverter.tsx",
    "components/home/SmartConverterDeferred.tsx",
  ]) {
    const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
    assert.doesNotMatch(source, /\bHEIC\b|\bHEIF\b/, `${relativePath} advertises contained HEIC`);

    const acceptValues = [...source.matchAll(/accept="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(acceptValues.length > 0, `${relativePath} has no bounded accept contract`);
    for (const accept of acceptValues) {
      assert.doesNotMatch(accept, /\.heic|\.heif/i, `${relativePath} accepts contained HEIC`);
      assert.equal(
        accept.split(",").includes(".doc"),
        false,
        `${relativePath} accepts unsupported legacy DOC`
      );
    }
  }
});
