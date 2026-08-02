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

const calendar = loadTypeScriptModule("lib/p1-remediation/calendar.ts");
const finance = loadTypeScriptModule("lib/p1-remediation/finance.ts");
const pace = loadTypeScriptModule("lib/p1-remediation/pace.ts");

function date(value) {
  const parsed = calendar.parseDateOnly(value);
  assert.ok(parsed, `expected a valid calendar date: ${value}`);
  return parsed;
}

function assertClose(actual, expected, tolerance = 1e-8) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
}

test("age public copy matches the custom As of input and avoids legal or unsupported provenance claims", () => {
  const registry = fs.readFileSync(path.join(projectRoot, "lib/tools.ts"), "utf8");
  const faqs = fs.readFileSync(path.join(projectRoot, "lib/seo/tool-faqs.ts"), "utf8");
  const publicCopy = `${registry}\n${faqs}`;
  assert.doesNotMatch(publicCopy, /actual and legal age|follow the Pew Research Center definitions/i);
  assert.match(publicCopy, /set the As of date to any later calendar date/i);
  assert.match(publicCopy, /not a statement about legal age rules/i);
});

test("date-only parsing rejects impossible dates", () => {
  assert.equal(calendar.parseDateOnly("2026-02-29"), null);
  assert.equal(calendar.parseDateOnly("2024-02-30"), null);
  assert.equal(calendar.parseDateOnly("2026-13-01"), null);
  assert.equal(calendar.parseDateOnly("01/31/2026"), null);
  assert.deepEqual(calendar.parseDateOnly("2024-02-29"), {
    year: 2024,
    month: 2,
    day: 29,
  });
});

test("month-end decomposition is non-negative and recomposes under clamping", () => {
  const cases = [
    ["2026-01-31", "2026-03-01", 29, 0, 1, 1],
    ["2026-01-31", "2026-02-28", 28, 0, 1, 0],
    ["2024-01-31", "2024-02-29", 29, 0, 1, 0],
    ["2025-03-31", "2026-03-30", 364, 0, 11, 30],
  ];

  for (const [startValue, endValue, elapsed, years, months, days] of cases) {
    const start = date(startValue);
    const end = date(endValue);
    const result = calendar.differenceDateOnly(start, end);
    assert.deepEqual(
      [result.absoluteDays, result.years, result.months, result.days],
      [elapsed, years, months, days],
      `${startValue} to ${endValue}`
    );
    assert.ok(result.months >= 0 && result.months <= 11);
    assert.ok(result.days >= 0);

    const monthAnchor = calendar.addCalendarMonthsClamped(
      start,
      result.years * 12 + result.months
    );
    assert.deepEqual(calendar.addCalendarDays(monthAnchor, result.days), end);
  }
});

test("same-day and reversed intervals preserve current absolute-result semantics", () => {
  const same = calendar.differenceDateOnly(date("2026-06-15"), date("2026-06-15"));
  assert.deepEqual(same, {
    signedDays: 0,
    absoluteDays: 0,
    direction: 0,
    years: 0,
    months: 0,
    days: 0,
  });

  const forward = calendar.differenceDateOnly(date("2026-01-31"), date("2026-03-01"));
  const reversed = calendar.differenceDateOnly(date("2026-03-01"), date("2026-01-31"));
  assert.equal(forward.signedDays, 29);
  assert.equal(reversed.signedDays, -29);
  assert.deepEqual(
    [reversed.absoluteDays, reversed.years, reversed.months, reversed.days],
    [forward.absoluteDays, forward.years, forward.months, forward.days]
  );
});

test("leap anniversaries clamp to February 28 in non-leap years", () => {
  const birthDate = date("2024-02-29");
  const asOf = date("2025-02-28");
  const age = calendar.differenceDateOnly(birthDate, asOf);
  assert.deepEqual(
    [age.absoluteDays, age.years, age.months, age.days],
    [365, 1, 0, 0]
  );
  assert.deepEqual(calendar.nextBirthdayAfter(birthDate, date("2025-02-27")), asOf);
  assert.deepEqual(calendar.nextBirthdayAfter(birthDate, asOf), date("2026-02-28"));
});

