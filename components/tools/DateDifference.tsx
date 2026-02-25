"use client";

import { useState, useMemo, useCallback } from "react";
import { addToast } from "@/lib/toast";

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const d = new Date(start);
  const endTime = end.getTime();
  const direction = start <= end ? 1 : -1;
  const actualStart = direction === 1 ? start : end;
  const actualEnd = direction === 1 ? end : start;
  const dd = new Date(actualStart);
  while (dd.getTime() <= actualEnd.getTime()) {
    const day = dd.getDay();
    if (day !== 0 && day !== 6) count++;
    dd.setDate(dd.getDate() + 1);
  }
  return count;
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

export default function DateDifference() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");

  const setShortcut = useCallback(
    (label: string) => {
      const now = new Date();
      setStartDate(today);
      let target: Date;
      switch (label) {
        case "new-year":
          target = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case "christmas": {
          target = new Date(now.getFullYear(), 11, 25);
          if (target <= now)
            target = new Date(now.getFullYear() + 1, 11, 25);
          break;
        }
        case "90-days":
          target = new Date(now.getTime() + 90 * 86400000);
          break;
        case "180-days":
          target = new Date(now.getTime() + 180 * 86400000);
          break;
        default:
          return;
      }
      setEndDate(target.toISOString().slice(0, 10));
    },
    [today]
  );

  const result = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const diffMs = end.getTime() - start.getTime();
    const daysDiff = Math.round(diffMs / 86400000);
    const absDays = Math.abs(daysDiff);
    const direction = daysDiff >= 0 ? "in the future" : "in the past";

    const weeks = Math.floor(absDays / 7);
    const remainingDays = absDays % 7;

    // Year/month calc
    const earlier = daysDiff >= 0 ? start : end;
    const later = daysDiff >= 0 ? end : start;
    let years = later.getFullYear() - earlier.getFullYear();
    let months = later.getMonth() - earlier.getMonth();
    let days = later.getDate() - earlier.getDate();
    if (days < 0) {
      months--;
      days += new Date(
        later.getFullYear(),
        later.getMonth(),
        0
      ).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const businessDays = countBusinessDays(start, end);
    const weekendDays = absDays + 1 - businessDays;

    return {
      daysDiff,
      absDays,
      direction,
      weeks,
      remainingDays,
      years,
      months,
      days,
      businessDays,
      weekendDays,
    };
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            End Date
          </label>
          <input
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

      {result && (
        <>
          {/* Primary result */}
          <div className="text-center rounded-xl border border-border bg-card p-6">
            <p className="text-3xl sm:text-4xl font-bold text-foreground dark:text-emerald-500">
              {result.absDays.toLocaleString()} days
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.direction}
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
            <StatBox label="Business Days" value={result.businessDays} />
            <StatBox label="Weekend Days" value={result.weekendDays} />
          </div>
        </>
      )}
    </div>
  );
}
