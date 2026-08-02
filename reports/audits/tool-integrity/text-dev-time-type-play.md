# Text, Developer, Time, Typing, Generator, and Play Integrity Audit

Recorded 2026-08-01 on `codex/tool-integrity-audit` at foundation commit
`a3bff45bede1f6c0e799d38d7bd4ab20ba94cb70`.

## Executive verdict

This workstream covers **29 portfolio units**: 27 live registered tools and two
tool-like products outside `lib/tools.ts` (Numble and Meme Generator). The
recommendation split is **0 FLAGSHIP, 7 KEEP, 21 FIX, 1 HIDE, 0 CONSOLIDATE,
0 REMOVE**. Verification is **4 PASS, 14 PARTIAL, 11 FAIL**.

There are **no observed P0 defects**. Eight P1 defects require repair before the
affected tool can be described as trustworthy: Case Converter, Password
Generator, Random Number Generator, Typing Test, Keyboard Tester, Typing Race,
CPS Test, and Numble.

### Anti-pattern verdict

**FAIL — moderate templated/AI-slop signature.** The repeated card shell is
internally consistent, but several tools have confident educational copy,
percentile/strength claims, or settings that are not supported by the actual
implementation. The most damaging pattern is not visual sameness; it is the
gap between polished certainty and unverified or incorrect behavior. Fixing
truthfulness and state integrity matters more than adding visual novelty.

## Scope and evidence boundaries

- `tests/e2e/tool-audit/text-play-integrity.spec.ts`: 14/14 passed in Chromium.
  These are assertions of current behavior; several intentionally reproduce a
  defect and therefore do not imply that the product passed.
- `tests/e2e/tool-audit/time-type-smoke.spec.ts`: 13/13 passed. These tests prove
  route/state transitions only and are PARTIAL evidence, not calculation proof.
- In-app Browser control was unavailable (`agent.browsers.list()` returned no
  browsers). Playwright and source inspection were used instead; this is an
  environment constraint, not a product defect.
- Temporary decoded output artifacts are under
  `/tmp/clevr-tool-audit/text-play/`; none are committed.
- Demand is `UNKNOWN` for every row because no GSC export or other measured
  demand evidence was available. `demand_score` and `total_score` therefore
  remain `UNKNOWN`; the known subtotal is shown only to make the other four
  criteria mergeable and must not be treated as a score out of 100.
- Indexability, sitemap inclusion, navigation/category/search discovery, and
  final SEO actions are `UNVERIFIED` in this workstream and must be merged from
  the routes/discovery audit. No production route, logic, copy, or indexation
  was changed.
- Unless a row says otherwise, processing is client-side, inspected code makes
  no external runtime request, desktop evidence is Chromium/source inspection,
  mobile behavior is unverified, and clipboard permissions/results remain
  unverified. Typing/play history is stored in browser `localStorage`.

## Matrix-ready classifications and scores

Score cells are `correctness/30`, `differentiation/20`, `fit/15`, and
`maintainability/10`. `Known /75` excludes demand.

