export interface ConversionUnit {
  label: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export interface UnitConverterConfig {
  category: string;
  description: string;
  units: ConversionUnit[];
  defaultFromUnit: string;
  defaultToUnit: string;
}

// ─── Length (base: meter) ───────────────────────────────────────────────
export const lengthConfig: UnitConverterConfig = {
  category: "Length",
  description: "Convert between metric and imperial length units",
  units: [
    { label: "Millimeters", symbol: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Centimeters", symbol: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { label: "Meters", symbol: "m", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilometers", symbol: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Inches", symbol: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { label: "Feet", symbol: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { label: "Yards", symbol: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { label: "Miles", symbol: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { label: "Nautical Miles", symbol: "nmi", toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
  ],
  defaultFromUnit: "m",
  defaultToUnit: "ft",
};

// ─── Weight (base: kilogram) ────────────────────────────────────────────
export const weightConfig: UnitConverterConfig = {
  category: "Weight",
  description: "Convert between metric and imperial weight units",
  units: [
    { label: "Milligrams", symbol: "mg", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    { label: "Grams", symbol: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Kilograms", symbol: "kg", toBase: (v) => v, fromBase: (v) => v },
    { label: "Metric Tons", symbol: "t", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Ounces", symbol: "oz", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { label: "Pounds", symbol: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { label: "Stone", symbol: "st", toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
  ],
  defaultFromUnit: "kg",
  defaultToUnit: "lb",
};

// ─── Temperature (base: Kelvin — special non-linear) ────────────────────
export const temperatureConfig: UnitConverterConfig = {
  category: "Temperature",
  description: "Convert between Celsius, Fahrenheit, and Kelvin",
  units: [
    {
      label: "Celsius",
      symbol: "\u00B0C",
      toBase: (v) => v + 273.15,
      fromBase: (v) => v - 273.15,
    },
    {
      label: "Fahrenheit",
      symbol: "\u00B0F",
      toBase: (v) => (v - 32) * 5 / 9 + 273.15,
      fromBase: (v) => (v - 273.15) * 9 / 5 + 32,
    },
    {
      label: "Kelvin",
      symbol: "K",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
  ],
  defaultFromUnit: "\u00B0F",
  defaultToUnit: "\u00B0C",
};

// ─── Volume (base: liter) ──────────────────────────────────────────────
export const volumeConfig: UnitConverterConfig = {
  category: "Volume",
  description: "Convert between metric and imperial volume units",
  units: [
    { label: "Milliliters", symbol: "ml", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Liters", symbol: "l", toBase: (v) => v, fromBase: (v) => v },
    { label: "Gallons (US)", symbol: "gal", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    { label: "Quarts (US)", symbol: "qt", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    { label: "Pints (US)", symbol: "pt", toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    { label: "Cups", symbol: "cup", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    { label: "Fluid Ounces (US)", symbol: "fl oz", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    { label: "Tablespoons", symbol: "tbsp", toBase: (v) => v * 0.0147868, fromBase: (v) => v / 0.0147868 },
    { label: "Teaspoons", symbol: "tsp", toBase: (v) => v * 0.00492892, fromBase: (v) => v / 0.00492892 },
  ],
  defaultFromUnit: "l",
  defaultToUnit: "gal",
};

// ─── Area (base: square meter) ─────────────────────────────────────────
export const areaConfig: UnitConverterConfig = {
  category: "Area",
  description: "Convert between metric and imperial area units",
  units: [
    { label: "Square Millimeters", symbol: "mm\u00B2", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    { label: "Square Centimeters", symbol: "cm\u00B2", toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
    { label: "Square Meters", symbol: "m\u00B2", toBase: (v) => v, fromBase: (v) => v },
    { label: "Square Kilometers", symbol: "km\u00B2", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { label: "Square Miles", symbol: "mi\u00B2", toBase: (v) => v * 2589988, fromBase: (v) => v / 2589988 },
    { label: "Square Yards", symbol: "yd\u00B2", toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
    { label: "Square Feet", symbol: "ft\u00B2", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    { label: "Square Inches", symbol: "in\u00B2", toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
    { label: "Acres", symbol: "ac", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { label: "Hectares", symbol: "ha", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  ],
  defaultFromUnit: "m\u00B2",
  defaultToUnit: "ft\u00B2",
};

// ─── Speed (base: m/s) ─────────────────────────────────────────────────
export const speedConfig: UnitConverterConfig = {
  category: "Speed",
  description: "Convert between speed and velocity units",
  units: [
    { label: "Meters per Second", symbol: "m/s", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilometers per Hour", symbol: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { label: "Miles per Hour", symbol: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { label: "Knots", symbol: "kn", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { label: "Feet per Second", symbol: "ft/s", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  ],
  defaultFromUnit: "mph",
  defaultToUnit: "km/h",
};

// ─── Time (base: second) ───────────────────────────────────────────────
export const timeConfig: UnitConverterConfig = {
  category: "Time",
  description: "Convert between time units from milliseconds to years",
  units: [
    { label: "Milliseconds", symbol: "ms", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Seconds", symbol: "s", toBase: (v) => v, fromBase: (v) => v },
    { label: "Minutes", symbol: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    { label: "Hours", symbol: "hr", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { label: "Days", symbol: "day", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    { label: "Weeks", symbol: "wk", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    { label: "Months (avg)", symbol: "mo", toBase: (v) => v * 2629800, fromBase: (v) => v / 2629800 },
    { label: "Years", symbol: "yr", toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
  ],
  defaultFromUnit: "hr",
  defaultToUnit: "min",
};

// ─── Data (base: byte) ─────────────────────────────────────────────────
export const dataConfig: UnitConverterConfig = {
  category: "Data",
  description: "Convert between digital data storage and transfer units",
  units: [
    { label: "Bits", symbol: "bit", toBase: (v) => v / 8, fromBase: (v) => v * 8 },
    { label: "Bytes", symbol: "B", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilobytes", symbol: "KB", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { label: "Megabytes", symbol: "MB", toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
    { label: "Gigabytes", symbol: "GB", toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
    { label: "Terabytes", symbol: "TB", toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    { label: "Petabytes", symbol: "PB", toBase: (v) => v * 1125899906842624, fromBase: (v) => v / 1125899906842624 },
    { label: "Megabits", symbol: "Mbit", toBase: (v) => v * 125000, fromBase: (v) => v / 125000 },
    { label: "Gigabits", symbol: "Gbit", toBase: (v) => v * 125000000, fromBase: (v) => v / 125000000 },
  ],
  defaultFromUnit: "MB",
  defaultToUnit: "GB",
};

// ─── Pressure (base: pascal) ────────────────────────────────────────────
export const pressureConfig: UnitConverterConfig = {
  category: "Pressure",
  description: "Convert between pressure units like PSI, bar, and atm",
  units: [
    { label: "Pascals", symbol: "Pa", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilopascals", symbol: "kPa", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Bar", symbol: "bar", toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
    { label: "PSI", symbol: "psi", toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
    { label: "Atmospheres", symbol: "atm", toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
    { label: "mmHg", symbol: "mmHg", toBase: (v) => v * 133.322, fromBase: (v) => v / 133.322 },
  ],
  defaultFromUnit: "psi",
  defaultToUnit: "bar",
};

// ─── Energy (base: joule) ──────────────────────────────────────────────
export const energyConfig: UnitConverterConfig = {
  category: "Energy",
  description: "Convert between energy units like joules, calories, and kWh",
  units: [
    { label: "Joules", symbol: "J", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilojoules", symbol: "kJ", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Calories (small)", symbol: "cal", toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
    { label: "Kilocalories (food Cal)", symbol: "kcal", toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
    { label: "BTU", symbol: "BTU", toBase: (v) => v * 1055.06, fromBase: (v) => v / 1055.06 },
    { label: "Kilowatt-hours", symbol: "kWh", toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
    { label: "Watt-hours", symbol: "Wh", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { label: "Electronvolts", symbol: "eV", toBase: (v) => v * 1.60218e-19, fromBase: (v) => v / 1.60218e-19 },
  ],
  defaultFromUnit: "kcal",
  defaultToUnit: "kJ",
};

// ─── Frequency (base: Hz) ──────────────────────────────────────────────
export const frequencyConfig: UnitConverterConfig = {
  category: "Frequency",
  description: "Convert between frequency units like Hz, kHz, MHz, and GHz",
  units: [
    { label: "Hertz", symbol: "Hz", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilohertz", symbol: "kHz", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Megahertz", symbol: "MHz", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { label: "Gigahertz", symbol: "GHz", toBase: (v) => v * 1000000000, fromBase: (v) => v / 1000000000 },
  ],
  defaultFromUnit: "MHz",
  defaultToUnit: "GHz",
};

// ─── Fuel Economy (base: L/100km — special inverse) ─────────────────────
export const fuelEconomyConfig: UnitConverterConfig = {
  category: "Fuel Economy",
  description: "Convert between fuel economy units like MPG and L/100km",
  units: [
    {
      label: "L/100km",
      symbol: "L/100km",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      label: "Miles per Gallon (US)",
      symbol: "mpg",
      toBase: (v) => (v === 0 ? 0 : 235.215 / v),
      fromBase: (v) => (v === 0 ? 0 : 235.215 / v),
    },
    {
      label: "Miles per Gallon (UK)",
      symbol: "mpg (UK)",
      toBase: (v) => (v === 0 ? 0 : 282.481 / v),
      fromBase: (v) => (v === 0 ? 0 : 282.481 / v),
    },
    {
      label: "Kilometers per Liter",
      symbol: "km/L",
      toBase: (v) => (v === 0 ? 0 : 100 / v),
      fromBase: (v) => (v === 0 ? 0 : 100 / v),
    },
  ],
  defaultFromUnit: "mpg",
  defaultToUnit: "L/100km",
};

// ─── Angle (base: degree) ──────────────────────────────────────────────
export const angleConfig: UnitConverterConfig = {
  category: "Angle",
  description: "Convert between angle units like degrees, radians, and gradians",
  units: [
    { label: "Degrees", symbol: "\u00B0", toBase: (v) => v, fromBase: (v) => v },
    { label: "Radians", symbol: "rad", toBase: (v) => v * (180 / Math.PI), fromBase: (v) => v * (Math.PI / 180) },
    { label: "Gradians", symbol: "grad", toBase: (v) => v * 0.9, fromBase: (v) => v / 0.9 },
    { label: "Arcminutes", symbol: "arcmin", toBase: (v) => v / 60, fromBase: (v) => v * 60 },
    { label: "Arcseconds", symbol: "arcsec", toBase: (v) => v / 3600, fromBase: (v) => v * 3600 },
  ],
  defaultFromUnit: "\u00B0",
  defaultToUnit: "rad",
};

// ─── Power (base: watt) ────────────────────────────────────────────────
export const powerConfig: UnitConverterConfig = {
  category: "Power",
  description: "Convert between power units like watts, kilowatts, and horsepower",
  units: [
    { label: "Watts", symbol: "W", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilowatts", symbol: "kW", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Megawatts", symbol: "MW", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { label: "Horsepower", symbol: "hp", toBase: (v) => v * 745.7, fromBase: (v) => v / 745.7 },
    { label: "BTU/hour", symbol: "BTU/hr", toBase: (v) => v * 0.293071, fromBase: (v) => v / 0.293071 },
  ],
  defaultFromUnit: "hp",
  defaultToUnit: "kW",
};

// ─── Force (base: newton) ──────────────────────────────────────────────
export const forceConfig: UnitConverterConfig = {
  category: "Force",
  description: "Convert between force units like newtons, pounds-force, and dynes",
  units: [
    { label: "Newtons", symbol: "N", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilonewtons", symbol: "kN", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Pounds-force", symbol: "lbf", toBase: (v) => v * 4.44822, fromBase: (v) => v / 4.44822 },
    { label: "Kilograms-force", symbol: "kgf", toBase: (v) => v * 9.80665, fromBase: (v) => v / 9.80665 },
    { label: "Dynes", symbol: "dyn", toBase: (v) => v / 100000, fromBase: (v) => v * 100000 },
  ],
  defaultFromUnit: "N",
  defaultToUnit: "lbf",
};

// ─── Cooking (uses volume base: liter) ─────────────────────────────────
export const cookingConfig: UnitConverterConfig = {
  category: "Cooking",
  description: "Convert between common cooking measurement units",
  units: [
    { label: "Teaspoons", symbol: "tsp", toBase: (v) => v * 0.00492892, fromBase: (v) => v / 0.00492892 },
    { label: "Tablespoons", symbol: "tbsp", toBase: (v) => v * 0.0147868, fromBase: (v) => v / 0.0147868 },
    { label: "Fluid Ounces", symbol: "fl oz", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    { label: "Cups", symbol: "cup", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    { label: "Pints", symbol: "pt", toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    { label: "Quarts", symbol: "qt", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    { label: "Liters", symbol: "l", toBase: (v) => v, fromBase: (v) => v },
    { label: "Milliliters", symbol: "ml", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  ],
  defaultFromUnit: "cup",
  defaultToUnit: "ml",
};

// Map of slug → config for page routing
export const converterConfigs: Record<string, UnitConverterConfig> = {
  length: lengthConfig,
  weight: weightConfig,
  temperature: temperatureConfig,
  volume: volumeConfig,
  area: areaConfig,
  speed: speedConfig,
  time: timeConfig,
  data: dataConfig,
  pressure: pressureConfig,
  energy: energyConfig,
  frequency: frequencyConfig,
  "fuel-economy": fuelEconomyConfig,
  angle: angleConfig,
  power: powerConfig,
  force: forceConfig,
  cooking: cookingConfig,
};
