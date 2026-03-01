"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import {
  saveSession,
  updateStreak,
  getPersonalBest,
} from "@/lib/typing-stats";
import { addToast } from "@/lib/toast";
import StreakDisplay from "./StreakDisplay";
import TypingHistory from "./TypingHistory";

// ─── Passages ──────────────────────────────────────────────────────────────

const PASSAGES = [
  "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible.",
  "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
  "The best time to plant a tree was twenty years ago. The second best time is now. Start where you are and use what you have.",
  "Science is not only a discipline of reason but also one of romance and passion. The desire to understand is natural to curious minds.",
  "In the middle of every difficulty lies opportunity. The secret of getting ahead is getting started with what you already have.",
  "The function of good software is to make the complex appear to be simple. Complexity managed is progress made.",
  "First, solve the problem. Then, write the code. Most developers write the code and then wonder why the problem persists.",
  "The most important property of a program is whether it accomplishes the intention of its user. Clarity is the foundation of all good writing.",
  "Talk is cheap. Show me the code. Actions speak louder than words in the world of software development.",
  "Simplicity is the soul of efficiency. The simpler the solution, the more elegant and maintainable the result.",
  "The only way to learn a new programming language is by writing programs in it. Theory alone is never enough.",
  "Good code is its own best documentation. As you are about to add a comment, ask yourself how to make the code speak for itself.",
  "Software is a great combination between artistry and engineering. When you finally get the code right, it is a beautiful thing.",
  "The best error message is the one that never shows up. Design systems that prevent mistakes rather than just reporting them.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Walking on water and developing software from a specification are easy if both are frozen. Requirements change and that is normal.",
  "The computer was born to solve problems that did not exist before. Technology creates the questions it then proceeds to answer.",
  "Measuring programming progress by lines of code is like measuring flight progress by fuel consumed. Efficiency matters more.",
  "The most dangerous phrase in any language is we have always done it this way. Innovation requires questioning assumptions.",
  "Give a man a program, frustrate him for a day. Teach a man to program, frustrate him for a lifetime of learning.",
  "It is not enough to do your best. You must know what to do, and then do your best. Preparation precedes execution.",
  "The key to performance is elegance, not battalions of special cases. Elegant code scales while special cases do not.",
  "Optimism is an occupational hazard of programming. Testing is the treatment. Ship carefully and test thoroughly.",
  "The most effective debugging tool is still careful thought, coupled with judiciously placed print statements.",
  "Everyone knows that debugging is twice as hard as writing a program in the first place. So if you are as clever as you can be when you write it, how will you ever debug it.",
  "The value of a prototype is in the education it gives you, not in the code itself. Throw it away and build it right.",
  "A language that does not affect the way you think about programming is not worth knowing. Expand your mental toolkit.",
  "Before software can be reusable it first has to be usable. Focus on correctness before optimization.",
  "The greatest performance improvement of all is when a system goes from not working to working. Never underestimate reliability.",
  "Deleted code is debugged code. The best code is no code at all. Every line you write is a liability.",
];

// ─── Types ──────────────────────────────────────────────────────────────────

type Difficulty = "casual" | "average" | "fast" | "pro" | "expert";
type Status = "idle" | "racing" | "won" | "lost";

