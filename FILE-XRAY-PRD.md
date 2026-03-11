# File X-Ray — Product Requirements Document
## AI-Powered Document Intelligence for clevr.tools

**Product:** clevr.tools — File X-Ray
**Version:** 1.0 (Phase 1 — PDF)
**Author:** Preet / Pipit LLC
**Date:** March 3, 2026
**Status:** Ready for Development
**AI Partner:** Anthropic (Claude API)
**Stack:** Next.js / Vercel / TypeScript

---

## 1. Executive Summary

### The Opportunity

File utility sites process billions of files annually but treat every file as a black box — bytes in, bytes out. No site understands what users upload. File X-Ray changes that by making clevr.tools the first file platform that actually reads, analyzes, and explains your documents.

File X-Ray is an AI-powered document intelligence feature that analyzes uploaded files and surfaces key insights, risks, and hidden metadata — all without storing any user data. When a user uploads a PDF, instead of just offering conversion tools, clevr.tools will understand the document and present layered findings: what the file is, what matters in it, and what actions the user should take.

This feature positions clevr.tools as the first AI-native file utility platform, differentiated from competitors like ILovePDF, Smallpdf, and Adobe Acrobat Online, none of which offer any form of document intelligence. It also establishes a natural integration with Anthropic's Claude API, positioning clevr.tools for Menlo Ventures' Anthology Fund.

### 1.1 Success Metrics

- **Engagement:** 15%+ of PDF uploaders trigger X-Ray within first 30 days
- **Return visits:** X-Ray users return 3x more often than non-X-Ray users
- **Conversion:** 5% of free X-Ray users upgrade to Pro within 60 days
- **Accuracy:** Zero hallucinated numerical/financial claims in production (verified by confidence filter)
- **Performance:** 95th percentile response time under 8 seconds

---

## 2. Product Vision

### 2.1 The Problem

Every file utility site follows the same broken pattern: upload a file, pick an operation, download the result, endure intrusive ads. The user has zero relationship with the site. They arrive via search, tolerate a poor experience, and leave. There is no intelligence, no understanding, and no reason to return.

Meanwhile, users increasingly work with complex documents they don't fully understand — contracts, legal agreements, financial statements, insurance policies. They need help understanding these files, not just converting them.

### 2.2 The Solution

File X-Ray transforms clevr.tools from a passive file converter into an active document intelligence platform. The core interaction model shifts from "upload → process → download" to "upload → understand → transform."

A single button ("X-Ray this file") lets users opt into AI analysis. The results surface what the document is, what matters in it, and what's hidden — all anchored to specific pages and sections. Suggested actions then route users into clevr's existing tools, making the entire platform contextually discoverable.

### 2.3 Privacy-First Principle

> **CORE PROMISE:** "Your file will be analyzed to surface key insights. Nothing is stored. Your file is deleted immediately after analysis."

This is not negotiable. clevr.tools differentiates on trust. Files are held in memory only, never written to disk or cloud storage. No file content appears in logs. No user data is retained. The privacy promise is displayed inline at the point of interaction, not buried in terms of service.

---

## 3. User Experience

### 3.1 User Flow

1. User uploads a PDF to any clevr tool page (compress, merge, convert, etc.)
2. Alongside existing tool buttons, user sees: "✦ X-Ray this file" with the privacy notice below.
3. User clicks X-Ray. A scanning animation plays (3–8 seconds) while the document is analyzed.
4. Results appear in layers: File Facts (deterministic) → Summary → Key Findings → Deep Analysis (premium) → Suggested Actions.
5. User can act on any finding by clicking a suggested tool, or close and continue with their original task.

### 3.2 Results Hierarchy

#### Layer 1: File Facts (Always Shown, 100% Accurate)

Deterministic data extracted directly from the PDF structure. This is never AI-interpreted and is always correct: page count, file size, creation date, creator application, image count, estimated read time. Displayed as a compact bar at the top of results.

#### Layer 2: Document Summary (Free Tier)

