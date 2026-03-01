export interface PageRectCss {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PageSizePt {
  widthPt: number;
  heightPt: number;
}

export interface FieldSizePt {
  widthPt: number;
  heightPt: number;
}

export function domPointToNxNy(params: {
  clientX: number;
  clientY: number;
  pageRectCss: PageRectCss;
}): { nx: number; ny: number };

export function pdfPtSizeToCssPx(params: {
  widthPt: number;
  heightPt: number;
  pageRectCss: Pick<PageRectCss, "width" | "height">;
  pageSizePt: PageSizePt;
}): { widthPx: number; heightPx: number };

export function cssPxToPdfPtSize(params: {
  widthPx: number;
  heightPx: number;
  pageRectCss: Pick<PageRectCss, "width" | "height">;
  pageSizePt: PageSizePt;
}): { widthPt: number; heightPt: number };

export function nxnyToCssPx(params: {
  nx: number;
  ny: number;
  pageRectCss: Pick<PageRectCss, "width" | "height">;
}): { leftPx: number; topPx: number };

export function nxnyToPdfPt(params: {
  nx: number;
  ny: number;
  pageSizePt: PageSizePt;
  fieldSizePt: FieldSizePt;
}): { xPt: number; yPt: number };

export function clampNxNyToBounds(params: {
  nx: number;
  ny: number;
  pageSizePt: PageSizePt;
  fieldSizePt: FieldSizePt;
}): { nx: number; ny: number; maxNx: number; maxNy: number };