| Tool | Route · registry state | Verification | C | Demand | Diff | Fit | Maint | Known /75 | Total | Recommendation | Severity | Concise rationale |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| Word Counter | `/text/word-counter` · live registered | PARTIAL | 24 | UNKNOWN | 5 | 14 | 9 | 52 | UNKNOWN | FIX | P2 | Large Unicode/multiline word and paragraph totals work, but “characters” are UTF-16 units and sentence/average-length claims overstate the parser. |
| Case Converter | `/text/case-converter` · live registered | FAIL | 12 | UNKNOWN | 4 | 13 | 8 | 37 | UNKNOWN | FIX | P1 | Promised rule-aware title case is not implemented. |
| Lorem Ipsum Generator | `/text/lorem-generator` · live registered | PARTIAL | 26 | UNKNOWN | 3 | 11 | 9 | 49 | UNKNOWN | KEEP | — | Source logic honors count/type bounds; full browser count/copy matrix was not executed. |
| Remove Line Breaks | `/text/remove-line-breaks` · live registered | PARTIAL | 23 | UNKNOWN | 4 | 13 | 9 | 49 | UNKNOWN | FIX | P2 | Operations are deterministic, but public copy says paragraph breaks can be retained while `lineBreaks` joins every newline. |
| Text to Slug | `/text/text-to-slug` · live registered | FAIL | 17 | UNKNOWN | 4 | 12 | 9 | 42 | UNKNOWN | FIX | P2 | “Any text” can become an empty slug for non-Latin input. |
| Character Counter | `/text/character-counter` · live registered | FAIL | 20 | UNKNOWN | 3 | 13 | 9 | 45 | UNKNOWN | FIX | P2 | Emoji/ZWJ characters are counted as UTF-16 code units, not user-perceived characters. |
| Find & Replace | `/text/find-and-replace` · live registered | PARTIAL | 22 | UNKNOWN | 5 | 13 | 8 | 48 | UNKNOWN | FIX | P2 | Literal/regex paths are coherent and regex errors surface, but `\b` whole-word behavior is ASCII-centric for Unicode text. |
| Sort Lines | `/text/sort-lines` · live registered | PARTIAL | 25 | UNKNOWN | 4 | 11 | 9 | 49 | UNKNOWN | KEEP | — | A–Z/Z–A, length, dedupe, and shuffle logic are present; direct edge/copy assertions remain. |
| JSON Formatter | `/dev/json-formatter` · live registered | PARTIAL | 22 | UNKNOWN | 5 | 13 | 8 | 48 | UNKNOWN | FIX | P2 | Valid Unicode JSON formats correctly, but invalid input leaves a stale valid output visible. |
| Base64 Encode / Decode | `/dev/base64` · live registered | PASS | 29 | UNKNOWN | 4 | 13 | 9 | 55 | UNKNOWN | KEEP | — | Independent UTF-8 Base64 round-trip passed for accents, emoji, and multiline CJK. |
| Color Picker | `/dev/color-picker` · live registered | PARTIAL | 24 | UNKNOWN | 4 | 12 | 9 | 49 | UNKNOWN | FIX | P3 | Conversion source paths are coherent; invalid HEX remains displayed while the swatch silently retains the prior valid color. |
| URL Encoder / Decoder | `/dev/url-encoder` · live registered | PASS | 29 | UNKNOWN | 4 | 13 | 9 | 55 | UNKNOWN | KEEP | — | `encodeURIComponent`/decode round-trip passed for accents, emoji, newline, and CJK. |
| UUID Generator | `/dev/uuid` · live registered | PASS | 29 | UNKNOWN | 4 | 12 | 9 | 54 | UNKNOWN | KEEP | — | v4 and v7 shape/version/variant passed; a 100-item v7 batch was unique and valid. |
| Password Generator | `/generate/password` · live registered | FAIL | 14 | UNKNOWN | 5 | 14 | 7 | 40 | UNKNOWN | FIX | P1 | Generated constraints pass, but biased selection and incorrect entropy/pool math make the security-strength output unreliable. |
| Random Number Generator | `/generate/random-number` · live registered | FAIL | 10 | UNKNOWN | 3 | 12 | 8 | 33 | UNKNOWN | FIX | P1 | Modulo reduction is biased and ranges wider than 2^32 contain unreachable advertised values. |
| Timer | `/time/timer` · live registered | PARTIAL | 27 | UNKNOWN | 4 | 14 | 8 | 53 | UNKNOWN | FIX | P2 | Fake-clock timing passes, but the custom-time row clips the Start button and creates 6px document overflow at 390px. |
| Stopwatch | `/time/stopwatch` · live registered | PASS | 29 | UNKNOWN | 4 | 14 | 9 | 56 | UNKNOWN | KEEP | — | Fake-clock start/stop/resume retained elapsed time without counting the paused interval. |
| Pomodoro Timer | `/time/pomodoro` · live registered | PARTIAL | 23 | UNKNOWN | 5 | 14 | 8 | 50 | UNKNOWN | FIX | P2 | Start/pause/skip state works and timing is wall-clock based; custom durations are not handler-clamped and “today” stats are reload-local. |
| Typing Test | `/type/typing-test` · live registered | FAIL | 12 | UNKNOWN | 7 | 14 | 6 | 39 | UNKNOWN | FIX | P1 | Every completed word is assigned `rawWpm: 0`, so prominent consistency is always 100%; timed completion also drops the current partial word. |
| WPM Test | `/type/wpm-test` · live registered | PARTIAL | 21 | UNKNOWN | 5 | 13 | 7 | 46 | UNKNOWN | FIX | P2 | Typing/start state works, but the current in-progress word is omitted at timeout and percentile bands have no cited evidence. |
| Keyboard Tester | `/type/keyboard-tester` · live registered | FAIL | 14 | UNKNOWN | 5 | 12 | 8 | 39 | UNKNOWN | FIX | P1 | Physical key mapping uses `event.code`, but a global handler prevents a plain Tab and traps keyboard focus. |
| Typing Practice | `/type/typing-practice` · live registered | FAIL | 18 | UNKNOWN | 8 | 13 | 6 | 45 | UNKNOWN | FIX | P2 | Final-word counters are updated in state then read from a stale callback, so completion results omit the last word. |
| Typing Race | `/type/race` · live registered | FAIL | 10 | UNKNOWN | 8 | 11 | 5 | 34 | UNKNOWN | FIX | P1 | Ghost-loss callback closes over `startTime = 0`, producing epoch-scale elapsed time and 0 WPM. |
| Word Blitz | `/type/word-blitz` · live registered | PARTIAL | 20 | UNKNOWN | 8 | 10 | 6 | 44 | UNKNOWN | FIX | P2 | Wall-clock round timing works; accuracy counts each non-prefix edit event as one error and ignores current/backtracked character truth. |
| Code Typing Challenge | `/type/code-challenge` · live registered | PARTIAL | 25 | UNKNOWN | 10 | 13 | 7 | 55 | UNKNOWN | KEEP | — | Language/difficulty typing state works and source metrics are coherent; deterministic completion math and mobile input remain unverified. |
| CPS Test | `/type/cps-test` · live registered | FAIL | 12 | UNKNOWN | 4 | 9 | 7 | 32 | UNKNOWN | FIX | P1 | Nominal duration advances by interval callback count rather than elapsed time, so throttling lengthens the test while CPS still divides by the nominal duration. |
| Reaction Time Test | `/type/reaction-time` · live registered | PARTIAL | 24 | UNKNOWN | 4 | 10 | 8 | 46 | UNKNOWN | FIX | P2 | `performance.now()` and early-click handling are coherent, but the primary click surface is a non-semantic `div` without keyboard operation. |
| Numble | `/play/numble` · tool-like, not registered | FAIL | 15 | UNKNOWN | 16 | 11 | 5 | 47 | UNKNOWN | FIX | P1 | Daily puzzle/solver and PNG share work, but Hard mode, colorblind mode, and sound settings are persisted no-ops; a returning visit with the tutorial key persisted raises React hydration error #418. |
| Meme Generator | `/play/meme-generator` (+ 30 variants) · tool-like, not registered | PARTIAL | 22 | UNKNOWN | 6 | 6 | 4 | 38 | UNKNOWN | HIDE | P2 | Mobile PNG export works, but template rights/provenance and demand are unverified; fixed zones, permanent watermark, and 30-template upkeep weaken utility and fit. |

