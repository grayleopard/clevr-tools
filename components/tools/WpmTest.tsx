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

// ─── Word Lists ──────────────────────────────────────────────────────────────

const COMMON_WORDS = [
  "the","of","and","a","to","in","is","you","that","he","was","for","on","are",
  "with","as","his","they","be","at","one","have","this","from","or","had","by",
  "hot","but","some","what","there","we","can","out","other","were","all","your",
  "when","up","use","word","how","said","an","each","she","which","do","their",
  "time","if","will","way","about","many","then","them","would","write","like",
  "so","these","her","long","make","thing","see","him","two","has","look","more",
  "day","could","go","come","did","my","no","most","who","person","into","show",
  "three","small","every","where","high","give","just","because","know","take",
  "good","much","before","great","think","help","line","set","change","off",
  "play","spell","air","away","animal","house","point","page","letter","mother",
  "answer","found","still","learn","should","world","near","add","food","between",
  "own","below","country","plant","last","school","father","keep","tree","never",
  "start","city","earth","eyes","light","thought","head","under","story","saw",
  "left","few","while","along","might","close","something","seem","next","hard",
  "open","example","begin","life","always","those","both","paper","together","got",
  "group","often","run","important","until","children","side","feet","car","mile",
  "night","walk","white","sea","began","grow","took","river","four","carry",
  "state","once","book","hear","stop","without","second","later","miss","idea",
  "enough","eat","face","watch","far","real","almost","let","above","girl",
  "sometimes","mountain","cut","young","talk","soon","list","song","being","leave",
];

const EXTENDED_WORDS = [
  ...COMMON_WORDS,
  "experience","remember","different","beautiful","community","government",
  "information","opportunity","relationship","environment","technology",
  "development","performance","management","understand","particularly",
  "international","throughout","everything","everyone","nothing","someone",
  "anyone","whatever","whenever","wherever","however","therefore","although",
  "between","through","around","against","during","within","behind","beside",
  "already","another","answer","article","become","better","beyond","bring",
  "build","business","center","certain","charge","choice","clear","color",
  "common","company","complete","consider","continue","control","course",
  "create","current","dark","decision","deep","describe","detail","develop",
  "direct","discover","distance","draw","drive","early","economy","effect",
  "either","energy","entire","especially","exist","expect","fact","fall",
  "family","feel","field","figure","fill","final","find","follow","force",
  "form","free","full","further","game","general","given","glass","growth",
  "guess","hand","happen","heart","history","hold","home","hope","hour",
  "human","image","impact","include","increase","individual","industry",
  "inside","instead","interest","involve","issue","item","kind","land",
  "large","late","level","live","local","lose","love","main","many","market",
  "matter","mean","meet","member","mind","model","money","music","name",
  "national","natural","need","note","number","offer","only","order",
  "outside","over","page","part","past","pattern","people","personal",
  "piece","place","plan","power","present","problem","process","produce",
  "public","pull","purpose","push","question","quickly","quite","raise",
  "reach","reason","remain","right","rise","road","role","rule","save",
  "seem","sense","serve","short","since","size","skill","social","sound",
  "south","space","step","support","sure","table","tell","thus","toward",
  "true","turn","usually","value","view","voice","want","well","wide",
  "work","write","year","young","accept","achieve","across","actually",
  "address","agree","allow","amount","appear","apply","area","argue",
  "attention","available","aware","base","beat","beauty","benefit","bit",
  "board","born","bottom","break","brother","budget","camera","campaign",
  "cancer","candidate","capital","career","catch","cause","cell","chair",
  "challenge","chance","chapter","character","check","child","church",
  "citizen","claim","class","coach","cold","collection","college","compare",
  "computer","concern","condition","conference","congress","consumer","contain",
  "cost","could","couple","cover","crime","culture","cup","customer","data",
  "daughter","dead","deal","death","debate","decade","defense","degree",
  "Democrat","department","design","despite","determine","difference",
  "difficult","dinner","direction","director","discuss","discussion",
  "disease","doctor","dog","door","dream","drop","drug","during","edge",
  "education","effort","eight","election","else","employee","enjoy","enter",
  "environmental","establish","even","evening","event","evidence","exactly",
  "executive","expert","explain","eye","factor","fail","fast","fear","federal",
  "fight","finger","fire","firm","fish","five","floor","fly","focus","foot",
  "foreign","forget","former","forward","four","friend","front","fund",
  "future","garden","gas","generation","girl","goal","green","ground",
  "hair","half","hang","happy","health","heat","heavy","herself","him",
  "himself","hit","hotel","huge","hundred","husband","identify","imagine",
];

