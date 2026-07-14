// Per-tool interaction fixtures for the functional smoke suite.
//
// The registry (lib/tools.ts) tells us a tool exists and where it lives, but
// it doesn't encode how to drive it — what to type, what button to click,
// what a "it worked" signal looks like. That has to be hand-authored once
// per tool by reading its component. This file is that data, kept separate
// from the test runner (functional-smoke.spec.ts) so the driving logic and
// the tool-specific knowledge don't get tangled together.
//
// functional-smoke.spec.ts asserts every LIVE_TOOLS entry (minus the
// unit-converter family, which is covered by one generic spec — see
// unit-converter-smoke.spec.ts) has a fixture here, so a new tool without
// one fails loudly instead of silently going untested.

export type Step =
  | { type: "fill"; label: string; value: string }
  | { type: "fillPlaceholder"; placeholder: string; value: string }
  | { type: "select"; label: string; optionLabel: string }
  | { type: "check"; label: string }
  | { type: "click"; name: string | RegExp }
  /** Escape hatch for pages where label-text matching picks the wrong element (e.g. GPA's "Grade" also appears in a "Grade Scale" button earlier in the DOM). */
  | { type: "selectCss"; css: string; optionLabel: string };

export interface FormFixture {
  kind: "form";
  /** Steps to run, in order, before asserting on the result. */
  steps: Step[];
  /** Regex matched against the normalized innerText of <main> after steps run. */
  successPattern: RegExp;
  /** True if a plausible result should already be visible on page load, before any steps. */
  defaultsProduceResult?: boolean;
}

export interface FileFixture {
  kind: "file";
  fixtureFiles: string[];
  /** Button to click after upload, if processing isn't automatic. */
  actionButton?: string | RegExp;
  /** Regex matched against <main> innerText once processing completes. */
  successPattern?: RegExp;
  /** If true, clicking actionButton (or the upload itself) triggers a real browser download rather than a persistent blob link. */
  expectsBrowserDownload?: boolean;
  /** Skip this tool's functional test with a reason (still covered by Level 1 registry smoke). */
  skip?: string;
}

export interface CustomFixture {
  kind: "custom";
  /** Free-form description of what the custom spec in functional-smoke.spec.ts does for this tool. */
  note: string;
}

export type Fixture = FormFixture | FileFixture | CustomFixture;

