"use client";

import { useState, useMemo } from "react";
import { addToast } from "@/lib/toast";

const ZODIAC = [
  { sign: "Capricorn", emoji: "\u2651", end: [1, 19] },
  { sign: "Aquarius", emoji: "\u2652", end: [2, 18] },
  { sign: "Pisces", emoji: "\u2653", end: [3, 20] },
  { sign: "Aries", emoji: "\u2648", end: [4, 19] },
  { sign: "Taurus", emoji: "\u2649", end: [5, 20] },
  { sign: "Gemini", emoji: "\u264A", end: [6, 20] },
  { sign: "Cancer", emoji: "\u264B", end: [7, 22] },
  { sign: "Leo", emoji: "\u264C", end: [8, 22] },
  { sign: "Virgo", emoji: "\u264D", end: [9, 22] },
  { sign: "Libra", emoji: "\u264E", end: [10, 22] },
  { sign: "Scorpio", emoji: "\u264F", end: [11, 21] },
  { sign: "Sagittarius", emoji: "\u2650", end: [12, 21] },
  { sign: "Capricorn", emoji: "\u2651", end: [12, 31] },
];

const CHINESE_ANIMALS = [
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
];

const CHINESE_EMOJIS: Record<string, string> = {
  Dragon: "\uD83D\uDC09",
  Snake: "\uD83D\uDC0D",
  Horse: "\uD83D\uDC0E",
  Goat: "\uD83D\uDC10",
  Monkey: "\uD83D\uDC12",
  Rooster: "\uD83D\uDC13",
  Dog: "\uD83D\uDC15",
  Pig: "\uD83D\uDC16",
  Rat: "\uD83D\uDC00",
  Ox: "\uD83D\uDC02",
  Tiger: "\uD83D\uDC05",
  Rabbit: "\uD83D\uDC07",
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getGeneration(year: number): string {
  if (year <= 1927) return "Greatest Generation";
  if (year <= 1945) return "Silent Generation";
  if (year <= 1964) return "Baby Boomers";
  if (year <= 1980) return "Gen X";
  if (year <= 1996) return "Millennials";
  if (year <= 2012) return "Gen Z";
  return "Gen Alpha";
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC) {
    if (month < z.end[0] || (month === z.end[0] && day <= z.end[1])) {
      return z;
    }
  }
  return ZODIAC[ZODIAC.length - 1];
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-lg font-semibold tabular-nums text-foreground dark:text-emerald-500">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function AgeCalculator() {
  const today = new Date().toISOString().slice(0, 10);
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(today);

  const result = useMemo(() => {
    if (!dob || !asOf) return null;
    const dobDate = new Date(dob + "T00:00:00");
    const asOfDate = new Date(asOf + "T00:00:00");
    if (isNaN(dobDate.getTime()) || isNaN(asOfDate.getTime())) return null;
    if (asOfDate < dobDate) return null;

    let years = asOfDate.getFullYear() - dobDate.getFullYear();
    let months = asOfDate.getMonth() - dobDate.getMonth();
    let days = asOfDate.getDate() - dobDate.getDate();

    if (days < 0) {
      months--;
      days += daysInMonth(
        asOfDate.getFullYear(),
        asOfDate.getMonth() - 1
      );
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor(
      (asOfDate.getTime() - dobDate.getTime()) / 86400000
    );
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Next birthday
    let nextBdayYear = asOfDate.getFullYear();
    let nextBday = new Date(
      nextBdayYear,
      dobDate.getMonth(),
      dobDate.getDate()
    );
    if (nextBday <= asOfDate) {
      nextBdayYear++;
      nextBday = new Date(
        nextBdayYear,
        dobDate.getMonth(),
        dobDate.getDate()
      );
    }
    const daysUntilBday = Math.ceil(
      (nextBday.getTime() - asOfDate.getTime()) / 86400000
    );

    const dayOfBirth = DAYS[dobDate.getDay()];
    const zodiac = getZodiac(dobDate.getMonth() + 1, dobDate.getDate());
    const chineseIdx =
      ((dobDate.getFullYear() - 2000) % 12 + 12) % 12;
    const chineseAnimal = CHINESE_ANIMALS[chineseIdx];
    const generation = getGeneration(dobDate.getFullYear());

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      nextBirthday: nextBday.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      daysUntilBday,
      dayOfBirth,
      zodiacSign: `${zodiac.emoji} ${zodiac.sign}`,
      chineseZodiac: `${CHINESE_EMOJIS[chineseAnimal] || ""} ${chineseAnimal}`,
      generation,
    };
  }, [dob, asOf]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={asOf}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            As of
          </label>
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {!result && dob && (
        <p className="text-sm text-muted-foreground text-center">
          The &quot;As of&quot; date must be on or after the date of birth.
        </p>
      )}

      {result && (
        <>
          {/* Primary result */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-2xl sm:text-3xl font-bold text-foreground dark:text-emerald-500">
              {result.years} years, {result.months} months, {result.days} days
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <StatBox label="Total Months" value={result.totalMonths} />
            <StatBox label="Total Weeks" value={result.totalWeeks} />
            <StatBox label="Total Days" value={result.totalDays} />
            <StatBox label="Hours" value={result.totalHours} />
            <StatBox label="Minutes" value={result.totalMinutes} />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <DetailBox
              label="Next Birthday"
              value={`${result.nextBirthday} (${result.daysUntilBday} days)`}
            />
            <DetailBox label="Born on" value={result.dayOfBirth} />
            <DetailBox label="Zodiac Sign" value={result.zodiacSign} />
            <DetailBox label="Chinese Zodiac" value={result.chineseZodiac} />
            <DetailBox label="Generation" value={result.generation} />
          </div>
        </>
      )}
    </div>
  );
}
