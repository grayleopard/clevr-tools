export const UINT32_CARDINALITY = 0x1_0000_0000;
export const MAX_INCLUSIVE_INTEGER_WIDTH = UINT32_CARDINALITY;

export type Uint32Source = () => number;

export function browserUint32(): number {
  const words = new Uint32Array(1);
  globalThis.crypto.getRandomValues(words);
  return words[0];
}

function readUint32(source: Uint32Source): number {
  const value = source();
  if (!Number.isInteger(value) || value < 0 || value >= UINT32_CARDINALITY) {
    throw new RangeError("Random source must return an unsigned 32-bit integer.");
  }
  return value;
}

/** Returns a uniform integer in [0, upperExclusive) without modulo bias. */
export function uniformUint32Below(
  upperExclusive: number,
  source: Uint32Source = browserUint32,
): number {
  if (
    !Number.isSafeInteger(upperExclusive) ||
    upperExclusive < 1 ||
    upperExclusive > UINT32_CARDINALITY
  ) {
    throw new RangeError(`Upper bound must be an integer from 1 through ${UINT32_CARDINALITY}.`);
  }

  const acceptanceLimit =
    Math.floor(UINT32_CARDINALITY / upperExclusive) * upperExclusive;
  let value: number;
  do {
    value = readUint32(source);
  } while (value >= acceptanceLimit);

  return value % upperExclusive;
}

export function inclusiveIntegerWidth(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new RangeError("Minimum and maximum must be safe integers.");
  }
  if (min > max) {
    throw new RangeError("Minimum must be less than or equal to maximum.");
  }

  const width = BigInt(max) - BigInt(min) + BigInt(1);
  if (width > BigInt(MAX_INCLUSIVE_INTEGER_WIDTH)) {
    throw new RangeError(
      `Inclusive range cannot contain more than ${MAX_INCLUSIVE_INTEGER_WIDTH} integers.`,
    );
  }
  return Number(width);
}

/** Returns a uniform safe integer in the explicit inclusive interval [min, max]. */
export function randomIntegerInclusive(
  min: number,
  max: number,
  source: Uint32Source = browserUint32,
): number {
  const width = inclusiveIntegerWidth(min, max);
  return min + uniformUint32Below(width, source);
}

export interface RandomIntegerListOptions {
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
}

export function randomIntegerList(
  options: RandomIntegerListOptions,
  source: Uint32Source = browserUint32,
): number[] {
  const { min, max, count, allowDuplicates } = options;
  const width = inclusiveIntegerWidth(min, max);
  if (!Number.isSafeInteger(count) || count < 1 || count > 1000) {
    throw new RangeError("Count must be an integer from 1 through 1000.");
  }
  if (!allowDuplicates && count > width) {
    throw new RangeError(
      `Cannot generate ${count} unique integers from an inclusive range containing ${width} values.`,
    );
  }

  if (allowDuplicates) {
    return Array.from({ length: count }, () => min + uniformUint32Below(width, source));
  }

  // Partial Fisher-Yates over integer offsets. The map avoids allocating the
  // entire range while retaining uniform sampling without replacement.
  const swaps = new Map<number, number>();
  const results: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const remaining = width - index;
    const selectedIndex = uniformUint32Below(remaining, source);
    const selectedValue = swaps.get(selectedIndex) ?? selectedIndex;
    const finalIndex = remaining - 1;
    const finalValue = swaps.get(finalIndex) ?? finalIndex;
    swaps.set(selectedIndex, finalValue);
    swaps.delete(finalIndex);
    results.push(min + selectedValue);
  }
  return results;
}

export const PASSWORD_CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:',.<>?",
} as const;

export const AMBIGUOUS_PASSWORD_CHARACTERS = "0O1lI";

export interface PasswordOptions {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean;
}

export function buildPasswordCharacterSets(options: PasswordOptions): string[] {
  const selected = [
    options.useUppercase ? PASSWORD_CHARACTER_SETS.uppercase : "",
    options.useLowercase ? PASSWORD_CHARACTER_SETS.lowercase : "",
    options.useNumbers ? PASSWORD_CHARACTER_SETS.numbers : "",
    options.useSymbols ? PASSWORD_CHARACTER_SETS.symbols : "",
  ].filter(Boolean);

  if (!options.excludeAmbiguous) return selected;
  return selected.map((characterSet) =>
    [...characterSet]
      .filter((character) => !AMBIGUOUS_PASSWORD_CHARACTERS.includes(character))
      .join(""),
  );
}

function validatePasswordOptions(options: PasswordOptions, characterSets: string[]): void {
  if (!Number.isSafeInteger(options.length) || options.length < 1 || options.length > 1024) {
    throw new RangeError("Password length must be an integer from 1 through 1024.");
  }
  if (characterSets.length === 0) {
    throw new RangeError("Select at least one character type.");
  }
  if (options.length < characterSets.length) {
    throw new RangeError("Password length must be at least the number of selected character types.");
  }
  if (characterSets.some((characterSet) => characterSet.length === 0)) {
    throw new RangeError("A selected character type has no available characters.");
  }
}

/**
 * Generates uniformly from all strings of the requested length that contain at
 * least one character from every selected class. Whole-candidate rejection
 * preserves that conditional uniform distribution.
 */
export function generatePassword(
  options: PasswordOptions,
  source: Uint32Source = browserUint32,
): string {
  const characterSets = buildPasswordCharacterSets(options);
  validatePasswordOptions(options, characterSets);
  const alphabet = characterSets.join("");

  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const candidate = Array.from(
      { length: options.length },
      () => alphabet[uniformUint32Below(alphabet.length, source)],
    ).join("");
    if (characterSets.every((characterSet) => [...candidate].some((char) => characterSet.includes(char)))) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a password containing every selected character type.");
}

export function countValidPasswords(options: PasswordOptions): bigint {
  const characterSets = buildPasswordCharacterSets(options);
  validatePasswordOptions(options, characterSets);
  const alphabetSize = characterSets.reduce((sum, characterSet) => sum + characterSet.length, 0);
  let validCount = BigInt(0);

  for (let mask = 0; mask < 1 << characterSets.length; mask += 1) {
    let excludedSize = 0;
    let excludedClasses = 0;
    for (let index = 0; index < characterSets.length; index += 1) {
      if ((mask & (1 << index)) !== 0) {
        excludedSize += characterSets[index].length;
        excludedClasses += 1;
      }
    }
    const term = powBigInt(alphabetSize - excludedSize, options.length);
    validCount += excludedClasses % 2 === 0 ? term : -term;
  }

  return validCount;
}

function powBigInt(base: number, exponent: number): bigint {
  let result = BigInt(1);
  let factor = BigInt(base);
  let remaining = exponent;
  while (remaining > 0) {
    if (remaining % 2 === 1) result *= factor;
    remaining = Math.floor(remaining / 2);
    if (remaining > 0) factor *= factor;
  }
  return result;
}

export function log2BigInt(value: bigint): number {
  if (value <= BigInt(0)) return Number.NEGATIVE_INFINITY;
  const bitLength = value.toString(2).length;
  const shift = Math.max(0, bitLength - 53);
  const leading = Number(value >> BigInt(shift));
  return Math.log2(leading) + shift;
}

export function passwordSearchSpaceBits(options: PasswordOptions): number {
  return log2BigInt(countValidPasswords(options));
}
