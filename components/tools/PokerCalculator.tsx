"use client";

import Link from "next/link";
import { Fragment, useState, useMemo } from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools";

/* ─── Types ─────────────────────────────────────────────────────────── */

type PokerTab = "rankings" | "odds" | "rules" | "hands";
type Street = "flop" | "turn";
type Suit = "♠" | "♥" | "♦" | "♣";
type HandTier = "strong" | "good" | "marginal" | "weak";

interface CardDef {
  rank: string;
  suit: Suit;
}

interface HandRanking {
  name: string;
  cards: CardDef[];
  description: string;
  probability: string;
}

interface DrawScenario {
  label: string;
  outs: number;
}

interface StartingHand {
  label: string;
  name: string;
  tier: HandTier;
  winRate: string;
}

/* ─── Constants ─────────────────────────────────────────────────────── */

const tabMeta: Array<{ id: PokerTab; label: string }> = [
  { id: "rankings", label: "Hand Rankings" },
  { id: "odds", label: "Odds & Outs" },
  { id: "rules", label: "Quick Rules" },
  { id: "hands", label: "Starting Hands" },
];

const handRankings: HandRanking[] = [
  { name: "Royal Flush", cards: [{ rank: "A", suit: "♠" }, { rank: "K", suit: "♠" }, { rank: "Q", suit: "♠" }, { rank: "J", suit: "♠" }, { rank: "10", suit: "♠" }], description: "A, K, Q, J, 10 all of the same suit.", probability: "1 in 649,740" },
  { name: "Straight Flush", cards: [{ rank: "9", suit: "♥" }, { rank: "8", suit: "♥" }, { rank: "7", suit: "♥" }, { rank: "6", suit: "♥" }, { rank: "5", suit: "♥" }], description: "Five sequential cards of the same suit.", probability: "1 in 72,193" },
  { name: "Four of a Kind", cards: [{ rank: "K", suit: "♠" }, { rank: "K", suit: "♥" }, { rank: "K", suit: "♦" }, { rank: "K", suit: "♣" }, { rank: "9", suit: "♠" }], description: "Four cards of the same rank.", probability: "1 in 4,165" },
  { name: "Full House", cards: [{ rank: "J", suit: "♠" }, { rank: "J", suit: "♥" }, { rank: "J", suit: "♦" }, { rank: "8", suit: "♠" }, { rank: "8", suit: "♥" }], description: "Three of a kind plus a pair.", probability: "1 in 694" },
  { name: "Flush", cards: [{ rank: "A", suit: "♦" }, { rank: "J", suit: "♦" }, { rank: "8", suit: "♦" }, { rank: "5", suit: "♦" }, { rank: "3", suit: "♦" }], description: "Five cards of the same suit, not sequential.", probability: "1 in 509" },
  { name: "Straight", cards: [{ rank: "10", suit: "♠" }, { rank: "9", suit: "♥" }, { rank: "8", suit: "♦" }, { rank: "7", suit: "♣" }, { rank: "6", suit: "♠" }], description: "Five sequential cards of different suits.", probability: "1 in 255" },
  { name: "Three of a Kind", cards: [{ rank: "Q", suit: "♠" }, { rank: "Q", suit: "♥" }, { rank: "Q", suit: "♦" }, { rank: "7", suit: "♣" }, { rank: "4", suit: "♠" }], description: "Three cards of the same rank.", probability: "1 in 47" },
  { name: "Two Pair", cards: [{ rank: "A", suit: "♠" }, { rank: "A", suit: "♥" }, { rank: "9", suit: "♦" }, { rank: "9", suit: "♣" }, { rank: "5", suit: "♠" }], description: "Two different pairs.", probability: "1 in 21" },
  { name: "One Pair", cards: [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }, { rank: "K", suit: "♦" }, { rank: "7", suit: "♣" }, { rank: "3", suit: "♠" }], description: "Two cards of the same rank.", probability: "1 in 2.4" },
  { name: "High Card", cards: [{ rank: "A", suit: "♠" }, { rank: "J", suit: "♥" }, { rank: "8", suit: "♦" }, { rank: "5", suit: "♣" }, { rank: "2", suit: "♠" }], description: "No matching cards.", probability: "1 in 2" },
];

