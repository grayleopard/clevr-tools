const FIELD_DEFAULTS = {
  text: { width: 220, height: 28 },
  checkbox: { width: 18, height: 18 },
  date: { width: 160, height: 28 },
  signature: { width: 220, height: 28 },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizePdfBytes(input) {
  if (input instanceof Uint8Array) {
    return input.slice();
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input.slice(0));
  }
  throw new TypeError("Expected PDF input as Uint8Array or ArrayBuffer");
}

function sanitizeFieldName(name, fallback) {
  const raw = (name || fallback || "field").trim();
  const normalized = raw
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.-]/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback || "field";
}

export function getDefaultFieldSize(type) {
  return FIELD_DEFAULTS[type] ?? FIELD_DEFAULTS.text;
}

export async function createFillablePdf(input, fields) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const sourceBytes = normalizePdfBytes(input);
  const pdfDoc = await PDFDocument.load(sourceBytes);
  const pages = pdfDoc.getPages();
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const usedNames = new Set();

  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const page = pages[field.pageIndex];
    if (!page) continue;

    const defaults = getDefaultFieldSize(field.type);
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const width = clamp(
      Number(field.width) || defaults.width,
      8,
      Math.max(8, pageWidth)
    );
    const height = clamp(
      Number(field.height) || defaults.height,
      8,
      Math.max(8, pageHeight)
    );
    const x = clamp(
      Number(field.x) || 0,
      0,
      Math.max(0, pageWidth - width)
    );
    const y = clamp(
      Number(field.y) || 0,
      0,
      Math.max(0, pageHeight - height)
    );

    let fieldName = sanitizeFieldName(
      field.name,
      `${field.type || "field"}_${i + 1}`
    );
    while (usedNames.has(fieldName)) {
      fieldName = `${fieldName}_${usedNames.size + 1}`;
    }
    usedNames.add(fieldName);

    if (field.type === "checkbox") {
      const checkbox = form.createCheckBox(fieldName);
      checkbox.addToPage(page, {
        x,
        y,
        width,
        height,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 1,
      });
      continue;
    }

    const textField = form.createTextField(fieldName);
    if (field.type === "date") {
      textField.setText("YYYY-MM-DD");
    } else {
      textField.setText("");
    }
    textField.addToPage(page, {
      x,
      y,
      width,
      height,
      textColor: rgb(0, 0, 0),
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 1,
      backgroundColor: rgb(1, 1, 1),
      font,
    });
    textField.updateAppearances(font);
  }

  return pdfDoc.save();
}
