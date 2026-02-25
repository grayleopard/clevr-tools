"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, X } from "lucide-react";

const GRADE_MAP: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

const GRADES = Object.keys(GRADE_MAP);

interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

let nextId = 5;

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", credits: "3", grade: "" },
    { id: 2, name: "", credits: "3", grade: "" },
    { id: 3, name: "", credits: "3", grade: "" },
    { id: 4, name: "", credits: "3", grade: "" },
  ]);
  const [showCumulative, setShowCumulative] = useState(false);
  const [prevGpa, setPrevGpa] = useState("");
  const [prevCredits, setPrevCredits] = useState("");
  const [showGradeScale, setShowGradeScale] = useState(false);

  const addCourse = useCallback(() => {
    setCourses((prev) => [
      ...prev,
      { id: nextId++, name: "", credits: "3", grade: "" },
    ]);
  }, []);

  const removeCourse = useCallback((id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCourse = useCallback(
    (id: number, field: keyof Course, value: string) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const result = useMemo(() => {
    const validCourses = courses.filter(
      (c) => c.grade !== "" && parseFloat(c.credits) > 0
    );

    if (validCourses.length === 0) return null;

    const totalCredits = validCourses.reduce(
      (sum, c) => sum + (parseFloat(c.credits) || 0),
      0
    );
    const totalPoints = validCourses.reduce(
      (sum, c) =>
        sum + (parseFloat(c.credits) || 0) * (GRADE_MAP[c.grade] ?? 0),
      0
    );

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const gpaRounded = Math.round(gpa * 1000) / 1000;

    let cumulativeGpa: number | null = null;
    if (showCumulative) {
      const prev = parseFloat(prevGpa) || 0;
      const prevCred = parseFloat(prevCredits) || 0;
      if (prevCred > 0) {
        cumulativeGpa =
          (prev * prevCred + gpa * totalCredits) / (prevCred + totalCredits);
        cumulativeGpa = Math.round(cumulativeGpa * 1000) / 1000;
      }
    }

    return { gpa: gpaRounded, totalCredits, totalPoints, cumulativeGpa };
  }, [courses, showCumulative, prevGpa, prevCredits]);

  const gpaColor = (gpa: number) => {
    if (gpa >= 3.7) return "text-foreground dark:text-emerald-500";
    if (gpa >= 3.0) return "text-blue-600 dark:text-blue-400";
    if (gpa >= 2.0) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Course table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_100px_40px] sm:grid-cols-[1fr_80px_120px_40px] gap-2 border-b border-border bg-muted/20 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            Course
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Credits
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Grade
          </span>
          <span />
        </div>

        {/* Rows */}
        {courses.map((course) => (
          <div
            key={course.id}
            className="grid grid-cols-[1fr_80px_100px_40px] sm:grid-cols-[1fr_80px_120px_40px] gap-2 border-b border-border last:border-0 px-3 py-2 items-center"
          >
            <input
              type="text"
              value={course.name}
              onChange={(e) => updateCourse(course.id, "name", e.target.value)}
              placeholder="Course name (optional)"
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <input
              type="number"
              min="0"
              max="10"
              value={course.credits}
              onChange={(e) =>
                updateCourse(course.id, "credits", e.target.value)
              }
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <select
              value={course.grade}
              onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">--</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeCourse(course.id)}
              disabled={courses.length <= 1}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add course button */}
      <button
        onClick={addCourse}
        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Plus className="h-4 w-4" /> Add Course
      </button>

      {/* GPA result */}
      {result && (
        <div className="text-center rounded-xl border border-border bg-card p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Semester GPA</p>
          <p className={`text-4xl sm:text-5xl font-bold ${gpaColor(result.gpa)}`}>
            {result.gpa.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {result.totalCredits} credits | {result.totalPoints.toFixed(1)}{" "}
            grade points
          </p>
        </div>
      )}

      {/* Grade scale */}
      <button
        onClick={() => setShowGradeScale(!showGradeScale)}
        className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {showGradeScale ? "Hide Grade Scale" : "Show Grade Scale"}
      </button>

      {showGradeScale && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {GRADES.map((g) => (
              <div
                key={g}
                className="flex flex-col items-center rounded-lg bg-muted/30 px-2 py-2"
              >
                <span className="text-sm font-semibold text-foreground">
                  {g}
                </span>
                <span className="text-xs text-muted-foreground">
                  {GRADE_MAP[g].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cumulative GPA */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowCumulative(!showCumulative)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <span>Cumulative GPA Calculator</span>
          <span className="text-muted-foreground">
            {showCumulative ? "\u25B2" : "\u25BC"}
          </span>
        </button>

        {showCumulative && (
          <div className="border-t border-border px-4 py-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Previous GPA
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={prevGpa}
                  onChange={(e) => setPrevGpa(e.target.value)}
                  placeholder="e.g., 3.5"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Previous Credit Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={prevCredits}
                  onChange={(e) => setPrevCredits(e.target.value)}
                  placeholder="e.g., 60"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {result?.cumulativeGpa !== null && result?.cumulativeGpa !== undefined && (
              <div className="text-center rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  New Cumulative GPA
                </p>
                <p
                  className={`text-3xl font-bold ${gpaColor(result.cumulativeGpa)}`}
                >
                  {result.cumulativeGpa.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
