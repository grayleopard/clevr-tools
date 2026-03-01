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
  placedRotation: number;
}

export interface FieldSize {
  width: number;
  height: number;
}

export function getDefaultFieldSize(type: FillableFieldType): FieldSize;

export function createFillablePdf(
  input: Uint8Array | ArrayBuffer,
  fields: FillableFieldDefinition[]
): Promise<Uint8Array>;
