"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import {
  saveSession,
  updateStreak,
  getPersonalBest,
  updateWeakKeys,
  getWeakKeys,
} from "@/lib/typing-stats";
import { addToast } from "@/lib/toast";
import StreakDisplay from "./StreakDisplay";
import TypingHistory from "./TypingHistory";

// ─── Word Lists ──────────────────────────────────────────────────────────────

const COMMON_100 = [
  "the","of","and","a","to","in","is","you","that","he","was","for","on","are",
  "with","as","his","they","be","at","one","have","this","from","or","had","by",
  "but","some","what","there","we","can","out","other","were","all","your","when",
  "up","use","word","how","said","an","each","she","which","do","their","time",
  "if","will","way","about","many","then","them","would","write","like","so",
  "these","her","long","make","thing","see","him","two","has","look","more","day",
  "could","go","come","did","my","no","most","who","person","into","show","three",
  "small","every","where","high","give","just","because","know","take","good",
  "much","before","great","think","help",
];

const COMMON_500 = [
  ...COMMON_100,
  "line","set","change","off","play","spell","air","away","animal","house",
  "point","page","letter","mother","answer","found","still","learn","should",
  "world","near","add","food","between","own","below","country","plant","last",
  "school","father","keep","tree","never","start","city","earth","eyes","light",
  "thought","head","under","story","saw","left","few","while","along","might",
  "close","something","seem","next","hard","open","example","begin","life",
  "always","those","both","paper","together","got","group","often","run",
  "important","until","children","side","feet","car","mile","night","walk",
  "white","sea","began","grow","took","river","four","carry","state","once",
  "book","hear","stop","without","second","later","miss","idea","enough","eat",
  "face","watch","far","real","almost","let","above","girl","sometimes",
  "mountain","cut","young","talk","soon","list","song","being","leave",
  "family","body","music","color","stand","sun","question","fish","door","area",
  "mark","horse","sure","several","piece","told","usually","didn't","friend",
  "hand","high","keep","move","try","kind","already","number","order","true",
  "half","red","behind","picture","turn","problem","better","try","name",
  "sentence","room","knew","class","center","become","happen","heart","power",
  "money","serve","voice","fall","girl","table","early","move","mean","free",
  "deep","past","dark","hold","reach","rest","speak","stay","hear","care",
  "cover","feel","stand","bring","drop","carry","south","able","size","fine",
  "close","form","mind","drive","week","strong","sense","clear","pull","cold",
  "lead","class","front","board","child","ago","love","pass","test","west",
  "north","east","town","piece","green","field","island","sleep","fact","plan",
  "figure","land","simple","ready","voice","heat","fill","floor","record",
  "main","step","notice","interest","draw","act","horse","force","low",
  "window","follow","wish","sat","single","wide","unit","round","appear",
  "cross","street","space","store","practice","warm","common","gold","possible",
  "plane","dream","boat","nature","condition","feed","tool","total","basic",
  "smell","valley","count","double","seat","continue","block","chart","hat",
  "sell","success","company","event","particular","deal","swim","term","appear",
  "opposite","wife","shoe","shoulder","spread","arrange","camp","invent",
  "cotton","born","determine","row","coat","position","finger","ring",
  "character","garden","strange","valley","master","track","parent","shore",
  "division","sheet","substance","favor","connect","post","spend","chord",
  "fat","glad","original","share","station","dad","bread","charge","proper",
  "bar","offer","segment","duck","instant","market","degree","populate",
];