AI-generated document type classification and a 1–2 sentence summary identifying the parties, dates, and purpose. Example: "A 12-page commercial lease agreement between ABC Corp and XYZ LLC, dated February 14, 2026."

#### Layer 3: Key Findings (Free Tier, 3–6 Findings)

The core value of X-Ray. Each finding includes the insight text, a page/section reference, and a visual indicator for category (risk items shown with a warning icon and amber highlight). Findings are sorted by importance: risks first, then key terms, then notable items.

#### Layer 4: Deep Analysis (Premium / clevr Pro)

Blurred behind a paywall. Includes metadata anomalies (creation vs. stated dates, revision history), missing standard clauses, structural comparisons to typical documents of this type, and language pattern analysis. Unlocked with clevr Pro subscription.

#### Layer 5: Suggested Actions (Always Shown)

2–4 contextual tool recommendations based on the document content. Each links to an existing clevr tool. Example: "Convert to Word — edit the clauses flagged above." This makes clevr's full tool suite discoverable through context rather than navigation.

### 3.3 Analysis Animation

While Claude processes the document, a scanning animation communicates progress without being gimmicky. A subtle scan line moves through a document silhouette with a soft indigo glow. The text reads "Reading your document..." with a gentle pulse. No spinner. No "AI is thinking." The animation should feel premium and calm.

### 3.4 Attribution

A small, tasteful footer at the bottom of every X-Ray result: "Analyzed with Claude ✦" in light gray. No links, no badges, no marketing language. Just attribution, like a photographer's signature. The word "AI" does not appear prominently anywhere in the user-facing experience.

### 3.5 Liability Disclaimer

Directly above the Claude attribution: "These insights are for informational purposes. Verify important details independently." Short, honest, and visible without being obtrusive. This provides legal protection while maintaining trust.

---

## 4. Technical Architecture

### 4.1 System Overview

The system uses a serverless architecture on Vercel with no persistent storage. The frontend (Next.js/React) handles file upload and results display. A Vercel serverless API route processes the file entirely in memory: PDF text extraction via pdf-parse, analysis via the Anthropic Claude API, confidence filtering, and structured JSON response. The file buffer is released after processing and garbage collected by Node.js.

### 4.2 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js (React), existing clevr.tools codebase |
| API Layer | Next.js API Routes (Vercel Serverless Functions) |
| PDF Extraction | pdf-parse (pure JavaScript, no native dependencies) |
| AI Analysis | Anthropic Claude API (claude-sonnet-4-5-20250514) |
| Hosting | Vercel (existing infrastructure) |
| Rate Limiting | IP-based, Vercel KV or in-memory for prototype |
| New Dependencies | @anthropic-ai/sdk, pdf-parse |

### 4.3 API Endpoint

| Detail | Value |
|--------|-------|
| Route | POST /api/xray |
| Input | multipart/form-data with PDF file (max 20MB) |
| Validation | PDF magic bytes (%PDF-), file size limit |
| Processing | Extract text → Analyze with Claude → Filter → Respond |
| Output | Structured JSON (XRayResponse type) |
| Storage | None. File held in memory buffer only, never written to disk. |
| Logging | Timestamp, file size, page count, response time only. No content. |

### 4.4 Hallucination Prevention

This is the most critical technical component. AI hallucination in document analysis is unacceptable because users will trust the output for financial and legal decisions. The system employs a multi-layer defense:

**Layer 1 — Prompt Engineering:** The Claude system prompt explicitly prohibits fabricating numbers, dates, names, or dollar amounts. Every claim must be anchored to a page reference. Confidence scores are mandatory for every finding.

**Layer 2 — Confidence Threshold:** Any finding with a confidence score below 0.75 is silently removed before the user sees it. Only high-confidence interpretations reach the results.

**Layer 3 — Numerical Verification:** After Claude responds, a post-processing step extracts all dollar amounts and significant numbers from each finding and verifies they exist verbatim in the source document text. If Claude claims "$2,400 monthly rent" but that number does not appear in the PDF, the finding is removed.

