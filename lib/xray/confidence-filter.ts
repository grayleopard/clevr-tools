// lib/xray/confidence-filter.ts

import { Finding } from "./types";

const CONFIDENCE_THRESHOLD = 0.75;

/**
 * Filters findings based on confidence score and verifies
 * that any specific numerical claims exist in the source text.
 *
 * This is our primary defense against hallucination.
 */
export function filterAndVerifyFindings(
  findings: Finding[],
  sourceText: string
): Finding[] {
  return findings.filter((finding) => {
    // 1. Remove anything below confidence threshold
    if (finding.confidence < CONFIDENCE_THRESHOLD) {
      return false;
    }

    // 2. Verify numerical claims against source text
    if (!verifyNumericalClaims(finding.insight, sourceText)) {
      return false;
    }

    // 3. Verify dollar amounts against source text
    if (!verifyDollarAmounts(finding.insight, sourceText)) {
      return false;
    }

    return true;
  });
}

/**
 * Extracts numbers from an insight and checks they exist in source.
 * Numbers in context like "3% annual" or "24 months" must have
 * the actual number present in the document.
 */
function verifyNumericalClaims(insight: string, sourceText: string): boolean {
  if (!insight) return true; // guard against undefined/null insight
  // Match significant numbers (skip small common numbers like 1, 2, a, the)
  const numberPattern = /\b(\d{2,}(?:,\d{3})*(?:\.\d+)?)\s*%?/g;
  const matches = insight.match(numberPattern);

  if (!matches) return true; // No numbers to verify

  return matches.every((match) => {
    const cleanNumber = match.replace(/[,%\s]/g, "").trim();

    // Skip very common small numbers that might just be descriptive
    if (parseInt(cleanNumber) < 10 && !match.includes("%")) return true;

    // Check if this number appears somewhere in the source text
    return sourceText.includes(cleanNumber);
  });
}

/**
 * Specifically verifies dollar amounts, which are the highest-risk
 * category for hallucination (and the most damaging if wrong).
 */
function verifyDollarAmounts(insight: string, sourceText: string): boolean {
  if (!insight) return true; // guard against undefined/null insight
  const dollarPattern = /\$[\d,]+(?:\.\d{2})?/g;
  const matches = insight.match(dollarPattern);

  if (!matches) return true; // No dollar amounts to verify

  return matches.every((match) => {
    // Extract just the number portion
    const numericPart = match.replace(/[$,]/g, "");

    // Must find this number in the source text
    // Check both with and without dollar sign formatting
    return (
      sourceText.includes(numericPart) ||
      sourceText.includes(match) ||
      sourceText.includes(match.replace(/,/g, ""))
    );
  });
}

/**
 * Sorts findings by confidence (highest first) and then by
 * category priority (risks first, then key terms, then others).
 */
export function sortFindings(findings: Finding[]): Finding[] {
  const categoryPriority: Record<string, number> = {
    risk: 0,
    key_term: 1,
    notable: 2,
    structural: 3,
    metadata: 4,
  };

  return [...findings].sort((a, b) => {
    // Primary sort: category priority
    const catDiff =
      (categoryPriority[a.category] ?? 5) -
      (categoryPriority[b.category] ?? 5);
    if (catDiff !== 0) return catDiff;

    // Secondary sort: confidence (descending)
    return b.confidence - a.confidence;
  });
}