const NUMBER_WORDS = [
  "the 42 keys","100 percent","send 3 copies","file 17b","page 256",
  "room 404","5 stars","9 items","order 1092","23 miles","80 degrees",
  "2024 update","call 555-0123","zip 90210","flight 747","code 200",
  "version 3.1","score 98","weight 150","price $29.99","port 8080",
  "ssh -p 22","chmod 755","exit 0","apt 2.5","node 18","batch 64",
  "http 301","offset 128","index 0","rgba 255","hex #ff0000","test 47",
  "row 12","col 8","level 99","rank 1","step 5","phase 2","retry 3",
  "max 1024",
];

const PUNCTUATION_SENTENCES = [
  "Hello, world! How are you doing today?",
  "She said, \"I'll be there at 5:00 PM.\"",
  "The quick brown fox jumps over the lazy dog.",
  "Wait — did you hear that? I'm not sure.",
  "To be, or not to be: that is the question.",
  "Error: file not found (check path/to/file).",
  "Dear Mr. Smith, please confirm your order #4521.",
  "Note: items marked with * are required fields.",
  "The temperature was -5°C; we stayed inside.",
  "Use ctrl+c to copy and ctrl+v to paste.",
  "Why? Because it's the right thing to do!",
  "He scored 95%; she scored 97% — both passed.",
  "Call (555) 123-4567 for more information.",
  "Price: $19.99/month or $199.99/year — save 15%!",
  "The file [report_v2.pdf] has been uploaded.",
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Duration = 15 | 30 | 60 | 120;
type WordSet = "common" | "extended" | "numbers" | "punctuation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWords(wordSet: WordSet, count: number): string[] {
  if (wordSet === "numbers") {
    // Mix number phrases — split each phrase into words
    const shuffled = shuffleArray(NUMBER_WORDS);
    const all: string[] = [];
    while (all.length < count) {
      for (const phrase of shuffled) {
        all.push(...phrase.split(" "));
        if (all.length >= count) break;
      }
    }
    return all.slice(0, count);
  }

  if (wordSet === "punctuation") {
    // Use sentences split into words
    const shuffled = shuffleArray(PUNCTUATION_SENTENCES);
    const all: string[] = [];
    while (all.length < count) {
      for (const sentence of shuffled) {
        all.push(...sentence.split(" "));
        if (all.length >= count) break;
      }
    }
    return all.slice(0, count);
  }

  const source = wordSet === "extended" ? EXTENDED_WORDS : COMMON_WORDS;
  const result: string[] = [];
  while (result.length < count) {
    result.push(...shuffleArray(source));
  }
  return result.slice(0, count);
}

