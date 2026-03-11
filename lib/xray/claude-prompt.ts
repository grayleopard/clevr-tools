// lib/xray/claude-prompt.ts

export const XRAY_SYSTEM_PROMPT = `You are the analysis engine for File X-Ray, a document intelligence feature on clevr.tools. You receive extracted text and metadata from PDF documents. Your job is to surface insights that help the user understand their document quickly.

RULES — THESE ARE ABSOLUTE:

1. NEVER fabricate numbers, dates, names, or dollar amounts. If a specific value appears in your response, it MUST exist verbatim in the source text provided. If you are unsure about a specific value, do not include it.

2. ALWAYS anchor findings to page numbers or section references when possible. Say "Page 3, Section 2.1" not just "the document states..."

3. EVERY finding must include a confidence score from 0.0 to 1.0:
   - 0.9-1.0: Directly stated in document, completely unambiguous
   - 0.75-0.89: Strongly implied, high confidence interpretation
   - Below 0.75: Do NOT include. Omit entirely.

4. Classify the document type. If uncertain, say "General Document."

5. For keyFindings (the most important insights), focus on:
   - Terms that directly affect the reader (financial obligations, deadlines, restrictions, penalties)
   - Anything unusual or noteworthy for this type of document
   - Risks or items requiring the reader's attention
   - Important dates and deadlines
   - Limit to 3-6 findings. Quality over quantity.

6. For deepAnalysis (premium insights), surface:
   - Metadata anomalies (e.g., creation date vs. stated date discrepancies)
   - Missing standard clauses or sections for this document type
   - Structural observations (reading level, complexity, length relative to typical)
   - Notable patterns in language (heavily one-sided terms, ambiguous clauses)
   - Limit to 2-4 findings.

7. For suggestedActions, recommend 2-4 relevant file operations. Map each to one of these tool slugs:
   - "compress-pdf" (reduce file size)
   - "split-pdf" (extract specific pages)
   - "merge-pdf" (combine with other documents)
   - "rotate-pdf" (fix page orientation)
   - "pdf-to-jpg" (convert pages to images)
   - "pdf-to-fillable" (make the PDF fillable/interactive)

8. Keep language clear, direct, and accessible. You are NOT giving legal, financial, or professional advice. You are surfacing information that already exists in the document to help the reader understand it faster.

9. The oneLinerSummary should be exactly 1-2 sentences. Be specific — include party names, dates, and document purpose if identifiable.

Respond ONLY with valid JSON using EXACTLY this structure and EXACTLY these field names — no variations:

{
  "documentType": "string",
  "oneLinerSummary": "string",
  "keyFindings": [
    {
      "insight": "the finding text goes here",
      "pageReference": "Page 3" or null,
      "confidence": 0.95,
      "category": "risk"
    }
  ],
  "deepAnalysis": [
    {
      "insight": "the finding text goes here",
      "pageReference": "Page 1" or null,
      "confidence": 0.85,
      "category": "structural"
    }
  ],
  "suggestedActions": [
    {
      "label": "Convert to Word",
      "toolSlug": "pdf-to-word",
      "reason": "short reason here"
    }
  ]
}

Field name rules (MANDATORY — do not use any other names):
- Use "insight" (not "text", "finding", "description", "observation", or "content")
- Use "pageReference" (not "page", "page_reference", or "location")
- Use "confidence" (not "score" or "certainty")
- Use "category" (not "type" or "kind") — must be one of: risk, key_term, notable, metadata, structural
- Use "toolSlug" (not "tool" or "slug")

No markdown fences. No extra fields. No preamble. Just the JSON object.`;

export function buildUserPrompt(
  extractedText: string,
  metadata: {
    pageCount: number;
    author: string | null;
    creator: string | null;
    creationDate: string | null;
    modDate: string | null;
  }
): string {
  const metadataSection = [
    `Page count: ${metadata.pageCount}`,
    metadata.author ? `Author metadata: ${metadata.author}` : null,
    metadata.creator ? `Creator application: ${metadata.creator}` : null,
    metadata.creationDate ? `Creation date (from metadata): ${metadata.creationDate}` : null,
    metadata.modDate ? `Last modified (from metadata): ${metadata.modDate}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Truncate text to ~15,000 words to stay within token limits
  const maxChars = 60000;
  const truncatedText =
    extractedText.length > maxChars
      ? extractedText.slice(0, maxChars) + "\n\n[Document truncated — showing first ~15,000 words]"
      : extractedText;

  return `DOCUMENT METADATA:
${metadataSection}

DOCUMENT TEXT:
${truncatedText}

Analyze this document and respond with the JSON structure containing documentType, oneLinerSummary, keyFindings, deepAnalysis, and suggestedActions.`;
}

export function parseClaudeResponse(rawText: string): {
  documentType: string;
  oneLinerSummary: string;
  keyFindings: Array<{
    insight: string;
    pageReference: string | null;
    confidence: number;
    category: string;
  }>;
  deepAnalysis: Array<{
    insight: string;
    pageReference: string | null;
    confidence: number;
    category: string;
  }>;
  suggestedActions: Array<{
    label: string;
    toolSlug: string;
    reason: string;
  }>;
} {
  // Strip any accidental markdown fencing
  const cleaned = rawText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate required fields exist
    if (!parsed.documentType || !parsed.oneLinerSummary || !parsed.keyFindings) {
      throw new Error("Missing required fields in Claude response");
    }

    // Normalize finding fields — the system prompt now specifies exact field names,
    // but this handles any residual variance from prior Claude responses.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizeFinding = (raw: Record<string, any>) => {
      // Insight text — try every alias Claude has been observed to use
      const insightText =
        raw.insight ??       // correct field name (per our schema)
        raw.text ??          // common fallback
        raw.description ??   // common fallback
        raw.content ??       // common fallback
        raw.finding ??       // "finding" instead of "insight"
        raw.observation ??   // analytical style
        raw.detail ??        // detail-oriented style
        raw.note ??          // note style
        raw.statement ??     // statement style
        raw.point ??         // bullet-point style
        raw.item ??          // list style
        "";

      return {
        insight: String(insightText),
        pageReference: (
          raw.pageReference ??   // correct field name
          raw.page_reference ??  // snake_case variant
          raw.page ??            // short form
          raw.pages ??           // plural form
          raw.location ??        // location alias
          raw.source ??          // source alias
          raw.ref ??             // abbreviated
          null
        ) as string | null,
        confidence: Number(raw.confidence ?? raw.score ?? raw.certainty ?? 0),
        category: String(raw.category ?? raw.type ?? raw.kind ?? raw.classification ?? "notable"),
      };
    };

    return {
      documentType: parsed.documentType,
      oneLinerSummary: parsed.oneLinerSummary,
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings.map(normalizeFinding) : [],
      deepAnalysis: Array.isArray(parsed.deepAnalysis) ? parsed.deepAnalysis.map(normalizeFinding) : [],
      suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
    };
  } catch (err) {
    console.error("Failed to parse Claude response:", err instanceof Error ? err.message : "unknown error");
    throw new Error("Analysis response could not be parsed");
  }
}
