const MILLISECONDS_PER_DAY = 86_400_000;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface CalendarDifference {
  /** Signed end-minus-start count of elapsed calendar days. */
  signedDays: number;
  /** Absolute elapsed calendar days; neither endpoint is added to the interval. */
  absoluteDays: number;
  /** -1 when end precedes start, 0 for the same date, otherwise 1. */
  direction: -1 | 0 | 1;
  /** Absolute calendar decomposition using end-of-month clamping. */
  years: number;
  months: number;
  days: number;
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInCalendarMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}

export function parseDateOnly(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInCalendarMonth(year, month)
  ) {
    return null;
  }

  return { year, month, day };
}

export function formatDateOnly(date: CalendarDate): string {
  return `${date.year.toString().padStart(4, "0")}-${date.month
    .toString()
    .padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
}

export function localDateOnly(date = new Date()): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function localDateInputValue(date = new Date()): string {
  return formatDateOnly(localDateOnly(date));
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

/**
 * Returns a UTC-backed ordinal for a civil date. UTC is used only as a stable
 * Gregorian calendar coordinate; local offsets and DST never enter the math.
 */
export function calendarDayNumber(date: CalendarDate): number {
  const utc = new Date(0);
  utc.setUTCHours(0, 0, 0, 0);
  utc.setUTCFullYear(date.year, date.month - 1, date.day);
  return Math.trunc(utc.getTime() / MILLISECONDS_PER_DAY);
}

export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const utc = new Date((calendarDayNumber(date) + Math.trunc(days)) * MILLISECONDS_PER_DAY);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/**
 * Adds whole months and clamps a missing month-end to the target month's last
 * date (for example, January 31 + 1 month = February 28 in a common year).
 */
export function addCalendarMonthsClamped(
  date: CalendarDate,
  months: number
): CalendarDate {
  const monthIndex = date.year * 12 + (date.month - 1) + Math.trunc(months);
  const year = Math.floor(monthIndex / 12);
  const zeroBasedMonth = ((monthIndex % 12) + 12) % 12;
  const month = zeroBasedMonth + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInCalendarMonth(year, month)),
  };
}

/**
 * Decomposes the absolute interval into the largest whole clamped calendar
 * months from the earlier date, followed by elapsed days from that anchor.
 */
export function differenceDateOnly(
  start: CalendarDate,
  end: CalendarDate
): CalendarDifference {
  const comparison = compareCalendarDates(start, end);
  const direction: -1 | 0 | 1 = comparison === 0 ? 0 : comparison < 0 ? 1 : -1;
  const earlier = direction < 0 ? end : start;
  const later = direction < 0 ? start : end;
  const absoluteDays = calendarDayNumber(later) - calendarDayNumber(earlier);

  let wholeMonths =
    (later.year - earlier.year) * 12 + (later.month - earlier.month);
  let monthAnchor = addCalendarMonthsClamped(earlier, wholeMonths);
  if (compareCalendarDates(monthAnchor, later) > 0) {
    wholeMonths -= 1;
    monthAnchor = addCalendarMonthsClamped(earlier, wholeMonths);
  }

  return {
    signedDays: absoluteDays * direction,
    absoluteDays,
    direction,
    years: Math.floor(wholeMonths / 12),
    months: wholeMonths % 12,
    days: calendarDayNumber(later) - calendarDayNumber(monthAnchor),
  };
}

export function dayOfWeek(date: CalendarDate): number {
  // 1970-01-01 was Thursday (4 when Sunday is 0).
  return ((calendarDayNumber(date) + 4) % 7 + 7) % 7;
}

export function countBusinessDaysInclusive(
  start: CalendarDate,
  end: CalendarDate
): number {
  const earlier = compareCalendarDates(start, end) <= 0 ? start : end;
  const later = earlier === start ? end : start;
  const inclusiveDays = calendarDayNumber(later) - calendarDayNumber(earlier) + 1;
  const fullWeeks = Math.floor(inclusiveDays / 7);
  let businessDays = fullWeeks * 5;
  const remainingDays = inclusiveDays % 7;
  const firstWeekday = dayOfWeek(earlier);

  for (let offset = 0; offset < remainingDays; offset += 1) {
    const weekday = (firstWeekday + offset) % 7;
    if (weekday !== 0 && weekday !== 6) businessDays += 1;
  }

  return businessDays;
}

export function birthdayInYear(birthDate: CalendarDate, year: number): CalendarDate {
  return {
    year,
    month: birthDate.month,
    day: Math.min(birthDate.day, daysInCalendarMonth(year, birthDate.month)),
  };
}

export function nextBirthdayAfter(
  birthDate: CalendarDate,
  asOf: CalendarDate
): CalendarDate {
  let birthday = birthdayInYear(birthDate, asOf.year);
  if (compareCalendarDates(birthday, asOf) <= 0) {
    birthday = birthdayInYear(birthDate, asOf.year + 1);
  }
  return birthday;
}

export function formatCalendarDateLong(date: CalendarDate): string {
  return `${MONTH_NAMES[date.month - 1]} ${date.day}, ${date.year}`;
}