const COMMON_1000 = [
  ...COMMON_500,
  "experience","remember","different","beautiful","community","government",
  "information","opportunity","relationship","environment","technology",
  "development","performance","management","understand","particularly",
  "international","throughout","everything","everyone","nothing","someone",
  "anyone","whatever","whenever","wherever","however","therefore","although",
  "between","through","around","against","during","within","behind","beside",
  "already","another","article","become","better","beyond","bring","build",
  "business","certain","choice","company","complete","consider","continue",
  "control","course","create","current","decision","describe","detail",
  "develop","direct","discover","distance","economy","effect","either",
  "energy","entire","especially","exist","expect","factor","family","field",
  "figure","final","follow","force","form","further","game","general","given",
  "glass","growth","guess","happen","history","hope","hour","human","image",
  "impact","include","increase","individual","industry","inside","instead",
  "interest","involve","issue","item","large","late","level","live","local",
  "market","matter","meet","member","model","music","national","natural",
  "note","number","offer","outside","over","pattern","people","personal",
  "place","power","present","problem","process","produce","public","purpose",
  "push","question","quickly","quite","raise","reach","reason","remain",
  "right","rise","road","role","rule","save","sense","serve","short","since",
  "skill","social","sound","south","space","support","sure","table","tell",
  "toward","true","turn","usually","value","view","voice","want","well","wide",
  "within","without","work","write","young","accept","achieve","across",
  "actually","address","agree","allow","amount","appear","apply","area",
  "argue","attention","available","aware","base","beat","beauty","benefit",
  "board","born","bottom","break","brother","budget","camera","campaign",
  "cancer","candidate","capital","career","catch","cause","cell","chair",
  "challenge","chance","chapter","character","check","church","citizen",
  "claim","coach","cold","collection","college","compare","computer",
  "concern","condition","conference","consumer","contain","cost","couple",
  "culture","cup","customer","data","daughter","dead","deal","death","debate",
  "decade","defense","degree","department","design","despite","determine",
  "difference","difficult","dinner","direction","director","discuss",
  "discussion","disease","doctor","door","dream","drop","drug","edge",
  "education","effort","eight","election","employee","enjoy","enter",
  "establish","even","evening","evidence","exactly","executive","expert",
  "explain","factor","fail","fast","fear","federal","fight","finger","fire",
  "firm","fish","five","focus","foot","foreign","forget","former","forward",
  "friend","front","fund","future","garden","gas","generation","goal",
  "green","ground","hair","half","hang","happy","health","heat","heavy",
  "herself","himself","hit","hotel","huge","hundred","husband","identify",
  "imagine","knowledge","language","majority","material","measure","media",
  "mention","method","middle","military","million","mission","modern",
  "moment","movement","necessary","network","operation","option","painting",
  "partner","patient","perform","period","physical","picture","politics",
  "popular","pressure","production","professional","professor","program",
  "project","property","protect","prove","provide","quality","range",
  "reality","receive","recent","recognize","reduce","reflect","region",
  "relate","release","religious","remove","represent","require","research",
  "resource","respond","result","return","reveal","science","section",
  "security","senior","serious","shoulder","significant","similar","simply",
  "sister","situation","soldier","sometimes","source","southern","special",
  "specific","standard","statement","station","strategy","structure","student",
  "success","suddenly","suggest","surface","system","teacher","technology",
  "television","theory","thought","threat","together","tonight","training",
  "treatment","trouble","various","violence","western","whatever","worker",
];