## Per-tool evidence ledger

`output_verified=true` below means the calculation was independently asserted or
the downloaded artifact was parsed. It does not mean every workflow passed.

### Text tools

1. **Word Counter** — Input: 10,000 occurrences of `café😀`, two newlines, then
   `終わり`. Expected/actual: 10,001 words and 2 paragraphs; both matched
   (`output_verified=true`). Source inspection shows character totals use
   JavaScript string length and average word length strips non-ASCII characters;
   the advertised abbreviation-aware sentence behavior is a simple boundary
   split. Desktop large-input interaction passed. Mobile, copy, all sentence
   abbreviations, and performance/memory ceilings remain unverified. Evidence:
   `components/tools/WordCounter.tsx`, integrity spec lines 37–46.

2. **Case Converter** — Input: `the art of war`, Title Case. Expected from the
   page copy: `The Art of War`; actual: `The Art Of War`
   (`output_verified=true`). Upper/lower/developer case variants were inspected
   but not exhaustively executed. Evidence: `components/tools/CaseConverter.tsx`,
   `lib/tools.ts`, integrity spec lines 14–22.

3. **Lorem Ipsum Generator** — Source-inspected edge bounds are 1–100 and the
   generator creates the selected number of paragraphs, sentences, or whitespace
   words. Expected/actual browser output counts and clipboard output were not
   independently asserted (`output_verified=false`), so this remains PARTIAL.
   Evidence: `components/tools/LoremGenerator.tsx`.

