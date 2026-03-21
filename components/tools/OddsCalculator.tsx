"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Minus, Plus, TrendingUp } from "lucide-react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { TipJar } from "@/components/tool/TipJar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools";
import {
  calculatePayout,
  calculateProfit,
  calculateVig,
  convertOdds,
  formatAmericanOdds,
  formatDecimalOdds,
  formatProbability,
  parseOddsToDecimal,
  parseProbabilityPercent,
  probabilityToAmerican,
  probabilityToDecimal,
  probabilityToFractional,
  type OddsFormat,
} from "@/lib/odds";

type OddsTab = "converter" | "parlay" | "payout" | "implied";
type Outcome = "win" | "lose";

interface ParlayLeg {
  id: number;
  label: string;
  odds: string;
  format: OddsFormat;
}

const tabMeta: Array<{ id: OddsTab; label: string }> = [
  { id: "converter", label: "Odds Converter" },
  { id: "parlay", label: "Parlay Calculator" },
  { id: "payout", label: "Payout Calculator" },
  { id: "implied", label: "Implied Probability" },
];

const oddsFormatOptions: Array<{ value: OddsFormat; label: string }> = [
  { value: "american", label: "American" },
  { value: "decimal", label: "Decimal" },
  { value: "fractional", label: "Fractional" },
];

const relatedTools = [
  "salary",
  "loan",
  "credit-card-payoff",
  "percentage-calculator",
].flatMap((slug) => {
  const tool = getToolBySlug(slug);
  return tool ? [{ name: tool.name, href: tool.route }] : [];
});

const quickReferenceRows = [
  { american: "-500", decimal: "1.20", fractional: "1/5", probability: "83.3%" },
  { american: "-200", decimal: "1.50", fractional: "1/2", probability: "66.7%" },
  { american: "-110", decimal: "1.91", fractional: "10/11", probability: "52.4%" },
  { american: "+100", decimal: "2.00", fractional: "1/1", probability: "50.0%" },
  { american: "+150", decimal: "2.50", fractional: "3/2", probability: "40.0%" },
  { american: "+200", decimal: "3.00", fractional: "2/1", probability: "33.3%" },
  { american: "+500", decimal: "6.00", fractional: "5/1", probability: "16.7%" },
  { american: "+1000", decimal: "11.00", fractional: "10/1", probability: "9.1%" },
];

function fmtCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function parseMoney(input: string): number | null {
  const normalized = input.trim().replace(/[$,\s]/g, "");
  if (!/^\d*\.?\d+$/.test(normalized)) return null;

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;

  return value;
}

function ProbabilityBar({ probability }: { probability: number }) {
  const width = Math.max(0, Math.min(100, probability * 100));

  return (
    <div className="space-y-2">
      <div className="h-3 overflow-hidden rounded-full bg-muted/70">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#6ee7b7_0%,#10b981_100%)] transition-[width] duration-200"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">Implied probability: {formatProbability(probability)}</p>
    </div>
  );
}

