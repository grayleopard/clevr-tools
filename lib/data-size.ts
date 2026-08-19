export type DataSizeSystem = "base" | "si" | "iec" | "bit";

export type DataSizeMode = "si" | "iec" | "all";

export interface DataSizeUnit {
  symbol: string;
  label: string;
  system: DataSizeSystem;
  bytesPerUnit: number;
  scale: number;
}

export interface DataSizeModeDefinition {
  id: DataSizeMode;
  label: string;
  description: string;
}

const SI_FACTORS = [1e3, 1e6, 1e9, 1e12, 1e15] as const;
const IEC_FACTORS = [2 ** 10, 2 ** 20, 2 ** 30, 2 ** 40, 2 ** 50] as const;
const BIT_FACTORS = [1 / 8, 1e3 / 8, 1e6 / 8, 1e9 / 8, 1e12 / 8, 1e15 / 8] as const;

export const DATA_SIZE_UNIT_REGISTRY: readonly DataSizeUnit[] = [
  { symbol: "B", label: "Bytes", system: "base", bytesPerUnit: 1, scale: 0 },
  { symbol: "kB", label: "Kilobytes", system: "si", bytesPerUnit: SI_FACTORS[0], scale: 1 },
  { symbol: "MB", label: "Megabytes", system: "si", bytesPerUnit: SI_FACTORS[1], scale: 2 },
  { symbol: "GB", label: "Gigabytes", system: "si", bytesPerUnit: SI_FACTORS[2], scale: 3 },
  { symbol: "TB", label: "Terabytes", system: "si", bytesPerUnit: SI_FACTORS[3], scale: 4 },
  { symbol: "PB", label: "Petabytes", system: "si", bytesPerUnit: SI_FACTORS[4], scale: 5 },
  { symbol: "KiB", label: "Kibibytes", system: "iec", bytesPerUnit: IEC_FACTORS[0], scale: 1 },
  { symbol: "MiB", label: "Mebibytes", system: "iec", bytesPerUnit: IEC_FACTORS[1], scale: 2 },
  { symbol: "GiB", label: "Gibibytes", system: "iec", bytesPerUnit: IEC_FACTORS[2], scale: 3 },
  { symbol: "TiB", label: "Tebibytes", system: "iec", bytesPerUnit: IEC_FACTORS[3], scale: 4 },
  { symbol: "PiB", label: "Pebibytes", system: "iec", bytesPerUnit: IEC_FACTORS[4], scale: 5 },
  { symbol: "bit", label: "Bits", system: "bit", bytesPerUnit: BIT_FACTORS[0], scale: 0 },
  { symbol: "kbit", label: "Kilobits", system: "bit", bytesPerUnit: BIT_FACTORS[1], scale: 1 },
  { symbol: "Mbit", label: "Megabits", system: "bit", bytesPerUnit: BIT_FACTORS[2], scale: 2 },
  { symbol: "Gbit", label: "Gigabits", system: "bit", bytesPerUnit: BIT_FACTORS[3], scale: 3 },
  { symbol: "Tbit", label: "Terabits", system: "bit", bytesPerUnit: BIT_FACTORS[4], scale: 4 },
  { symbol: "Pbit", label: "Petabits", system: "bit", bytesPerUnit: BIT_FACTORS[5], scale: 5 },
];

export const DATA_SIZE_MODES: readonly DataSizeModeDefinition[] = [
  {
    id: "si",
    label: "SI decimal",
    description: "Default · kB, MB, GB, TB and PB use powers of 1,000.",
  },
  {
    id: "iec",
    label: "IEC binary",
    description: "KiB, MiB, GiB, TiB and PiB use powers of 1,024.",
  },
  {
    id: "all",
    label: "Compare both",
    description: "Show SI and IEC byte units together for cross-system conversions.",
  },
];

export const DEFAULT_DATA_SIZE_MODE: DataSizeMode = "si";

export function getDataSizeUnit(symbol: string): DataSizeUnit {
  const unit = DATA_SIZE_UNIT_REGISTRY.find((candidate) => candidate.symbol === symbol);
  if (!unit) throw new Error(`Unknown data-size unit: ${symbol}`);
  return unit;
}

export function convertDataSize(value: number, fromSymbol: string, toSymbol: string): number {
  const from = getDataSizeUnit(fromSymbol);
  const to = getDataSizeUnit(toSymbol);
  return (value * from.bytesPerUnit) / to.bytesPerUnit;
}

export function getDataSizeUnitsForMode(mode: DataSizeMode): readonly DataSizeUnit[] {
  if (mode === "all") return DATA_SIZE_UNIT_REGISTRY;
  return DATA_SIZE_UNIT_REGISTRY.filter(
    (unit) => unit.system === "base" || unit.system === "bit" || unit.system === mode
  );
}

export function getCompatibleDataSizeSymbol(symbol: string, mode: DataSizeMode): string {
  const unit = getDataSizeUnit(symbol);
  if (mode === "all" || unit.system === "base" || unit.system === "bit" || unit.system === mode) {
    return symbol;
  }
  return DATA_SIZE_UNIT_REGISTRY.find(
    (candidate) => candidate.system === mode && candidate.scale === unit.scale
  )?.symbol ?? "B";
}