4. **Remove Line Breaks** — Source-inspected input `a\n\nb` produces `a b` for
   Remove Line Breaks/Clean All; the control itself says it joins all lines.
   This conflicts with SEO copy saying intentional paragraph structure can be
   retained by that operation. Calculation is deterministic but not browser-
   asserted here (`output_verified=false`). Paste/copy permission behavior and
   CR-only newlines remain unverified. Evidence:
   `components/tools/RemoveLineBreaks.tsx`, `lib/tools.ts`.

5. **Text to Slug** — Input: `日本語 😀`. Expected under “convert any text”:
   a useful URL-safe representation or a disclosed unsupported-language error;
   actual: empty placeholder and disabled Copy (`output_verified=true`). Latin
   accents are normalized in source; non-Latin transliteration is absent.
   Evidence: `components/tools/TextToSlug.tsx`, integrity spec lines 48–54.

6. **Character Counter** — Input: `A👩‍💻é\n世`. Expected grapheme count: 5;
   actual displayed characters: 9 UTF-16 code units
   (`output_verified=true`, independently counted with `Intl.Segmenter`). Platform
   limits therefore mislead for emoji-rich content. Evidence:
   `components/tools/CharacterCounter.tsx`, integrity spec lines 24–35.

7. **Find & Replace** — Literal escaping, case sensitivity, regex compile errors,
   match count, clear, and copy paths were source-inspected. Expected Unicode
   whole-word matching for values such as `café`; actual construction uses ASCII
   `\\b...\\b`, which can miss boundaries where the final character is non-ASCII
   (`output_verified=false`; no browser assertion). Evidence:
   `components/tools/FindAndReplace.tsx`.

8. **Sort Lines** — Source cases cover case-insensitive locale A–Z/Z–A, UTF-16
   length sorting, exact-string dedupe, blank-line removal, and Fisher–Yates
   shuffle. No independently asserted browser output, mobile/copy result, or
   locale matrix (`output_verified=false`). Evidence:
   `components/tools/SortLines.tsx`.

### Developer and generator tools

9. **JSON Formatter** — Input first `{"emoji":"😀","lines":[1,2]}`, then `{`.
   Expected: valid formatted object, then invalid state without a usable prior
   result. Actual: parse-correct formatted JSON followed by `Invalid JSON` while
   the old formatted output remains (`output_verified=true`). Evidence:
   `components/tools/JsonFormatter.tsx`, integrity spec lines 77–89.

10. **Base64 Encode / Decode** — Input `café 😀\n第二行`; expected independent
    UTF-8 Base64 and exact inverse. Both matched (`output_verified=true`). Binary
    file/Base64url are not promised and were not tested; clipboard remains a gap.
    Evidence: `components/tools/Base64Tool.tsx`, integrity spec lines 56–75.

11. **Color Picker** — Conversion formulas and synchronized HEX/RGB/HSL controls
    were source-inspected. Invalid HEX can remain in the input while preview state
    silently stays at the last valid color, with no error (`output_verified=false`).
    Contrast interpretation, alpha, wide-gamut colors, eyedropper support, copy,
    and mobile controls remain unverified. Evidence:
    `components/tools/ColorPicker.tsx`.

12. **URL Encoder / Decoder** — Input `café 😀\n第二行`; expected
    `encodeURIComponent(input)` and exact decoded input. Both matched
    (`output_verified=true`). Malformed percent escapes and clipboard behavior
    remain unverified. Evidence: `components/tools/UrlEncoderDecoder.tsx`,
    integrity spec lines 56–75.