export const FIXTURES: Record<string, Fixture> = {
  // ---------- finance / misc calculators ----------
  "percentage-calculator": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fill", label: "Percentage (%)", value: "15" },
      { type: "fill", label: "Number", value: "200" },
    ],
    successPattern: /30/,
  },
  "odds-calculator": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "American Odds", value: "+300" }],
    successPattern: /4\.00|Win \$300/,
  },
  poker: {
    kind: "form",
    // The default tab ("Hand Rankings") renders fine without input, but that's
    // not what successPattern checks for — successPattern targets the Odds &
    // Outs tab this fixture clicks into. Don't gate on the pre-click state.
    defaultsProduceResult: false,
    steps: [
      { type: "click", name: /Odds & Outs/i },
      { type: "fill", label: "Pot size ($)", value: "500" },
    ],
    successPattern: /Profitable call|Fold|: 1/,
  },
  "age-calculator": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fill", label: "Date of Birth", value: "1990-06-15" }],
    successPattern: /\d+\s*years,\s*\d+\s*months,\s*\d+\s*days/,
  },
  "date-difference": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "click", name: /90 days from today/i }],
    successPattern: /\d+\s*days/,
  },
  "bmi-calculator": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Weight (lbs)", value: "220" }],
    successPattern: /\d+\.\d/,
  },
  "mortgage-calculator": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Home Price ($)", value: "600000" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  "tip-calculator": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fill", label: "Bill Amount ($)", value: "85.50" }],
    successPattern: /\$\d+\.\d{2}/,
  },
  "discount-calculator": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fill", label: "Original Price ($)", value: "100" },
      { type: "click", name: "20%" },
    ],
    successPattern: /\$80\.00/,
  },
  "compound-interest": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Years", value: "20" }],
    successPattern: /\$[\d,]+/,
  },
  "gpa-calculator": {
    kind: "form",
    defaultsProduceResult: false,
    // Per-course grade <select>s have no <label> at all (placeholder-style
    // table header only) — go straight for the one <select> on this page.
    steps: [{ type: "selectCss", css: "select", optionLabel: "A" }],
    successPattern: /4\.00/,
  },
  salary: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Hourly Rate ($)", value: "50" }],
    successPattern: /\$104,000\.00/,
  },
  "take-home-pay": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "select", label: "State", optionLabel: "California" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  loan: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Loan Amount ($)", value: "50000" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  "auto-loan": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "click", name: "36 mo" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  "credit-card-payoff": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Monthly Payment ($)", value: "500" }],
    successPattern: /\d+\s*(months|yr)/,
  },
  "savings-goal": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Timeline (months)", value: "60" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  retirement: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Retirement Age", value: "70" }],
    successPattern: /Projected Savings[\s\S]*\$[\d,]+/,
  },
  "investment-return": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Years", value: "30" }],
    successPattern: /Final Balance[\s\S]*\$[\d,]+/,
  },
  "debt-to-income": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Gross Monthly Income ($)", value: "3000" }],
    successPattern: /\d+\.\d%/,
  },
  "net-worth": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [],
    successPattern: /Net Worth/,
  },
  "sales-tax": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Tax Rate (%)", value: "20" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  amortization: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Extra Monthly Payment ($)", value: "500" }],
    successPattern: /Interest Saved/,
  },
  "car-payment": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Down Payment ($)", value: "0" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  paycheck: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "select", label: "State", optionLabel: "California" }],
    successPattern: /\$[\d,]+\.\d{2}/,
  },
  "down-payment": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Home Price ($)", value: "600000" }],
    successPattern: /\$[\d,]+/,
  },
  calorie: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Weight (lbs)", value: "220" }],
    successPattern: /calories\/day/,
  },
  macro: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Daily Calorie Target", value: "3000" }],
    successPattern: /\d+g/,
  },
  "body-fat": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Waist (inches)", value: "40" }],
    successPattern: /Estimated Body Fat[\s\S]*\d+%/,
  },
  "due-date": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fill", label: "First Day of Last Period", value: "2026-01-01" }],
    successPattern: /Estimated Due Date/,
  },
  ovulation: {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fill", label: "First Day of Last Period", value: "2026-06-01" }],
    successPattern: /Estimated Ovulation Date/,
  },
  "ideal-weight": {
    kind: "form",
    defaultsProduceResult: true,
    // NOTE: don't lower height below 5'0" — IdealWeightCalculator.tsx shows a
    // "formulas don't hold up below 5'0"" message instead of a result there.
    // "Height" is htmlFor-associated with the ft input specifically.
    steps: [{ type: "fill", label: "Height", value: "6" }],
    successPattern: /Healthy BMI Range/,
  },
  "calories-burned": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Duration (minutes)", value: "60" }],
    successPattern: /Total Calories Burned/,
  },
  sleep: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [],
    successPattern: /\d{1,2}:\d{2}\s?(AM|PM)/,
  },
  pace: {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "Distance (miles)", value: "6.2" }],
    successPattern: /\d+:\d{2}/,
  },

  // ---------- text tools ----------
  "word-counter": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fillPlaceholder", placeholder: "Start typing or paste your text here", value: "one two three" }],
    successPattern: /\b3\b/,
  },
  "case-converter": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fillPlaceholder", placeholder: "Paste or type your text here", value: "hello world" },
      { type: "click", name: "UPPER CASE" },
    ],
    successPattern: /HELLO WORLD/,
  },
  "lorem-generator": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "click", name: /Generate/i }],
    successPattern: /[A-Za-z]/,
  },
  "remove-line-breaks": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fillPlaceholder", placeholder: "Paste your messy text here", value: "line one\nline two\nline three" },
      { type: "click", name: "Remove Line Breaks" },
    ],
    successPattern: /line one line two line three/,
  },
  "text-to-slug": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fillPlaceholder", placeholder: "How to Make the Perfect Sourdough Bread", value: "Crème brûlée recipe!" }],
    successPattern: /creme-brulee-recipe/,
  },
  "character-counter": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fillPlaceholder", placeholder: "Type or paste text to count characters", value: "hello" }],
    successPattern: /\b5\b/,
  },
  "find-and-replace": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fillPlaceholder", placeholder: "Paste your source text here", value: "the cat sat on the mat" },
      { type: "fillPlaceholder", placeholder: "Search text", value: "cat" },
      { type: "fillPlaceholder", placeholder: "Replacement text", value: "dog" },
      { type: "click", name: "Replace All" },
    ],
    successPattern: /the dog sat on the mat/,
  },
  "sort-lines": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fillPlaceholder", placeholder: "Paste lines of text to sort", value: "banana\napple\ncherry" },
      { type: "click", name: "A → Z" },
    ],
    successPattern: /apple/,
  },

  // ---------- dev tools ----------
  "json-formatter": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fillPlaceholder", placeholder: "Paste JSON here", value: '{"a":1,"b":[2,3]}' },
      { type: "click", name: "Format" },
    ],
    successPattern: /Valid JSON/,
  },
  base64: {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fillPlaceholder", placeholder: "Type or paste plain text", value: "test" }],
    successPattern: /dGVzdA==/,
  },
  "color-picker": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [{ type: "fill", label: "HEX", value: "#ff0000" }],
    successPattern: /255/,
  },
  "url-encoder": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [{ type: "fillPlaceholder", placeholder: "Type or paste plain text", value: "a b" }],
    successPattern: /a%20b/,
  },
  "uuid-generator": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [],
    successPattern: /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
  },

  // ---------- generate ----------
  "qr-code-generator": {
    kind: "custom",
    note: "type a URL into the URL tab input, wait for the 300ms debounce, assert img[alt='QR Code preview'] src starts with data:image/png;base64,",
  },
  "password-generator": {
    kind: "form",
    defaultsProduceResult: true,
    steps: [],
    successPattern: /Very Strong|Strong|Moderate|Weak|bits/,
  },
  "random-number": {
    kind: "form",
    defaultsProduceResult: false,
    steps: [
      { type: "fill", label: "Min", value: "1" },
      { type: "fill", label: "Max", value: "1" },
      { type: "fill", label: "Count", value: "1" },
      { type: "click", name: "Generate" },
    ],
    successPattern: /^1$|\b1\b/,
  },

  // ---------- file tools ----------
  "image-compressor": {
    kind: "file",
    fixtureFiles: ["sample.jpg"],
    successPattern: /Download/i,
  },
  "gif-compressor": {
    kind: "file",
    fixtureFiles: ["sample.gif"],
    actionButton: /Compress GIF/i,
    successPattern: /Download/i,
  },
  "pdf-compressor": {
    kind: "file",
    fixtureFiles: ["sample.pdf"],
    successPattern: /Results/,
  },
  "png-to-jpg": {
    kind: "file",
    fixtureFiles: ["sample.png"],
    successPattern: /Download/i,
  },
  "heic-to-jpg": {
    kind: "custom",
    // heic2any's WASM decode hangs indefinitely under headless Chromium
    // (confirmed: same genuine HEIC fixture converts in ~10s via manual
    // interaction in the (headed) Browser pane, but never resolves after 80s+
    // under `playwright test`'s headless run). Manually verified working;
    // automating it reliably needs a headed run or a longer investigation
    // into headless WASM/SIMD support, out of scope for this audit.
    note: "manually verified working (~10s); hangs under headless Playwright — see comment",
  },
  "webp-to-png": {
    kind: "file",
    fixtureFiles: ["sample.webp"],
    successPattern: /Download/i,
  },
  "png-to-webp": {
    kind: "file",
    fixtureFiles: ["sample.png"],
    successPattern: /Download/i,
  },
  "jpg-to-png": {
    kind: "file",
    fixtureFiles: ["sample.jpg"],
    successPattern: /Download/i,
  },
  "pdf-to-jpg": {
    kind: "file",
    fixtureFiles: ["sample.pdf"],
    actionButton: /Convert.*to JPG/i,
    successPattern: /converted to JPG successfully/i,
  },
  "jpg-to-pdf": {
    kind: "file",
    fixtureFiles: ["sample.jpg"],
    actionButton: /Download/i,
    expectsBrowserDownload: true,
  },
  "png-to-pdf": {
    kind: "file",
    fixtureFiles: ["sample.png"],
    actionButton: /Download/i,
    expectsBrowserDownload: true,
  },
  "word-to-pdf": {
    kind: "file",
    fixtureFiles: ["sample.docx"],
    skip: "heavy/flaky in headless CI — mirrors the existing skip in file-tools-happy.spec.ts",
  },
  "background-remover": {
    kind: "file",
    fixtureFiles: ["sample.jpg"],
    actionButton: /Remove Background/i,
    successPattern: /Download/i,
    skip: "hits a real backend API (/api/remove-bg) with daily rate limiting — not safe to run unattended in CI without mocking",
  },
  "merge-pdf": {
    kind: "file",
    fixtureFiles: ["sample.pdf", "sample.pdf"],
    actionButton: /Merge\s+\d+\s+PDFs/i,
    successPattern: /Download/i,
  },
  "split-pdf": {
    kind: "file",
    fixtureFiles: ["sample.pdf"],
    actionButton: /Split PDF/i,
    successPattern: /page PDF/i,
  },
  "rotate-pdf": {
    kind: "file",
    fixtureFiles: ["sample.pdf"],
    actionButton: /Apply Rotations/i,
    successPattern: /Download/i,
  },
  "pdf-to-fillable": {
    kind: "custom",
    note: "already covered by tests/e2e/pdf-to-fillable-placement.spec.ts — reuse rather than duplicate",
  },
  "resize-image": {
    kind: "file",
    fixtureFiles: ["sample.jpg"],
    actionButton: /Resize to/i,
    expectsBrowserDownload: true,
  },
  "image-cropper": {
    kind: "file",
    fixtureFiles: ["sample.jpg"],
    actionButton: /Crop Image/i,
    successPattern: /Download/i,
  },
  "invoice-generator": {
    kind: "custom",
    note: "pure form (no file upload) — fill business/client name fields, click Download PDF, assert a real browser download fires",
  },
};

