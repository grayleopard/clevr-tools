import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function loadTypeScriptModule(relativePath) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    () => {
      throw new Error(`${relativePath} unexpectedly imported a runtime dependency`);
    }
  );
  return transpiledModule.exports;
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

const titleCase = loadTypeScriptModule("lib/p1-remediation/title-case.ts");
const typing = loadTypeScriptModule("lib/p1-remediation/typing-metrics.ts");
const timing = loadTypeScriptModule("lib/p1-remediation/monotonic-timing.ts");

test("title case fixes the audited small-word over-capitalization", () => {
  assert.equal(titleCase.toEditorialTitleCase("the art of war"), "The Art of War");
  assert.equal(
    titleCase.toEditorialTitleCase("a tale of two cities and the sea"),
    "A Tale of Two Cities and the Sea"
  );
});

test("title case capitalizes small words only at real title and subtitle boundaries", () => {
  assert.equal(
    titleCase.toEditorialTitleCase("war and peace: a tale of two cities"),
    "War and Peace: A Tale of Two Cities"
  );
  assert.equal(
    titleCase.toEditorialTitleCase("from here to there? and back again"),
    "From Here to There? And Back Again"
  );
});

test("title case handles acronyms, hyphens, Unicode letters, and punctuation", () => {
  assert.equal(
    titleCase.toEditorialTitleCase("the NASA API and URL guide"),
    "The NASA API and URL Guide"
  );
  assert.equal(
    titleCase.toEditorialTitleCase("state-of-the-art tools for the web"),
    "State-of-the-Art Tools for the Web"
  );
  assert.equal(
    titleCase.toEditorialTitleCase("élan and O’NEILL: the API story"),
    "Élan and O’Neill: The API Story"
  );
  assert.equal(
    titleCase.toEditorialTitleCase("THE LORD OF THE RINGS"),
    "The Lord of the Rings"
  );
});

test("title-case public copy describes the implemented minor-word house style", () => {
  const publicCopy = readSource("lib/seo/tool-faqs.ts");
  assert.doesNotMatch(publicCopy, /Title case capitalizes the first letter of each word/u);
  assert.match(publicCopy, /keeps common articles, conjunctions, and short prepositions lowercase/u);
});

test("title case preserves multiline separators and horizontal spacing", () => {
  const input = "first line of text\r\nsecond\tline  and the API\n\nlast line";
  assert.equal(
    titleCase.toEditorialTitleCase(input),
    "First Line of Text\r\nSecond\tLine  and the API\n\nLast Line"
  );
});

test("typing metrics include completed input and timed partial progress", () => {
  const metrics = typing.calculateTypingMetrics({
    expectedWords: ["hello", "world"],
    typedWords: ["hello"],
    completedWords: 1,
    currentInput: "wor",
    elapsedMs: 60_000,
  });

  assert.deepEqual(
    {
      wpm: metrics.wpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      correctChars: metrics.correctChars,
      missedChars: metrics.missedChars,
      typedChars: metrics.typedChars,
      evaluatedChars: metrics.evaluatedChars,
      correctWords: metrics.correctWords,
      partialWords: metrics.partialWords,
    },
    {
      wpm: 2,
      rawWpm: 2,
      accuracy: 81.8,
      correctChars: 9,
      missedChars: 2,
      typedChars: 9,
      evaluatedChars: 11,
      correctWords: 1,
      partialWords: 1,
    }
  );
});

test("skipped and missed expected characters meaningfully reduce accuracy", () => {
  const skipped = typing.calculateTypingMetrics({
    expectedWords: ["hello"],
    typedWords: [""],
    completedWords: 1,
    currentInput: "",
    elapsedMs: 60_000,
  });

  assert.equal(skipped.correctChars, 0);
  assert.equal(skipped.incorrectChars, 1);
  assert.equal(skipped.missedChars, 5);
  assert.equal(skipped.evaluatedChars, 6);
  assert.equal(skipped.accuracy, 0);
  assert.equal(skipped.incorrectWords, 1);
});

test("typing accuracy denominator includes substitutions, extras, and misses", () => {
  const metrics = typing.calculateTypingMetrics({
    expectedWords: ["cat", "dog"],
    typedWords: ["cut!"],
    completedWords: 1,
    currentInput: "d",
    elapsedMs: 30_000,
  });

  assert.equal(metrics.correctChars, 4); // c, t, separator, and partial d
  assert.equal(metrics.incorrectChars, 1);
  assert.equal(metrics.extraChars, 1);
  assert.equal(metrics.missedChars, 2);
  assert.equal(metrics.evaluatedChars, 8);
  assert.equal(metrics.accuracy, 50);
  assert.equal(metrics.wpm, 2);
  assert.equal(metrics.rawWpm, 2);
});