13. **UUID Generator** — Expected RFC-shape v4, then v7, and 100 unique v7 values;
    actual output matched version and variant nibbles and all 100 were unique
    (`output_verified=true`). Monotonic ordering under identical milliseconds,
    clipboard, and very large bulk counts remain unverified. Evidence:
    `components/tools/UUIDGenerator.tsx`, integrity spec lines 91–107.

14. **Password Generator** — Length 128 with all four categories and exclusion
    enabled produced 128 characters, at least one from each category, and none of
    `0O1lI` (`output_verified=true`). Security claims still fail source validation:
    `uint32 % max` introduces modulo bias; forced-category generation plus shuffle
    is not the displayed `length × log2(pool)` distribution; pool size subtracts
    eight although only five ambiguous characters are listed (and not all five
    exist in every enabled pool). Crack-time output inherits the incorrect entropy.
    Evidence: `components/tools/PasswordGenerator.tsx`, integrity spec lines
    109–127.

15. **Random Number Generator** — Input min 0, max 5,000,000,000, count 1 with
    deterministic maximum `Uint32`. Expected: every value in the advertised range
    should be reachable; actual maximum source value maps to 4,294,967,295, so the
    upper 705,032,705 values are unreachable (`output_verified=true`). Smaller
    non-power-of-two ranges are also modulo-biased. Evidence:
    `components/tools/RandomNumberGenerator.tsx`, integrity spec lines 129–150.

### Time tools

16. **Timer** — Fake-clock input 2 seconds. Expected/actual: after 1.1 seconds the
    display was `00:01`; two paused seconds did not count; after resume and 1.1
    seconds it reached `Time's Up!` (`output_verified=true`). A later 390×844
    Playwright audit found 6px document overflow: the fixed no-wrap custom-time
    row clips the primary Start button beyond the right viewport. This practically
    validates wall-clock/background recovery, though an actual OS-suspended tab,
    audio delivery, custom-input boundary entry, and mobile notifications remain
    unverified. Evidence: `components/tools/TimerTool.tsx`, integrity spec lines
    152–176.

17. **Stopwatch** — Fake-clock start 1.23 seconds, stop, advance 2 paused seconds,
    resume 0.5 seconds, stop. Expected/actual displays were approximately 1.2 then
    1.7 seconds (`output_verified=true`). Lap/reset/mobile and OS suspension remain
    unverified. Evidence: `components/tools/StopwatchTool.tsx`, integrity spec
    lines 165–176.

18. **Pomodoro Timer** — Existing state-transition test starts a session and
    exposes Pause/Skip; source uses `Date.now()` deltas. This is PARTIAL, not a
    completed-cycle assertion (`output_verified=false`). Numeric inputs rely on
    HTML min/max without handler clamping, and daily stats live only in component
    state. Full focus/break/long-break cycles, auto-start, background suspension,
    audio, reload persistence, and mobile remain unverified. Evidence:
    `components/tools/PomodoroTool.tsx`, `tests/e2e/tool-audit/time-type-smoke.spec.ts`.

### Typing and reaction tools

19. **Typing Test** — Ten-word mode was completed with deliberately alternating
    fast/slow timing. Expected: consistency below 100%; actual: 100%
    (`output_verified=true`). Source sets every `WordResult.rawWpm` to zero, filters
    zeroes, then defaults to 100. Timed finish uses `wordsReached` before the
    current partial word. Clipboard result is written by product code but not
    permission-verified. Evidence: `components/tools/TypingTest.tsx`, integrity
    spec lines 186–212.

20. **WPM Test** — The hidden input accepts typing in the smoke test. Source end
    calculations receive completed-word counters only, so text in the current
    word at timeout is omitted. Expected/actual completion metrics were not
    browser-recomputed (`output_verified=false`). Percentile bands are hardcoded
    without a cited source. Restart, mobile virtual keyboard, 15/30/60/120-second
    accuracy, and persistence remain unverified. Evidence:
    `components/tools/WpmTest.tsx`, time/type smoke spec.

