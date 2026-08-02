"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { RotateCcw, Copy, ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react";
import { addToast } from "@/lib/toast";
import { TipJar } from "@/components/tool/TipJar";
import { english200, quotes, passages, advancedPassages } from "@/lib/word-lists";
import {
  calculateTypingMetrics,
  type TypingMetrics,
} from "@/lib/p1-remediation/typing-metrics";
import {
  elapsedMilliseconds,
  monotonicNow,
} from "@/lib/p1-remediation/monotonic-timing";

// ─── Types ───────────────────────────────────────────────────────────────────

type TestMode = "time" | "words" | "quote";
type TestStatus = "idle" | "running" | "finished";
type TextTier = "simple" | "standard" | "advanced";

interface PerSecondData {
  second: number;
  wpm: number;
  rawWpm: number;
}

interface Settings {
  smoothCaret: boolean;
  liveWpm: boolean;
  sound: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePassageWords(neededWords: number = 400): string[] {
  const shuffled = [...passages].sort(() => Math.random() - 0.5);
  const combined = shuffled.join(' ');
  const words = combined.split(/\s+/).filter(w => w.length > 0);
  // Return enough words for even a 120s test (300+ words is safe)
  if (words.length >= neededWords) return words.slice(0, neededWords);
  // If somehow not enough, repeat
  const doubled = (combined + ' ' + combined).split(/\s+/).filter(w => w.length > 0);
  return doubled.slice(0, neededWords);
}

// ─── Sound ───────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function playKeyClick() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800 + Math.random() * 200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch {
    // Audio not available
  }
}

// ─── WPM Chart (SVG) ────────────────────────────────────────────────────────

