export type FillableFieldType = "text" | "checkbox" | "date" | "signature";

export interface FillableFieldDefinition {
  type: FillableFieldType;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  label?: string;
}

export interface FieldSize {
  width: number;
  height: number;
}

export interface FillablePdfOptions {
  normalizePageRotation?: boolean;
}

export function getDefaultFieldSize(type: FillableFieldType): FieldSize;

export function createFillablePdf(
  input: Uint8Array | ArrayBuffer,
  fields: FillableFieldDefinition[],
  options?: FillablePdfOptions
): Promise<Uint8Array>;
