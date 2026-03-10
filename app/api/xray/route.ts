// app/api/xray/route.ts
// NOTE: Vercel serverless functions default to a 4.5MB request body limit.
// Supporting the 20MB file size requires Vercel Pro plan configuration or
// a vercel.json override. This is a deployment-time concern, not a code concern.

import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { extractPDF, isValidPDF } from "@/lib/xray/pdf-extractor";
import {
  XRAY_SYSTEM_PROMPT,
  buildUserPrompt,
  parseClaudeResponse,
} from "@/lib/xray/claude-prompt";
import {
  filterAndVerifyFindings,
  sortFindings,
} from "@/lib/xray/confidence-filter";
import { checkRateLimit, incrementUsage } from "@/lib/xray/rate-limiter";
import type { XRayResponse, XRayError, Finding } from "@/lib/xray/types";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

// Max file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // ─── 1. RATE LIMIT (before reading body) ─────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `You've used all ${rateCheck.limit} free X-Rays for this month. Limit resets on the 1st.`,
          code: "RATE_LIMITED",
        } as XRayError,
        { status: 429 }
      );
    }

    // ─── 2. PARSE UPLOAD ───────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          code: "INVALID_FILE",
        } as XRayError,
        { status: 400 }
      );
    }

    // ─── 3. VALIDATE FILE ──────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File exceeds 20MB limit",
          code: "FILE_TOO_LARGE",
        } as XRayError,
        { status: 413 }
      );
    }

    // Check MIME type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "File must be a PDF (application/pdf)",
          code: "INVALID_FILE",
        } as XRayError,
        { status: 400 }
      );
    }

    // Read file into memory buffer (never written to disk)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes
    if (!isValidPDF(buffer)) {
      return NextResponse.json(
        {
          success: false,
          error: "File does not appear to be a valid PDF",
          code: "INVALID_FILE",
        } as XRayError,
        { status: 400 }
      );
    }

    // ─── 4. EXTRACT TEXT & METADATA ────────────────────────
    let extraction;
    try {
      extraction = await extractPDF(buffer);
    } catch (err) {
      console.error("PDF extraction failed:", err instanceof Error ? err.message : "unknown error");
      return NextResponse.json(
        {
          success: false,
          error: "Could not read this PDF. It may be scanned or image-based.",
          code: "EXTRACTION_FAILED",
        } as XRayError,
        { status: 422 }
      );
    }

    // Check if we actually got meaningful text
    if (extraction.text.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This PDF appears to be image-based or scanned. Text extraction found insufficient content. OCR support is coming soon.",
          code: "EXTRACTION_FAILED",
        } as XRayError,
        { status: 422 }
      );
    }

    // ─── 5. ANALYZE WITH CLAUDE ────────────────────────────
    let analysis;
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: XRAY_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(extraction.text, extraction.metadata),
          },
        ],
      });

      // Extract text content from response
      const responseText = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      analysis = parseClaudeResponse(responseText);
    } catch (err) {
      console.error("Claude analysis failed:", err instanceof Error ? err.message : "unknown error");
      return NextResponse.json(
        {
          success: false,
          error: "Analysis could not be completed. Please try again.",
          code: "ANALYSIS_FAILED",
        } as XRayError,
        { status: 502 }
      );
    }

    // ─── 6. FILTER & VERIFY ───────────────────────────────
    const verifiedKeyFindings = sortFindings(
      filterAndVerifyFindings(
        analysis.keyFindings as Finding[],
        extraction.text
      )
    );

    const verifiedDeepAnalysis = sortFindings(
      filterAndVerifyFindings(
        analysis.deepAnalysis as Finding[],
        extraction.text
      )
    );

    // ─── 7. INCREMENT USAGE ────────────────────────────────
    incrementUsage(ip);

    // ─── 8. BUILD RESPONSE ─────────────────────────────────
    const processingTime = Date.now() - startTime;

    const response: XRayResponse = {
      success: true,
      fileFacts: extraction.fileFacts,
      analysis: {
        documentType: analysis.documentType,
        oneLinerSummary: analysis.oneLinerSummary,
        keyFindings: verifiedKeyFindings,
        deepAnalysis: verifiedDeepAnalysis,
        suggestedActions: analysis.suggestedActions.slice(0, 4), // Max 4 actions
      },
      processingTime,
    };

    // ─── 9. LOG (minimal, no file content) ─────────────────
    console.log(
      JSON.stringify({
        event: "xray_complete",
        pageCount: extraction.fileFacts.pageCount,
        fileSize: extraction.fileFacts.fileSize,
        documentType: analysis.documentType,
        findingsCount: verifiedKeyFindings.length,
        processingTimeMs: processingTime,
        // NO file content, NO text, NO user data
      })
    );

    // File buffer goes out of scope here and will be garbage collected.
    // Nothing is persisted.

    return NextResponse.json(response);
  } catch (err) {
    console.error("Unexpected X-Ray error:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        code: "ANALYSIS_FAILED",
      } as XRayError,
      { status: 500 }
    );
  }
}
