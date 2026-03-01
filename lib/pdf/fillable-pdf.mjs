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
  const pdfjs = await import("pdfjs-dist");

  const sourceBytes = normalizePdfBytes(input);

  // Load with pdf-lib for form creation
  const pdfDoc = await PDFDocument.load(sourceBytes);
  const pdfLibPages = pdfDoc.getPages();
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Load with pdfjs for coordinate conversion
  const pdfjsDoc = await pdfjs.getDocument({ data: sourceBytes.slice() }).promise;

  const usedNames = new Set();

  // Cache pdfjs pages to avoid re-fetching
  const pdfjsPageCache = {};

  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const pdfLibPage = pdfLibPages[field.pageIndex];
    if (!pdfLibPage) continue;

    // Get or cache the pdfjs page (1-indexed)
    if (!pdfjsPageCache[field.pageIndex]) {
      pdfjsPageCache[field.pageIndex] = await pdfjsDoc.getPage(field.pageIndex + 1);
    }
    const pdfjsPage = pdfjsPageCache[field.pageIndex];

    // Recreate the viewport with the rotation active when the field was placed
    const placedRotation = Number(field.placedRotation) || 0;
    const viewport = pdfjsPage.getViewport({ scale: 1, rotation: placedRotation });

    // Convert field corners from viewport space to raw PDF space
    const [x1, y1] = viewport.convertToPdfPoint(
      Number(field.x) || 0,
      Number(field.y) || 0
    );
    const [x2, y2] = viewport.convertToPdfPoint(
      (Number(field.x) || 0) + (Number(field.width) || 0),
      (Number(field.y) || 0) + (Number(field.height) || 0)
    );

    const { width: pageWidth, height: pageHeight } = pdfLibPage.getSize();
    const defaults = getDefaultFieldSize(field.type);

    const rawWidth = Math.abs(x2 - x1) || defaults.width;
    const rawHeight = Math.abs(y2 - y1) || defaults.height;

    const width = clamp(rawWidth, 8, Math.max(8, pageWidth));
    const height = clamp(rawHeight, 8, Math.max(8, pageHeight));
    const x = clamp(
      Math.min(x1, x2),
      0,
      Math.max(0, pageWidth - width)
    );
    const y = clamp(
      Math.min(y1, y2),
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
      checkbox.addToPage(pdfLibPage, {
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
    textField.addToPage(pdfLibPage, {
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

  // Clean up pdfjs document
  pdfjsDoc.destroy();

  return pdfDoc.save();
}