const drawScenarios: DrawScenario[] = [
  { label: "Flush draw", outs: 9 },
  { label: "Open-ended straight draw", outs: 8 },
  { label: "Set to full house / quads", outs: 7 },
  { label: "Two overcards", outs: 6 },
  { label: "One pair to two pair / trips", outs: 5 },
  { label: "Gutshot straight draw", outs: 4 },
];

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;

const glossaryTerms = [
  { term: "Pot", def: "Total chips bet in the current hand." },
  { term: "Outs", def: "Cards remaining in the deck that improve your hand." },
  { term: "Position", def: "Your seat relative to the dealer button." },
  { term: "Equity", def: "Your percentage chance of winning the hand." },
  { term: "Suited", def: "Two cards of the same suit (e.g., A♠ K♠)." },
  { term: "Offsuit", def: "Two cards of different suits (e.g., A♠ K♥)." },
  { term: "Connectors", def: "Two sequential cards (e.g., 8-9)." },
];

const relatedTools = [
  "odds-calculator",
  "percentage-calculator",
].flatMap((slug) => {
  const tool = getToolBySlug(slug);
  return tool ? [{ name: tool.name, href: tool.route }] : [];
});

/* ─── Starting hands data ───────────────────────────────────────────── */

function getHandTier(r: number, c: number): HandTier {
  const rank1 = RANKS[r];
  const rank2 = RANKS[c];
  const isPair = r === c;
  const isSuited = c > r; // above diagonal = suited

  // Strong tier
  if (isPair && r <= 3) return "strong"; // AA, KK, QQ, JJ
  if ((rank1 === "A" && rank2 === "K") || (rank1 === "K" && rank2 === "A")) return "strong";
  if (isSuited && rank1 === "A" && rank2 === "Q") return "strong";

  // Good tier
  if (isPair && r >= 4 && r <= 5) return "good"; // TT, 99
  if (isSuited && rank1 === "A" && (rank2 === "J" || rank2 === "T")) return "good";
  if (isSuited && rank1 === "K" && rank2 === "Q") return "good";
  if (!isSuited && rank1 === "A" && rank2 === "Q") return "good";
  if (!isSuited && rank1 === "A" && rank2 === "J") return "good";
  if (!isSuited && rank1 === "K" && rank2 === "Q") return "good";

  // Marginal tier
  if (isPair && r >= 6 && r <= 7) return "marginal"; // 88, 77
  if (isSuited && rank1 === "K" && (rank2 === "J" || rank2 === "T")) return "marginal";
  if (isSuited && rank1 === "Q" && (rank2 === "J" || rank2 === "T")) return "marginal";
  if (isSuited && rank1 === "J" && rank2 === "T") return "marginal";
  // Suited connectors
  if (isSuited && Math.abs(r - c) === 1 && r >= 4 && r <= 9) return "marginal";
  // Suited aces (A5s–A2s)
  if (isSuited && rank1 === "A" && c >= 9) return "marginal";
  // ATo, KJo
  if (!isSuited && rank1 === "A" && rank2 === "T") return "marginal";
  if (!isSuited && rank1 === "K" && rank2 === "J") return "marginal";

  return "weak";
}

