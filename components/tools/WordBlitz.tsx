"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import {
  saveSession,
  updateStreak,
  getSessions,
} from "@/lib/typing-stats";
import { addToast } from "@/lib/toast";
import StreakDisplay from "./StreakDisplay";
import TypingHistory from "./TypingHistory";

// ─── Word Lists ─────────────────────────────────────────────────────────────

const EASY_WORDS = [
  "about","after","again","along","among","being","below","bring","carry","cause",
  "child","clean","clear","close","could","count","cover","cross","cycle","dance",
  "depth","dream","drive","eight","enjoy","enter","equal","every","exist","extra",
  "faith","field","final","first","fixed","flame","focus","force","found","front",
  "given","glass","grace","grade","grand","grant","grass","green","group","guard",
  "guide","happy","heart","heavy","horse","hotel","house","human","ideal","image",
  "input","knife","known","large","laugh","layer","learn","light","limit","local",
  "lucky","magic","major","match","media","metal","might","money","month","moral",
  "music","north","novel","ocean","offer","often","older","order","other","ought",
  "outer","owned","peace","phone","place","plain","plane","plant","plate","point",
  "power","price","prime","prior","prove","queen","quick","quiet","quite","quota",
  "raise","range","rapid","reach","ready","refer","relax","repay","right","river",
  "robot","rough","round","rural","sauce","scale","scene","score","sense","serve",
  "seven","shall","share","shift","short","since","skill","sleep","slice","slope",
  "small","smile","smoke","solid","solve","sorry","south","space","speak","speed",
  "spend","start","state","steel","steep","still","stock","stone","store","story",
  "strip","study","sugar","super","sweet","table","taste","teach","thank","their",
  "there","these","thick","thing","think","third","three","threw","throw","tight",
  "timer","tired","title","today","touch","tough","tower","trace","track","train",
  "tried","troop","truck","truly","trust","truth","twice","typed","ultra","under",
  "until","upper","usage","usual","value","video","visit","vital","voice","voter",
  "waste","watch","water","while","white","whose","wider","woman","world","worry",
  "worth","would","write","wrote","young","youth",
];

const MEDIUM_WORDS = [
  "absent","accept","access","across","acting","active","actual","adjust","admire","advice",
  "afford","afraid","agency","agenda","agreed","always","amount","animal","annual","answer",
  "anyone","anyway","appear","around","aspect","assert","assign","assist","attach","attack",
  "attend","author","autumn","avenue","banner","battle","become","before","behind","better",
  "beyond","borrow","bridge","broken","budget","caller","camera","cancel","cannot","career",
  "castle","center","change","charge","choice","choose","cinema","circle","client","closed",
  "coffee","column","combat","commit","common","couple","create","credit","crisis","critic",
  "custom","damage","debate","decide","defend","delete","demand","design","detail","differ",
  "direct","divide","doctor","domain","double","during","easily","either","eleven","emerge",
  "employ","energy","engine","entire","entity","except","expand","expect","expert","extend",
  "fabric","failed","fallen","famous","figure","filter","finish","follow","format","foster",
  "freely","future","garden","gender","gentle","global","govern","growth","handle","health",
  "hidden","higher","honest","hunger","impact","import","indeed","inform","inside","intent",
  "invite","island","itself","junior","keeper","launch","leader","league","length","listen",
  "living","manage","manner","market","master","matter","method","middle","mirror","mobile",
  "modern","moment","mother","mostly","moving","museum","narrow","nation","nearby","needle",
  "neural","nobody","normal","notice","obtain","offend","office","online","origin","output",
  "parent","partly","patent","people","period","permit","person","phrase","pocket","policy",
  "portal","profit","proper","public","pursue","puzzle","reason","recent","reduce","reform",
  "refuse","region","remove","repair","repeat","report","rescue","result","retain","return",
  "reveal","review","reward","rising","robust","safety","sample","scheme","second","sector",
  "select","sensor","series","server","settle","should","signal","simple","single","social",
  "source","spread","stable","strike","string","strong","submit","sudden","supply","talent",
  "target","theory","though","thread","ticket","timing","titles","topics","travel","treaty",
  "trying","turned","twelve","unique","update","upload","useful","varied","verify","victim",
  "visual","volume","widely","window","winner","within","wonder","worker","yearly",
];