function getPercentile(wpm: number): number {
  if (wpm < 20) return 5;
  if (wpm < 30) return 15;
  if (wpm < 40) return 35;
  if (wpm < 50) return 55;
  if (wpm < 60) return 70;
  if (wpm < 70) return 82;
  if (wpm < 80) return 88;
  if (wpm < 90) return 93;
  if (wpm < 100) return 96;
  if (wpm < 120) return 98;
  return 99;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WpmTest() {
  const [duration, setDuration] = useState<Duration>(60);
  const [wordSet, setWordSet] = useState<WordSet>("common");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
  } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordWindowStart, setWordWindowStart] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const statusRef = useRef<"idle" | "running" | "done">("idle");
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordSpansRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Track per-word typed text (for past words)
  const typedWordsRef = useRef<
    { typed: string; correct: number; incorrect: number }[]
  >([]);

  // Sync status ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Initialize words
  useEffect(() => {
    resetTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordSet, duration]);

  const resetTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const wordCount = Math.max(300, duration * 3);
    setWords(generateWords(wordSet, wordCount));
    setCurrentWordIndex(0);
    setCurrentInput("");
    setCorrectChars(0);
    setIncorrectChars(0);
    setTimeLeft(duration);
    setStatus("idle");
    setIsFocused(false);
    setResult(null);
    setIsNewPB(false);
    setCopied(false);
    setWordWindowStart(0);
    typedWordsRef.current = [];
  }, [wordSet, duration]);

  const endTest = useCallback(
    (finalCorrectChars: number, finalIncorrectChars: number) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const elapsed = duration; // full duration elapsed
      const wpm = Math.round(finalCorrectChars / 5 / (elapsed / 60));
      const totalChars = finalCorrectChars + finalIncorrectChars;
      const accuracy =
        totalChars > 0
          ? Math.round((finalCorrectChars / totalChars) * 1000) / 10
          : 100;

      const r = {
        wpm,
        accuracy,
        correctChars: finalCorrectChars,
        incorrectChars: finalIncorrectChars,
      };
      setResult(r);
      setStatus("done");
      setIsFocused(false);

      // Check personal best
      const mode = `${duration}s`;
      const pb = getPersonalBest("wpm-test", mode);
      if (!pb || wpm > pb.wpm) {
        setIsNewPB(true);
      }

      // Save session
      saveSession({
        id: crypto.randomUUID(),
        tool: "wpm-test",
        mode,
        wpm,
        accuracy,
        correctChars: finalCorrectChars,
        incorrectChars: finalIncorrectChars,
        totalChars,
        duration: elapsed,
        timestamp: Date.now(),
      });
      updateStreak();
    },
    [duration]
  );

  // We use refs to track chars for the timer callback
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  useEffect(() => {
    correctCharsRef.current = correctChars;
  }, [correctChars]);
  useEffect(() => {
    incorrectCharsRef.current = incorrectChars;
  }, [incorrectChars]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = duration - elapsed;
      if (left <= 0) {
        setTimeLeft(0);
        endTest(correctCharsRef.current, incorrectCharsRef.current);
      } else {
        setTimeLeft(left);
      }
    }, 200);
  }, [duration, endTest]);

  // Line advancement check
  const checkLineAdvance = useCallback(
    (newWordIndex: number) => {
      if (!wordsContainerRef.current) return;
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const visIdx = newWordIndex - wordWindowStart;
      const currentWordEl = wordSpansRef.current[visIdx];
      if (!currentWordEl) return;

      const currentTop =
        currentWordEl.getBoundingClientRect().top - containerRect.top;
      const firstWordEl = wordSpansRef.current[0];
      if (!firstWordEl) return;
      const firstTop =
        firstWordEl.getBoundingClientRect().top - containerRect.top;

      const lineHeight =
        parseFloat(getComputedStyle(currentWordEl).lineHeight) ||
        currentWordEl.getBoundingClientRect().height + 8;

      if (currentTop > firstTop + lineHeight * 1.2) {
        // Find the first word on the second row
        let newStart = wordWindowStart;
        for (let i = 0; i < wordSpansRef.current.length; i++) {
          const el = wordSpansRef.current[i];
          if (!el) continue;
          const elTop = el.getBoundingClientRect().top - containerRect.top;
          if (elTop > firstTop + 2) {
            newStart = wordWindowStart + i;
            break;
          }
        }
        if (newStart > wordWindowStart) {
          setWordWindowStart(newStart);
        }
      }
    },
    [wordWindowStart]
  );

  // Handle keydown on the hidden input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (statusRef.current === "done") return;

      // Start on first keypress
      if (
        statusRef.current === "idle" &&
        e.key !== "Backspace" &&
        e.key !== "Delete"
      ) {
        setStatus("running");
        setIsFocused(true);
        startTimer();
      }

      if (e.key === " ") {
        e.preventDefault();
        if (statusRef.current !== "running") return;

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

        typedWordsRef.current[currentWordIndex] = {
          typed: input,
          correct,
          incorrect,
        };
        setCorrectChars((prev) => prev + correct);
        setIncorrectChars((prev) => prev + incorrect);

        const nextIdx = currentWordIndex + 1;
        setCurrentWordIndex(nextIdx);
        setCurrentInput("");

        // Check line advancement after render
        setTimeout(() => checkLineAdvance(nextIdx), 10);
      } else if (e.key === "Backspace") {
        // Allow backspace within current word only
        if (currentInput.length > 0) {
          setCurrentInput((prev) => prev.slice(0, -1));
        }
        // Do NOT go back to previous word
      }
    },
    [words, currentWordIndex, currentInput, startTimer, checkLineAdvance]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (statusRef.current === "done") return;
      const val = e.target.value;
      // Only accept printable characters, no spaces (handled via keydown)
      if (val.endsWith(" ")) return;
      const word = words[currentWordIndex];
      if (!word) return;
      // Limit input length
      if (val.length <= word.length + 8) {
        setCurrentInput(val);
      }
    },
    [words, currentWordIndex]
  );

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `clevr.tools WPM Test\nWPM: ${result.wpm} | Accuracy: ${result.accuracy}%\nMode: ${duration}s ${wordSet} | clevr.tools/type/wpm-test`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Results copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [result, duration, wordSet]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Visible words (windowed)
  const visibleWords = useMemo(() => {
    const end = Math.min(words.length, wordWindowStart + 80);
    return words.slice(wordWindowStart, end);
  }, [words, wordWindowStart]);

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Mode selectors */}
      <div
        className={`space-y-3 transition-opacity duration-300 ${
          isFocused && status === "running"
            ? "opacity-30 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Duration buttons */}
        <div className="flex gap-2">
          {([15, 30, 60, 120] as Duration[]).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              title={`${d} second test`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                duration === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
        {/* Word set buttons */}
        <div className="flex flex-wrap gap-2">
          {(["common", "extended", "numbers", "punctuation"] as WordSet[]).map(
            (ws) => (
              <button
                key={ws}
                onClick={() => setWordSet(ws)}
                title={`${ws} word set`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  wordSet === ws
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {ws === "common"
                  ? "Common Words"
                  : ws === "extended"
                    ? "Extended"
                    : ws.charAt(0).toUpperCase() + ws.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Typing zone */}
      {status !== "done" ? (
        <div
          className="relative rounded-xl bg-gray-900 p-6 cursor-text min-h-[200px]"
          onClick={handleContainerClick}
        >
          {/* Character display */}
          <div
            ref={wordsContainerRef}
            className="font-mono text-xl leading-[2.2] select-none overflow-hidden"
            style={{ maxHeight: "calc(2.2em * 3)" }}
          >
            {visibleWords.map((word, visIdx) => {
              const absIdx = wordWindowStart + visIdx;
              const isCurrentWord = absIdx === currentWordIndex;
              const isPastWord = absIdx < currentWordIndex;
              const pastData = isPastWord
                ? typedWordsRef.current[absIdx]
                : null;
              const pastTyped = pastData?.typed ?? "";

              return (
                <span
                  key={`${absIdx}-${word}`}
                  ref={(el) => {
                    wordSpansRef.current[visIdx] = el;
                  }}
                  className="inline-block mr-[0.5em]"
                >
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
                        // Cursor position
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
          <div className="mt-4 text-center text-2xl font-mono text-gray-400 tabular-nums">
            {timeLeft}
          </div>

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
            aria-label="Type here to take the WPM test"
          />

          {status === "idle" && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Click here or start typing to begin
            </p>
          )}
        </div>
      ) : (
        /* Results screen */
        <div className="rounded-xl bg-gray-900 p-8 text-center animate-in fade-in duration-300">
          {/* WPM large in brand blue */}
          <div className="text-7xl font-bold text-primary mb-2">
            {result?.wpm}
          </div>
          <div className="text-gray-400 text-sm mb-6">WPM</div>

          {isNewPB && (
            <div className="text-yellow-400 font-medium mb-4">
              New Personal Best!
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
                {result?.correctChars}
              </div>
              <div className="text-xs text-gray-400">Correct Chars</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {duration}s
              </div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
          </div>

          {/* Percentile */}
          <div className="inline-block bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 mb-6">
            You type faster than ~{getPercentile(result?.wpm || 0)}% of people
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetTest}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
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
    </div>
  );
}
