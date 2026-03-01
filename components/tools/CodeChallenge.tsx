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

// ─── Code Snippets ──────────────────────────────────────────────────────────

const CODE_SNIPPETS: Record<string, Record<string, string[]>> = {
  javascript: {
    beginner: [
      `// Reverse a string\nfunction reverseString(str) {\n  return str.split("").reverse().join("");\n}`,
      `// Find the maximum value\nconst nums = [4, 7, 2, 9, 1];\nconst max = Math.max(...nums);\nconsole.log(max);`,
      `// Filter even numbers\nconst nums = [1, 2, 3, 4, 5, 6];\nconst evens = nums.filter(n => n % 2 === 0);\nconsole.log(evens);`,
      `// Check if palindrome\nfunction isPalindrome(str) {\n  const clean = str.toLowerCase();\n  return clean === clean.split("").reverse().join("");\n}`,
      `// Sum an array\nconst numbers = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((acc, n) => acc + n, 0);\nconsole.log(sum);`,
      `// Convert Celsius to Fahrenheit\nfunction toFahrenheit(celsius) {\n  return (celsius * 9) / 5 + 32;\n}\nconsole.log(toFahrenheit(100));`,
      `// Remove duplicates from array\nconst arr = [1, 2, 2, 3, 3, 4];\nconst unique = [...new Set(arr)];\nconsole.log(unique);`,
      `// Capitalize first letter\nfunction capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}`,
    ],
    intermediate: [
      `// Debounce function\nfunction debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}`,
      `// Fetch with error handling\nasync function getData(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(res.statusText);\n    return await res.json();\n  } catch (err) {\n    console.error("Fetch failed:", err);\n  }\n}`,
      `// Deep clone an object\nfunction deepClone(obj) {\n  if (obj === null || typeof obj !== "object") return obj;\n  const clone = Array.isArray(obj) ? [] : {};\n  for (const key in obj) {\n    clone[key] = deepClone(obj[key]);\n  }\n  return clone;\n}`,
      `// Memoize a function\nfunction memoize(fn) {\n  const cache = new Map();\n  return function (...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
      `// Flatten nested array\nfunction flatten(arr) {\n  return arr.reduce((flat, item) => {\n    return flat.concat(Array.isArray(item) ? flatten(item) : item);\n  }, []);\n}`,
      `// Group array by property\nfunction groupBy(arr, key) {\n  return arr.reduce((groups, item) => {\n    const group = item[key];\n    groups[group] = groups[group] || [];\n    groups[group].push(item);\n    return groups;\n  }, {});\n}`,
    ],
    advanced: [
      `// Simple event emitter\nclass EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  on(event, callback) {\n    if (!this.events[event]) this.events[event] = [];\n    this.events[event].push(callback);\n    return this;\n  }\n  emit(event, ...args) {\n    const callbacks = this.events[event] || [];\n    callbacks.forEach(cb => cb(...args));\n    return this;\n  }\n}`,
      `// Implement a simple Promise\nfunction delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\nasync function sequential(tasks) {\n  const results = [];\n  for (const task of tasks) {\n    results.push(await task());\n  }\n  return results;\n}`,
      `// Observable pattern\nfunction createStore(reducer, initialState) {\n  let state = initialState;\n  const listeners = new Set();\n  return {\n    getState: () => state,\n    dispatch: (action) => {\n      state = reducer(state, action);\n      listeners.forEach(fn => fn(state));\n    },\n    subscribe: (fn) => {\n      listeners.add(fn);\n      return () => listeners.delete(fn);\n    },\n  };\n}`,
    ],
  },
  python: {
    beginner: [
      `# Count word frequency\nwords = "the cat sat on the mat".split()\nfreq = {}\nfor word in words:\n    freq[word] = freq.get(word, 0) + 1\nprint(freq)`,
      `# List comprehension\nnumbers = range(1, 11)\nsquares = [n ** 2 for n in numbers if n % 2 == 0]\nprint(squares)`,
      `# Find maximum in list\ndef find_max(numbers):\n    if not numbers:\n        return None\n    return max(numbers)\n\nresult = find_max([3, 1, 4, 1, 5, 9])\nprint(result)`,
      `# Reverse a string\ndef reverse_string(s):\n    return s[::-1]\n\nprint(reverse_string("hello"))`,
      `# Check if a number is prime\ndef is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True`,
      `# Fibonacci sequence\ndef fibonacci(n):\n    a, b = 0, 1\n    result = []\n    while a < n:\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint(fibonacci(100))`,
    ],
    intermediate: [
      `# Read and process a CSV\ndef process_csv(filepath):\n    results = []\n    with open(filepath, "r") as f:\n        headers = f.readline().strip().split(",")\n        for line in f:\n            values = line.strip().split(",")\n            row = dict(zip(headers, values))\n            results.append(row)\n    return results`,
      `# Decorator example\ndef timer(func):\n    import time\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        end = time.time()\n        print(f"{func.__name__} took {end - start:.3f}s")\n        return result\n    return wrapper`,
      `# Context manager\nclass TempFile:\n    def __init__(self, name):\n        self.name = name\n    def __enter__(self):\n        self.file = open(self.name, "w")\n        return self.file\n    def __exit__(self, *args):\n        self.file.close()\n        import os\n        os.remove(self.name)`,
      `# Generator function\ndef read_chunks(filepath, size=1024):\n    with open(filepath, "rb") as f:\n        while True:\n            chunk = f.read(size)\n            if not chunk:\n                break\n            yield chunk`,
    ],
    advanced: [
      `# Dataclass with validation\nfrom dataclasses import dataclass, field\nfrom typing import List\n\n@dataclass\nclass Config:\n    host: str\n    port: int = 8080\n    tags: List[str] = field(default_factory=list)\n\n    def __post_init__(self):\n        if self.port < 1 or self.port > 65535:\n            raise ValueError(f"Invalid port: {self.port}")`,
      `# Async context manager\nimport asyncio\n\nclass AsyncDB:\n    async def __aenter__(self):\n        self.conn = await asyncio.open_connection("localhost", 5432)\n        return self\n    async def __aexit__(self, *args):\n        self.conn[1].close()\n        await self.conn[1].wait_closed()`,
    ],
  },
  typescript: {
    beginner: [
      `// Define a typed interface\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  active: boolean;\n}\n\nconst user: User = {\n  id: 1,\n  name: "Alice",\n  email: "alice@example.com",\n  active: true,\n};`,
      `// Enum and union types\nenum Direction {\n  Up = "UP",\n  Down = "DOWN",\n  Left = "LEFT",\n  Right = "RIGHT",\n}\n\ntype Point = {\n  x: number;\n  y: number;\n};`,
      `// Optional and default parameters\nfunction greet(name: string, greeting?: string): string {\n  return \`\${greeting ?? "Hello"}, \${name}!\`;\n}\n\nconsole.log(greet("Alice"));\nconsole.log(greet("Bob", "Hi"));`,
      `// Array and tuple types\nconst scores: number[] = [95, 87, 72];\nconst pair: [string, number] = ["Alice", 42];\n\nfunction getFirst<T>(arr: T[]): T | undefined {\n  return arr[0];\n}`,
    ],
    intermediate: [
      `// Generic function with constraints\nfunction getProperty<T, K extends keyof T>(\n  obj: T,\n  key: K\n): T[K] {\n  return obj[key];\n}\n\nconst person = { name: "Bob", age: 30 };\nconst name = getProperty(person, "name");`,
      `// Mapped and conditional types\ntype Readonly<T> = { readonly [K in keyof T]: T[K] };\ntype Optional<T> = { [K in keyof T]?: T[K] };\ntype NonNullable<T> = T extends null | undefined ? never : T;\n\ntype UserUpdate = Optional<Omit<User, "id">>;`,
      `// Discriminated union\ntype Result<T> =\n  | { success: true; data: T }\n  | { success: false; error: string };\n\nfunction processResult<T>(result: Result<T>): T | null {\n  if (result.success) return result.data;\n  console.error(result.error);\n  return null;\n}`,
    ],
    advanced: [
      `// Builder pattern with generics\nclass QueryBuilder<T> {\n  private filters: Partial<T> = {};\n  private limit = 10;\n\n  where(filter: Partial<T>): this {\n    this.filters = { ...this.filters, ...filter };\n    return this;\n  }\n\n  take(n: number): this {\n    this.limit = n;\n    return this;\n  }\n\n  build(): { filters: Partial<T>; limit: number } {\n    return { filters: this.filters, limit: this.limit };\n  }\n}`,
    ],
  },
  html: {
    beginner: [
      `<div class="card">\n  <h2 class="card-title">Hello World</h2>\n  <p class="card-body">Welcome to my site.</p>\n  <button class="btn btn-primary">Click me</button>\n</div>`,
      `<form action="/submit" method="POST">\n  <input type="text" name="name" placeholder="Your name">\n  <input type="email" name="email" placeholder="Email">\n  <button type="submit">Submit</button>\n</form>`,
      `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  gap: 1rem;\n}`,
      `.card {\n  background: #1a1a2e;\n  border-radius: 8px;\n  padding: 2rem;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);\n  transition: transform 0.2s ease;\n}`,
      `@media (max-width: 768px) {\n  .container {\n    flex-direction: column;\n    padding: 1rem;\n  }\n  .card {\n    width: 100%;\n  }\n}`,
    ],
    intermediate: [
      `.btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem 1rem;\n  border-radius: 0.375rem;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.15s ease;\n}\n\n.btn-primary {\n  background: var(--primary);\n  color: white;\n  border: none;\n}`,
    ],
  },
  sql: {
    beginner: [
      `SELECT name, email, created_at\nFROM users\nWHERE active = true\nORDER BY created_at DESC\nLIMIT 10;`,
      `INSERT INTO users (name, email, active)\nVALUES ('Alice', 'alice@example.com', true);`,
      `UPDATE products\nSET price = price * 0.9,\n    updated_at = NOW()\nWHERE category = 'sale';`,
      `DELETE FROM sessions\nWHERE expires_at < NOW();`,
    ],
    intermediate: [
      `SELECT\n  u.name,\n  COUNT(o.id) AS order_count,\n  SUM(o.total) AS total_spent\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.created_at >= '2025-01-01'\nGROUP BY u.name\nHAVING COUNT(o.id) > 5\nORDER BY total_spent DESC;`,
      `CREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  price DECIMAL(10, 2) NOT NULL,\n  category VARCHAR(100),\n  created_at TIMESTAMP DEFAULT NOW()\n);`,
    ],
    advanced: [
      `WITH monthly_revenue AS (\n  SELECT\n    DATE_TRUNC('month', created_at) AS month,\n    SUM(total) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY 1\n),\ngrowth AS (\n  SELECT\n    month,\n    revenue,\n    LAG(revenue) OVER (ORDER BY month) AS prev_revenue\n  FROM monthly_revenue\n)\nSELECT\n  month,\n  revenue,\n  ROUND((revenue - prev_revenue) / prev_revenue * 100, 2) AS growth_pct\nFROM growth\nORDER BY month;`,
    ],
  },
  go: {
    beginner: [
      `package main\n\nimport "fmt"\n\nfunc main() {\n    nums := []int{1, 2, 3, 4, 5}\n    sum := 0\n    for _, n := range nums {\n        sum += n\n    }\n    fmt.Println("Sum:", sum)\n}`,
      `package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    return fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n    fmt.Println(fibonacci(10))\n}`,
    ],
    intermediate: [
      `package main\n\nimport (\n    "fmt"\n    "sync"\n)\n\nfunc worker(id int, jobs <-chan int, wg *sync.WaitGroup) {\n    defer wg.Done()\n    for job := range jobs {\n        fmt.Printf("Worker %d processing job %d\\n", id, job)\n    }\n}`,
    ],
  },
  rust: {
    beginner: [
      `fn main() {\n    let numbers = vec![1, 2, 3, 4, 5];\n    let sum: i32 = numbers.iter().sum();\n    println!("Sum: {}", sum);\n}`,
      `fn is_prime(n: u64) -> bool {\n    if n < 2 {\n        return false;\n    }\n    for i in 2..=(n as f64).sqrt() as u64 {\n        if n % i == 0 {\n            return false;\n        }\n    }\n    true\n}`,
    ],
    intermediate: [
      `use std::collections::HashMap;\n\nfn word_count(text: &str) -> HashMap<&str, usize> {\n    let mut counts = HashMap::new();\n    for word in text.split_whitespace() {\n        *counts.entry(word).or_insert(0) += 1;\n    }\n    counts\n}`,
    ],
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────

type Language = "javascript" | "python" | "typescript" | "html" | "sql" | "go" | "rust";
type CodeDifficulty = "beginner" | "intermediate" | "advanced";

const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: "JavaScript",
  python: "Python",
  typescript: "TypeScript",
  html: "HTML/CSS",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
};

const SPECIAL_CHARS = new Set('{}[]();:=><.,"\'/\\|&!?@#$%^*-+~`');

const TAB_SIZES: Record<Language, number> = {
  javascript: 2,
  typescript: 2,
  python: 4,
  html: 2,
  sql: 2,
  go: 4,
  rust: 4,
};

// ─── Syntax Coloring ────────────────────────────────────────────────────────

function computeSyntaxColors(code: string, lang: Language): string[] {
  const colors = new Array(code.length).fill("text-gray-300");

  if (lang === "javascript" || lang === "typescript") {
    // Comments
    const comments = /(\/\/[^\n]*)/g;
    let m;
    while ((m = comments.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-gray-500";
    }
    // Strings
    const strings = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
    while ((m = strings.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-emerald-400";
    }
    // Keywords
    const keywords = /\b(const|let|var|function|return|if|else|for|while|class|new|async|await|try|catch|import|export|default|from|throw|typeof|instanceof|extends|this|true|false|null|undefined|of|in|interface|type|enum|readonly|private|string|number|boolean|void|never|any|unknown)\b/g;
    while ((m = keywords.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-purple-400";
    }
    // Numbers
    const numbers = /\b(\d+\.?\d*)\b/g;
    while ((m = numbers.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-orange-400";
    }
  } else if (lang === "python") {
    const comments = /(#[^\n]*)/g;
    let m;
    while ((m = comments.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-gray-500";
    }
    const strings = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|f"(?:[^"\\]|\\.)*"|f'(?:[^'\\]|\\.)*')/g;
    while ((m = strings.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-emerald-400";
    }
    const keywords = /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|yield|lambda|True|False|None|and|or|not|in|is|pass|break|continue|async|await|self)\b/g;
    while ((m = keywords.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-purple-400";
    }
    const numbers = /\b(\d+\.?\d*)\b/g;
    while ((m = numbers.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-orange-400";
    }
    const decorators = /(@\w+)/g;
    while ((m = decorators.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-yellow-400";
    }
  } else if (lang === "html") {
    // HTML tags
    const tags = /(<\/?[\w-]+|>|\/?>)/g;
    let m;
    while ((m = tags.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-blue-400";
    }
    // Attributes
    const attrs = /\b(class|id|type|name|placeholder|action|method|href|src|alt|style|value)=/g;
    while ((m = attrs.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length - 1; i++) colors[i] = "text-yellow-400";
    }
    // Strings
    const strings = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
    while ((m = strings.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-emerald-400";
    }
    // CSS properties
    const cssProps = /\b(display|justify-content|align-items|min-height|gap|background|border-radius|padding|box-shadow|transition|flex-direction|width|font-weight|cursor|color|border|font-size)\b/g;
    while ((m = cssProps.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-sky-400";
    }
    // CSS values
    const cssKeywords = /\b(flex|center|column|none|pointer|inline-flex|ease)\b/g;
    while ((m = cssKeywords.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-orange-400";
    }
    // @media
    const atRules = /(@media|@keyframes|@import)/g;
    while ((m = atRules.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-purple-400";
    }
  } else if (lang === "sql") {
    // Strings
    const strings = /('(?:[^'\\]|\\.)*')/g;
    let m;
    while ((m = strings.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-emerald-400";
    }
    // Keywords (case insensitive match but apply color)
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|PRIMARY|KEY|NOT|NULL|DEFAULT|AS|AND|OR|IN|BETWEEN|LIKE|COUNT|SUM|AVG|MIN|MAX|DISTINCT|UNION|ALL|EXISTS|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION|SERIAL|VARCHAR|INT|INTEGER|DECIMAL|TIMESTAMP|BOOLEAN|TRUE|FALSE|NOW|DATE_TRUNC|LAG|ROUND|HAVING)\b/gi;
    while ((m = keywords.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-purple-400";
    }
    // Numbers
    const numbers = /\b(\d+\.?\d*)\b/g;
    while ((m = numbers.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-orange-400";
    }
    // Comments
    const comments = /(--[^\n]*)/g;
    while ((m = comments.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-gray-500";
    }
  } else if (lang === "go") {
    const comments = /(\/\/[^\n]*)/g;
    let m;
    while ((m = comments.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-gray-500";
    }
    const strings = /("(?:[^"\\]|\\.)*"|`[^`]*`)/g;
    while ((m = strings.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-emerald-400";
    }
    const keywords = /\b(package|import|func|return|if|else|for|range|var|const|type|struct|interface|map|chan|go|defer|select|case|switch|break|continue|nil|true|false|int|string|bool|byte|float64|error)\b/g;
    while ((m = keywords.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-purple-400";
    }
    const numbers = /\b(\d+\.?\d*)\b/g;
    while ((m = numbers.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-orange-400";
    }
  } else if (lang === "rust") {
    const comments = /(\/\/[^\n]*)/g;
    let m;
    while ((m = comments.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-gray-500";
    }
    const strings = /("(?:[^"\\]|\\.)*")/g;
    while ((m = strings.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-emerald-400";
    }
    const keywords = /\b(fn|let|mut|return|if|else|for|while|loop|match|use|struct|impl|enum|pub|mod|self|super|crate|as|in|ref|move|true|false|i32|u32|u64|f64|bool|str|String|Vec|HashMap|Option|Result|Some|None|Ok|Err)\b/g;
    while ((m = keywords.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-purple-400";
    }
    const numbers = /\b(\d+\.?\d*)\b/g;
    while ((m = numbers.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-orange-400";
    }
    const macros = /\b(\w+!)/g;
    while ((m = macros.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) colors[i] = "text-blue-400";
    }
  }

  return colors;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pickSnippet(lang: Language, diff: CodeDifficulty): string {
  const langSnippets = CODE_SNIPPETS[lang];
  if (!langSnippets) return "";
  // Fallback to lower difficulty if advanced/intermediate doesn't exist
  const snippets =
    langSnippets[diff] ||
    langSnippets["intermediate"] ||
    langSnippets["beginner"] ||
    [];
  if (snippets.length === 0) return "";
  return snippets[Math.floor(Math.random() * snippets.length)];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CodeChallenge() {
  const [language, setLanguage] = useState<Language>("javascript");
  const [difficulty, setDifficulty] = useState<CodeDifficulty>("beginner");
  const [code, setCode] = useState("");
  const [typedText, setTypedText] = useState("");
  const [status, setStatus] = useState<"idle" | "typing" | "done">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    elapsedSec: number;
    specialAccuracy: number;
    correctChars: number;
    incorrectChars: number;
  } | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<"idle" | "typing" | "done">("idle");
  const codeRef = useRef("");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Initialize snippet
  useEffect(() => {
    resetChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, difficulty]);

  const resetChallenge = useCallback(() => {
    const snippet = pickSnippet(language, difficulty);
    setCode(snippet);
    codeRef.current = snippet;
    setTypedText("");
    setStatus("idle");
    setIsFocused(false);
    setStartTime(0);
    setResult(null);
    setIsNewPB(false);
    setCopied(false);
  }, [language, difficulty]);

  const endChallenge = useCallback(
    (finalTyped: string) => {
      const elapsed = (Date.now() - startTime) / 1000;
      const codeText = codeRef.current;

      let correctChars = 0;
      let incorrectChars = 0;
      let specialCorrect = 0;
      let specialTotal = 0;

      for (let i = 0; i < codeText.length; i++) {
        const isSpecial = SPECIAL_CHARS.has(codeText[i]);
        if (isSpecial) specialTotal++;

        if (i < finalTyped.length && finalTyped[i] === codeText[i]) {
          correctChars++;
          if (isSpecial) specialCorrect++;
        } else {
          incorrectChars++;
        }
      }

      const wpm = Math.round(correctChars / 5 / (elapsed / 60));
      const totalChars = correctChars + incorrectChars;
      const accuracy =
        totalChars > 0
          ? Math.round((correctChars / totalChars) * 1000) / 10
          : 100;
      const specialAccuracy =
        specialTotal > 0
          ? Math.round((specialCorrect / specialTotal) * 1000) / 10
          : 100;

      const r = {
        wpm,
        accuracy,
        elapsedSec: Math.round(elapsed * 10) / 10,
        specialAccuracy,
        correctChars,
        incorrectChars,
      };
      setResult(r);
      setStatus("done");
      setIsFocused(false);

      // Check personal best
      const mode = `${language}-${difficulty}`;
      const pb = getPersonalBest("code-challenge", mode);
      setPreviousBest(pb ? pb.wpm : null);
      if (!pb || wpm > pb.wpm) {
        setIsNewPB(true);
      }

      // Save session
      saveSession({
        id: crypto.randomUUID(),
        tool: "code-challenge",
        mode,
        wpm,
        accuracy,
        correctChars,
        incorrectChars,
        totalChars,
        duration: Math.round(elapsed),
        timestamp: Date.now(),
      });
      updateStreak();
      setHistoryRefresh((prev) => prev + 1);
    },
    [startTime, language, difficulty]
  );

  const handleInput = useCallback(
    (chars: string) => {
      setTypedText((prev) => {
        const next = prev + chars;
        if (next.length >= codeRef.current.length) {
          const finalTyped = next.slice(0, codeRef.current.length);
          setTimeout(() => endChallenge(finalTyped), 0);
          return finalTyped;
        }
        return next;
      });
    },
    [endChallenge]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (statusRef.current === "done") return;

      if (e.key === "Tab") {
        const spaces = " ".repeat(TAB_SIZES[language]);
        if (statusRef.current === "idle") {
          setStatus("typing");
          setIsFocused(true);
          setStartTime(Date.now());
        }
        handleInput(spaces);
        return;
      }

      if (e.key === "Enter") {
        if (statusRef.current === "idle") {
          setStatus("typing");
          setIsFocused(true);
          setStartTime(Date.now());
        }
        handleInput("\n");
        return;
      }

      if (e.key === "Backspace") {
        setTypedText((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (statusRef.current === "idle") {
          setStatus("typing");
          setIsFocused(true);
          setStartTime(Date.now());
        }
        handleInput(e.key);
      }
    },
    [language, handleInput]
  );

  const handleContainerClick = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `clevr.tools Code Typing Challenge\nWPM: ${result.wpm} | Accuracy: ${result.accuracy}% | Special: ${result.specialAccuracy}%\nLanguage: ${LANGUAGE_LABELS[language]} (${difficulty}) | clevr.tools/type/code-challenge`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Results copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [result, language, difficulty]);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => {
      containerRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [code]);

  // Pre-compute syntax colors
  const syntaxColors = useMemo(() => computeSyntaxColors(code, language), [code, language]);

  // Split code into lines for rendering
  const codeLines = useMemo(() => {
    if (!code) return [];
    const lines = code.split("\n");
    let charOffset = 0;
    return lines.map((line) => {
      const start = charOffset;
      charOffset += line.length + 1; // +1 for the \n
      return { text: line, start };
    });
  }, [code]);

  return (
    <div className="space-y-6">
      <StreakDisplay />

      {/* Mode selectors */}
      <div
        className={`space-y-3 transition-opacity duration-300 ${
          isFocused && status === "typing"
            ? "opacity-30 pointer-events-none"
            : "opacity-100"
        }`}
      >
        {/* Language buttons */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              title={LANGUAGE_LABELS[lang]}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
        {/* Difficulty buttons */}
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as CodeDifficulty[]).map(
            (d) => (
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
            )
          )}
        </div>
      </div>

      {/* Code zone */}
      {status !== "done" ? (
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleContainerClick}
          className="relative rounded-xl bg-gray-900 p-6 cursor-text min-h-[200px] outline-none focus:ring-2 focus:ring-primary/50"
        >
          {/* Line numbers + code */}
          <div className="font-mono text-sm leading-[1.8] select-none overflow-x-auto">
            {codeLines.map((line, lineIdx) => (
              <div key={lineIdx} className="flex">
                {/* Line number */}
                <span className="text-gray-600 w-8 text-right mr-4 select-none shrink-0">
                  {lineIdx + 1}
                </span>
                {/* Code characters */}
                <span className="whitespace-pre">
                  {line.text.length === 0 ? (
                    // Empty line - show cursor if at this position
                    typedText.length === line.start ? (
                      <span className="border-l-2 border-white">&nbsp;</span>
                    ) : (
                      <span>&nbsp;</span>
                    )
                  ) : (
                    line.text.split("").map((char, charIdx) => {
                      const absIdx = line.start + charIdx;
                      let cls: string;

                      if (absIdx < typedText.length) {
                        // Typed
                        cls =
                          typedText[absIdx] === char
                            ? "text-green-400"
                            : "text-red-400 bg-red-400/20";
                      } else if (absIdx === typedText.length) {
                        // Cursor position
                        cls =
                          syntaxColors[absIdx] +
                          " border-l-2 border-white";
                      } else {
                        // Untyped - use syntax color
                        cls = syntaxColors[absIdx] || "text-gray-300";
                      }

                      // Show spaces as dots in untyped indentation
                      const displayChar =
                        char === " " && absIdx > typedText.length
                          ? "\u00B7"
                          : char;

                      return (
                        <span key={absIdx} className={cls}>
                          {displayChar}
                        </span>
                      );
                    })
                  )}
                  {/* Newline indicator: show cursor at end of line if position is at the \n */}
                  {typedText.length === line.start + line.text.length &&
                    lineIdx < codeLines.length - 1 && (
                      <span className="border-l-2 border-white">&nbsp;</span>
                    )}
                </span>
              </div>
            ))}
          </div>

          {status === "idle" && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Click here or start typing to begin
            </p>
          )}
        </div>
      ) : (
        /* Results screen */
        <div className="rounded-xl bg-gray-900 p-8 text-center animate-in fade-in duration-300">
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
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.accuracy}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.specialAccuracy}%
              </div>
              <div className="text-xs text-gray-400">Special Chars</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {result?.elapsedSec}s
              </div>
              <div className="text-xs text-gray-400">Time</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white tabular-nums capitalize">
                {LANGUAGE_LABELS[language]}
              </div>
              <div className="text-xs text-gray-400">Language</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetChallenge}
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

      <TypingHistory tool="code-challenge" refreshTrigger={historyRefresh} />
    </div>
  );
}
