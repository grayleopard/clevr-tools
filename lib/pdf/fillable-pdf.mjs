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

function getNormalizedPageLayout(pageWidth, pageHeight, rotation) {
  switch (rotation) {
    case 90:
      return {
        outWidth: pageHeight,
        outHeight: pageWidth,
        drawX: 0,
        drawY: pageWidth,
        drawRotation: 90,
      };
    case 180:
      return {
        outWidth: pageWidth,
        outHeight: pageHeight,
        drawX: pageWidth,
        drawY: pageHeight,
        drawRotation: 180,
      };
    case 270:
      return {
        outWidth: pageHeight,
        outHeight: pageWidth,
        drawX: pageHeight,
        drawY: 0,
        drawRotation: 270,
      };
    default:
      return {
        outWidth: pageWidth,
        outHeight: pageHeight,
        drawX: 0,
        drawY: 0,
        drawRotation: 0,
      };
  }
}

function mapPointForRotation(x, y, pageWidth, pageHeight, rotation) {
  switch (rotation) {
    case 90:
      return { x: y, y: pageWidth - x };
    case 180:
      return { x: pageWidth - x, y: pageHeight - y };
    case 270:
      return { x: pageHeight - y, y: x };
    default:
      return { x, y };
  }
}

function transformRectForRotation(rect, pageWidth, pageHeight, rotation) {
  if (rotation === 0) {
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  const corners = [
    mapPointForRotation(rect.x, rect.y, pageWidth, pageHeight, rotation),
    mapPointForRotation(rect.x + rect.width, rect.y, pageWidth, pageHeight, rotation),
    mapPointForRotation(rect.x, rect.y + rect.height, pageWidth, pageHeight, rotation),
    mapPointForRotation(
      rect.x + rect.width,
      rect.y + rect.height,
      pageWidth,
      pageHeight,
      rotation
    ),
  ];

  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getDefaultFieldSize(type) {
  return FIELD_DEFAULTS[type] ?? FIELD_DEFAULTS.text;
}

async function normalizeDocumentAndFieldsForExport(pdfDoc, fields, options, degrees) {
  if (!options?.normalizePageRotation) {
    return { pdfDoc, fields };
  }

  const { PDFDocument } = await import("pdf-lib");
  const sourcePages = pdfDoc.getPages();
  const normalizedDoc = await PDFDocument.create();
  const embeddedPages = await normalizedDoc.embedPages(sourcePages);
  const pageTransforms = [];

  for (let i = 0; i < sourcePages.length; i += 1) {
    const sourcePage = sourcePages[i];
    const embeddedPage = embeddedPages[i];
    const { width, height } = sourcePage.getSize();
    const displayRotation = 0;
    const layout = getNormalizedPageLayout(width, height, displayRotation);

    const targetPage = normalizedDoc.addPage([layout.outWidth, layout.outHeight]);
    targetPage.drawPage(embeddedPage, {
      x: layout.drawX,
      y: layout.drawY,
      rotate: degrees(layout.drawRotation),
    });
    targetPage.setRotation(degrees(0));

    pageTransforms[i] = {
      pageWidth: width,
      pageHeight: height,
      rotation: displayRotation,
      outWidth: layout.outWidth,
      outHeight: layout.outHeight,
    };
  }

  const transformedFields = fields.map((field) => {
    const transform = pageTransforms[field.pageIndex];
    if (!transform) return field;

    const mapped = transformRectForRotation(
      {
        x: Number(field.x) || 0,
        y: Number(field.y) || 0,
        width: Number(field.width) || 0,
        height: Number(field.height) || 0,
      },
      transform.pageWidth,
      transform.pageHeight,
      transform.rotation
    );

    return {
      ...field,
      x: mapped.x,
      y: mapped.y,
      width: mapped.width,
      height: mapped.height,
    };
  });

  return {
    pdfDoc: normalizedDoc,
    fields: transformedFields,
  };
}

export async function createFillablePdf(input, fields, options = {}) {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");

  const sourceBytes = normalizePdfBytes(input);
  const sourceDoc = await PDFDocument.load(sourceBytes);
  const normalized = await normalizeDocumentAndFieldsForExport(sourceDoc, fields, options, degrees);
  const pdfDoc = normalized.pdfDoc;
  const fieldsToApply = normalized.fields;

  const pages = pdfDoc.getPages();
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const usedNames = new Set();

  for (let i = 0; i < fieldsToApply.length; i += 1) {
    const field = fieldsToApply[i];
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
