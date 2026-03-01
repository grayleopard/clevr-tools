import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, PDFName, degrees } from "pdf-lib";

import { createFillablePdf } from "../lib/pdf/fillable-pdf.mjs";

const fixturePath = (...parts) =>
  path.join(process.cwd(), "tests", "fixtures", ...parts);

test("createFillablePdf creates an AcroForm text field", async () => {
  const input = await readFile(fixturePath("sample.pdf"));
  const output = await createFillablePdf(input, [
    {
      type: "text",
      pageIndex: 0,
      x: 72,
      y: 72,
      width: 220,
      height: 28,
      name: "full_name",
      label: "Full Name",
    },
  ]);

  assert.ok(output.length > 500, `unexpectedly small output: ${output.length} bytes`);

  const pdfDoc = await PDFDocument.load(output);
  const acroForm = pdfDoc.catalog.get(PDFName.of("AcroForm"));
  assert.ok(acroForm, "Expected an AcroForm entry in output PDF");

  const fields = pdfDoc.getForm().getFields();
  assert.equal(fields.length, 1);
  assert.equal(fields[0].getName(), "full_name");
});

test("createFillablePdf preserves source page rotation metadata", async () => {
  const base = await readFile(fixturePath("sample.pdf"));
  const rotatedInput = await PDFDocument.load(base);
  rotatedInput.getPage(0).setRotation(degrees(90));
  const rotatedBytes = await rotatedInput.save();

  const output = await createFillablePdf(rotatedBytes, [
    {
      type: "text",
      pageIndex: 0,
      x: 100,
      y: 100,
      width: 180,
      height: 28,
      name: "rotated_field",
    },
  ]);

  const pdfDoc = await PDFDocument.load(output);
  const page = pdfDoc.getPage(0);
  assert.equal(page.getRotation().angle, 90, "Expected exported page rotation to match source");

  const fields = pdfDoc.getForm().getFields();
  assert.equal(fields.length, 1);

  const rect = fields[0].acroField
    .getWidgets()[0]
    .getRectangle();
  assert.ok(rect.width > 20, "Expected field width to be present");
  assert.ok(rect.height > 10, "Expected field height to be present");

  const { width: pageWidth, height: pageHeight } = page.getSize();
  assert.ok(rect.x >= 0 && rect.x <= pageWidth, "Field x must be inside page bounds");
  assert.ok(rect.y >= 0 && rect.y <= pageHeight, "Field y must be inside page bounds");
});