21. **Keyboard Tester** — With Reset focused, a plain Tab should move focus;
    actual focus remained on Reset (`output_verified=true`). The global window
    keydown prevents default for every key, creating a WCAG 2.1.2 keyboard trap.
    Source mapping correctly records physical `event.code`; international layouts,
    chattering/NKRO claims, mobile, and screen-reader announcements remain
    unverified. Evidence: `components/tools/KeyboardTester.tsx`, integrity spec
    lines 178–184.

22. **Typing Practice** — Typing state transition passed. On final Space, source
    enqueues `setCorrectChars`/`setIncorrectChars` and then invokes an `endTest`
    callback that closes over the pre-final counters, omitting the last word from
    results (`output_verified=false`; source reproduction). Full deterministic
    completion, weak-key math, persistence, clipboard, and mobile remain
    unverified. Evidence: `components/tools/TypingPractice.tsx`, time/type smoke
    spec.

23. **Typing Race** — Typing state transition passed. Source `startRace()` sets
    start time in React state while its already-created interval invokes the
    pre-render `endRace(false)` closure with `startTime = 0`. Expected ghost-loss
    elapsed time is race duration; actual calculation is milliseconds since the
    Unix epoch, which rounds WPM to 0 (`output_verified=false`; deterministic
    source defect). Win path, every ghost speed, persistence, and mobile remain
    unverified. Evidence: `components/tools/TypingRace.tsx`, time/type smoke spec.

24. **Word Blitz** — Visible input and wall-clock timer state pass smoke/source
    inspection. Expected accuracy is character truth; actual implementation adds
    one error on every non-prefix change event, including repeated edits, while
    ignoring the remaining current word at timeout (`output_verified=false`).
    Full 30/60/90-second result recomputation, streak scoring, persistence, and
    mobile keyboard remain unverified. Evidence: `components/tools/WordBlitz.tsx`,
    time/type smoke spec.

25. **Code Typing Challenge** — The challenge accepts keystrokes without a crash;
    source tracks code characters and special-character accuracy. No deterministic
    full-snippet WPM/accuracy recomputation or mobile virtual-keyboard run was done
    (`output_verified=false`). Clipboard and persistence remain unverified.
    Evidence: `components/tools/CodeChallenge.tsx`, time/type smoke spec.

26. **CPS Test** — First click increments the counter in smoke coverage. Expected:
    a 5-second test measures five seconds of elapsed time; actual source decrements
    state once per `setInterval` callback and ends after five callbacks, so a
    throttled/background tab can run materially longer while final CPS still
    divides by five (`output_verified=false`; deterministic source defect). The
    primary target is also a non-semantic `div`. Evidence:
    `components/tools/CpsTest.tsx`, time/type smoke spec.

27. **Reaction Time Test** — Start/wait state passed. Source measures from the
    green signal with `performance.now()` and rejects early clicks. Full
    randomized reaction output was not independently clock-asserted
    (`output_verified=false`). The click target is a non-semantic `div`, so it is
    not keyboard-operable. Hardware/display latency, percentile claims, mobile
    touch, and persistence remain unverified. Evidence:
    `components/tools/ReactionTime.tsx`, time/type smoke spec.

### Play products

28. **Numble** — Deterministic 2026-08-01 puzzle `[50,100,6,1,10,3] → 980` was
    independently solved in three legal operations: `100+1=101`, `101−3=98`,
    `10×98=980`. Hard mode was enabled, yet the four-number solution was accepted,
    contradicting “use all 6.” The downloaded share PNG parsed as 1080×1350
    (`output_verified=true`). Solver/generator legality and deterministic daily
    seed were independently inspected. `hardMode`, `colorblindMode`, and
    `soundEnabled` are persisted in the modal but never consumed by gameplay.
    Mobile, timezone rollover, long-run daily generation, clipboard share, and
    storage migration remain unverified. Evidence: `lib/numble.ts`,
    `components/numble/NumbleGame.tsx`, integrity spec lines 214–247,
    `/tmp/clevr-tool-audit/text-play/numble-share.png`.
    A later production-style 390×844 audit seeded the normal persisted
    `numble_how_to_play_shown=true` returning-user state and captured React
    hydration error #418 (`pageerror`), adding a P2 hydration defect beneath the
    existing P1 settings defect.