const CODE_SNIPPETS: Record<string, string[]> = {
  javascript: [
    "const add = (a, b) => a + b;",
    "const nums = [1, 2, 3].map(x => x * 2);",
    "async function fetchData(url) {",
    "  const res = await fetch(url);",
    "  return res.json();",
    "}",
    "const { name, age } = user;",
    "document.addEventListener('click', handleClick);",
    "const el = document.getElementById('app');",
    "setTimeout(() => console.log('done'), 1000);",
    "const filtered = arr.filter(x => x > 0);",
    "Object.keys(obj).forEach(key => {",
    "  console.log(key, obj[key]);",
    "});",
    "import { useState, useEffect } from 'react';",
    "export default function App() {",
    "  const [count, setCount] = useState(0);",
    "  return <button>{count}</button>;",
    "}",
    "try { JSON.parse(str); } catch (e) { console.error(e); }",
    "const sorted = [...arr].sort((a, b) => a - b);",
  ],
  python: [
    "def greet(name: str) -> str:",
    "    return f'Hello, {name}!'",
    "numbers = [1, 2, 3, 4, 5]",
    "squares = [x**2 for x in numbers]",
    "with open('file.txt', 'r') as f:",
    "    content = f.read()",
    "from typing import List, Dict, Optional",
    "class DataProcessor:",
    "    def __init__(self, data: List[int]):",
    "        self.data = data",
    "    def process(self) -> Dict[str, int]:",
    "        return {'sum': sum(self.data)}",
    "result = [item for item in data if item > 0]",
    "print(f'Result: {value:.2f}')",
    "import json; data = json.loads(raw_str)",
    "for i, val in enumerate(items):",
    "    print(f'{i}: {val}')",
    "sorted_items = sorted(data, key=lambda x: x['value'])",
    "try:",
    "    response = requests.get(url)",
    "    response.raise_for_status()",
    "except requests.HTTPError as e:",
    "    print(f'Error: {e}')",
  ],
  html: [
    '<div class="container flex flex-col">',
    '  <header class="bg-blue-500 text-white">',
    "    <h1>Hello World</h1>",
    "  </header>",
    '  <main class="flex-1 p-4">',
    '    <p class="text-gray-700">Content here</p>',
    "  </main>",
    "</div>",
    '<input type="email" placeholder="Enter email" required>',
    '<button class="px-4 py-2 rounded">Submit</button>',
    ".container { display: flex; gap: 1rem; }",
    "body { margin: 0; font-family: sans-serif; }",
    "@media (max-width: 768px) {",
    "  .grid { grid-template-columns: 1fr; }",
    "}",
    ":root { --primary: #1d4ed8; --bg: #ffffff; }",
    "a:hover { color: var(--primary); }",
  ],
  sql: [
    "SELECT id, name, email FROM users",
    "WHERE created_at > '2024-01-01'",
    "ORDER BY name ASC LIMIT 10;",
    "INSERT INTO orders (user_id, total)",
    "VALUES (42, 99.99);",
    "UPDATE products SET price = 29.99",
    "WHERE category = 'books';",
    "SELECT u.name, COUNT(o.id) AS orders",
    "FROM users u",
    "LEFT JOIN orders o ON u.id = o.user_id",
    "GROUP BY u.id HAVING COUNT(o.id) > 5;",
    "CREATE INDEX idx_email ON users(email);",
    "ALTER TABLE products ADD COLUMN sku VARCHAR(50);",
    "SELECT DISTINCT category FROM products;",
  ],
  typescript: [
    "interface User { id: number; name: string; }",
    "type Result<T> = { data: T; error: null };",
    "function identity<T>(value: T): T { return value; }",
    "const users: Array<User> = [];",
    "async function fetchUser(id: number): Promise<User> {",
    "  const res = await fetch(`/api/users/${id}`);",
    "  return res.json() as Promise<User>;",
    "}",
    "type EventHandler<T extends Event> = (event: T) => void;",
    "enum Status { Active = 'active', Inactive = 'inactive' }",
    "const greet = (user: Pick<User, 'name'>): string =>",
    "  `Hello, ${user.name}`;",
  ],
};

const NUMBER_SYMBOL_STRINGS = [
  "file_v2.3 config.json",
  "127.0.0.1:8080 ssh -p 22",
  "$199.99 + tax = $215.99",
  "user@example.com #hashtag",
  "2024-03-15T10:30:00Z",
  "chmod 755 ./deploy.sh",
  "apt-get install -y curl",
  "npm run build && npm test",
  "git commit -m 'fix: update'",
  "export PATH=$HOME/bin:$PATH",
  "SELECT * FROM users LIMIT 10;",
  "rgba(255, 128, 0, 0.5)",
  "margin: 0 auto; padding: 1rem;",
  "width: calc(100% - 2rem);",
  "z-index: 9999; opacity: 0.8;",
];