**Layer 4 — Deterministic Separation:** File facts (page count, size, dates, metadata) are extracted programmatically from the PDF structure, not by AI. These are presented separately and are always accurate.

### 4.5 Data Flow

```
Upload (client)
  → POST /api/xray (Vercel serverless)
  → Validate PDF magic bytes
  → pdf-parse extracts text + metadata in memory
  → Text sent to Claude API
  → Claude returns structured JSON with confidence scores
  → Confidence filter removes low-confidence and unverified claims
  → Structured response returned to client
  → File buffer released from memory
  → No data persisted anywhere
```

### 4.6 File Structure (New Files)

```
app/
  api/
    xray/
      route.ts              ← Serverless API endpoint
components/
  xray/
    FileXRay.tsx            ← Main React component (trigger, animation, results)
lib/
  xray/
    types.ts                ← TypeScript interfaces
    claude-prompt.ts        ← System prompt, user prompt builder, response parser
    confidence-filter.ts    ← Hallucination defense: confidence + numerical verification
    pdf-extractor.ts        ← PDF text/metadata extraction and validation
  anthropic.ts              ← Anthropic SDK client initialization
.env.local
  ANTHROPIC_API_KEY=sk-...  ← Server-side only, never in client bundle
```

---

## 5. Claude API Integration

### 5.1 Model Selection

Phase 1 uses `claude-sonnet-4-5-20250514` for the optimal balance of intelligence, speed, and cost. Average response time is 3–8 seconds for a typical document. The model can be upgraded to Opus for deeper analysis in the premium tier if needed.

### 5.2 System Prompt Design

The system prompt is the most important engineering artifact in this feature. It enforces absolute rules: no fabrication, page anchoring, confidence scoring, JSON-only output. It instructs Claude to classify the document, extract 3–6 key findings, surface 2–4 deep analysis items, and suggest 2–4 tool actions mapped to clevr's existing tool slugs.

The full system prompt and response parsing logic are in `lib/xray/claude-prompt.ts`. This file should be iterated on extensively during development and testing. Prompt quality is directly proportional to output quality.

### 5.3 Token Budgets & Cost

| Metric | Value |
|--------|-------|
| Average input | ~4,500 tokens (system prompt + extracted text) |
| Average output | ~800 tokens (structured JSON response) |
| Cost per X-Ray | $0.02 – $0.04 |
| At 100 X-Rays/day | $60 – $120/month |
| At 1,000 X-Rays/day | $600 – $1,200/month |
| Text truncation | Documents over ~15,000 words are truncated with notice |

---

## 6. Monetization Strategy

### 6.1 Free Tier

- 5 X-Ray analyses per month (tracked by hashed IP address)
- Full access to File Facts, Document Summary, Key Findings, and Suggested Actions
- No account required

### 6.2 clevr Pro (Future — Not in Phase 1)

