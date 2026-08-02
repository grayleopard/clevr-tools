export interface TypingMetricsInput {
  expectedWords: readonly string[];
  typedWords: readonly string[];
  completedWords: number;
  currentInput: string;
  elapsedMs: number;
}

export interface TypingMetrics {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  typedChars: number;
  evaluatedChars: number;
  correctWords: number;
  incorrectWords: number;
  partialWords: number;
  elapsedMs: number;
}

export function matchingCharacterCount(expected: string, typed: string): number {
  let matches = 0;
  for (let index = 0; index < Math.min(expected.length, typed.length); index += 1) {
    if (expected[index] === typed[index]) matches += 1;
  }
  return matches;
}

export function calculateWpm(correctCharacters: number, elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || correctCharacters <= 0) {
    return 0;
  }
  return Math.round((correctCharacters / 5) / (elapsedMs / 60_000));
}

export function calculateRawWpm(typedCharacters: number, elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || typedCharacters <= 0) {
    return 0;
  }
  return Math.round((typedCharacters / 5) / (elapsedMs / 60_000));
}

export function calculateAccuracy(
  correctCharacters: number,
  evaluatedCharacters: number
): number {
  if (evaluatedCharacters <= 0) return 100;
  return Math.round((correctCharacters / evaluatedCharacters) * 1_000) / 10;
}

export function calculateTypingMetrics(input: TypingMetricsInput): TypingMetrics {
  const completedWords = Math.max(
    0,
    Math.min(Math.trunc(input.completedWords), input.expectedWords.length)
  );
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;
  let typedChars = 0;
  let correctWords = 0;
  let incorrectWords = 0;

  for (let index = 0; index < completedWords; index += 1) {
    const expected = input.expectedWords[index] ?? "";
    const typed = input.typedWords[index] ?? "";
    const matches = matchingCharacterCount(expected, typed);
    const overlap = Math.min(expected.length, typed.length);

    // A committed word means the user actually typed its separator. A bare
    // separator skips the word, so it is scored as an error rather than as a
    // correct character.
    const correctSeparator = typed.length > 0 ? 1 : 0;
    typedChars += typed.length + 1;
    correctChars += matches + correctSeparator;
    incorrectChars += overlap - matches + (typed.length === 0 ? 1 : 0);
    extraChars += Math.max(0, typed.length - expected.length);
    missedChars += Math.max(0, expected.length - typed.length);

    if (typed === expected) correctWords += 1;
    else incorrectWords += 1;
  }

  let partialWords = 0;
  if (completedWords < input.expectedWords.length && input.currentInput.length > 0) {
    const expected = input.expectedWords[completedWords] ?? "";
    const typed = input.currentInput;
    const matches = matchingCharacterCount(expected, typed);
    const overlap = Math.min(expected.length, typed.length);

    partialWords = 1;
    typedChars += typed.length;
    correctChars += matches;
    incorrectChars += overlap - matches;
    extraChars += Math.max(0, typed.length - expected.length);
    missedChars += Math.max(0, expected.length - typed.length);
  }

  const elapsedMs = Math.max(0, input.elapsedMs);
  // Accuracy evaluates every character in each reached word: correct input,
  // substitutions, extras, and expected characters that were missed. Raw WPM
  // remains based only on actual keystrokes (typedChars).
  const evaluatedChars =
    correctChars + incorrectChars + extraChars + missedChars;
  return {
    wpm: calculateWpm(correctChars, elapsedMs),
    rawWpm: calculateRawWpm(typedChars, elapsedMs),
    accuracy: calculateAccuracy(correctChars, evaluatedChars),
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    typedChars,
    evaluatedChars,
    correctWords,
    incorrectWords,
    partialWords,
    elapsedMs,
  };
}

export function ghostCompletionMilliseconds(
  passageCharacters: number,
  wordsPerMinute: number
): number {
  if (passageCharacters <= 0 || wordsPerMinute <= 0) return 0;
  return passageCharacters / ((wordsPerMinute * 5) / 60_000);
}
