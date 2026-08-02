"use client";

import { useState, useMemo, useCallback } from "react";
import { TipJar } from "@/components/tool/TipJar";
import { CalculatorEmptyState } from "@/components/tool/CalculatorEmptyState";
import {
  addCalendarDays,
  compareCalendarDates,
  countBusinessDaysInclusive,
  differenceDateOnly,
  formatDateOnly,
  localDateInputValue,
  localDateOnly,
  parseDateOnly,
  type CalendarDate,
} from "@/lib/p1-remediation/calendar";

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

export default function DateDifference() {
  const [startDate, setStartDate] = useState(localDateInputValue);
  const [endDate, setEndDate] = useState("");

  const setShortcut = useCallback((label: string) => {
    const current = localDateOnly();
    setStartDate(formatDateOnly(current));
    let target: CalendarDate;
    switch (label) {
      case "new-year":
        target = { year: current.year + 1, month: 1, day: 1 };
        break;
      case "christmas": {
        target = { year: current.year, month: 12, day: 25 };
        if (compareCalendarDates(target, current) <= 0) {
          target = { year: current.year + 1, month: 12, day: 25 };
        }
        break;
      }
      case "90-days":
        target = addCalendarDays(current, 90);
        break;
      case "180-days":
        target = addCalendarDays(current, 180);
        break;
      default:
        return;
    }
    setEndDate(formatDateOnly(target));
  }, []);

  const result = useMemo(() => {
    if (!startDate || !endDate) {
      return { ok: false as const, emptyMessage: "Enter a start and end date to see the difference." };
    }
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) {
      return { ok: false as const, emptyMessage: "Enter a start and end date to see the difference." };
    }

    const difference = differenceDateOnly(start, end);
    const daysDiff = difference.signedDays;
    const absDays = difference.absoluteDays;
    const direction =
      difference.direction > 0
        ? "in the future"
        : difference.direction < 0
          ? "in the past"
          : "on the same day";

    const weeks = Math.floor(absDays / 7);
    const remainingDays = absDays % 7;
    const businessDays = countBusinessDaysInclusive(start, end);
    const weekendDays = absDays + 1 - businessDays;

    return {
      ok: true as const,
      daysDiff,
      absDays,
      direction,
      weeks,
      remainingDays,
      years: difference.years,
      months: difference.months,
      days: difference.days,
      businessDays,
      weekendDays,
    };
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-foreground mb-1">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            suppressHydrationWarning
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-foreground mb-1">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Quick shortcuts */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Quick shortcuts
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShortcut("new-year")}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Days until New Year
          </button>
          <button
            onClick={() => setShortcut("christmas")}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Days until Christmas
          </button>
          <button
            onClick={() => setShortcut("90-days")}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            90 days from today
          </button>
          <button
            onClick={() => setShortcut("180-days")}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            180 days from today
          </button>
        </div>
      </div>

      {result && !result.ok && <CalculatorEmptyState message={result.emptyMessage} />}

      {result?.ok && (
        <>
          {/* Primary result */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-3xl sm:text-4xl font-bold text-foreground dark:text-emerald-500 tabular-nums">
              {result.absDays.toLocaleString()} days
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.direction}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Elapsed days (end date minus start date)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Calendar months use end-of-month clamping.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox
              label="Years & Months"
              value={`${result.years}y ${result.months}m ${result.days}d`}
            />
            <StatBox
              label="Weeks"
              value={`${result.weeks}w ${result.remainingDays}d`}
            />
            <StatBox label="Business Days (inclusive)" value={result.businessDays} />
            <StatBox label="Weekend Days (inclusive)" value={result.weekendDays} />
          </div>
        </>
      )}

      <TipJar />
    </div>
  );
}