- Unlimited X-Ray analyses
- Deep Analysis layer unlocked (metadata forensics, missing clause detection, structural comparison)
- Priority processing speed
- Larger file size limits
- Pricing target: $8–$12/month (below Adobe Acrobat's $14.99/month)

### 6.3 Future Revenue Streams

- **API Access:** Developer API for document intelligence ($X per 1,000 analyses)
- **AI Credit Packs:** $3 for 25 additional X-Rays (for occasional users who don't want a subscription)
- **Contextual Affiliate:** After generating document insights, suggest relevant professional services (legal review, tax prep) with affiliate revenue

---

## 7. Security & Rate Limiting

### 7.1 Security Requirements

- ANTHROPIC_API_KEY stored as server-side environment variable only — never exposed in client bundle
- PDF validation via magic bytes (%PDF-), not file extension
- Maximum file size: 20MB, enforced server-side
- No file content in any logs — only metadata (size, page count, timing)
- API request timeout: 30 seconds (Vercel serverless default)
- CORS restricted to clevr.tools domain

### 7.2 Rate Limiting (Phase 1)

Free tier rate limiting is IP-based using a hashed IP address (raw IPs are not stored). Each IP gets 5 X-Rays per calendar month. For the prototype, this can use an in-memory store or Vercel KV. A more robust solution with account-based limits comes with clevr Pro.

---

## 8. Scope & Phased Rollout

### 8.1 Phase 1 — MVP (This PRD)

Ship a production-ready File X-Ray for PDF documents.

- **API route:** PDF extraction + Claude analysis + confidence filtering
- **React component:** X-Ray trigger button, scanning animation, layered results display
- **Privacy:** Inline notice, no file storage, no content logging
- **Accuracy:** Confidence threshold (0.75), numerical verification against source text
- **Attribution:** "Analyzed with Claude ✦" footer
- **Disclaimer:** "These insights are for informational purposes. Verify important details independently."
- **Rate limiting:** 5 free X-Rays/month per IP
- **Error handling:** Graceful failures for scanned/image PDFs, oversized files, API timeouts

### 8.2 Phase 1 Exclusions (Explicitly Not in Scope)

- No clevr Pro subscription or payment integration
- No Deep Analysis premium content (UI placeholder only, blurred)
- No user accounts or authentication
- No document memory or cross-session persistence
- No non-PDF file types (images, spreadsheets, etc.)
- No OCR for scanned/image-based PDFs

### 8.3 Future Phases

| Phase | Scope |
|-------|-------|
| Phase 2 | Deep Analysis premium tier with Stripe integration |
| Phase 3 | Image X-Ray (EXIF metadata, content analysis, AI-generated detection) |
| Phase 4 | Spreadsheet X-Ray (data quality, anomalies, column analysis) |
| Phase 5 | Document Memory (opt-in, cross-session intelligence, change tracking) |
| Phase 6 | Developer API (B2B document intelligence as a service) |

---

## 9. Acceptance Criteria

The following must ALL be true before File X-Ray is considered complete for Phase 1:

1. A user can upload a text-based PDF (up to 20MB) and trigger X-Ray analysis from any clevr tool page.
2. The privacy notice ("Your file will be analyzed to surface key insights. Nothing is stored. Your file is deleted immediately after analysis.") is visible before the user triggers X-Ray.
3. A scanning animation plays during analysis (no generic spinner).
4. Results display in layers: File Facts → Summary → Key Findings → Deep Analysis (blurred) → Suggested Actions.
5. Every Key Finding includes a page/section reference.
6. No finding with a confidence score below 0.75 reaches the user.
7. No dollar amount or specific number in a finding is fabricated (verified against source text).
8. Scanned/image-based PDFs return a clear, friendly error message (not a crash).
9. The file is never written to disk or persistent storage. Only held in memory buffer.
10. Logs contain no file content — only metadata (file size, page count, document type, processing time).
11. Footer displays: "Analyzed with Claude ✦" and the liability disclaimer.
12. Rate limiting prevents more than 5 free X-Rays per month per IP.
13. 95th percentile response time is under 8 seconds for documents under 15 pages.
14. The ANTHROPIC_API_KEY is server-side only and never exposed in the client bundle.

---

## 10. Reference Files

The following prototype code files accompany this PRD and should be used as the starting point for development:

| File | Purpose |
|------|---------|
| `app/api/xray/route.ts` | Complete API endpoint with validation, extraction, analysis, filtering |
| `components/xray/FileXRay.tsx` | Full React component with trigger, animation, results, error handling |
| `lib/xray/types.ts` | All TypeScript interfaces |
| `lib/xray/claude-prompt.ts` | System prompt, user prompt builder, JSON response parser |
| `lib/xray/confidence-filter.ts` | Hallucination defense: confidence threshold + numerical verification |
| `lib/xray/pdf-extractor.ts` | PDF text/metadata extraction and validation |
| `examples/integration-example.tsx` | Shows how to add FileXRay to any existing tool page |

> **NOTE TO DEVELOPER:** The system prompt in `claude-prompt.ts` is the highest-leverage file in this project. Small changes to the prompt produce large changes in output quality. Iterate on it extensively with real PDFs — contracts, invoices, bank statements, resumes — before considering the feature ready. When in doubt, remove a finding rather than show a wrong one.
