export interface MemeTemplate {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  textFields: TextFieldConfig[];
}

export type MemeTextAlign = "left" | "center" | "right";
export type MemeTextVAlign = "top" | "middle" | "bottom";

export interface TextFieldConfig {
  id: string;
  label: string;
  /** Fraction (0-1) of the template's width — not absolute pixels. */
  x: number;
  /** Fraction (0-1) of the template's height — not absolute pixels. */
  y: number;
  /** Fraction (0-1) of the template's width. */
  width: number;
  /** Fraction (0-1) of the template's height. */
  height: number;
  fontSize: number;
  align: MemeTextAlign;
  valign?: MemeTextVAlign;
  color: string;
  outline: boolean;
}

export type MemeStyleMode = "classic" | "modern";

export interface MemeStyleState {
  mode: MemeStyleMode;
  color: string;
  fontScale: number;
}

export type MemeTextValues = Record<string, string>;
