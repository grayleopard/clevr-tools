type PdfMakeModule = {
  vfs: Record<string, string>;
  fonts?: Record<string, unknown>;
  createPdf(documentDefinition: Record<string, unknown>): {
    download(filename?: string): void;
    getBlob(cb: (blob: Blob) => void): void;
    getBase64(cb: (data: string) => void): void;
    getDataUrl(cb: (url: string) => void): void;
  };
};

let pdfMakePromise: Promise<PdfMakeModule> | null = null;

function extractVfs(moduleValue: unknown): Record<string, string> | null {
  if (!moduleValue || typeof moduleValue !== "object") return null;
  const maybe = moduleValue as {
    default?: unknown;
    pdfMake?: { vfs?: Record<string, string> };
    vfs?: Record<string, string>;
  };

  if (maybe.default && typeof maybe.default === "object") {
    const fromDefault = maybe.default as { pdfMake?: { vfs?: Record<string, string> }; vfs?: Record<string, string> };
    if (fromDefault.pdfMake?.vfs) return fromDefault.pdfMake.vfs;
    if (fromDefault.vfs) return fromDefault.vfs;
  }

  if (maybe.pdfMake?.vfs) return maybe.pdfMake.vfs;
  if (maybe.vfs) return maybe.vfs;
  return null;
}

export async function loadPdfMake(): Promise<PdfMakeModule> {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const [pdfMakeImport, vfsImport] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);

      const pdfMake = ((pdfMakeImport as { default?: PdfMakeModule }).default ??
        (pdfMakeImport as unknown as PdfMakeModule));
      const vfs = extractVfs(vfsImport);

      if (vfs) pdfMake.vfs = vfs;
      if (!pdfMake?.createPdf) {
        throw new Error("Failed to initialize pdfmake");
      }

      return pdfMake;
    })();
  }

  return pdfMakePromise;
}