export function formatExactDataSizeValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  const [integer, fraction] = String(value).split(".");
  const groupedInteger = Number(integer).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return fraction ? `${groupedInteger}.${fraction}` : groupedInteger;
}

function definition(symbol: string): string {
  const unit = getDataSizeUnit(symbol);
  return `1 ${symbol} = ${formatExactDataSizeValue(unit.bytesPerUnit)} B`;
}

export const DATA_SIZE_REFERENCE_ROWS = DATA_SIZE_UNIT_REGISTRY
  .filter((unit) => unit.system === "si" || unit.system === "iec")
  .map((unit) => ({
    system: unit.system === "si" ? "SI decimal" : "IEC binary",
    unit: `1 ${unit.symbol}`,
    bytes: `${formatExactDataSizeValue(unit.bytesPerUnit)} B`,
  }));

function workedExample(
  value: number,
  from: string,
  targets: readonly string[],
  suffix = ""
) {
  const parts = [
    `${formatExactDataSizeValue(value)} ${from}${suffix}`,
    ...targets.map(
      (target) =>
        `${formatExactDataSizeValue(convertDataSize(value, from, target))} ${target}${suffix}`
    ),
  ];
  return {
    value,
    from,
    targets: targets.map((symbol) => ({
      symbol,
      value: convertDataSize(value, from, symbol),
    })),
    text: parts.join(" = "),
  };
}

export const DATA_SIZE_WORKED_EXAMPLES = [
  workedExample(1, "MB", ["B", "Mbit"]),
  workedExample(1, "MiB", ["B", "Mbit"]),
  workedExample(1, "GB", ["MB"]),
  workedExample(1, "GiB", ["MiB", "GB"]),
  workedExample(1, "TB", ["B", "GiB"]),
  {
    ...workedExample(100, "Mbit", ["MB", "MiB"], "/s"),
    text: `100 Mbit/s ÷ 8 = ${formatExactDataSizeValue(convertDataSize(100, "Mbit", "MB"))} MB/s = ${formatExactDataSizeValue(convertDataSize(100, "Mbit", "MiB"))} MiB/s`,
  },
] as const;

export const DATA_SIZE_COMPATIBILITY_NOTE =
  "Use SI symbols such as MB, GB, TB and PB for standard 1,000-based values. Choose IEC units such as MiB, GiB, TiB or PiB when the source uses 1,024-based binary quantities.";

const availableSymbols = DATA_SIZE_UNIT_REGISTRY.map((unit) => unit.symbol).join(", ");

export const DATA_SIZE_FAQS = [
  {
    question: "What data units can I convert between?",
    answer: `The converter supports ${availableSymbols}. SI byte units are decimal, IEC byte units are binary, and bit multiples use decimal prefixes.`,
  },
  {
    question: "What is the difference between kB and KiB?",
    answer: `${definition("kB")}, while ${definition("KiB")}. The lowercase k in kB is the SI symbol; KiB is the unambiguous IEC binary symbol.`,
  },
  {
    question: "What is the difference between megabits and megabytes?",
    answer: `${definition("Mbit")}, while ${definition("MB")}. There are always 8 bits in 1 byte, so 100 Mbit/s equals ${formatExactDataSizeValue(convertDataSize(100, "Mbit", "MB"))} MB/s.`,
  },
  {
    question: "Which data-size system is the default?",
    answer: `SI decimal is the default, so ${definition("MB")} and 1 GB = ${formatExactDataSizeValue(convertDataSize(1, "GB", "MB"))} MB. Select IEC binary for 1,024-based units or Compare both for SI-to-IEC conversions. ${DATA_SIZE_COMPATIBILITY_NOTE}`,
  },
  {
    question: "Is the data size converter free?",
    answer: "Yes. This converter is free with no signup, and all calculations run in your browser.",
  },
] as const;

const referenceTableRows = DATA_SIZE_REFERENCE_ROWS.map(
  (row) => `<tr><td>${row.unit}</td><td>${row.system}</td><td>${row.bytes}</td></tr>`
).join("");
const workedExampleItems = DATA_SIZE_WORKED_EXAMPLES.map(
  (example) => `<li><code>${example.text}</code></li>`
).join("");

export const dataSizeSeoContent = `
  <h2>When to use this</h2>
  <p>Use this converter when a file, storage plan, memory value, or network speed is expressed in a different data unit than the one you need. It converts directly between decimal SI byte units, binary IEC byte units, bytes, and decimal bit multiples.</p>

  <h2>SI decimal and IEC binary units</h2>
  <p>SI decimal units use powers of 1,000: ${definition("kB")}, ${definition("MB")}, and ${definition("GB")}. IEC binary units use powers of 1,024: ${definition("KiB")}, ${definition("MiB")}, and ${definition("GiB")}. The symbols are not interchangeable.</p>
  <p>SI decimal is the calculator default. Select IEC binary when the source explicitly uses KiB, MiB, GiB, TiB, or PiB. Select Compare both to convert across the two systems.</p>
  <p>${DATA_SIZE_COMPATIBILITY_NOTE}</p>

  <h2>Worked examples</h2>
  <ul>${workedExampleItems}</ul>

  <h2>Quick reference</h2>
  <table>
    <thead><tr><th>Unit</th><th>System</th><th>Exact bytes</th></tr></thead>
    <tbody>${referenceTableRows}</tbody>
  </table>
`;
