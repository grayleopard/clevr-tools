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
  x: number;
  y: number;
  width: number;
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