const PUNCTUATION_SENTENCES = [
  "Hello, world! How are you doing today?",
  "Wait -- did you hear that? I'm not sure.",
  "To be, or not to be: that is the question.",
  "Error: file not found (check path/to/file).",
  "Dear Mr. Smith, please confirm your order.",
  "Note: items marked with * are required.",
  "The temperature was -5; we stayed inside.",
  "Use ctrl+c to copy and ctrl+v to paste.",
  "Why? Because it's the right thing to do!",
  "He scored 95%; she scored 97% -- both passed.",
  "Call (555) 123-4567 for more information.",
  "The file [report_v2.pdf] has been uploaded.",
  "She said, \"I'll be there at 5:00 PM.\"",
  "Don't forget: practice makes perfect.",
  "First, second, and third -- all done.",
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "words" | "code" | "numbers" | "punctuation";
type Difficulty = "easy" | "medium" | "hard";

interface KeyStats {
  correct: number;
  incorrect: number;
  totalTime: number;
  count: number;
  lastKeyTime: number;
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

function generateContent(
  category: Category,
  difficulty: Difficulty,
  subMode: string
): string[] {
  if (category === "words") {
    let source: string[];
    let count: number;
    if (difficulty === "easy") {
      source = COMMON_100;
      count = 50;
    } else if (difficulty === "medium") {
      source = COMMON_500;
      count = 40;
    } else {
      source = COMMON_1000;
      count = 30;
    }
    const result: string[] = [];
    while (result.length < count) {
      result.push(...shuffleArray(source));
    }
    return result.slice(0, count);
  }

  if (category === "code") {
    const snippets = CODE_SNIPPETS[subMode] || CODE_SNIPPETS.javascript;
    // Split snippets into words for the typing experience
    const shuffled = shuffleArray(snippets);
    const lines = difficulty === "easy" ? 8 : difficulty === "medium" ? 12 : 18;
    const selected = shuffled.slice(0, lines);
    // Return each line as separate "words" (actually tokens)
    return selected.flatMap((line) => line.split(/\s+/).filter(Boolean));
  }

  if (category === "numbers") {
    const shuffled = shuffleArray(NUMBER_SYMBOL_STRINGS);
    const count = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12;
    return shuffled
      .slice(0, count)
      .flatMap((s) => s.split(/\s+/).filter(Boolean));
  }

  // punctuation
  const shuffled = shuffleArray(PUNCTUATION_SENTENCES);
  const count = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12;
  return shuffled
    .slice(0, count)
    .flatMap((s) => s.split(/\s+/).filter(Boolean));
}

// ─── Heatmap layout ──────────────────────────────────────────────────────────

const HEATMAP_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

function getHeatColor(
  accuracy: number,
  samples: number
): string {
  if (samples < 3) return "bg-gray-700";
  if (accuracy >= 95) return "bg-green-500/40";
  if (accuracy >= 85) return "bg-yellow-500/40";
  if (accuracy >= 70) return "bg-orange-500/40";
  return "bg-red-500/40";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TypingPractice() {
  const [category, setCategory] = useState<Category>("words");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [subMode, setSubMode] = useState("javascript");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    duration: number;
    keyStats: Record<string, KeyStats>;
  } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const [wordWindowStart, setWordWindowStart] = useState(0);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [previousBest, setPreviousBest] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(0);
  const statusRef = useRef<"idle" | "running" | "done">("idle");
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordSpansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const keyStatsRef = useRef<Record<string, KeyStats>>({});
  const typedWordsRef = useRef<
    { typed: string; correct: number; incorrect: number }[]
  >([]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    resetTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, difficulty, subMode]);

  const resetTest = useCallback(() => {
    setWords(generateContent(category, difficulty, subMode));
    setCurrentWordIndex(0);
    setCurrentInput("");
    setCorrectChars(0);
    setIncorrectChars(0);
    setStatus("idle");
    setIsFocused(false);
    setResult(null);
    setIsNewPB(false);
    setWordWindowStart(0);
    keyStatsRef.current = {};
    typedWordsRef.current = [];
    startTimeRef.current = 0;
  }, [category, difficulty, subMode]);

  // Auto-focus hidden input on mount and after reset
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(t);
  }, [words]); // re-focus when words change (i.e. after reset)

  const recordKeypress = useCallback((key: string, isCorrect: boolean) => {
    const now = Date.now();
    const stats = keyStatsRef.current;
    const lower = key.toLowerCase();
    if (!stats[lower])
      stats[lower] = {
        correct: 0,
        incorrect: 0,
        totalTime: 0,
        count: 0,
        lastKeyTime: now,
      };
    const elapsed = now - stats[lower].lastKeyTime;
    if (elapsed > 0 && elapsed < 5000) {
      stats[lower].totalTime += elapsed;
      stats[lower].count += 1;
    }
    stats[lower].lastKeyTime = now;
    if (isCorrect) stats[lower].correct++;
    else stats[lower].incorrect++;
  }, []);

  const endTest = useCallback(() => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const wpm = Math.round(correctChars / 5 / (elapsed / 60));
    const totalChars = correctChars + incorrectChars;
    const accuracy =
      totalChars > 0
        ? Math.round((correctChars / totalChars) * 1000) / 10
        : 100;

    const r = {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      duration: elapsed,
      keyStats: { ...keyStatsRef.current },
    };
    setResult(r);
    setStatus("done");
    setIsFocused(false);

    // Check personal best
    const mode = `${category}-${difficulty}${category === "code" ? `-${subMode}` : ""}`;
    const pb = getPersonalBest("typing-practice", mode);
    setPreviousBest(pb ? pb.wpm : null);
    if (!pb || wpm > pb.wpm) {
      setIsNewPB(true);
    }

    // Save session
    saveSession({
      id: crypto.randomUUID(),
      tool: "typing-practice",
      mode,
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      duration: elapsed,
      timestamp: Date.now(),
    });
    updateStreak();
    setHistoryRefresh((prev) => prev + 1);

    // Update weak keys
    const keyData: Record<
      string,
      { correct: number; incorrect: number; avgSpeed: number }
    > = {};
    for (const [key, stats] of Object.entries(keyStatsRef.current)) {
      keyData[key] = {
        correct: stats.correct,
        incorrect: stats.incorrect,
        avgSpeed: stats.count > 0 ? stats.totalTime / stats.count : 0,
      };
    }
    updateWeakKeys(keyData);
  }, [correctChars, incorrectChars, category, difficulty, subMode]);

  // Line advancement
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Always prevent default — hidden input should never trigger browser actions
      e.preventDefault();

      if (statusRef.current === "done") return;

      if (
        statusRef.current === "idle" &&
        e.key !== "Backspace" &&
        e.key !== "Delete"
      ) {
        setStatus("running");
        setIsFocused(true);
        startTimeRef.current = Date.now();
      }

      if (e.key === " ") {
        if (statusRef.current !== "running") return;

        const word = words[currentWordIndex];
        const input = currentInput;
        if (input.length === 0) return;

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

        // Check if test is done
        if (nextIdx >= words.length) {
          // Use setTimeout to ensure state updates have flushed
          setTimeout(() => endTest(), 0);
          return;
        }

        setTimeout(() => checkLineAdvance(nextIdx), 10);
      } else if (e.key === "Backspace") {
        if (currentInput.length > 0) {
          setCurrentInput((prev) => prev.slice(0, -1));
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Printable character — handle directly since we preventDefault above
        if (statusRef.current !== "running" && statusRef.current !== "idle") return;
        const word = words[currentWordIndex];
        if (!word) return;
        const charIdx = currentInput.length;
        const isCorrect = charIdx < word.length && e.key === word[charIdx];
        recordKeypress(e.key, isCorrect);
        // Manually update input since preventDefault blocks onChange
        if (currentInput.length < word.length + 8) {
          setCurrentInput((prev) => prev + e.key);
        }
      }
    },
    [words, currentWordIndex, currentInput, endTest, checkLineAdvance, recordKeypress]
  );

  // onChange is now a no-op since we handle all input via keydown + preventDefault
  const handleChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>) => {
      // All input is handled in handleKeyDown to allow preventDefault on all keys
    },
    []
  );

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
    wordsContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setIsFocused(true);
  }, []);

  // Visible words
  const visibleWords = useMemo(() => {
    const end = Math.min(words.length, wordWindowStart + 80);
    return words.slice(wordWindowStart, end);
  }, [words, wordWindowStart]);

  // Historical weak keys for heatmap
  const historicalWeakKeys = useMemo(() => {
    if (status !== "done") return {};
    return getWeakKeys();
  }, [status]);

  // Merge session key stats with historical for heatmap display
  const heatmapData = useMemo(() => {
    if (!result) return {};
    const merged: Record<string, { accuracy: number; samples: number }> = {};

    // Use session data primarily, fallback to historical
    for (const rows of HEATMAP_ROWS) {
      for (const key of rows) {
        const session = result.keyStats[key];
        const historical = historicalWeakKeys[key];

        if (session) {
          const total = session.correct + session.incorrect;
          const acc = total > 0 ? (session.correct / total) * 100 : 100;
          merged[key] = { accuracy: acc, samples: total };
        } else if (historical) {
          merged[key] = {
            accuracy: historical.accuracy,
            samples: historical.samples,
          };
        }
      }
    }
    return merged;
  }, [result, historicalWeakKeys]);

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Category tabs and selectors */}
      <div
        className={`space-y-3 transition-opacity duration-300 ${
          isFocused && status === "running"
            ? "opacity-30 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Category tabs */}
        <div className="flex gap-2">
          {(
            [
              ["words", "Words"],
              ["code", "Programming"],
              ["numbers", "Numbers & Symbols"],
              ["punctuation", "Punctuation"],
            ] as [Category, string][]
          ).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              title={`Practice with ${label.toLowerCase()}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Difficulty selector */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                title={`${d} difficulty`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  difficulty === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Language selector for code mode */}
          {category === "code" && (
            <div className="flex gap-2">
              {Object.keys(CODE_SNIPPETS).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSubMode(lang)}
                  title={`Practice ${lang}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    subMode === lang
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {lang === "html" ? "HTML/CSS" : lang === "sql" ? "SQL" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Typing zone */}
      {status !== "done" ? (
        <div
          className="relative rounded-xl bg-gray-900 p-6 cursor-text min-h-[200px]"
          onClick={handleContainerClick}
        >
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
                    let cls = "text-gray-500";

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

          {/* Progress */}
          <div className="mt-4 text-center text-sm text-gray-400 tabular-nums">
            {currentWordIndex} / {words.length} words
          </div>

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
            aria-label="Type here to practice typing"
          />

          {status === "idle" && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Click here or start typing to begin
            </p>
          )}
        </div>
      ) : result ? (
        /* Results screen */
        <div className="space-y-6">
          <div className="rounded-xl bg-gray-900 p-8 text-center animate-in fade-in duration-300">
            <div className="text-7xl font-bold text-primary mb-2">
              {result.wpm}
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-semibold text-white tabular-nums">
                  {result.accuracy}%
                </div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white tabular-nums">
                  {result.correctChars}
                </div>
                <div className="text-xs text-gray-400">Correct Chars</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white tabular-nums">
                  {result.duration}s
                </div>
                <div className="text-xs text-gray-400">Duration</div>
              </div>
            </div>

            <button
              onClick={resetTest}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </button>
          </div>

          {/* Keyboard heatmap */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Key Performance
            </h3>
            <div className="space-y-1.5 max-w-md mx-auto">
              {HEATMAP_ROWS.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex gap-1 justify-center"
                  style={{ paddingLeft: `${rowIdx * 0.5}rem` }}
                >
                  {row.map((key) => {
                    const data = heatmapData[key];
                    const colorCls = data
                      ? getHeatColor(data.accuracy, data.samples)
                      : "bg-gray-700";
                    return (
                      <div
                        key={key}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono text-gray-300 ${colorCls}`}
                        title={
                          data
                            ? `${key}: ${Math.round(data.accuracy)}% accuracy (${data.samples} samples)`
                            : `${key}: no data`
                        }
                      >
                        {key}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-green-500/40" />
                <span>&gt;95%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-yellow-500/40" />
                <span>85-95%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-orange-500/40" />
                <span>70-85%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-500/40" />
                <span>&lt;70%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-700" />
                <span>No data</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <TypingHistory tool="typing-practice" refreshTrigger={historyRefresh} />
    </div>
  );
}
