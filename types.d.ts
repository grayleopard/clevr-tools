// Module declarations for packages that lack TypeScript types

// window.pdfMake — set globally by the CDN script in WordToPdf.
// Declared optional so TypeScript's control flow can narrow away `undefined`.
// Ambient .d.ts files augment globals directly (no `declare global {}` wrapper).
interface Window {
  pdfMake?: {
    vfs: Record<string, string>;
    fonts: Record<string, unknown>;
    createPdf(documentDefinition: Record<string, unknown>): {
      download(filename?: string): void;
      getBlob(cb: (blob: Blob) => void): void;
      getBase64(cb: (data: string) => void): void;
      getDataUrl(cb: (url: string) => void): void;
    };
  };
}

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

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export = vfs;
}

declare module "html-to-pdfmake" {
  function htmlToPdfmake(
    html: string,
    options?: Record<string, unknown>
  ): unknown[];
  export = htmlToPdfmake;
}
