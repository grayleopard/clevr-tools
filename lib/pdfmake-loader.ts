type PdfMakeModule = {
  addVirtualFileSystem(vfs: Record<string, string>): void;
  fonts?: Record<string, unknown>;
  createPdf(documentDefinition: Record<string, unknown>): {
    download(filename?: string): Promise<void>;
    getBlob(): Promise<Blob>;
    getBase64(): Promise<string>;
    getDataUrl(): Promise<string>;
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
    if (Object.values(fromDefault).every(value => typeof value === "string")) {
      return fromDefault as Record<string, string>;
    }
  }

  if (maybe.pdfMake?.vfs) return maybe.pdfMake.vfs;
  if (maybe.vfs) return maybe.vfs;
  if (Object.values(moduleValue).every(value => typeof value === "string")) {
    return moduleValue as Record<string, string>;
  }
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

      if (!pdfMake?.createPdf || !pdfMake.addVirtualFileSystem || !vfs) {
        throw new Error("Failed to initialize pdfmake");
      }
      pdfMake.addVirtualFileSystem(vfs);

      return pdfMake;
    })();
  }

  return pdfMakePromise;
}
