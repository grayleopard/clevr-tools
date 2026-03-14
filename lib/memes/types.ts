export interface MemeTemplate {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  textFields: TextFieldConfig[];
}

export interface TextFieldConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  align: "center" | "left";
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