function FieldCard({
  label,
  driver,
  isDriver,
  children,
}: {
  label: string;
  driver?: string;
  isDriver?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border bg-card/80 p-4 transition-colors",
        isDriver ? "border-primary/45 bg-primary/[0.05]" : "border-[color:var(--ghost-border)]"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className={cn("text-sm font-semibold", isDriver ? "text-primary" : "text-foreground")}>
          {label}
        </label>
        {driver && isDriver ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {driver}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ResultCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "primary";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] p-5",
        tone === "primary" ? "bg-primary/[0.08]" : "bg-muted/45"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-3 text-2xl font-bold tracking-tight", tone === "primary" ? "text-primary" : "text-foreground")}>
        {value}
      </p>
    </div>
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

export default function OddsCalculator() {
  const [activeTab, setActiveTab] = useState<OddsTab>("converter");

  const [converterDriver, setConverterDriver] = useState<OddsFormat>("american");
  const [americanInput, setAmericanInput] = useState("+150");
  const [decimalInput, setDecimalInput] = useState("");
  const [fractionalInput, setFractionalInput] = useState("");

  const nextLegId = useRef(3);
  const [parlayStake, setParlayStake] = useState("100");
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([
    { id: 1, label: "", odds: "+100", format: "american" },
    { id: 2, label: "", odds: "+100", format: "american" },
  ]);

  const [payoutStake, setPayoutStake] = useState("100");
  const [payoutOdds, setPayoutOdds] = useState("+200");
  const [payoutFormat, setPayoutFormat] = useState<OddsFormat>("american");
  const [payoutOutcome, setPayoutOutcome] = useState<Outcome>("win");

  const [impliedMode, setImpliedMode] = useState<"odds" | "probability">("odds");
  const [impliedOdds, setImpliedOdds] = useState("-110");
  const [impliedFormat, setImpliedFormat] = useState<OddsFormat>("american");
  const [probabilityInput, setProbabilityInput] = useState("52.4");
  const [marketA, setMarketA] = useState("-110");
  const [marketB, setMarketB] = useState("-110");

  const converterInputValue =
    converterDriver === "american"
      ? americanInput
      : converterDriver === "decimal"
      ? decimalInput
      : fractionalInput;
  const converterResult = convertOdds(converterInputValue, converterDriver);
  const converterAmerican =
    converterDriver === "american"
      ? americanInput
      : converterResult
      ? formatAmericanOdds(converterResult.american)
      : "";
  const converterDecimal =
    converterDriver === "decimal"
      ? decimalInput
      : converterResult
      ? formatDecimalOdds(converterResult.decimal)
      : "";
  const converterFractional =
    converterDriver === "fractional" ? fractionalInput : converterResult?.fractional ?? "";
  const converterProfit = converterResult ? calculateProfit(100, converterResult.decimal) : null;
  const converterReturn = converterResult ? calculatePayout(100, converterResult.decimal) : null;

  const parlayStakeValue = parseMoney(parlayStake);
  const parlayLegDetails = parlayLegs.map((leg) => {
    const decimal = parseOddsToDecimal(leg.odds, leg.format);
    return {
      ...leg,
      decimal,
      probability: decimal ? 1 / decimal : null,
    };
  });
  const parlayCanCalculate =
    parlayStakeValue !== null &&
    parlayStakeValue > 0 &&
    parlayLegDetails.every((leg) => leg.decimal !== null);
  const combinedDecimal = parlayCanCalculate
    ? parlayLegDetails.reduce((product, leg) => product * (leg.decimal as number), 1)
    : null;
  const combinedProbability = parlayCanCalculate
    ? parlayLegDetails.reduce((product, leg) => product * (leg.probability as number), 1)
    : null;
  const combinedPayout =
    parlayCanCalculate && combinedDecimal !== null ? calculatePayout(parlayStakeValue as number, combinedDecimal) : null;
  const combinedProfit =
    parlayCanCalculate && combinedPayout !== null ? combinedPayout - (parlayStakeValue as number) : null;

  const payoutStakeValue = parseMoney(payoutStake);
  const payoutDecimal = parseOddsToDecimal(payoutOdds, payoutFormat);
  const payoutProfit =
    payoutOutcome === "win" && payoutStakeValue !== null && payoutDecimal !== null
      ? calculateProfit(payoutStakeValue, payoutDecimal)
      : null;
  const payoutReturn =
    payoutOutcome === "win" && payoutStakeValue !== null && payoutDecimal !== null
      ? calculatePayout(payoutStakeValue, payoutDecimal)
      : null;
  const payoutRoi =
    payoutOutcome === "win" && payoutStakeValue && payoutProfit !== null
      ? (payoutProfit / payoutStakeValue) * 100
      : null;

  const impliedOddsResult = convertOdds(impliedOdds, impliedFormat);
  const probabilityValue = parseProbabilityPercent(probabilityInput);
  const probabilityOdds =
    probabilityValue !== null
      ? {
          decimal: probabilityToDecimal(probabilityValue),
          american: probabilityToAmerican(probabilityValue),
          fractional: probabilityToFractional(probabilityValue),
        }
      : null;
  const vigResult = calculateVig(marketA, marketB);

  const settingsPanel = (
    <div className="space-y-6">
      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          American (Moneyline)
        </p>
        <div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          <p><span className="font-semibold text-foreground">+150</span> = win $150 on $100</p>
          <p><span className="font-semibold text-foreground">-200</span> = bet $200 to win $100</p>
        </div>
      </div>

      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Decimal
        </p>
        <div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          <p><span className="font-semibold text-foreground">2.50</span> = total return per $1 bet</p>
          <p><span className="font-semibold text-foreground">1.50</span> = total return per $1 bet</p>
        </div>
      </div>

      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Fractional
        </p>
        <div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          <p><span className="font-semibold text-foreground">3/2</span> = win $3 for every $2 bet</p>
          <p><span className="font-semibold text-foreground">1/2</span> = win $1 for every $2 bet</p>
        </div>
      </div>

      <div className="rounded-[1rem] bg-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Quick reference
        </p>
        <div className="mt-4 overflow-hidden rounded-[0.9rem] border border-[color:var(--ghost-border)]">
          <table className="w-full text-xs">
            <thead className="bg-muted/45 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Am</th>
                <th className="px-3 py-2 text-left font-semibold">Dec</th>
                <th className="px-3 py-2 text-left font-semibold">Frac</th>
                <th className="px-3 py-2 text-right font-semibold">Prob</th>
              </tr>
            </thead>
            <tbody>
              {quickReferenceRows.map((row) => (
                <tr key={row.american} className="border-t border-[color:var(--ghost-border)]">
                  <td className="px-3 py-2 text-foreground">{row.american}</td>
                  <td className="px-3 py-2 text-foreground">{row.decimal}</td>
                  <td className="px-3 py-2 text-foreground">{row.fractional}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{row.probability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const infoPanel = <RelatedCalculatorList />;

  return (
    <ToolPageLayout
      categoryName="Calculate"
      categoryHref="/calculate"
      relatedTools={relatedTools}
      settingsPanel={settingsPanel}
      infoPanel={infoPanel}
      settingsTitle="Odds reference"
      infoTitle="Related calculators"
    >
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OddsTab)} className="gap-6">
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

          <TabsContent value="converter" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <FieldCard label="American Odds" driver="Driving" isDriver={converterDriver === "american"}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={converterAmerican}
                  onChange={(event) => {
                    setConverterDriver("american");
                    setAmericanInput(event.target.value);
                  }}
                  placeholder="+150 or -200"
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </FieldCard>
              <FieldCard label="Decimal Odds" driver="Driving" isDriver={converterDriver === "decimal"}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={converterDecimal}
                  onChange={(event) => {
                    setConverterDriver("decimal");
                    setDecimalInput(event.target.value);
                  }}
                  placeholder="2.50"
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </FieldCard>
              <FieldCard label="Fractional Odds" driver="Driving" isDriver={converterDriver === "fractional"}>
                <input
                  type="text"
                  inputMode="text"
                  value={converterFractional}
                  onChange={(event) => {
                    setConverterDriver("fractional");
                    setFractionalInput(event.target.value);
                  }}
                  placeholder="3/2"
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </FieldCard>
            </div>

            {converterResult ? (
              <>
                <div className="rounded-[1.5rem] bg-primary/[0.08] p-6">
                  <ProbabilityBar probability={converterResult.impliedProbability} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <ResultCard label="American" value={formatAmericanOdds(converterResult.american)} />
                  <ResultCard label="Decimal" value={formatDecimalOdds(converterResult.decimal)} tone="primary" />
                  <ResultCard label="Fractional" value={converterResult.fractional} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-muted/45 p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      $100 bet payout
                    </p>
                    <p className="mt-3 text-xl font-bold tracking-tight text-foreground">
                      Win {fmtCurrency(converterProfit ?? 0)} profit on a $100 bet
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Total return: {fmtCurrency(converterReturn ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-muted/45 p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Break-even win rate
                    </p>
                    <p className="mt-3 text-xl font-bold tracking-tight text-primary">
                      {formatProbability(converterResult.impliedProbability)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You need to win {formatProbability(converterResult.impliedProbability)} of the time to break even at these odds.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--ghost-border)] bg-muted/35 p-8 text-sm text-muted-foreground">
                Enter valid American, decimal, or fractional odds to see live conversions, implied probability, and payout math.
              </div>
            )}
          </TabsContent>

          <TabsContent value="parlay" className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[1.5rem] bg-muted/35 p-5">
              {parlayLegs.map((leg, index) => {
                const legDetail = parlayLegDetails[index];

                return (
                  <div key={leg.id} className="rounded-[1.25rem] bg-card/80 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">Leg {index + 1}</p>
                      {parlayLegs.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setParlayLegs((current) => current.filter((item) => item.id !== leg.id));
                          }}
                          className="rounded-full bg-muted/70 p-2 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove leg ${index + 1}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_10rem]">
                      <input
                        type="text"
                        value={leg.label}
                        onChange={(event) => {
                          setParlayLegs((current) =>
                            current.map((item) =>
                              item.id === leg.id ? { ...item, label: event.target.value } : item
                            )
                          );
                        }}
                        placeholder="Bet description"
                        className="w-full rounded-[1rem] border border-[color:var(--ghost-border)] bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/35"
                      />

                      <select
                        value={leg.format}
                        onChange={(event) => {
                          setParlayLegs((current) =>
                            current.map((item) =>
                              item.id === leg.id ? { ...item, format: event.target.value as OddsFormat } : item
                            )
                          );
                        }}
                        className="rounded-[1rem] border border-[color:var(--ghost-border)] bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/35"
                      >
                        {oddsFormatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
                      <input
                        type="text"
                        value={leg.odds}
                        onChange={(event) => {
                          setParlayLegs((current) =>
                            current.map((item) =>
                              item.id === leg.id ? { ...item, odds: event.target.value } : item
                            )
                          );
                        }}
                        placeholder={leg.format === "american" ? "+150" : leg.format === "decimal" ? "2.50" : "3/2"}
                        className="w-full rounded-[1rem] border border-[color:var(--ghost-border)] bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/35"
                      />

                      <div className="rounded-[1rem] bg-muted/50 px-4 py-3 text-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Implied
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {legDetail.probability !== null ? formatProbability(legDetail.probability) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (parlayLegs.length >= 15) return;
                    setParlayLegs((current) => [
                      ...current,
                      { id: nextLegId.current++, label: "", odds: "+100", format: "american" },
                    ]);
                  }}
                  disabled={parlayLegs.length >= 15}
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost-border)] bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add another leg
                </button>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-foreground">Your bet amount</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={parlayStake}
                    onChange={(event) => setParlayStake(event.target.value)}
                    className="w-32 rounded-[1rem] border border-[color:var(--ghost-border)] bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/35"
                  />
                </div>
              </div>
            </div>

            {combinedDecimal !== null && combinedPayout !== null && combinedProfit !== null && combinedProbability !== null ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <ResultCard label="Combined decimal" value={formatDecimalOdds(combinedDecimal)} tone="primary" />
                  <ResultCard label="Combined American" value={formatAmericanOdds(probabilityToAmerican(combinedProbability))} />
                  <ResultCard label="Total payout" value={fmtCurrency(combinedPayout)} />
                  <ResultCard label="Total profit" value={fmtCurrency(combinedProfit)} />
                  <ResultCard label="Implied probability" value={formatProbability(combinedProbability)} />
                </div>

                <div className="rounded-[1.5rem] bg-primary/[0.08] p-6">
                  <ProbabilityBar probability={combinedProbability} />
                </div>

                <div className="rounded-[1.5rem] bg-muted/35 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Per-leg breakdown
                  </p>
                  <div className="mt-4 overflow-hidden rounded-[1rem] border border-[color:var(--ghost-border)] bg-card/85">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/45 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Leg</th>
                          <th className="px-4 py-3 text-left font-semibold">Odds</th>
                          <th className="px-4 py-3 text-right font-semibold">Implied probability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parlayLegDetails.map((leg, index) => (
                          <tr key={leg.id} className="border-t border-[color:var(--ghost-border)]">
                            <td className="px-4 py-3 text-foreground">
                              {leg.label.trim() || `Leg ${index + 1}`}
                            </td>
                            <td className="px-4 py-3 text-foreground">{leg.odds}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              {leg.probability !== null ? formatProbability(leg.probability) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--ghost-border)] bg-muted/35 p-8 text-sm text-muted-foreground">
                Enter valid odds on every leg and a stake amount to see combined parlay odds, payout, profit, and probability in real time.
              </div>
            )}
          </TabsContent>

          <TabsContent value="payout" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)_12rem]">
              <FieldCard label="Stake">
                <input
                  type="text"
                  inputMode="decimal"
                  value={payoutStake}
                  onChange={(event) => setPayoutStake(event.target.value)}
                  placeholder="100"
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </FieldCard>
              <FieldCard label="Odds">
                <input
                  type="text"
                  inputMode="text"
                  value={payoutOdds}
                  onChange={(event) => setPayoutOdds(event.target.value)}
                  placeholder={payoutFormat === "american" ? "+200" : payoutFormat === "decimal" ? "3.00" : "2/1"}
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </FieldCard>
              <FieldCard label="Format">
                <select
                  value={payoutFormat}
                  onChange={(event) => setPayoutFormat(event.target.value as OddsFormat)}
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none"
                >
                  {oddsFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldCard>
            </div>

            <div className="inline-flex rounded-full bg-muted/60 p-1">
              {(["win", "lose"] as Outcome[]).map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setPayoutOutcome(outcome)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    payoutOutcome === outcome ? "bg-card text-primary" : "text-muted-foreground"
                  )}
                >
                  {outcome === "win" ? "Win" : "Lose"}
                </button>
              ))}
            </div>

            {payoutOutcome === "win" && payoutStakeValue !== null && payoutProfit !== null && payoutReturn !== null && payoutRoi !== null ? (
              <div className="grid gap-4 md:grid-cols-3">
                <ResultCard label="Profit" value={fmtCurrency(payoutProfit)} tone="primary" />
                <ResultCard label="Total return" value={fmtCurrency(payoutReturn)} />
                <ResultCard label="ROI" value={fmtPercent(payoutRoi)} />
              </div>
            ) : payoutOutcome === "lose" && payoutStakeValue !== null ? (
              <div className="grid gap-4 md:grid-cols-3">
                <ResultCard label="Loss" value={`-${fmtCurrency(payoutStakeValue)}`} tone="primary" />
                <ResultCard label="Total return" value={fmtCurrency(0)} />
                <ResultCard label="ROI" value="-100.0%" />
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--ghost-border)] bg-muted/35 p-8 text-sm text-muted-foreground">
                Enter a stake and valid odds to see profit, return, and ROI instantly.
              </div>
            )}
          </TabsContent>

          <TabsContent value="implied" className="space-y-6">
            <div className="inline-flex rounded-full bg-muted/60 p-1">
              {(["odds", "probability"] as Array<"odds" | "probability">).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setImpliedMode(mode)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    impliedMode === mode ? "bg-card text-primary" : "text-muted-foreground"
                  )}
                >
                  {mode === "odds" ? "Odds to probability" : "Probability to odds"}
                </button>
              ))}
            </div>

            {impliedMode === "odds" ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                <FieldCard label="Odds">
                  <input
                    type="text"
                    value={impliedOdds}
                    onChange={(event) => setImpliedOdds(event.target.value)}
                    placeholder={impliedFormat === "american" ? "-110" : impliedFormat === "decimal" ? "1.91" : "10/11"}
                    className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </FieldCard>
                <FieldCard label="Format">
                  <select
                    value={impliedFormat}
                    onChange={(event) => setImpliedFormat(event.target.value as OddsFormat)}
                    className="w-full bg-transparent text-lg font-semibold text-foreground outline-none"
                  >
                    {oddsFormatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldCard>
              </div>
            ) : (
              <FieldCard label="Probability %">
                <input
                  type="text"
                  inputMode="decimal"
                  value={probabilityInput}
                  onChange={(event) => setProbabilityInput(event.target.value)}
                  placeholder="52.4"
                  className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </FieldCard>
            )}

            {impliedMode === "odds" && impliedOddsResult ? (
              <>
                <div className="rounded-[1.5rem] bg-primary/[0.08] p-6">
                  <ProbabilityBar probability={impliedOddsResult.impliedProbability} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <ResultCard label="American" value={formatAmericanOdds(impliedOddsResult.american)} />
                  <ResultCard label="Decimal" value={formatDecimalOdds(impliedOddsResult.decimal)} tone="primary" />
                  <ResultCard label="Fractional" value={impliedOddsResult.fractional} />
                </div>
              </>
            ) : impliedMode === "probability" && probabilityValue !== null && probabilityOdds ? (
              <>
                <div className="rounded-[1.5rem] bg-primary/[0.08] p-6">
                  <ProbabilityBar probability={probabilityValue} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <ResultCard label="American" value={formatAmericanOdds(probabilityOdds.american)} />
                  <ResultCard label="Decimal" value={formatDecimalOdds(probabilityOdds.decimal)} tone="primary" />
                  <ResultCard label="Fractional" value={probabilityOdds.fractional} />
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--ghost-border)] bg-muted/35 p-8 text-sm text-muted-foreground">
                Enter valid odds or a probability percentage to convert between price and implied chance.
              </div>
            )}

            <div className="rounded-[1.5rem] bg-muted/35 p-5">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Market vig / juice
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                  Two-sided American market
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldCard label="Team A">
                  <input
                    type="text"
                    value={marketA}
                    onChange={(event) => setMarketA(event.target.value)}
                    placeholder="-150"
                    className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </FieldCard>
                <FieldCard label="Team B">
                  <input
                    type="text"
                    value={marketB}
                    onChange={(event) => setMarketB(event.target.value)}
                    placeholder="+130"
                    className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </FieldCard>
              </div>

              {vigResult ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <ResultCard label="Combined implied" value={fmtPercent(vigResult.combinedProbability * 100)} />
                  <ResultCard label="Vig / juice" value={fmtPercent(vigResult.vig * 100)} tone="primary" />
                  <ResultCard label="Team A fair" value={formatProbability(vigResult.fairProbabilityA)} />
                  <ResultCard label="Team B fair" value={formatProbability(vigResult.fairProbabilityB)} />
                  <ResultCard label="No-vig split" value={`${fmtPercent(vigResult.fairProbabilityA * 100)} / ${fmtPercent(vigResult.fairProbabilityB * 100)}`} />
                </div>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>

        <TipJar />
      </div>
    </ToolPageLayout>
  );
}