function WpmChart({ data }: { data: PerSecondData[] }) {
  if (data.length < 2) return null;

  const W = 600;
  const H = 200;
  const PX = 50; // left padding
  const PY = 20; // top/bottom padding

  const maxWpm = Math.max(...data.map((d) => Math.max(d.wpm, d.rawWpm)), 10);
  const maxSec = data[data.length - 1].second;
  const yMax = Math.ceil(maxWpm / 20) * 20;

  const toX = (sec: number) => PX + ((sec / maxSec) * (W - PX - 20));
  const toY = (wpm: number) => PY + ((1 - wpm / yMax) * (H - PY * 2));

  const wpmPoints = data.map((d) => `${toX(d.second)},${toY(d.wpm)}`).join(" ");
  const rawPoints = data.map((d) => `${toX(d.second)},${toY(d.rawWpm)}`).join(" ");

  // Y axis labels
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += Math.max(20, Math.floor(yMax / 5 / 20) * 20)) {
    yTicks.push(v);
  }
  if (!yTicks.includes(yMax)) yTicks.push(yMax);

  // X axis labels
  const xTicks: number[] = [];
  const xStep = Math.max(1, Math.floor(maxSec / 6));
  for (let s = 0; s <= maxSec; s += xStep) {
    xTicks.push(s);
  }
  if (!xTicks.includes(maxSec)) xTicks.push(maxSec);

  return (
    <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[240px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
            <line x1={PX} y1={toY(v)} x2={W - 20} y2={toY(v)} stroke="currentColor" className="text-border" strokeWidth={0.5} />
            <text x={PX - 8} y={toY(v) + 4} textAnchor="end" className="fill-muted-foreground" fontSize={10}>{v}</text>
          </g>
        ))}
        {xTicks.map((s) => (
          <text key={`x-${s}`} x={toX(s)} y={H - 2} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>{s}s</text>
        ))}

        {/* Raw WPM line */}
        <polyline points={rawPoints} fill="none" stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1.5} strokeLinejoin="round" />

        {/* WPM line */}
        <polyline points={wpmPoints} fill="none" stroke="currentColor" className="text-primary dark:text-emerald-500" strokeWidth={2} strokeLinejoin="round" />

        {/* Y-axis label */}
        <text x={12} y={H / 2} textAnchor="middle" transform={`rotate(-90, 12, ${H / 2})`} className="fill-muted-foreground" fontSize={10}>WPM</text>
      </svg>
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-primary dark:bg-emerald-500 rounded" />
          WPM
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-muted-foreground/40 rounded" />
          Raw WPM
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TypingTest() {
  // ── Mode state ──
  const [testMode, setTestMode] = useState<TestMode>("time");
  const [textTier, setTextTier] = useState<TextTier>("standard");
  const [timeOption, setTimeOption] = useState(30);
  const [wordCountOption, setWordCountOption] = useState(25);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    smoothCaret: true,
    liveWpm: true,
    sound: false,
  });

  // ── Test state (React state for rendering) ──
  const [status, setStatus] = useState<TestStatus>("idle");
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [, setElapsed] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [, setLiveRawWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [perSecondData, setPerSecondData] = useState<PerSecondData[]>([]);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number } | null>(null);
  const [wordWindowStart, setWordWindowStart] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<{ text: string; attribution: string } | null>(null);
  const [finalMetrics, setFinalMetrics] = useState<TypingMetrics | null>(null);

  // ── Authoritative mutable refs for input system ──
  const wordListRef = useRef<string[]>([]);
  const currentWordIndexRef = useRef(0);
  const currentInputRef = useRef("");
  const wordWindowStartRef = useRef(0);
  const typedWordsRef = useRef<string[]>([]);

  // ── Other refs ──
  const startTimeRef = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const perSecondRef = useRef<PerSecondData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordSpansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const statusRef = useRef<TestStatus>("idle");

  // Keep statusRef in sync
  useEffect(() => { statusRef.current = status; }, [status]);

  // Keep wordListRef in sync with words state
  useEffect(() => { wordListRef.current = words; }, [words]);

  // Initialize words on mount and mode/settings change
  useEffect(() => {
    resetTest(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode, textTier, timeOption, wordCountOption]);

  // ── Reset test ──
  const resetTest = useCallback((newWords = false) => {
    // Clear timers
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (statsTimerRef.current) { clearInterval(statsTimerRef.current); statsTimerRef.current = null; }

    setStatus("idle");
    statusRef.current = "idle";
    setWordIndex(0);
    setCurrentInput("");
    setTimeLeft(testMode === "time" ? timeOption : 0);
    setElapsed(0);
    setLiveWpm(0);
    setLiveRawWpm(0);
    setLiveAccuracy(100);
    setPerSecondData([]);
    setCaretPos(null);
    setWordWindowStart(0);
    setIsFocused(false);
    setFinalMetrics(null);

    // Reset authoritative refs
    currentWordIndexRef.current = 0;
    currentInputRef.current = "";
    wordWindowStartRef.current = 0;
    typedWordsRef.current = [];

    perSecondRef.current = [];
    startTimeRef.current = -1;

    if (newWords) {
      if (testMode === "quote") {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(q);
        const quoteWords = q.text.split(/\s+/).filter(Boolean);
        setWords(quoteWords);
        wordListRef.current = quoteWords;
      } else if (textTier === "simple") {
        // Simple: shuffled common words, all lowercase, no punctuation
        const count = testMode === "time" ? 300 : wordCountOption;
        const result: string[] = [];
        while (result.length < count) result.push(...shuffleArray(english200));
        const newWordList = result.slice(0, count);
        setWords(newWordList);
        wordListRef.current = newWordList;
        setCurrentQuote(null);
      } else if (textTier === "standard") {
        // Standard: curated passages with natural prose
        const count = testMode === "time" ? 400 : wordCountOption;
        const newWordList = generatePassageWords(count);
        setWords(newWordList);
        wordListRef.current = newWordList;
        setCurrentQuote(null);
      } else {
        // Advanced: technical passages with punctuation, numbers, domain vocabulary
        const count = testMode === "time" ? 400 : wordCountOption;
        const shuffled = shuffleArray(advancedPassages);
        const combined = shuffled.join(' ');
        const allWords = combined.split(/\s+/).filter(w => w.length > 0);
        let newWordList: string[];
        if (allWords.length >= count) {
          newWordList = allWords.slice(0, count);
        } else {
          const doubled = (combined + ' ' + combined).split(/\s+/).filter(w => w.length > 0);
          newWordList = doubled.slice(0, count);
        }
        setWords(newWordList);
        wordListRef.current = newWordList;
        setCurrentQuote(null);
      }
    }
  }, [testMode, textTier, timeOption, wordCountOption]);

  // ── Start test ──
  const startTest = useCallback(() => {
    setStatus("running");
    statusRef.current = "running";
    startTimeRef.current = monotonicNow();

    if (testMode === "time") {
      setTimeLeft(timeOption);
      timerRef.current = setInterval(() => {
        const elapsedSec = Math.floor(
          elapsedMilliseconds(startTimeRef.current, monotonicNow()) / 1000
        );
        const left = timeOption - elapsedSec;
        setTimeLeft(Math.max(0, left));
        setElapsed(elapsedSec);
        if (left <= 0) {
          finishTest();
        }
      }, 200);
    } else {
      timerRef.current = setInterval(() => {
        const elapsedSec = Math.floor(
          elapsedMilliseconds(startTimeRef.current, monotonicNow()) / 1000
        );
        setElapsed(elapsedSec);
      }, 200);
    }

    // Stats timer (every second for chart data) — reads ONLY from refs to avoid stale closures
    statsTimerRef.current = setInterval(() => {
      const elapsedMs = elapsedMilliseconds(startTimeRef.current, monotonicNow());
      const elapsedSeconds = elapsedMs / 1000;
      if (elapsedSeconds <= 0) return;

      const metrics = calculateTypingMetrics({
        expectedWords: wordListRef.current,
        typedWords: typedWordsRef.current,
        completedWords: currentWordIndexRef.current,
        currentInput: currentInputRef.current,
        elapsedMs,
      });
      setLiveWpm(metrics.wpm);
      setLiveRawWpm(metrics.rawWpm);
      setLiveAccuracy(Math.round(metrics.accuracy));

      perSecondRef.current.push({
        second: Math.floor(elapsedSeconds),
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode, timeOption]);

  // ── Finish test ──
  const finishTest = useCallback(() => {
    if (statusRef.current === "finished" || startTimeRef.current < 0) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (statsTimerRef.current) { clearInterval(statsTimerRef.current); statsTimerRef.current = null; }

    const metrics = calculateTypingMetrics({
      expectedWords: wordListRef.current,
      typedWords: typedWordsRef.current,
      completedWords: currentWordIndexRef.current,
      currentInput: currentInputRef.current,
      elapsedMs: elapsedMilliseconds(startTimeRef.current, monotonicNow()),
    });

    statusRef.current = "finished";
    setStatus("finished");
    setFinalMetrics(metrics);
    setPerSecondData([...perSecondRef.current]);
  }, []);

  // ── Caret positioning (uses data-word / data-char attributes) ──
  const updateCaret = useCallback(() => {
    if (!wordsContainerRef.current) return;
    const idx = currentWordIndexRef.current;
    const charIdx = currentInputRef.current.length;

    // Try exact char position first
    const charEl = wordsContainerRef.current.querySelector(
      `[data-word="${idx}"][data-char="${charIdx}"]`
    ) as HTMLElement | null;

    if (charEl) {
      const rect = charEl.getBoundingClientRect();
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      setCaretPos({ left: rect.left - containerRect.left, top: rect.top - containerRect.top });
      return;
    }

    // If past end of word, position after the last char
    if (charIdx > 0) {
      const prevEl = wordsContainerRef.current.querySelector(
        `[data-word="${idx}"][data-char="${charIdx - 1}"]`
      ) as HTMLElement | null;
      if (prevEl) {
        const rect = prevEl.getBoundingClientRect();
        const containerRect = wordsContainerRef.current.getBoundingClientRect();
        setCaretPos({ left: rect.right - containerRect.left, top: rect.top - containerRect.top });
        return;
      }
    }

    // Fallback: beginning of word span
    const visIdx = idx - wordWindowStartRef.current;
    const wordEl = wordSpansRef.current[visIdx];
    if (wordEl) {
      const rect = wordEl.getBoundingClientRect();
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      setCaretPos({ left: rect.left - containerRect.left, top: rect.top - containerRect.top });
    }
  }, []);

  // Update caret on React state changes (for initial render and window resizes)
  useEffect(() => {
    if (status === "running" || status === "idle") {
      requestAnimationFrame(updateCaret);
    }
  }, [wordIndex, currentInput, status, wordWindowStart, updateCaret]);

  // ── Line advancement ──
  const checkLineAdvance = useCallback(() => {
    if (!wordsContainerRef.current) return;
    const containerRect = wordsContainerRef.current.getBoundingClientRect();

    // Find current word span
    const currentWordSpanIdx = currentWordIndexRef.current - wordWindowStartRef.current;
    const currentWordEl = wordSpansRef.current[currentWordSpanIdx];
    if (!currentWordEl) return;

    const currentTop = currentWordEl.getBoundingClientRect().top - containerRect.top;

    // Find first word span to get first row Y
    const firstWordEl = wordSpansRef.current[0];
    if (!firstWordEl) return;
    const firstTop = firstWordEl.getBoundingClientRect().top - containerRect.top;

    // If current word is beyond the second row, advance
    const lineHeight = parseFloat(getComputedStyle(currentWordEl).lineHeight) || currentWordEl.getBoundingClientRect().height + 8;

    if (currentTop > firstTop + lineHeight * 1.2) {
      // Find the first word on the second row
      let newStart = wordWindowStartRef.current;
      for (let i = 0; i < wordSpansRef.current.length; i++) {
        const el = wordSpansRef.current[i];
        if (!el) continue;
        const elTop = el.getBoundingClientRect().top - containerRect.top;
        if (elTop > firstTop + 2) {
          newStart = wordWindowStartRef.current + i;
          break;
        }
      }
      if (newStart > wordWindowStartRef.current) {
        wordWindowStartRef.current = newStart;
        setWordWindowStart(newStart);
      }
    }
  }, []);

  // ── Line retreat (scroll window back when backspacing into previous word) ──
  const checkLineRetreat = useCallback(() => {
    // If the current word is before the window start, we need to scroll back
    if (currentWordIndexRef.current < wordWindowStartRef.current) {
      // Find a good window start: go back to show the current word's row
      // Simple approach: set window start to the current word index (or a bit before)
      // We want to show at least one row before the current word
      const newStart = Math.max(0, currentWordIndexRef.current);
      wordWindowStartRef.current = newStart;
      setWordWindowStart(newStart);
    }
  }, []);

  // ── Sync React state from refs (called after every keystroke) ──
  const renderState = useCallback(() => {
    setWordIndex(currentWordIndexRef.current);
    setCurrentInput(currentInputRef.current);
    setWordWindowStart(wordWindowStartRef.current);
    // Caret update must happen after React renders the new state
    requestAnimationFrame(() => updateCaret());
  }, [updateCaret]);

  // ── Single keydown handler (NO keypress/keyup/input listeners) ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Tab and Shift+Tab are navigation only: do not prevent them and do not
      // let them start or mutate the typing test.
      if (e.key === "Tab") return;

      // Ctrl/Command+Enter restarts without taking over Tab focus navigation.
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.altKey) {
        e.preventDefault();
        resetTest(true);
        return;
      }

      // Ignore modifier keys except shift
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignore non-character keys
      if (["Shift", "CapsLock", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "Home", "End", "PageUp", "PageDown", "Insert", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].includes(e.key)) return;

      // If test is finished, ignore
      if (statusRef.current === "finished") return;

      // Always preventDefault for Space, Backspace, and Delete to prevent double-handling
      if (e.key === " " || e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
      }

      // Start on first keypress (not backspace/delete)
      if (statusRef.current === "idle" && e.key !== "Backspace" && e.key !== "Delete") {
        startTest();
        setIsFocused(true);
      }

      if (statusRef.current !== "running" && statusRef.current !== "idle") return;

      // Prevent default for all other typing keys too
      if (e.key.length === 1) {
        e.preventDefault();
      }

      // Play sound
      if (settings.sound) playKeyClick();

      const wordList = wordListRef.current;
      const wi = currentWordIndexRef.current;
      const currentWord = wordList[wi];
      if (!currentWord && e.key !== "Backspace") return;

      if (e.key === "Backspace" || e.key === "Delete") {
        if (currentInputRef.current.length === 0 && currentWordIndexRef.current > 0) {
          // Backspace into previous word
          typedWordsRef.current[currentWordIndexRef.current] = "";
          currentWordIndexRef.current -= 1;
          currentInputRef.current = typedWordsRef.current[currentWordIndexRef.current] ?? "";
          // Handle window scroll back if needed
          checkLineRetreat();
          renderState();
          return;
        }
        // Remove last character from current word input
        if (currentInputRef.current.length > 0) {
          currentInputRef.current = currentInputRef.current.slice(0, -1);
          typedWordsRef.current[currentWordIndexRef.current] = currentInputRef.current;
          renderState();
        }
        return;
      }

      if (e.key === " ") {
        const typed = currentInputRef.current;
        if (typed.length === 0) return; // Don't skip empty

        // Store typed input for this word
        typedWordsRef.current[currentWordIndexRef.current] = typed;

        // Advance to next word
        currentWordIndexRef.current += 1;
        currentInputRef.current = typedWordsRef.current[currentWordIndexRef.current] ?? "";

        // Check if test is done (word count or quote mode)
        if ((testMode === "words" || testMode === "quote") && currentWordIndexRef.current >= wordList.length) {
          renderState();
          setTimeout(() => finishTest(), 0);
          return;
        }

        // Sync state then check line advancement
        renderState();
        setTimeout(() => checkLineAdvance(), 10);
        return;
      }

      // Regular printable character (key.length === 1 and not space)
      if (e.key.length === 1) {
        // Allow a few extra chars beyond word length
        if (currentInputRef.current.length < currentWord.length + 8) {
          currentInputRef.current += e.key;
          typedWordsRef.current[currentWordIndexRef.current] = currentInputRef.current;
          renderState();
        }
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [settings.sound, testMode, startTest, finishTest, resetTest, checkLineAdvance, checkLineRetreat, renderState]);

  // ── Focus click handler ──
  const handleContainerClick = useCallback(() => {
    setIsFocused(true);
    containerRef.current?.focus();
  }, []);

  // ── Blur handler ──
  useEffect(() => {
    function handleFocusOut(e: FocusEvent) {
      // Check if focus left the whole page
      if (!e.relatedTarget || !(e.relatedTarget instanceof Node)) {
        // Don't unfocus if clicking inside the container
      }
    }
    document.addEventListener("focusout", handleFocusOut);
    return () => document.removeEventListener("focusout", handleFocusOut);
  }, []);

  // ── Cleanup timers on unmount ──
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    };
  }, []);

  // ── Computed results ──
  const results = useMemo(
    () =>
      status === "finished" && finalMetrics
        ? {
            ...finalMetrics,
            time: Math.round((finalMetrics.elapsedMs / 1000) * 10) / 10,
          }
        : null,
    [finalMetrics, status]
  );

  // ── Copy results ──
  const copyResults = useCallback(async () => {
    if (!results) return;
    const modeLabel = testMode === "time"
      ? `${timeOption}s`
      : testMode === "words"
        ? `${wordCountOption} words`
        : "quote";

    const text = `clevr.tools Typing Test\nWPM: ${results.wpm} | Accuracy: ${results.accuracy}% | Raw WPM: ${results.rawWpm}\nMode: ${modeLabel} | clevr.tools/type/typing-test`;
    try {
      await navigator.clipboard.writeText(text);
      addToast("Results copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [results, testMode, timeOption, wordCountOption]);

  // ── Visible words (windowed) ──
  const visibleWords = useMemo(() => {
    // Show enough words from wordWindowStart
    const end = Math.min(words.length, wordWindowStart + 80);
    return words.slice(wordWindowStart, end);
  }, [words, wordWindowStart]);

  // (char span registration removed — using data-word/data-char attributes instead)

  // ── Render ──
  const modeLabel = testMode === "time"
    ? `${timeLeft}s`
    : testMode === "words"
      ? `${wordIndex}/${words.length}`
      : `${wordIndex}/${words.length}`;

  // ── Mode buttons ──
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];

  return (
    <div className="space-y-5">
      {/* ── Mode selector ── */}
      {status !== "finished" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 px-3 py-3">
            {/* Mode tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {(["time", "words", "quote"] as TestMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTestMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    testMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "time" ? "Time" : mode === "words" ? "Words" : "Quote"}
                </button>
              ))}
            </div>

            {/* Sub-options */}
            {testMode === "time" && (
              <div className="flex items-center gap-1 ml-2">
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeOption(t)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      timeOption === t
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            )}
            {testMode === "words" && (
              <div className="flex items-center gap-1 ml-2">
                {wordOptions.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWordCountOption(w)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      wordCountOption === w
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            {/* Text complexity tier selector (not shown in quote mode) */}
            {testMode !== "quote" && (
              <div className="flex items-center gap-1 ml-2">
                {(["simple", "standard", "advanced"] as TextTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTextTier(tier)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      textTier === tier
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tier === "simple" ? "Simple" : tier === "standard" ? "Standard" : "Advanced"}
                  </button>
                ))}
              </div>
            )}

            {/* Settings toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Settings
              {settingsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Settings panel */}
          {settingsOpen && (
            <div className="border-t border-border px-3 py-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <ToggleSetting label="Smooth caret" checked={settings.smoothCaret} onChange={(v) => setSettings((s) => ({ ...s, smoothCaret: v }))} />
                <ToggleSetting label="Live WPM" checked={settings.liveWpm} onChange={(v) => setSettings((s) => ({ ...s, liveWpm: v }))} />
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  {settings.sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span>Sound</span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}
                    className={`relative h-5 w-9 rounded-full transition-colors ${settings.sound ? "bg-primary dark:bg-emerald-500" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings.sound ? "translate-x-4" : ""}`} />
                  </button>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Live stats bar ── */}
      {status === "running" && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground tabular-nums">
          {settings.liveWpm && (
            <div>
              <span className="text-foreground font-semibold">{liveWpm}</span>
              <span className="ml-1 text-xs">WPM</span>
            </div>
          )}
          <div>
            <span className="text-foreground font-semibold">{liveAccuracy}</span>
            <span className="ml-0.5 text-xs">%</span>
          </div>
          <div>
            <span className="text-foreground font-semibold">{modeLabel}</span>
          </div>
        </div>
      )}

      {/* ── Word display area ── */}
      {status !== "finished" && (
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          tabIndex={0}
          className="relative cursor-text rounded-xl border border-border bg-card px-5 py-6 min-h-[140px] select-none focus:outline-none focus:ring-2 focus:ring-primary/30 overflow-hidden"
        >
          {/* Focus hint */}
          {status === "idle" && !isFocused && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/80 backdrop-blur-[2px]">
              <p className="text-sm text-muted-foreground">
                Click to focus &middot; start typing to begin
              </p>
            </div>
          )}

          {/* Words */}
          <div ref={wordsContainerRef} className="relative text-xl leading-[2.2] font-mono tracking-wide">
            {/* Caret */}
            {(status === "running" || (status === "idle" && isFocused)) && caretPos && (
              <span
                className={`absolute w-[2px] h-[1.4em] bg-primary dark:bg-emerald-500 rounded-full z-10 ${
                  settings.smoothCaret ? "transition-all duration-100 ease-out" : ""
                } ${status === "idle" ? "animate-pulse" : ""}`}
                style={{
                  left: caretPos.left,
                  top: caretPos.top,
                }}
              />
            )}

            {visibleWords.map((word, visIdx) => {
              const absIdx = wordWindowStart + visIdx;
              const isCurrentWord = absIdx === wordIndex;
              const isPastWord = absIdx < wordIndex;

              // For completed words, get what was typed from typedWordsRef
              const pastTyped = isPastWord ? (typedWordsRef.current[absIdx] ?? "") : "";

              // Word-level classes
              let wordClassName = "inline-block mr-[0.5em]";
              if (isCurrentWord) {
                wordClassName += " bg-primary/5 rounded-sm px-0.5";
              }
              // No bg highlight for completed words — only underline if incorrect
              if (isPastWord && pastTyped !== word) {
                wordClassName += " underline decoration-red-400/60";
              }

              return (
                <span
                  key={`${absIdx}-${word}`}
                  ref={(el) => { wordSpansRef.current[visIdx] = el; }}
                  className={wordClassName}
                >
                  {word.split("").map((char, charIdx) => {
                    let cls = "text-foreground/30"; // upcoming (untyped)

                    if (isPastWord) {
                      // Completed word: faded green/red per character
                      if (charIdx < pastTyped.length) {
                        cls = pastTyped[charIdx] === char
                          ? "text-green-500/60"
                          : "text-red-400/70";
                      } else {
                        // Not typed (user typed fewer chars than word length)
                        cls = "text-red-400/40 underline";
                      }
                    } else if (isCurrentWord) {
                      if (charIdx < currentInput.length) {
                        cls = currentInput[charIdx] === char
                          ? "text-green-500"
                          : "text-red-500";
                      } else {
                        cls = "text-foreground/30"; // untyped
                      }
                    }

                    return (
                      <span
                        key={`${absIdx}-${charIdx}`}
                        data-word={absIdx}
                        data-char={charIdx}
                        className={cls}
                      >
                        {char}
                      </span>
                    );
                  })}
                  {/* Extra typed characters beyond word length (completed words) */}
                  {isPastWord && pastTyped.length > word.length &&
                    pastTyped.slice(word.length).split("").map((c, i) => (
                      <span key={`extra-${i}`} className="text-red-400/70">{c}</span>
                    ))
                  }
                  {/* Extra typed characters beyond word length (current word) */}
                  {isCurrentWord && currentInput.length > word.length &&
                    currentInput.slice(word.length).split("").map((c, i) => (
                      <span key={`extra-${i}`} className="text-red-500">{c}</span>
                    ))
                  }
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Restart hint ── */}
      {status !== "finished" && (
        <p className="text-center text-xs text-muted-foreground/60">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">Ctrl/⌘</kbd>
          {" + "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">Enter</kbd>
          {" to restart"}
        </p>
      )}

      {/* ── Results screen ── */}
      {status === "finished" && results && (
        <div className="space-y-6">
          {/* Hero stats */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-4xl sm:text-5xl font-bold text-primary dark:text-emerald-500 tabular-nums">{results.wpm}</p>
                <p className="text-xs text-muted-foreground mt-1">WPM</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">{results.accuracy}%</p>
                <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">{results.rawWpm}</p>
                <p className="text-xs text-muted-foreground mt-1">Raw WPM</p>
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatBox label="Characters" value={`${results.correctChars}/${results.incorrectChars}/${results.extraChars}/${results.missedChars}`} sub="correct / incorrect / extra / missed" />
            <StatBox label="Time" value={`${results.time}s`} />
            <StatBox label="Words" value={`${results.correctWords}/${results.incorrectWords}/${results.partialWords}`} sub="correct / incorrect / partial" />
          </div>

          {/* Quote attribution */}
          {testMode === "quote" && currentQuote && (
            <p className="text-center text-sm text-muted-foreground italic">
              &mdash; {currentQuote.attribution}
            </p>
          )}

          {/* Chart */}
          <WpmChart data={perSecondData} />

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => resetTest(false)}
              className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => resetTest(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next Test
            </button>
            <button
              onClick={copyResults}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>

          {/* Restart hint */}
          <p className="text-center text-xs text-muted-foreground/60">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">Ctrl/⌘</kbd>
            {" + "}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">Enter</kbd>
            {" to restart"}
          </p>

          <TipJar />
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleSetting({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
      <span>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary dark:bg-emerald-500" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground/60">{sub}</span>}
    </div>
  );
}