function getWinRate(r: number, c: number): string {
  const isPair = r === c;
  const isSuited = c > r;
  // Approximate heads-up win rates vs random hand
  if (isPair) {
    const pairRates: Record<string, string> = {
      A: "85%", K: "82%", Q: "80%", J: "78%", T: "75%",
      "9": "72%", "8": "69%", "7": "66%", "6": "63%",
      "5": "60%", "4": "57%", "3": "54%", "2": "51%",
    };
    return pairRates[RANKS[r]] ?? "50%";
  }
  const high = Math.min(r, c);
  const low = Math.max(r, c);
  const gap = low - high;
  // Base rate from high card strength
  let base = 50 + (13 - high) * 2.5 - gap * 1.5;
  if (isSuited) base += 3;
  return `${Math.round(Math.min(80, Math.max(30, base)))}%`;
}

function getHandLabel(r: number, c: number): string {
  if (r === c) return `${RANKS[r]}${RANKS[c]}`;
  if (c > r) return `${RANKS[r]}${RANKS[c]}s`;
  return `${RANKS[c]}${RANKS[r]}o`;
}

function getHandName(r: number, c: number): string {
  const names: Record<string, string> = {
    A: "Ace", K: "King", Q: "Queen", J: "Jack", T: "Ten",
    "9": "Nine", "8": "Eight", "7": "Seven", "6": "Six",
    "5": "Five", "4": "Four", "3": "Three", "2": "Two",
  };
  if (r === c) return `Pocket ${names[RANKS[r]]}s`;
  const suited = c > r;
  const hi = suited ? RANKS[r] : RANKS[c];
  const lo = suited ? RANKS[c] : RANKS[r];
  return `${names[hi]}-${names[lo]} ${suited ? "suited" : "offsuit"}`;
}

/* ─── Sub-components ────────────────────────────────────────────────── */

function PlayingCard({ rank, suit }: CardDef) {
  const isRed = suit === "♥" || suit === "♦";
  return (
    <div className={cn(
      "flex h-12 w-9 flex-col items-center justify-center rounded-lg border bg-white text-xs font-bold shadow-sm sm:h-14 sm:w-10 sm:text-sm",
      "border-gray-200 dark:border-gray-600 dark:bg-gray-50",
      isRed ? "text-red-600" : "text-gray-900"
    )}>
      <span className="leading-none">{rank}</span>
      <span className="text-[10px] leading-none sm:text-xs">{suit}</span>
    </div>
  );
}

function HandRankingRow({ hand, rank }: { hand: HandRanking; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="w-full rounded-[1.25rem] border border-[color:var(--ghost-border)] bg-card/80 p-4 text-left transition-colors hover:border-primary/30"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {rank}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="font-semibold text-foreground">{hand.name}</span>
          <div className="flex shrink-0 gap-1">
            {hand.cards.map((card, i) => (
              <PlayingCard key={i} rank={card.rank} suit={card.suit} />
            ))}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </div>
      {expanded && (
        <div className="mt-3 space-y-1 pl-11">
          <p className="text-sm text-muted-foreground">{hand.description}</p>
          <p className="text-xs text-primary font-semibold">{hand.probability}</p>
        </div>
      )}
    </button>
  );
}

