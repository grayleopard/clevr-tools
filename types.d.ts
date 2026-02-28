// Module declarations for packages that lack first-class TypeScript types.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "pdfmake/build/pdfmake" {
  const pdfMake: {
    vfs: Record<string, string>;
    fonts: Record<string, unknown>;
    createPdf(documentDefinition: Record<string, unknown>): {
      download(filename?: string): void;
      getBlob(cb: (blob: Blob) => void): void;
      getBase64(cb: (data: string) => void): void;
      getDataUrl(cb: (url: string) => void): void;
    };
  };
  export = pdfMake;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export = vfs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "html-to-pdfmake" {
  function htmlToPdfmake(
    html: string,
    options?: Record<string, unknown>
  ): unknown[];
  export = htmlToPdfmake;
}