const HARD_WORDS = [
  "abandoned","abolition","absorbing","abundance","accepted","accessible","accomplish",
  "accountable","accumulate","accurately","achievement","acknowledge","acquisition",
  "adaptation","additional","adjustment","admiration","adolescent","advancement","affordable",
  "aggressive","agriculture","allegation","alternative","ambassador","amendment","appreciate",
  "apprentice","appropriate","architecture","assembled","assignment","assistance","atmosphere",
  "attention","attraction","authority","background","benchmark","biography","brilliant",
  "broadcast","calculate","celebrate","challenge","character","civilized","classified",
  "cognitive","collective","commitment","community","complement","complicated","compromise",
  "concentrate","conclusion","confidence","configured","consistent","construct","contribute",
  "convenient","convictions","coordinates","creativity","criticism","curiosity","customize",
  "dangerous","dedicated","dependent","derivative","described","destroyed","determined",
  "developed","different","difficulty","dimensions","disagreement","discovered","distributed",
  "divergence","documented","dominated","efficient","eliminate","elsewhere","emotional",
  "emphasize","encourage","environment","establishment","evolution","examples","excellence",
  "exception","exclusive","existence","expansion","experience","experiment","explanation",
  "extraordinary","following","frequency","functions","gathering","generation","gracefully",
  "guidelines","historical","hypothesis","identified","immediate","importance","individual",
  "influential","interesting","knowledge","laboratory","legitimate","limitations","management",
  "meaningful","mechanisms","motivation","movement","observation","operations","opportunity",
  "organized","outstanding","particular","performance","permission","possibility","precisely",
  "preparation","principal","priorities","progressive","properties","providing","publishing",
  "qualitative","reasonable","recognized","refactored","registered","reinforcing","relationship",
  "remarkable","represents","responsible","structured","successful","surprising","systematic",
  "technology","theoretical","tournament","transmitting","underneath","unexpected","unfortunate",
  "universal","unlocking","variables","widespread",
];

// ─── Types ──────────────────────────────────────────────────────────────────

type Duration = 30 | 60 | 90;
type Difficulty = "easy" | "medium" | "hard";

