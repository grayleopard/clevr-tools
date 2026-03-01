export interface DomRectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FieldPlacementParams {
  pdfPageWidth: number;
  pdfPageHeight: number;
  fieldWidthPt: number;
  fieldHeightPt: number;
  pageRotation?: number;
}

export interface MapDomPointToPdfPointParams extends FieldPlacementParams {
  clientX: number;
  clientY: number;
  canvasRect: DomRectLike;
  cssZoom?: number;
  dpr?: number;
  pdfViewport?: unknown;
}

export interface MapResult {
  nx: number;
  ny: number;
  xPt: number;
  yPt: number;
}

export interface FieldNormSizeResult {
  widthNorm: number;
  heightNorm: number;
}

export interface PdfFieldToDomRectParams extends FieldPlacementParams {
  xPt: number;
  yPt: number;
  canvasRect: DomRectLike;
}

export interface PdfFieldToDomRectResult {
  nx: number;
  ny: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getFieldDisplayNormSize(params: FieldPlacementParams): FieldNormSizeResult;

export function mapNormalizedFieldToPdfPoint(params: {
  nx: number;
  ny: number;
  pdfPageWidth: number;
  pdfPageHeight: number;
  fieldWidthPt: number;
  fieldHeightPt: number;
  pageRotation?: number;
}): MapResult;

export function mapDomPointToPdfPoint(
  params: MapDomPointToPdfPointParams
): MapResult;

export function mapPdfFieldToDomRect(
  params: PdfFieldToDomRectParams
): PdfFieldToDomRectResult;