29. **Meme Generator** — At 390×844, the Drake variant accepted multiline Unicode
    text without horizontal page overflow and downloaded a PNG that parsed as
    1200×1200 (`output_verified=true`). All 30 bundled images decode, and their
    total repository size is about 2.3 MB. Editing is limited to predefined text
    zones, style/color/scale controls, and a permanent `clevr.tools` watermark;
    there is no drag positioning, persistence, or upload error state/size guard.
    The repository contains no identified license/provenance manifest for the
    third-party meme images. That is an unverified rights/trust gate, not a legal
    conclusion. Evidence: `components/meme/MemeEditor.tsx`,
    `components/meme/MemeCanvas.tsx`, `lib/memes.ts`, integrity spec lines
    249–269, `/tmp/clevr-tool-audit/text-play/drake-meme.png`.

## P1 defect register

1. **Case Converter:** output contradicts the explicit rule-aware Title Case
   promise.
2. **Password Generator:** biased randomness and incorrect entropy/pool math make
   security-strength and crack-time results unreliable.
3. **Random Number Generator:** modulo bias; advertised ranges wider than 2^32
   include unreachable values.
4. **Typing Test:** consistency is fabricated as 100% for every completed result.
5. **Keyboard Tester:** global Tab prevention creates a keyboard trap.
6. **Typing Race:** ghost-loss path calculates elapsed time from the Unix epoch
   and produces 0 WPM.
7. **CPS Test:** callback-count timing becomes inaccurate under timer throttling.
8. **Numble:** three prominent saved settings, including Hard mode, have no effect.

## Meme Generator recommendation: HIDE

The renderer is functional and produces a sharp full-resolution mobile download,
so immediate deletion is not justified by correctness evidence. It should still
be hidden from public discovery/indexation pending a portfolio decision because:

- asset provenance/usage rights are undocumented in the repository;
- measured search demand and repeat-use evidence are unavailable;
- the 30-template fixed-zone model creates ongoing manual maintenance;
- permanent site watermarking reduces consumer utility;
- controls are less capable than established meme editors, so differentiation is
  weak; and
- the meme surface pulls the brand toward disposable novelty rather than trusted
  general-purpose utility.

Before retaining it publicly, require an asset provenance manifest, evidence of
demand, upload failure/size handling, export regression coverage across template
aspect ratios, keyboard-accessible editing controls, and a clear watermark policy.
If rights or demand cannot be established, recommend `REMOVE` in a later action
phase after checking traffic/backlinks. For the current `HIDE` recommendation,
the future SEO action is noindex/remove from sitemap and discovery while keeping
the route temporarily available for review; no such action was implemented here.

## Cross-cutting gaps and next tests

- Merge route/indexability/sitemap/navigation/category/search data from Worker 4.
- Merge representative mobile, dark-mode, contrast, focus, touch-target, console,
  hydration, and three-column-layout findings from Worker 5.
- Run clipboard read/write assertions in an explicitly permissioned browser.
- Add deterministic result tests for Typing Practice final-word accounting,
  Typing Race ghost loss, CPS elapsed time, WPM Test timeout partial words, Word
  Blitz edit/backtrack accuracy, and Code Typing Challenge completion metrics.
- Exercise real background-tab throttling/OS suspension for all timers and games;
  fake-clock tests establish wall-clock logic only.
- Test storage corruption, quota errors, private browsing, and cross-version
  migration for typing history and Numble state.
- Audit screen-reader announcements and keyboard operation for every custom game
  surface. Keyboard Tester, CPS Test, and Reaction Time Test already have concrete
  failures or source-level gaps.
- Obtain GSC data before proposing any FLAGSHIP, removal, or demand-based SEO
  priority. No tool in this workstream is nominated as FLAGSHIP without demand
  evidence.

## Files and safety

- Added audit test: `tests/e2e/tool-audit/text-play-integrity.spec.ts`.
- Added this report: `reports/audits/tool-integrity/text-dev-time-type-play.md`.
- Production logic, routes, SEO copy, and indexation were not changed.
- User-owned `outputs/` was not read, modified, staged, or deleted.