function RelatedCalculatorList() {
  return (
    <div className="space-y-2">
      {relatedTools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="flex items-center justify-between rounded-[1rem] bg-card/80 px-4 py-3 text-sm text-foreground transition-colors hover:text-primary"
        >
          <span>{tool.name}</span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}

/* ─── Odds calculation helpers ──────────────────────────────────────── */

function calcProbability(outs: number, street: Street): number {
  const remaining = 52 - (street === "flop" ? 3 : 4) - 2; // community cards seen + 2 hole cards
  if (street === "turn") {
    return outs / remaining;
  }
  // Flop: probability of hitting on turn OR river
  const missOnce = (remaining - outs) / remaining;
  const missTwice = missOnce * ((remaining - 1 - outs) / (remaining - 1));
  return 1 - missTwice;
}

function calcRuleOfThumb(outs: number, street: Street): number {
  return street === "flop" ? outs * 4 : outs * 2;
}

/* ─── Tier styling ──────────────────────────────────────────────────── */

const tierColors: Record<HandTier, { bg: string; text: string; label: string }> = {
  strong: { bg: "bg-emerald-500/20 dark:bg-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", label: "Strong" },
  good: { bg: "bg-emerald-500/10 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", label: "Good" },
  marginal: { bg: "bg-amber-500/15 dark:bg-amber-400/15", text: "text-amber-700 dark:text-amber-300", label: "Marginal" },
  weak: { bg: "bg-muted/40", text: "text-muted-foreground", label: "Weak" },
};

/* ─── Main Component ────────────────────────────────────────────────── */

export default function PokerCalculator() {
  const [activeTab, setActiveTab] = useState<PokerTab>("rankings");

  // Odds calculator state
  const [selectedDraw, setSelectedDraw] = useState<number | "custom">(0);
  const [customOuts, setCustomOuts] = useState("10");
  const [street, setStreet] = useState<Street>("flop");
  const [potSize, setPotSize] = useState("100");
  const [betToCall, setBetToCall] = useState("25");

  // Starting hands state
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  // Odds calculations
  const outs = selectedDraw === "custom" ? (Number.parseInt(customOuts) || 0) : drawScenarios[selectedDraw].outs;
  const probability = useMemo(() => calcProbability(Math.max(0, Math.min(20, outs)), street), [outs, street]);
  const ruleOfThumb = calcRuleOfThumb(Math.max(0, Math.min(20, outs)), street);
  const oddsAgainst = probability > 0 ? (1 - probability) / probability : 0;

  // Pot odds calculations
  const potVal = Number.parseFloat(potSize) || 0;
  const betVal = Number.parseFloat(betToCall) || 0;
  const potOddsPercent = betVal > 0 ? betVal / (potVal + betVal) : 0;
  const potOddsRatio = betVal > 0 ? (potVal + betVal) / betVal : 0;
  const isProfitableCall = probability > potOddsPercent;

  /* ─── Sidebar ──────────────────────────────────────────────────────── */

  const settingsPanel = (
    <div className="space-y-6">
      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Reference
        </p>
        <div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          <p>All calculations use standard 52-card deck probabilities.</p>
          <p>Starting hand win rates are based on heads-up simulations against a random hand.</p>
        </div>
      </div>

      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Rule of 2 and 4
        </p>
        <div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          <p>Multiply outs by <span className="font-semibold text-foreground">4</span> on the flop (two cards to come)</p>
          <p>Multiply outs by <span className="font-semibold text-foreground">2</span> on the turn (one card to come)</p>
        </div>
      </div>

      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Common outs
        </p>
        <div className="mt-4 overflow-hidden rounded-[0.9rem] border border-[color:var(--ghost-border)]">
          <table className="w-full text-xs">
            <thead className="bg-muted/45 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Draw</th>
                <th className="px-3 py-2 text-right font-semibold">Outs</th>
              </tr>
            </thead>
            <tbody>
              {drawScenarios.map((d) => (
                <tr key={d.label} className="border-t border-[color:var(--ghost-border)]">
                  <td className="px-3 py-2 text-foreground">{d.label}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{d.outs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const infoPanel = <RelatedCalculatorList />;

  /* ─── Tab 1: Hand Rankings ─────────────────────────────────────────── */

  const rankingsContent = (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        All 10 poker hand rankings from best to worst. Tap any hand to see details.
      </p>
      <div className="space-y-2">
        {handRankings.map((hand, i) => (
          <HandRankingRow key={hand.name} hand={hand} rank={i + 1} />
        ))}
      </div>
    </div>
  );

  /* ─── Tab 2: Odds & Outs ───────────────────────────────────────────── */

  const oddsContent = (
    <div className="space-y-8">
      {/* Draw selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">What draw are you on?</h3>
        <div className="flex flex-wrap gap-2">
          {drawScenarios.map((d, i) => (
            <button
              key={d.label}
              type="button"
              onClick={() => setSelectedDraw(i)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedDraw === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {d.label} ({d.outs})
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedDraw("custom")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              selectedDraw === "custom"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            )}
          >
            Custom
          </button>
        </div>
        {selectedDraw === "custom" && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Outs (1–20):</label>
            <input
              type="number"
              min={1}
              max={20}
              value={customOuts}
              onChange={(e) => setCustomOuts(e.target.value)}
              className="w-20 rounded-xl border border-[color:var(--ghost-border)] bg-muted/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
        )}
      </div>

      {/* Street toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">What street?</h3>
        <div className="flex gap-2">
          {(["flop", "turn"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStreet(s)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                street === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {s === "flop" ? "Flop (2 cards to come)" : "Turn (1 card to come)"}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.25rem] bg-primary/[0.08] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Probability</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-primary">
            {(probability * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-muted/45 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Odds Against</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {oddsAgainst.toFixed(2)} : 1
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-muted/45 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Rule of {street === "flop" ? "4" : "2"}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            ≈ {Math.min(ruleOfThumb, 100)}%
          </p>
        </div>
      </div>

      {/* Pot Odds */}
      <div className="space-y-4 rounded-[1.25rem] border border-[color:var(--ghost-border)] bg-card/80 p-5">
        <h3 className="text-sm font-semibold text-foreground">Pot Odds</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Pot size ($)</label>
            <input
              type="number"
              min={0}
              value={potSize}
              onChange={(e) => setPotSize(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[color:var(--ghost-border)] bg-muted/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Bet to call ($)</label>
            <input
              type="number"
              min={0}
              value={betToCall}
              onChange={(e) => setBetToCall(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[color:var(--ghost-border)] bg-muted/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </div>
        </div>
        {betVal > 0 && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1rem] bg-muted/45 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pot odds</p>
                <p className="mt-2 text-lg font-bold text-foreground">{(potOddsRatio - 1).toFixed(1)} : 1</p>
                <p className="text-xs text-muted-foreground">{(potOddsPercent * 100).toFixed(1)}% needed to break even</p>
              </div>
              <div className={cn(
                "rounded-[1rem] p-4",
                isProfitableCall ? "bg-emerald-500/10" : "bg-red-500/10"
              )}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Verdict</p>
                <p className={cn(
                  "mt-2 text-lg font-bold",
                  isProfitableCall ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {isProfitableCall ? "Profitable call" : "Fold"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isProfitableCall
                    ? `Your ${(probability * 100).toFixed(1)}% chance exceeds the ${(potOddsPercent * 100).toFixed(1)}% needed.`
                    : `Your ${(probability * 100).toFixed(1)}% chance is below the ${(potOddsPercent * 100).toFixed(1)}% needed.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── Tab 3: Quick Rules ───────────────────────────────────────────── */

  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const rulesContent = (
    <div className="space-y-8">
      {/* Game Flow */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Game Flow</h3>
        <ol className="space-y-2">
          {[
            "Blinds posted (small blind, big blind)",
            "Each player dealt 2 hole cards (face down)",
            "Pre-flop betting round",
            "Flop — 3 community cards dealt face up",
            "Flop betting round",
            "Turn — 1 community card dealt face up",
            "Turn betting round",
            "River — 1 community card dealt face up",
            "River betting round",
            "Showdown — best 5-card hand wins",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5 text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Actions</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { action: "Fold", desc: "Give up your hand and any bets" },
            { action: "Check", desc: "Pass the action (only if no bet to you)" },
            { action: "Call", desc: "Match the current bet" },
            { action: "Raise", desc: "Increase the current bet" },
            { action: "All-in", desc: "Bet all your remaining chips" },
          ].map(({ action, desc }) => (
            <div key={action} className="rounded-[1rem] bg-muted/40 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">{action}</span>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blinds */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Blinds</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-semibold text-foreground">Small blind:</span> forced bet by player to dealer&apos;s left (usually half the big blind)</p>
          <p><span className="font-semibold text-foreground">Big blind:</span> forced bet by player two seats to dealer&apos;s left</p>
          <p>Blinds increase over time in tournaments, stay fixed in cash games.</p>
        </div>
      </div>

      {/* Best Hand */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Making Your Best Hand</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Use any combination of your 2 hole cards + 5 community cards to make the best 5-card hand.</p>
          <p>You can use both, one, or none of your hole cards.</p>
        </div>
      </div>

      {/* Glossary */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setGlossaryOpen(!glossaryOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          Common Terms
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", glossaryOpen && "rotate-180")} />
        </button>
        {glossaryOpen && (
          <div className="space-y-2">
            {glossaryTerms.map(({ term, def }) => (
              <div key={term} className="rounded-[1rem] bg-muted/40 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">{term}</span>
                <p className="text-xs text-muted-foreground">{def}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ─── Tab 4: Starting Hands ────────────────────────────────────────── */

  const handsContent = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        169 unique starting hands. Diagonal = pairs, above = suited, below = offsuit. Tap any cell for details.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(["strong", "good", "marginal", "weak"] as const).map((tier) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 rounded", tierColors[tier].bg)} />
            <span className={cn("font-semibold", tierColors[tier].text)}>{tierColors[tier].label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-grid grid-cols-[auto_repeat(13,1fr)] gap-px text-[10px] sm:text-xs">
          {/* Header row */}
          <div />
          {RANKS.map((r) => (
            <div key={r} className="flex items-center justify-center p-1 font-bold text-muted-foreground">
              {r}
            </div>
          ))}
          {/* Data rows */}
          {RANKS.map((_, r) => (
            <Fragment key={`row-${r}`}>
              <div className="flex items-center justify-center p-1 font-bold text-muted-foreground">
                {RANKS[r]}
              </div>
              {RANKS.map((_, c) => {
                const tier = getHandTier(r, c);
                const label = getHandLabel(r, c);
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => setSelectedCell(isSelected ? null : { r, c })}
                    className={cn(
                      "flex items-center justify-center rounded-sm p-1 font-medium transition-all sm:rounded-md sm:p-1.5",
                      tierColors[tier].bg,
                      tierColors[tier].text,
                      isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      r === c && "font-bold"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedCell && (
        <div className="rounded-[1.25rem] border border-primary/30 bg-primary/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{getHandName(selectedCell.r, selectedCell.c)}</p>
              <p className="text-sm text-muted-foreground">{getHandLabel(selectedCell.r, selectedCell.c)}</p>
            </div>
            <div className="text-right">
              <span className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                tierColors[getHandTier(selectedCell.r, selectedCell.c)].bg,
                tierColors[getHandTier(selectedCell.r, selectedCell.c)].text,
              )}>
                {tierColors[getHandTier(selectedCell.r, selectedCell.c)].label}
              </span>
              <p className="mt-1 text-sm font-bold text-foreground">
                {getWinRate(selectedCell.r, selectedCell.c)} vs random
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ─── Render ───────────────────────────────────────────────────────── */

  return (
    <ToolPageLayout
      categoryName="Calculate"
      categoryHref="/calculate"
      relatedTools={relatedTools}
      settingsPanel={settingsPanel}
      infoPanel={infoPanel}
      settingsTitle="Reference"
      infoTitle="Related calculators"
    >
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PokerTab)} className="gap-6">
          <div className="overflow-x-auto pb-1">
            <TabsList variant="default" className="min-w-max rounded-full bg-muted/60 p-1">
              {tabMeta.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-primary"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="rankings" className="space-y-6">
            {rankingsContent}
          </TabsContent>

          <TabsContent value="odds" className="space-y-6">
            {oddsContent}
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            {rulesContent}
          </TabsContent>

          <TabsContent value="hands" className="space-y-6">
            {handsContent}
          </TabsContent>
        </Tabs>
      </div>
    </ToolPageLayout>
  );
}
