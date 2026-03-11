// lib/xray/types.ts

export interface XRayRequest {
  file: File;
}

export interface FileFacts {
  pageCount: number;
  fileSize: string;
  createdDate: string | null;
  modifiedDate: string | null;
  creatorApp: string | null;
  isEncrypted: boolean;
  hasFormFields: boolean;
  imageCount: number;
  estimatedReadTime: string;
  pdfVersion: string | null;
  fontCount: number;
}

export interface Finding {
  insight: string;
  pageReference: string | null;
  confidence: number;
  category: "key_term" | "risk" | "notable" | "metadata" | "structural";
}

export interface SuggestedAction {
  label: string;
  toolSlug: string;
  reason: string;
}

export interface XRayAnalysis {
  documentType: string;
  oneLinerSummary: string;
  keyFindings: Finding[];
  deepAnalysis: Finding[];
  suggestedActions: SuggestedAction[];
}

export interface XRayResponse {
  success: true;
  fileFacts: FileFacts;
  analysis: XRayAnalysis;
  processingTime: number;
}

export interface XRayError {
  success: false;
  error: string;
  code: "FILE_TOO_LARGE" | "INVALID_FILE" | "RATE_LIMITED" | "ANALYSIS_FAILED" | "EXTRACTION_FAILED";
}

export type XRayResult = XRayResponse | XRayError;
