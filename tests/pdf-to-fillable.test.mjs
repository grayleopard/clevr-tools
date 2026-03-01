import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, PDFName } from "pdf-lib";

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