test("WPM calculations use actual elapsed time instead of a nominal duration", () => {
  assert.equal(typing.calculateWpm(250, 60_000), 50);
  assert.equal(typing.calculateWpm(250, 75_000), 40);
  assert.equal(typing.calculateRawWpm(300, 75_000), 48);
  assert.equal(typing.calculateWpm(250, 0), 0);
});

test("monotonic timing helpers tolerate throttled callbacks and backward samples", () => {
  assert.equal(timing.elapsedMilliseconds(1_000, 8_000), 7_000);
  assert.equal(timing.remainingMilliseconds(1_000, 5_000, 8_000), 0);
  assert.equal(timing.hasElapsed(1_000, 5_000, 8_000), true);
  assert.equal(timing.elapsedMilliseconds(8_000, 1_000), 0);
  assert.equal(timing.ratePerSecond(10, 7_000), 10 / 7);
});

test("CPS result derives its visible rate from the same rounded duration it displays", () => {
  const source = readSource("components/tools/CpsTest.tsx");
  assert.match(source, /ratePerSecond\(totalClicks, actualDuration \* 1000\)/u);
  assert.match(source, /result\?\.duration\.toFixed\(2\)/u);
});

test("race ghost completion is derived from passage length and WPM", () => {
  assert.equal(typing.ghostCompletionMilliseconds(300, 60), 60_000);
  assert.equal(typing.ghostCompletionMilliseconds(300, 120), 30_000);
  assert.equal(typing.ghostCompletionMilliseconds(0, 120), 0);
});

test("keyboard tester records Tab without cancelling browser navigation", () => {
  const source = readSource("components/tools/KeyboardTester.tsx");
  const tabBranch = source.slice(
    source.indexOf('if (e.key === "Tab")'),
    source.indexOf("// Allow specific browser shortcuts")
  );
  assert.match(tabBranch, /setTestedKeys/u);
  assert.doesNotMatch(tabBranch, /preventDefault/u);
  assert.match(source, /isInteractiveTarget/u);
  assert.match(source, /if \(!isInteractiveTarget\) e\.preventDefault\(\)/u);
});

test("typing results no longer expose synthetic consistency", () => {
  const source = readSource("components/tools/TypingTest.tsx");
  const publicCopy = [
    "lib/navigation.ts",
    "lib/search-index.ts",
    "lib/tools.ts",
    "lib/seo/tool-faqs.ts",
  ].map(readSource).join("\n");
  assert.doesNotMatch(source, /Consistency/u);
  assert.match(source, /currentInput:\s*currentInputRef\.current/u);
  assert.match(source, /setFinalMetrics\(metrics\)/u);
  assert.doesNotMatch(publicCopy, /accuracy, consistency|consistency score measure|coefficient of variation in your per-word typing speed/iu);
  assert.match(publicCopy, /elapsed-time WPM, raw WPM, and character accuracy/iu);
});

test("typing test preserves Tab focus navigation and uses a non-trapping restart shortcut", () => {
  const source = readSource("components/tools/TypingTest.tsx");
  assert.doesNotMatch(source, /if \(e\.key === "Tab"\)[\s\S]{0,120}preventDefault/u);
  assert.match(source, /e\.key === "Enter" && \(e\.ctrlKey \|\| e\.metaKey\)/u);
});

test("Numble removes inert settings and gates persisted state until hydration", () => {
  const source = readSource("components/numble/NumbleGame.tsx");
  const storageSource = readSource("lib/numble-storage.ts");
  assert.doesNotMatch(source, /getSettings|saveSettings|SettingsModal/u);
  assert.doesNotMatch(source, />Settings</u);
  assert.doesNotMatch(storageSource, /NumbleSettings|SETTINGS_KEY|getSettings|saveSettings/u);
  assert.match(source, /useSyncExternalStore/u);
  assert.match(source, /if \(!hasHydrated \|\| !puzzle\)/u);
  assert.match(source, /getTodayState\(\)/u);
  assert.match(source, /formatCountdown\(countdownSec\)/u);
});
