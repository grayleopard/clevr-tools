export type OddsFormat = "american" | "decimal" | "fractional";

export interface OddsConversion {
  decimal: number;
  american: number;
  fractional: string;
  impliedProbability: number;
}

export interface VigCalculation {
  sideAProbability: number;
  sideBProbability: number;
  combinedProbability: number;
  vig: number;
  fairProbabilityA: number;
  fairProbabilityB: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }

  return x || 1;
}

function simplifyFraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function approximateFraction(value: number, maxDenominator = 1000) {
  if (!Number.isFinite(value) || value <= 0) {
    return { numerator: 0, denominator: 1 };
  }

  let lowerNumerator = 0;
  let lowerDenominator = 1;
  let upperNumerator = 1;
  let upperDenominator = 0;
  let numerator = Math.round(value);
  let denominator = 1;

  while (denominator <= maxDenominator) {
    numerator = lowerNumerator + upperNumerator;
    denominator = lowerDenominator + upperDenominator;

    if (denominator > maxDenominator) break;

    const current = numerator / denominator;
    if (Math.abs(current - value) < 1e-8) break;

    if (current < value) {
      lowerNumerator = numerator;
      lowerDenominator = denominator;
    } else {
      upperNumerator = numerator;
      upperDenominator = denominator;
    }
  }

  return simplifyFraction(numerator, denominator);
}

export function parseAmericanOdds(input: string): number | null {
  const normalized = input.trim().replace(/\s+/g, "");
  if (!/^[-+]?\d+$/.test(normalized)) return null;

  const value = Number.parseInt(normalized, 10);
  if (!Number.isFinite(value) || value === 0) return null;

  return value;
}

export function parseDecimalOdds(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d*\.?\d+$/.test(normalized)) return null;

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 1) return null;

  return value;
}

export function parseFractionalOdds(input: string): { numerator: number; denominator: number } | null {
  const match = input.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;

  const numerator = Number.parseInt(match[1], 10);
  const denominator = Number.parseInt(match[2], 10);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return simplifyFraction(numerator, denominator);
}

export function americanToDecimal(american: number): number {
  return american > 0 ? american / 100 + 1 : 100 / Math.abs(american) + 1;
}

export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  }

  return Math.round(-100 / (decimal - 1));
}

export function decimalToFractional(decimal: number): string {
  const profitMultiple = decimal - 1;
  if (profitMultiple <= 0) return "0/1";

  const { numerator, denominator } = approximateFraction(profitMultiple);
  const simplified = simplifyFraction(numerator, denominator);

  return `${simplified.numerator}/${simplified.denominator}`;
}

export function fractionalToDecimal(input: string): number | null {
  const fraction = parseFractionalOdds(input);
  if (!fraction) return null;

  return fraction.numerator / fraction.denominator + 1;
}

export function impliedProbabilityFromDecimal(decimal: number): number {
  return 1 / decimal;
}

export function americanToImpliedProbability(american: number): number {
  return american > 0
    ? 100 / (american + 100)
    : Math.abs(american) / (Math.abs(american) + 100);
}

export function probabilityToDecimal(probability: number): number {
  if (probability <= 0 || probability >= 1) return Number.NaN;
  return 1 / probability;
}

export function probabilityToAmerican(probability: number): number {
  if (probability <= 0 || probability >= 1) return Number.NaN;

  return probability >= 0.5
    ? Math.round((-100 * probability) / (1 - probability))
    : Math.round((100 * (1 - probability)) / probability);
}

export function probabilityToFractional(probability: number): string {
  return decimalToFractional(probabilityToDecimal(probability));
}

export function parseOddsToDecimal(input: string, format: OddsFormat): number | null {
  if (format === "american") {
    const american = parseAmericanOdds(input);
    return american === null ? null : americanToDecimal(american);
  }

  if (format === "decimal") {
    return parseDecimalOdds(input);
  }

  return fractionalToDecimal(input);
}

export function convertOdds(input: string, format: OddsFormat): OddsConversion | null {
  const decimal = parseOddsToDecimal(input, format);
  if (decimal === null) return null;

  return {
    decimal,
    american: decimalToAmerican(decimal),
    fractional: decimalToFractional(decimal),
    impliedProbability: impliedProbabilityFromDecimal(decimal),
  };
}

export function formatAmericanOdds(american: number): string {
  const rounded = Math.round(american);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function formatDecimalOdds(decimal: number): string {
  return decimal.toFixed(2);
}

export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}

export function parseProbabilityPercent(input: string): number | null {
  const normalized = input.trim().replace("%", "");
  if (!/^\d*\.?\d+$/.test(normalized)) return null;

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 0 || value >= 100) return null;

  return value / 100;
}

export function calculateProfit(stake: number, decimal: number): number {
  return stake * (decimal - 1);
}

export function calculatePayout(stake: number, decimal: number): number {
  return stake * decimal;
}

export function calculateVig(sideAInput: string, sideBInput: string): VigCalculation | null {
  const sideA = parseAmericanOdds(sideAInput);
  const sideB = parseAmericanOdds(sideBInput);

  if (sideA === null || sideB === null) return null;

  const sideAProbability = americanToImpliedProbability(sideA);
  const sideBProbability = americanToImpliedProbability(sideB);
  const combinedProbability = sideAProbability + sideBProbability;
  const vig = combinedProbability - 1;

  return {
    sideAProbability,
    sideBProbability,
    combinedProbability,
    vig,
    fairProbabilityA: sideAProbability / combinedProbability,
    fairProbabilityB: sideBProbability / combinedProbability,
  };
}