test("DST transitions are one elapsed calendar day in a DST-observing timezone", () => {
  const originalTimeZone = process.env.TZ;
  process.env.TZ = "America/Los_Angeles";
  try {
    const spring = calendar.differenceDateOnly(date("2026-03-08"), date("2026-03-09"));
    const fall = calendar.differenceDateOnly(date("2026-11-01"), date("2026-11-02"));
    assert.equal(spring.absoluteDays, 1);
    assert.equal(fall.absoluteDays, 1);

    // This documents the regression mechanism: local elapsed hours are not a
    // valid oracle for date-only inputs across clock changes.
    const springLocalHours =
      (new Date("2026-03-09T00:00:00").getTime() -
        new Date("2026-03-08T00:00:00").getTime()) /
      3_600_000;
    const fallLocalHours =
      (new Date("2026-11-02T00:00:00").getTime() -
        new Date("2026-11-01T00:00:00").getTime()) /
      3_600_000;
    assert.equal(springLocalHours, 23);
    assert.equal(fallLocalHours, 25);
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

test("today values use the user's local civil date rather than the UTC date", () => {
  const originalTimeZone = process.env.TZ;
  const instant = new Date("2026-01-01T01:30:00Z");
  try {
    process.env.TZ = "America/Los_Angeles";
    assert.equal(calendar.localDateInputValue(instant), "2025-12-31");
    process.env.TZ = "Pacific/Kiritimati";
    assert.equal(calendar.localDateInputValue(instant), "2026-01-01");
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

test("business and weekend totals remain inclusive and direction-neutral", () => {
  const friday = date("2026-01-02");
  const monday = date("2026-01-05");
  assert.equal(calendar.countBusinessDaysInclusive(friday, monday), 2);
  assert.equal(calendar.countBusinessDaysInclusive(monday, friday), 2);
  assert.equal(calendar.countBusinessDaysInclusive(date("2026-01-03"), date("2026-01-03")), 0);

  const elapsedDays = calendar.differenceDateOnly(friday, monday).absoluteDays;
  const inclusiveSpan = elapsedDays + 1;
  assert.equal(inclusiveSpan - calendar.countBusinessDaysInclusive(friday, monday), 2);
});

test("90- and 180-day shortcuts use calendar-day addition", () => {
  const start = date("2026-01-31");
  assert.equal(calendar.formatDateOnly(calendar.addCalendarDays(start, 90)), "2026-05-01");
  assert.equal(calendar.formatDateOnly(calendar.addCalendarDays(start, 180)), "2026-07-30");
});

test("extra-payment payoff caps the audit case's final payment", () => {
  const result = finance.calculateFixedRateAmortization(300_000, 6.5, 360, 100);
  assert.ok(result);
  const finalRow = result.schedule.at(-1);
  assert.ok(finalRow);

  assert.equal(result.actualMonths, 312);
  assertClose(finalRow.payment, 819.2141864010698, 1e-8);
  assertClose(result.totalWithExtra, 621_638.6801053394, 1e-7);
  assertClose(result.interestWithExtra, 321_638.68010533793, 1e-7);
  assert.equal(finalRow.balance, 0);
  assert.ok(finalRow.payment < result.basePayment);
  assertClose(finalRow.payment, finalRow.principal + finalRow.interest);
  assertClose(result.principalWithExtra, 300_000, 1e-7);
  assertClose(result.totalWithExtra - result.interestWithExtra, 300_000, 1e-7);
  assert.ok(result.schedule.every((row) => row.balance >= 0));
});

test("a large extra payment retires a short loan without overcharging", () => {
  const result = finance.calculateFixedRateAmortization(1_000, 12, 2, 10_000);
  assert.ok(result);
  assert.equal(result.actualMonths, 1);
  assert.equal(result.schedule.length, 1);
  assertClose(result.schedule[0].interest, 10);
  assertClose(result.schedule[0].principal, 1_000);
  assertClose(result.schedule[0].payment, 1_010);
  assertClose(result.totalWithExtra, 1_010);
  assertClose(result.principalWithExtra, 1_000);
  assert.equal(result.schedule[0].balance, 0);
  assert.ok(result.schedule[0].extraPayment < 10_000);
});

test("zero-rate and no-extra schedules reconcile principal exactly", () => {
  const zeroRate = finance.calculateFixedRateAmortization(1_200, 0, 12, 1_000);
  assert.ok(zeroRate);
  assert.equal(zeroRate.actualMonths, 2);
  assert.deepEqual(
    zeroRate.schedule.map((row) => Math.round(row.payment)),
    [1_100, 100]
  );
  assert.equal(zeroRate.schedule.at(-1).balance, 0);
  assertClose(zeroRate.totalWithExtra, 1_200);
  assertClose(zeroRate.principalWithExtra, 1_200);

  const standard = finance.calculateFixedRateAmortization(25_000, 6.5, 60, 0);
  assert.ok(standard);
  assert.equal(standard.actualMonths, 60);
  assert.equal(standard.schedule.at(-1).balance, 0);
  assertClose(standard.principalWithExtra, 25_000, 1e-8);
});

test("pace rounding carries at the 59.5-second boundary", () => {
  assert.equal(pace.formatRoundedPace(359.499), "5:59");
  assert.equal(pace.formatRoundedPace(359.5), "6:00");
  assert.equal(pace.formatRoundedPace(1_079 / 3), "6:00");
  assert.equal(pace.formatRoundedDuration(3_599.499), "0:59:59");
  assert.equal(pace.formatRoundedDuration(3_599.5), "1:00:00");
});

test("pace/speed conversion cases on both sides of rollover never emit 60 seconds", () => {
  const distance = 3;
  const cases = [
    { totalTime: 1_078, expectedPace: "5:59" },
    { totalTime: 1_079, expectedPace: "6:00" },
  ];

  for (const { totalTime, expectedPace } of cases) {
    const paceSeconds = totalTime / distance;
    const speed = distance / (totalTime / 3_600);
    assert.equal(pace.formatRoundedPace(paceSeconds), expectedPace);
    assertClose(speed, 3_600 / paceSeconds);
  }

  for (let seconds = 0.5; seconds < 7_200; seconds += 17.25) {
    const formattedPace = pace.formatRoundedPace(seconds);
    const formattedDuration = pace.formatRoundedDuration(seconds);
    assert.doesNotMatch(formattedPace, /:60$/);
    assert.doesNotMatch(formattedDuration, /:60(?:$|:)/);
    assert.match(formattedPace, /^\d+:[0-5]\d$/);
    assert.match(formattedDuration, /^\d+:[0-5]\d:[0-5]\d$/);
  }
});