const DIFFICULTY_WPM: Record<Difficulty, number> = {
  casual: 40,
  average: 60,
  fast: 80,
  pro: 100,
  expert: 120,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function pickPassage(): string {
  return PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TypingRace() {
  const [difficulty, setDifficulty] = useState<Difficulty>("average");
  const [passage, setPassage] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [isFocused, setIsFocused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ghostProgress, setGhostProgress] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    elapsedSec: number;
    won: boolean;
    beatGhostBySec: number | null;
  } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<Status>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  const currentWordIndexRef = useRef(0);
  const wordsRef = useRef<string[]>([]);

  // Per-word typed text for coloring past words
  const typedWordsRef = useRef<
    { typed: string; correct: number; incorrect: number }[]
  >([]);

  // Sync refs
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    correctCharsRef.current = correctChars;
  }, [correctChars]);
  useEffect(() => {
    incorrectCharsRef.current = incorrectChars;
  }, [incorrectChars]);
  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  // Initialize passage
  useEffect(() => {
    resetRace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const resetRace = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const p = pickPassage();
    const w = p.split(" ");
    setPassage(p);
    setWords(w);
    wordsRef.current = w;
    setCurrentWordIndex(0);
    currentWordIndexRef.current = 0;
    setCurrentInput("");
    setStatus("idle");
    setIsFocused(false);
    setStartTime(0);
    setElapsedMs(0);
    setGhostProgress(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    correctCharsRef.current = 0;
    incorrectCharsRef.current = 0;
    setResult(null);
    setIsNewPB(false);
    setCopied(false);
    typedWordsRef.current = [];
  }, []);

  const userProgress = useMemo(() => {
    if (words.length === 0) return 0;
    return Math.min(1, currentWordIndex / words.length);
  }, [currentWordIndex, words.length]);

  const currentWpm = useMemo(() => {
    if (elapsedMs < 1000) return 0;
    return Math.round(correctChars / 5 / (elapsedMs / 60000));
  }, [correctChars, elapsedMs]);

  const endRace = useCallback(
    (userWon: boolean) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const finalElapsedMs = Date.now() - startTime;
      const finalElapsedSec = finalElapsedMs / 1000;
      const totalChars = correctCharsRef.current + incorrectCharsRef.current;
      const wpm = Math.round(
        correctCharsRef.current / 5 / (finalElapsedSec / 60)
      );
      const accuracy =
        totalChars > 0
          ? Math.round((correctCharsRef.current / totalChars) * 1000) / 10
          : 100;

      // Calculate ghost completion time
      const ghostWpm = DIFFICULTY_WPM[difficulty];
      const totalPassageChars = passage.length;
      const ghostCharsPerMs = (ghostWpm * 5) / 60000;
      const ghostCompletionMs = totalPassageChars / ghostCharsPerMs;

      let beatGhostBySec: number | null = null;
      if (userWon) {
        beatGhostBySec = Math.round((ghostCompletionMs - finalElapsedMs) / 100) / 10;
      }

      const r = {
        wpm,
        accuracy,
        elapsedSec: Math.round(finalElapsedSec * 10) / 10,
        won: userWon,
        beatGhostBySec,
      };
      setResult(r);
      setStatus(userWon ? "won" : "lost");
      setIsFocused(false);
      setElapsedMs(finalElapsedMs);

      // Check personal best
      const mode = difficulty;
      const pb = getPersonalBest("race", mode);
      setPreviousBest(pb ? pb.wpm : null);
      if (!pb || wpm > pb.wpm) {
        setIsNewPB(true);
      }

      // Save session
      saveSession({
        id: crypto.randomUUID(),
        tool: "race",
        mode,
        wpm,
        accuracy,
        correctChars: correctCharsRef.current,
        incorrectChars: incorrectCharsRef.current,
        totalChars,
        duration: Math.round(finalElapsedSec),
        timestamp: Date.now(),
      });
      updateStreak();
      setHistoryRefresh((prev) => prev + 1);
    },
    [startTime, difficulty, passage]
  );

  const startRace = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setStatus("racing");
    setIsFocused(true);

    const ghostWpm = DIFFICULTY_WPM[difficulty];
    const totalChars = passage.length;
    const ghostCharsPerMs = (ghostWpm * 5) / 60000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - now;
      setElapsedMs(elapsed);

      const newGhostProgress = Math.min(
        1,
        (elapsed * ghostCharsPerMs) / totalChars
      );
      setGhostProgress(newGhostProgress);

      // Check if ghost finished
      if (newGhostProgress >= 1 && statusRef.current === "racing") {
        // Ghost wins
        setGhostProgress(1);
        // Small timeout to let state settle
        setTimeout(() => {
          if (statusRef.current === "racing") {
            endRace(false);
          }
        }, 0);
      }
    }, 50);
  }, [difficulty, passage, endRace]);

  // Handle keydown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (statusRef.current === "won" || statusRef.current === "lost") return;

      // Start on first keypress
      if (
        statusRef.current === "idle" &&
        e.key !== "Backspace" &&
        e.key !== "Delete"
      ) {
        startRace();
      }

      if (e.key === " ") {
        if (statusRef.current !== "racing") return;

        const word = words[currentWordIndex];
        const input = currentInput;
        if (input.length === 0) return;

        // Calculate per-character correct/incorrect
        let correct = 0;
        let incorrect = 0;
        const maxLen = Math.max(word.length, input.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < input.length && i < word.length && input[i] === word[i]) {
            correct++;
          } else {
            incorrect++;
          }
        }
        // Add +1 for the space character (correct)
        correct++;

        typedWordsRef.current[currentWordIndex] = {
          typed: input,
          correct: correct - 1,
          incorrect,
        };

        const newCorrect = correctCharsRef.current + correct;
        const newIncorrect = incorrectCharsRef.current + incorrect;
        setCorrectChars(newCorrect);
        correctCharsRef.current = newCorrect;
        setIncorrectChars(newIncorrect);
        incorrectCharsRef.current = newIncorrect;

        const nextIdx = currentWordIndex + 1;
        setCurrentWordIndex(nextIdx);
        currentWordIndexRef.current = nextIdx;
        setCurrentInput("");

        // Check if user finished
        if (nextIdx >= words.length) {
          endRace(true);
        }
      } else if (e.key === "Backspace") {
        if (currentInput.length > 0) {
          setCurrentInput((prev) => prev.slice(0, -1));
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (statusRef.current !== "racing" && statusRef.current !== "idle")
          return;
        const word = words[currentWordIndex];
        if (!word) return;
        if (currentInput.length < word.length + 8) {
          setCurrentInput((prev) => prev + e.key);
        }
      }
    },
    [words, currentWordIndex, currentInput, startRace, endRace]
  );

  const handleChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>) => {},
    []
  );

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `clevr.tools Typing Race\nWPM: ${result.wpm} | Accuracy: ${result.accuracy}%\n${result.won ? "Beat the " + difficulty + " ghost!" : "Lost to the " + difficulty + " ghost"} | clevr.tools/type/race`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Results copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [result, difficulty]);

  // Auto-focus on mount and after reset
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [passage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const isFinished = status === "won" || status === "lost";

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Difficulty selector */}
      <div
        className={`transition-opacity duration-300 ${
          isFocused && status === "racing"
            ? "opacity-30 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {(
            ["casual", "average", "fast", "pro", "expert"] as Difficulty[]
          ).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              title={`${d} difficulty (${DIFFICULTY_WPM[d]} WPM ghost)`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                difficulty === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d} ({DIFFICULTY_WPM[d]} WPM)
            </button>
          ))}
        </div>
      </div>

      {/* Typing zone */}
      {!isFinished ? (
        <div
          className="relative rounded-xl bg-gray-900 p-6 cursor-text min-h-[280px]"
          onClick={handleContainerClick}
        >
          {/* Progress bars */}
          {status === "racing" && (
            <div className="mb-6 space-y-3">
              {/* You */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-12">You</span>
                <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{
                      width: `${Math.round(userProgress * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-300 w-24 text-right font-mono tabular-nums">
                  {Math.round(userProgress * 100)}% &middot; {currentWpm} WPM
                </span>
              </div>
              {/* Ghost */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-12">Ghost</span>
                <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500 rounded-full transition-all duration-100"
                    style={{
                      width: `${Math.round(ghostProgress * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-24 text-right font-mono tabular-nums">
                  {Math.round(ghostProgress * 100)}% &middot;{" "}
                  {DIFFICULTY_WPM[difficulty]} WPM
                </span>
              </div>
            </div>
          )}

          {/* Character display */}
          <div className="font-mono text-xl leading-[2.2] select-none overflow-hidden">
            {words.map((word, absIdx) => {
              const isCurrentWord = absIdx === currentWordIndex;
              const isPastWord = absIdx < currentWordIndex;
              const pastData = isPastWord
                ? typedWordsRef.current[absIdx]
                : null;
              const pastTyped = pastData?.typed ?? "";

              return (
                <span key={`${absIdx}-${word}`} className="inline-block mr-[0.5em]">
                  {word.split("").map((char, charIdx) => {
                    let cls = "text-gray-500"; // future

                    if (isPastWord) {
                      if (charIdx < pastTyped.length) {
                        cls =
                          pastTyped[charIdx] === char
                            ? "text-white"
                            : "text-red-400";
                      } else {
                        cls = "text-red-400/50";
                      }
                    } else if (isCurrentWord) {
                      if (charIdx < currentInput.length) {
                        cls =
                          currentInput[charIdx] === char
                            ? "text-white"
                            : "text-red-400";
                      } else if (charIdx === currentInput.length) {
                        cls = "text-white border-b-2 border-white";
                      } else {
                        cls = "text-gray-500";
                      }
                    }

                    return (
                      <span key={`${absIdx}-${charIdx}`} className={cls}>
                        {char}
                      </span>
                    );
                  })}
                  {/* Extra typed characters beyond word length (past words) */}
                  {isPastWord &&
                    pastTyped.length > word.length &&
                    pastTyped
                      .slice(word.length)
                      .split("")
                      .map((c, i) => (
                        <span key={`extra-${i}`} className="text-red-400">
                          {c}
                        </span>
                      ))}
                  {/* Extra typed characters (current word) */}
                  {isCurrentWord &&
                    currentInput.length > word.length &&
                    currentInput
                      .slice(word.length)
                      .split("")
                      .map((c, i) => (
                        <span key={`extra-${i}`} className="text-red-400">
                          {c}
                        </span>
                      ))}
                </span>
              );
            })}
          </div>

          {/* Timer */}
          {status === "racing" && (
            <div className="mt-4 text-center text-2xl font-mono text-gray-400 tabular-nums">
              {(elapsedMs / 1000).toFixed(1)}s
            </div>
          )}

          {/* Hidden input */}
          <input
            ref={inputRef}
            value={currentInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 opacity-0 cursor-default"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Type here to race"
          />

          {status === "idle" && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Click here or start typing to begin the race
            </p>
          )}
        </div>
      ) : (
        /* Results screen */
        <div className="rounded-xl bg-gray-900 p-8 text-center animate-in fade-in duration-300">
          {/* Win/Loss banner */}
          <div className="mb-4">
            {result?.won ? (
              <div className="text-3xl font-bold text-yellow-400">
                You Win!
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-400">
                Ghost Wins
              </div>
            )}
          </div>

          {/* WPM large */}
          <div className="text-7xl font-bold text-primary mb-2">
            {result?.wpm}
          </div>
          <div className="text-gray-400 text-sm mb-6">WPM</div>

          {isNewPB && (
            <div className="text-yellow-400 font-medium mb-4">
              New Personal Best!
            </div>
          )}
          {!isNewPB && previousBest !== null && (
            <div className="text-sm text-gray-500 mb-4">
              Personal best: {previousBest} WPM
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.accuracy}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.elapsedSec}s
              </div>
              <div className="text-xs text-gray-400">Time</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums capitalize">
                {difficulty}
              </div>
              <div className="text-xs text-gray-400">Difficulty</div>
            </div>
          </div>

          {/* Beat ghost by */}
          {result?.won && result.beatGhostBySec !== null && (
            <div className="inline-block bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 mb-6">
              Beat the ghost by {result.beatGhostBySec}s
            </div>
          )}

          {!result?.won && (
            <div className="inline-block bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 mb-6">
              You reached {Math.round(userProgress * 100)}% at {result?.wpm} WPM
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetRace}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Race Again
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-2.5 rounded-lg bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
            >
              {copied ? "Copied!" : "Share Result"}
            </button>
          </div>
        </div>
      )}

      <TypingHistory tool="race" refreshTrigger={historyRefresh} />
    </div>
  );
}