const WORD_LISTS: Record<Difficulty, string[]> = {
  easy: EASY_WORDS,
  medium: MEDIUM_WORDS,
  hard: HARD_WORDS,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function pickWord(difficulty: Difficulty): string {
  const list = WORD_LISTS[difficulty];
  return list[Math.floor(Math.random() * list.length)];
}

function getMultiplier(streak: number): number {
  if (streak >= 30) return 5;
  if (streak >= 20) return 4;
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  return 1;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WordBlitz() {
  const [duration, setDuration] = useState<Duration>(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [status, setStatus] = useState<"idle" | "playing" | "done">("idle");
  const [currentWord, setCurrentWord] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFocused, setIsFocused] = useState(false);
  const [inputBorderState, setInputBorderState] = useState<
    "default" | "correct" | "error"
  >("default");
  const [correctCharsTotal, setCorrectCharsTotal] = useState(0);
  const [totalCharsTotal, setTotalCharsTotal] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    wpm: number;
    accuracy: number;
    wordsCompleted: number;
    longestStreak: number;
  } | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [previousHighScore, setPreviousHighScore] = useState<number | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const statusRef = useRef<"idle" | "playing" | "done">("idle");
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const longestStreakRef = useRef(0);
  const wordsCompletedRef = useRef(0);
  const correctCharsTotalRef = useRef(0);
  const totalCharsTotalRef = useRef(0);

  // Sync refs
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Initialize
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, duration]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentWord(pickWord(difficulty));
    setCurrentInput("");
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    streakRef.current = 0;
    setLongestStreak(0);
    longestStreakRef.current = 0;
    setWordsCompleted(0);
    wordsCompletedRef.current = 0;
    setTimeLeft(duration);
    setStatus("idle");
    setIsFocused(false);
    setInputBorderState("default");
    setCorrectCharsTotal(0);
    correctCharsTotalRef.current = 0;
    setTotalCharsTotal(0);
    totalCharsTotalRef.current = 0;
    setResult(null);
    setIsNewHighScore(false);
    setCopied(false);
  }, [difficulty, duration]);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalScore = scoreRef.current;
    const finalWordsCompleted = wordsCompletedRef.current;
    const finalLongestStreak = longestStreakRef.current;
    const finalCorrectChars = correctCharsTotalRef.current;
    const finalTotalChars = totalCharsTotalRef.current;

    const wpm = Math.round(finalCorrectChars / 5 / (duration / 60));
    const accuracy =
      finalTotalChars > 0
        ? Math.round((finalCorrectChars / finalTotalChars) * 1000) / 10
        : 100;

    const r = {
      score: finalScore,
      wpm,
      accuracy,
      wordsCompleted: finalWordsCompleted,
      longestStreak: finalLongestStreak,
    };
    setResult(r);
    setStatus("done");
    setIsFocused(false);

    // Check high score
    const mode = `${difficulty}-${duration}s`;
    const sessions = getSessions("word-blitz", 100);
    const modeSessions = sessions.filter((s) => s.mode === mode);
    const prevBest = modeSessions.reduce(
      (best, s) => Math.max(best, s.score ?? 0),
      0
    );
    setPreviousHighScore(prevBest > 0 ? prevBest : null);
    if (finalScore > prevBest) {
      setIsNewHighScore(true);
    }

    // Save session
    saveSession({
      id: crypto.randomUUID(),
      tool: "word-blitz",
      mode,
      wpm,
      accuracy,
      correctChars: finalCorrectChars,
      incorrectChars: finalTotalChars - finalCorrectChars,
      totalChars: finalTotalChars,
      duration,
      timestamp: Date.now(),
      score: finalScore,
    });
    updateStreak();
    setHistoryRefresh((prev) => prev + 1);
  }, [duration, difficulty]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(duration);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      const left = duration - elapsed;
      if (left <= 0) {
        setTimeLeft(0);
        endGame();
      } else {
        setTimeLeft(left);
      }
    }, 200);
  }, [duration, endGame]);

  const flashBorder = useCallback((state: "correct" | "error") => {
    setInputBorderState(state);
    setTimeout(() => setInputBorderState("default"), 200);
  }, []);

  const handleWordComplete = useCallback(() => {
    const wordLen = currentWord.length;
    const newCorrectChars = correctCharsTotalRef.current + wordLen;
    const newTotalChars = totalCharsTotalRef.current + wordLen;
    correctCharsTotalRef.current = newCorrectChars;
    totalCharsTotalRef.current = newTotalChars;
    setCorrectCharsTotal(newCorrectChars);
    setTotalCharsTotal(newTotalChars);

    const newStreak = streakRef.current + 1;
    streakRef.current = newStreak;
    setStreak(newStreak);
    if (newStreak > longestStreakRef.current) {
      longestStreakRef.current = newStreak;
      setLongestStreak(newStreak);
    }

    const multiplier = getMultiplier(newStreak);
    const points = wordLen * multiplier;
    const newScore = scoreRef.current + points;
    scoreRef.current = newScore;
    setScore(newScore);

    const newWordsCompleted = wordsCompletedRef.current + 1;
    wordsCompletedRef.current = newWordsCompleted;
    setWordsCompleted(newWordsCompleted);

    flashBorder("correct");
    setCurrentInput("");
    setCurrentWord(pickWord(difficulty));
  }, [currentWord, difficulty, flashBorder]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setCurrentInput(val);

      if (statusRef.current === "idle" && val.length > 0) {
        setStatus("playing");
        setIsFocused(true);
        startTimer();
      }

      if (statusRef.current === "done") return;

      // Check for correct completion
      if (val === currentWord) {
        handleWordComplete();
        return;
      }

      // Check if the current input has a wrong character
      if (val.length > 0 && !currentWord.startsWith(val)) {
        // Track error
        const newTotal = totalCharsTotalRef.current + 1;
        totalCharsTotalRef.current = newTotal;
        setTotalCharsTotal(newTotal);
        // Reset streak
        streakRef.current = 0;
        setStreak(0);
      }
    },
    [currentWord, startTimer, handleWordComplete]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (statusRef.current === "done") {
        e.preventDefault();
        return;
      }
      // Let the input handle naturally (no preventDefault here since we use onChange)
    },
    []
  );

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `clevr.tools Word Blitz\nScore: ${result.score.toLocaleString()} | WPM: ${result.wpm} | ${result.wordsCompleted} words\nMode: ${difficulty} ${duration}s | clevr.tools/type/word-blitz`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Results copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [result, difficulty, duration]);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [currentWord, status]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const streakMultiplier = getMultiplier(streak);

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Mode selectors */}
      <div
        className={`space-y-3 transition-opacity duration-300 ${
          isFocused && status === "playing"
            ? "opacity-30 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Duration buttons */}
        <div className="flex gap-2">
          {([30, 60, 90] as Duration[]).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              title={`${d} second round`}
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
        {/* Difficulty buttons */}
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              title={`${d} difficulty`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                difficulty === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Game zone */}
      {status !== "done" ? (
        <div className="rounded-xl bg-gray-900 p-8 min-h-[300px] flex flex-col items-center justify-between">
          {/* Stats row */}
          <div className="w-full flex justify-between text-sm font-mono">
            <span className="text-gray-300">
              Score:{" "}
              <span className="text-white font-bold">
                {score.toLocaleString()}
              </span>
            </span>
            <span
              className={`font-bold ${
                streak >= 5 ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              {streakMultiplier}x streak
            </span>
            <span
              className={`font-mono font-bold ${
                timeLeft <= 10
                  ? "text-red-400 animate-pulse"
                  : "text-gray-300"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* Current word */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-4xl font-mono font-bold tracking-wide">
              {currentWord.split("").map((char, i) => {
                const typedChar = currentInput[i];
                let colorClass = "text-gray-400"; // untyped
                if (typedChar !== undefined) {
                  colorClass =
                    typedChar === char ? "text-green-400" : "text-red-400";
                }
                return (
                  <span key={i} className={colorClass}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`text-xl font-mono text-center bg-transparent border-b-2 text-white outline-none w-64 pb-1 transition-colors ${
              inputBorderState === "correct"
                ? "border-green-500"
                : inputBorderState === "error"
                  ? "border-red-500"
                  : "border-gray-600 focus:border-primary"
            }`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={status === "idle" ? "start typing..." : ""}
          />

          {status === "idle" && (
            <p className="text-xs text-gray-500 mt-2">
              Type the word above to start
            </p>
          )}
        </div>
      ) : (
        /* Results screen */
        <div className="rounded-xl bg-gray-900 p-8 text-center animate-in fade-in duration-300">
          {/* Score large */}
          <div className="text-7xl font-bold text-primary mb-2">
            {result?.score.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm mb-6">Score</div>

          {isNewHighScore && (
            <div className="text-yellow-400 font-medium mb-4">
              New High Score!
            </div>
          )}
          {!isNewHighScore && previousHighScore !== null && (
            <div className="text-sm text-gray-500 mb-4">
              Previous best: {previousHighScore.toLocaleString()}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.wpm}
              </div>
              <div className="text-xs text-gray-400">WPM</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.accuracy}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.wordsCompleted}
              </div>
              <div className="text-xs text-gray-400">Words</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.longestStreak}
              </div>
              <div className="text-xs text-gray-400">Best Streak</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
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

      <TypingHistory tool="word-blitz" refreshTrigger={historyRefresh} />
    </div>
  );
}