/** Slugs handled by the generic unit-converter driver, not this table. */
export const UNIT_CONVERTER_SLUGS = new Set([
  "unit-converter",
  "convert-length",
  "convert-weight",
  "convert-temperature",
  "convert-volume",
  "convert-area",
  "convert-speed",
  "convert-time",
  "convert-data",
  "convert-pressure",
  "convert-energy",
  "convert-frequency",
  "convert-fuel-economy",
  "convert-angle",
  "convert-power",
  "convert-force",
  "convert-cooking",
  "cm-to-inches",
  "kg-to-lbs",
  "miles-to-km",
  "fahrenheit-to-celsius",
  "feet-to-meters",
  "oz-to-grams",
  "liters-to-gallons",
  "inches-to-feet",
  "meters-to-feet",
  "cups-to-ml",
  "lbs-to-kg",
  "mm-to-inches",
  "acres-to-sq-ft",
  "mbps-to-gbps",
]);

/** Slugs handled by bespoke specs in time-type-smoke.spec.ts, not this table. */
export const TIME_TYPE_SLUGS = new Set([
  "timer",
  "stopwatch",
  "pomodoro",
  "typing-test",
  "wpm-test",
  "keyboard-tester",
  "typing-practice",
  "race",
  "word-blitz",
  "code-challenge",
  "cps-test",
  "reaction-time",
]);
