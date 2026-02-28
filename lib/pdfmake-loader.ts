/**
 * Shared browser-side loader for pdfmake using bundled package assets.
 * Avoids runtime CDN dependencies in conversion flows.
 */

type PdfMakeApi = NonNullable<Window["pdfMake"]>;

let pdfMakePromise: Promise<PdfMakeApi> | null = null;

function normalizeVfsModule(moduleValue: unknown): Record<string, string> | null {
  if (!moduleValue || typeof moduleValue !== "object") return null;
  const value = moduleValue as {
    pdfMake?: { vfs?: Record<string, string> };
    vfs?: Record<string, string>;
    default?: unknown;
  };

  if (value.pdfMake?.vfs) return value.pdfMake.vfs;
  if (value.vfs) return value.vfs;
  if (value.default && typeof value.default === "object") {
    const fallback = value.default as { pdfMake?: { vfs?: Record<string, string> }; vfs?: Record<string, string> };
    if (fallback.pdfMake?.vfs) return fallback.pdfMake.vfs;
    if (fallback.vfs) return fallback.vfs;
  }
  return null;
}

export async function loadPdfMake(): Promise<PdfMakeApi> {
  if (typeof window === "undefined") {
    throw new Error("pdfmake can only be loaded in the browser");
  }

  if (pdfMakePromise) return pdfMakePromise;

  pdfMakePromise = (async () => {
    const [pdfMakeModule, vfsFontsModule] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);

    const candidate = (pdfMakeModule as { default?: PdfMakeApi }).default
      ?? (pdfMakeModule as unknown as PdfMakeApi);

    const vfs = normalizeVfsModule(vfsFontsModule);
    if (!vfs) {
      throw new Error("Failed to load pdfmake font VFS");
    }

    candidate.vfs = candidate.vfs || vfs;
    candidate.fonts = candidate.fonts || {
      Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-MediumItalic.ttf",
      },
    };

    return candidate;
  })();

  return pdfMakePromise;
}
