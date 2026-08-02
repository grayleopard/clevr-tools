export type SearchCategory =
  | "compress"
  | "convert"
  | "generate"
  | "ai"
  | "tools"
  | "text"
  | "dev"
  | "calc"
  | "time"
  | "type"
  | "files";

export interface SearchTool {
  name: string;
  route: string;
  category: SearchCategory;
  shortDescription: string;
  aliases: readonly string[];
  icon: string;
}

/**
 * Browser-safe projection of the live tool registry. Keep this intentionally
 * small: the full registry also contains long-form SEO copy and server-only
 * metadata that should never ship with the command palette.
 */
export const searchIndex: readonly SearchTool[] = [
  {
    "name": "Image Compressor",
    "route": "/compress/image",
    "category": "compress",
    "shortDescription": "Compress JPG, PNG & WebP images and compare the result.",
    "aliases": [
      "shrink image",
      "reduce image size",
      "make image smaller",
      "compress photo"
    ],
    "icon": "ImageDown"
  },
  {
    "name": "GIF Compressor",
    "route": "/tools/gif-compressor",
    "category": "compress",
    "shortDescription": "Compress animated GIFs in your browser while preserving motion.",
    "aliases": [
      "shrink gif",
      "reduce gif size",
      "make gif smaller"
    ],
    "icon": "Minimize2"
  },
  {
    "name": "PNG to JPG Converter",
    "route": "/convert/png-to-jpg",
    "category": "convert",
    "shortDescription": "Convert PNG images to JPG with a white background fill.",
    "aliases": [],
    "icon": "FileImage"
  },
  {
    "name": "QR Code Generator",
    "route": "/generate/qr-code",
    "category": "generate",
    "shortDescription": "Generate QR codes for URLs or text. Download as PNG or SVG.",
    "aliases": [
      "make qr code",
      "generate qr"
    ],
    "icon": "QrCode"
  },
  {
    "name": "WebP to PNG Converter",
    "route": "/convert/webp-to-png",
    "category": "convert",
    "shortDescription": "Convert WebP images to lossless PNG — batch supported.",
    "aliases": [],
    "icon": "FileImage"
  },
  {
    "name": "PNG to WebP Converter",
    "route": "/convert/png-to-webp",
    "category": "convert",
    "shortDescription": "Convert PNG images to WebP for smaller web-ready files.",
    "aliases": [],
    "icon": "Layers"
  },
  {
    "name": "JPG to PNG Converter",
    "route": "/convert/jpg-to-png",
    "category": "convert",
    "shortDescription": "Convert JPG images to lossless PNG — batch supported.",
    "aliases": [],
    "icon": "FileImage"
  },
  {
    "name": "PDF Compressor",
    "route": "/compress/pdf",
    "category": "compress",
    "shortDescription": "Strip metadata and reduce PDF file size in your browser.",
    "aliases": [
      "shrink pdf",
      "reduce pdf size",
      "make pdf smaller"
    ],
    "icon": "FileText"
  },
  {
    "name": "PDF to JPG Converter",
    "route": "/convert/pdf-to-jpg",
    "category": "convert",
    "shortDescription": "Convert PDF pages to high-quality JPG images — batch supported.",
    "aliases": [],
    "icon": "ImageDown"
  },
  {
    "name": "JPG to PDF Converter",
    "route": "/convert/jpg-to-pdf",
    "category": "convert",
    "shortDescription": "Combine JPG, PNG & WebP images into a single PDF document.",
    "aliases": [],
    "icon": "FileText"
  },
  {
    "name": "Merge PDF",
    "route": "/tools/merge-pdf",
    "category": "tools",
    "shortDescription": "Combine multiple PDF files into one — drag to reorder.",
    "aliases": [
      "combine pdf",
      "join pdf",
      "pdf merger"
    ],
    "icon": "GitMerge"
  },
  {
    "name": "Split PDF",
    "route": "/tools/split-pdf",
    "category": "tools",
    "shortDescription": "Split a PDF into individual pages or custom page ranges.",
    "aliases": [
      "separate pdf",
      "extract pdf pages",
      "divide pdf"
    ],
    "icon": "Scissors"
  },
  {
    "name": "Rotate PDF",
    "route": "/tools/rotate-pdf",
    "category": "tools",
    "shortDescription": "Rotate PDF pages individually or all at once.",
    "aliases": [
      "turn pdf",
      "flip pdf pages"
    ],
    "icon": "RotateCw"
  },
  {
    "name": "Image Resizer",
    "route": "/tools/resize-image",
    "category": "tools",
    "shortDescription": "Resize images by dimensions, presets, or target file size.",
    "aliases": [
      "scale image",
      "change image dimensions",
      "change image size"
    ],
    "icon": "Scaling"
  },
  {
    "name": "PNG to PDF Converter",
    "route": "/convert/png-to-pdf",
    "category": "convert",
    "shortDescription": "Convert PNG images to a PDF document — drag to reorder.",
    "aliases": [],
    "icon": "FileText"
  },
  {
    "name": "Word to PDF Converter",
    "route": "/convert/word-to-pdf",
    "category": "convert",
    "shortDescription": "Convert .docx Word documents to PDF — 100% in your browser.",
    "aliases": [],
    "icon": "FileText"
  },
  {
    "name": "Word Counter",
    "route": "/text/word-counter",
    "category": "text",
    "shortDescription": "Count words, characters, sentences, paragraphs, and more — in real time.",
    "aliases": [
      "count words",
      "character count"
    ],
    "icon": "Hash"
  },
  {
    "name": "Case Converter",
    "route": "/text/case-converter",
    "category": "text",
    "shortDescription": "Convert text between uppercase, lowercase, title case, camelCase, and more.",
    "aliases": [
      "uppercase lowercase",
      "change text case",
      "capitalize text"
    ],
    "icon": "CaseSensitive"
  },
  {
    "name": "Lorem Ipsum Generator",
    "route": "/text/lorem-generator",
    "category": "text",
    "shortDescription": "Generate placeholder text by paragraphs, sentences, or word count.",
    "aliases": [
      "placeholder text",
      "dummy text",
      "filler text"
    ],
    "icon": "AlignLeft"
  },
  {
    "name": "Remove Line Breaks",
    "route": "/text/remove-line-breaks",
    "category": "text",
    "shortDescription": "Clean up messy text — remove line breaks, extra spaces, and empty lines.",
    "aliases": [
      "strip newlines",
      "remove new lines"
    ],
    "icon": "Eraser"
  },
  {
    "name": "Text to Slug",
    "route": "/text/text-to-slug",
    "category": "text",
    "shortDescription": "Convert any text to a clean, URL-friendly slug instantly.",
    "aliases": [
      "url slug",
      "slugify"
    ],
    "icon": "Link2"
  },
  {
    "name": "Character Counter",
    "route": "/text/character-counter",
    "category": "text",
    "shortDescription": "Count characters, words, and lines. See real-time limits for Twitter, Instagram, SMS, and more.",
    "aliases": [
      "count characters",
      "letter count"
    ],
    "icon": "Hash"
  },
  {
    "name": "JSON Formatter",
    "route": "/dev/json-formatter",
    "category": "dev",
    "shortDescription": "Format, validate, and minify JSON. Instant error detection with line numbers.",
    "aliases": [
      "pretty print json",
      "validate json",
      "minify json"
    ],
    "icon": "Braces"
  },
  {
    "name": "Find & Replace",
    "route": "/text/find-and-replace",
    "category": "text",
    "shortDescription": "Find and replace text online. Supports plain text, case-sensitive, and regex modes.",
    "aliases": [
      "text replace",
      "search and replace"
    ],
    "icon": "Replace"
  },
  {
    "name": "Sort Lines",
    "route": "/text/sort-lines",
    "category": "text",
    "shortDescription": "Sort lines of text alphabetically, by length, randomly, or remove duplicates.",
    "aliases": [
      "alphabetize lines",
      "sort text alphabetically"
    ],
    "icon": "ArrowUpDown"
  },
  {
    "name": "Base64 Encode / Decode",
    "route": "/dev/base64",
    "category": "dev",
    "shortDescription": "Encode text to Base64 or decode Base64 back to plain text. Handles Unicode.",
    "aliases": [
      "encode base64",
      "decode base64"
    ],
    "icon": "Binary"
  },
  {
    "name": "Password Generator",
    "route": "/generate/password",
    "category": "generate",
    "shortDescription": "Generate random passwords with custom length and character sets.",
    "aliases": [
      "random password",
      "strong password"
    ],
    "icon": "KeyRound"
  },
  {
    "name": "Random Number Generator",
    "route": "/generate/random-number",
    "category": "generate",
    "shortDescription": "Generate random numbers in any range. Supports multiple results, dice, and coin flip.",
    "aliases": [
      "dice roll",
      "random number picker"
    ],
    "icon": "Dices"
  },
  {
    "name": "Color Picker",
    "route": "/dev/color-picker",
    "category": "dev",
    "shortDescription": "Pick colors and convert between HEX, RGB, HSL, and HSB formats instantly.",
    "aliases": [
      "hex to rgb",
      "color converter",
      "rgb to hex"
    ],
    "icon": "Pipette"
  },
  {
    "name": "Percentage Calculator",
    "route": "/calc/percentage",
    "category": "calc",
    "shortDescription": "Calculate percentages, percentage change, and what percent X is of Y.",
    "aliases": [],
    "icon": "Percent"
  },
  {
    "name": "Odds Calculator",
    "route": "/calc/odds-calculator",
    "category": "calc",
    "shortDescription": "Convert betting odds, calculate parlays, payouts, and implied probability.",
    "aliases": [
      "betting odds"
    ],
    "icon": "Percent"
  },
  {
    "name": "Unit Converter",
    "route": "/calc/unit-converter",
    "category": "calc",
    "shortDescription": "Convert between units of length, weight, temperature, volume, area, speed, and data.",
    "aliases": [
      "convert units"
    ],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "URL Encoder / Decoder",
    "route": "/dev/url-encoder",
    "category": "dev",
    "shortDescription": "Encode or decode URLs and query string parameters.",
    "aliases": [
      "encode url",
      "percent encoding",
      "uri encode"
    ],
    "icon": "Link"
  },
  {
    "name": "Timer",
    "route": "/time/timer",
    "category": "time",
    "shortDescription": "Countdown timer with sound alerts and quick presets. Works in background tabs.",
    "aliases": [
      "countdown timer"
    ],
    "icon": "Timer"
  },
  {
    "name": "Stopwatch",
    "route": "/time/stopwatch",
    "category": "time",
    "shortDescription": "Precise online stopwatch with lap timing. Highlights fastest and slowest laps.",
    "aliases": [
      "time tracker"
    ],
    "icon": "Watch"
  },
  {
    "name": "Pomodoro Timer",
    "route": "/time/pomodoro",
    "category": "time",
    "shortDescription": "Pomodoro Technique timer with focus/break cycles and customizable intervals.",
    "aliases": [
      "focus timer"
    ],
    "icon": "Brain"
  },
  {
    "name": "Age Calculator",
    "route": "/calc/age",
    "category": "calc",
    "shortDescription": "Calculate your exact age in years, months, days, hours, and minutes from your birthday.",
    "aliases": [
      "how old am i"
    ],
    "icon": "Cake"
  },
  {
    "name": "Date Difference",
    "route": "/calc/date-difference",
    "category": "calc",
    "shortDescription": "Calculate days, weeks, and business days between any two dates.",
    "aliases": [
      "days between dates"
    ],
    "icon": "CalendarDays"
  },
  {
    "name": "UUID Generator",
    "route": "/dev/uuid",
    "category": "dev",
    "shortDescription": "Generate random UUIDs (v4 and v7). Bulk generate up to 100 at once.",
    "aliases": [
      "generate guid",
      "random id"
    ],
    "icon": "Fingerprint"
  },
  {
    "name": "BMI Calculator",
    "route": "/calc/bmi",
    "category": "calc",
    "shortDescription": "Calculate Body Mass Index with a visual scale, healthy weight range, and BMI categories.",
    "aliases": [
      "body mass index"
    ],
    "icon": "Scale"
  },
  {
    "name": "Mortgage Calculator",
    "route": "/calc/mortgage",
    "category": "calc",
    "shortDescription": "Calculate monthly mortgage payments with taxes, insurance, PMI, and amortization schedule.",
    "aliases": [
      "home loan calculator"
    ],
    "icon": "Home"
  },
  {
    "name": "Tip Calculator",
    "route": "/calc/tip",
    "category": "calc",
    "shortDescription": "Calculate tips and split bills instantly. Quick presets for 15%, 18%, 20%, and more.",
    "aliases": [],
    "icon": "Receipt"
  },
  {
    "name": "Discount Calculator",
    "route": "/calc/discount",
    "category": "calc",
    "shortDescription": "Find the sale price after any discount. Supports stacked discounts and reverse calculation.",
    "aliases": [],
    "icon": "Tag"
  },
  {
    "name": "Compound Interest Calculator",
    "route": "/calc/compound-interest",
    "category": "calc",
    "shortDescription": "See how investments grow over time. Visualize compound growth with a chart and yearly table.",
    "aliases": [
      "interest calculator"
    ],
    "icon": "TrendingUp"
  },
  {
    "name": "GPA Calculator",
    "route": "/calc/gpa",
    "category": "calc",
    "shortDescription": "Calculate semester and cumulative GPA. Add courses with credits and letter grades.",
    "aliases": [
      "grade point average"
    ],
    "icon": "GraduationCap"
  },
  {
    "name": "Typing Test",
    "route": "/type/typing-test",
    "category": "type",
    "shortDescription": "Test typing speed and character accuracy with measured WPM, raw WPM, and a live performance chart.",
    "aliases": [
      "wpm test",
      "typing speed test"
    ],
    "icon": "Keyboard"
  },
  {
    "name": "WPM Test",
    "route": "/type/wpm-test",
    "category": "type",
    "shortDescription": "Measure your typing speed in 60 seconds.",
    "aliases": [
      "words per minute test"
    ],
    "icon": "Gauge"
  },
  {
    "name": "Keyboard Tester",
    "route": "/type/keyboard-tester",
    "category": "type",
    "shortDescription": "Press any key to verify it registers correctly.",
    "aliases": [
      "test keys",
      "key tester"
    ],
    "icon": "Keyboard"
  },
  {
    "name": "Typing Practice",
    "route": "/type/typing-practice",
    "category": "type",
    "shortDescription": "Structured typing lessons with per-key performance tracking.",
    "aliases": [],
    "icon": "BookOpen"
  },
  {
    "name": "Typing Race",
    "route": "/type/race",
    "category": "type",
    "shortDescription": "Race against ghost opponents at different skill levels.",
    "aliases": [],
    "icon": "Flag"
  },
  {
    "name": "Word Blitz",
    "route": "/type/word-blitz",
    "category": "type",
    "shortDescription": "Fast-paced word typing game with streak multipliers.",
    "aliases": [],
    "icon": "Zap"
  },
  {
    "name": "Code Typing Challenge",
    "route": "/type/code-challenge",
    "category": "type",
    "shortDescription": "Practice typing real code in JS, Python, TypeScript, and more.",
    "aliases": [],
    "icon": "Code2"
  },
  {
    "name": "Image Cropper",
    "route": "/files/image-cropper",
    "category": "files",
    "shortDescription": "Crop images with precision. Freeform or aspect ratio presets including circle crop.",
    "aliases": [
      "crop photo",
      "trim image",
      "cut image"
    ],
    "icon": "Crop"
  },
  {
    "name": "Invoice Generator",
    "route": "/files/invoice-generator",
    "category": "files",
    "shortDescription": "Create professional PDF invoices with line items, taxes, and your logo.",
    "aliases": [
      "make an invoice",
      "billing template"
    ],
    "icon": "FileText"
  },
  {
    "name": "Salary Calculator",
    "route": "/calc/salary",
    "category": "calc",
    "shortDescription": "Convert hourly pay to annual salary and see your earnings breakdown.",
    "aliases": [
      "hourly to salary",
      "wage calculator"
    ],
    "icon": "DollarSign"
  },
  {
    "name": "Loan Calculator",
    "route": "/calc/loan",
    "category": "calc",
    "shortDescription": "Calculate monthly loan payments with a full amortization schedule.",
    "aliases": [
      "loan payment calculator"
    ],
    "icon": "Landmark"
  },
  {
    "name": "Auto Loan Calculator",
    "route": "/calc/auto-loan",
    "category": "calc",
    "shortDescription": "Calculate car loan payments with trade-in and term comparison.",
    "aliases": [
      "car loan calculator"
    ],
    "icon": "Car"
  },
  {
    "name": "Credit Card Payoff Calculator",
    "route": "/calc/credit-card-payoff",
    "category": "calc",
    "shortDescription": "See how long it takes to pay off credit card debt and the total interest cost.",
    "aliases": [
      "pay off credit card debt"
    ],
    "icon": "CreditCard"
  },
  {
    "name": "Savings Goal Calculator",
    "route": "/calc/savings-goal",
    "category": "calc",
    "shortDescription": "Find out how much to save monthly to reach your financial goal.",
    "aliases": [],
    "icon": "PiggyBank"
  },
  {
    "name": "Retirement Calculator",
    "route": "/calc/retirement",
    "category": "calc",
    "shortDescription": "Project your retirement savings and estimated monthly retirement income.",
    "aliases": [
      "401k calculator"
    ],
    "icon": "TrendingUp"
  },
  {
    "name": "Investment Return Calculator",
    "route": "/calc/investment-return",
    "category": "calc",
    "shortDescription": "Calculate future investment value with monthly contributions and compound growth.",
    "aliases": [
      "roi calculator"
    ],
    "icon": "BarChart3"
  },
  {
    "name": "Debt-to-Income Calculator",
    "route": "/calc/debt-to-income",
    "category": "calc",
    "shortDescription": "Calculate your DTI ratio and see how lenders view your debt level.",
    "aliases": [
      "dti calculator"
    ],
    "icon": "Scale"
  },
  {
    "name": "Net Worth Calculator",
    "route": "/calc/net-worth",
    "category": "calc",
    "shortDescription": "Calculate your net worth by listing all assets and liabilities.",
    "aliases": [],
    "icon": "Calculator"
  },
  {
    "name": "Sales Tax Calculator",
    "route": "/calc/sales-tax",
    "category": "calc",
    "shortDescription": "Calculate sales tax and total price, or reverse-calculate pre-tax price.",
    "aliases": [
      "tax calculator"
    ],
    "icon": "Receipt"
  },
  {
    "name": "Amortization Calculator",
    "route": "/calc/amortization",
    "category": "calc",
    "shortDescription": "View a full loan amortization schedule with optional extra payments.",
    "aliases": [],
    "icon": "CalendarCheck"
  },
  {
    "name": "Car Payment Calculator",
    "route": "/calc/car-payment",
    "category": "calc",
    "shortDescription": "Estimate monthly car payments with price, down payment, and loan details.",
    "aliases": [],
    "icon": "Car"
  },
  {
    "name": "Down Payment Calculator",
    "route": "/calc/down-payment",
    "category": "calc",
    "shortDescription": "Calculate how much to save for a down payment and compare percentages.",
    "aliases": [],
    "icon": "Home"
  },
  {
    "name": "Calorie Calculator (TDEE)",
    "route": "/calc/calorie",
    "category": "calc",
    "shortDescription": "Calculate daily calories needed to lose, maintain, or gain weight.",
    "aliases": [
      "tdee calculator",
      "maintenance calories"
    ],
    "icon": "Flame"
  },
  {
    "name": "Macro Calculator",
    "route": "/calc/macro",
    "category": "calc",
    "shortDescription": "Calculate daily protein, carbs, and fat grams for your calorie target.",
    "aliases": [
      "macro calculator",
      "protein carbs fat"
    ],
    "icon": "Beef"
  },
  {
    "name": "Body Fat Calculator",
    "route": "/calc/body-fat",
    "category": "calc",
    "shortDescription": "Estimate body fat using a legacy circumference equation or a BMI-based screening formula.",
    "aliases": [],
    "icon": "Activity"
  },
  {
    "name": "Due Date Calculator",
    "route": "/calc/due-date",
    "category": "calc",
    "shortDescription": "Estimate your pregnancy due date and view milestone dates.",
    "aliases": [
      "pregnancy due date"
    ],
    "icon": "Baby"
  },
  {
    "name": "Ovulation Calculator",
    "route": "/calc/ovulation",
    "category": "calc",
    "shortDescription": "Predict your fertile window and ovulation dates for the next 3 months.",
    "aliases": [],
    "icon": "Heart"
  },
  {
    "name": "Ideal Weight Calculator",
    "route": "/calc/ideal-weight",
    "category": "calc",
    "shortDescription": "Compare ideal weight estimates from multiple medical formulas.",
    "aliases": [],
    "icon": "Scale"
  },
  {
    "name": "Calories Burned Calculator",
    "route": "/calc/calories-burned",
    "category": "calc",
    "shortDescription": "Calculate calories burned for 29 activities using MET values.",
    "aliases": [],
    "icon": "Dumbbell"
  },
  {
    "name": "Sleep Calculator",
    "route": "/calc/sleep",
    "category": "calc",
    "shortDescription": "Find optimal bedtimes or wake times based on 90-minute sleep cycles.",
    "aliases": [
      "bedtime calculator",
      "sleep cycle calculator"
    ],
    "icon": "Moon"
  },
  {
    "name": "Pace Calculator",
    "route": "/calc/pace",
    "category": "calc",
    "shortDescription": "Calculate running pace, finish time, or distance for any race.",
    "aliases": [
      "running pace calculator"
    ],
    "icon": "Footprints"
  },
  {
    "name": "Length Converter",
    "route": "/calc/convert/length",
    "category": "calc",
    "shortDescription": "Convert between meters, feet, inches, miles, kilometers, and more.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "Weight Converter",
    "route": "/calc/convert/weight",
    "category": "calc",
    "shortDescription": "Convert between kilograms, pounds, ounces, grams, and stone.",
    "aliases": [],
    "icon": "Weight"
  },
  {
    "name": "Temperature Converter",
    "route": "/calc/convert/temperature",
    "category": "calc",
    "shortDescription": "Convert between Celsius, Fahrenheit, and Kelvin.",
    "aliases": [
      "celsius to fahrenheit"
    ],
    "icon": "Thermometer"
  },
  {
    "name": "Volume Converter",
    "route": "/calc/convert/volume",
    "category": "calc",
    "shortDescription": "Convert between liters, gallons, cups, fluid ounces, and more.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Area Converter",
    "route": "/calc/convert/area",
    "category": "calc",
    "shortDescription": "Convert between square meters, square feet, acres, and hectares.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Speed Converter",
    "route": "/calc/convert/speed",
    "category": "calc",
    "shortDescription": "Convert between mph, km/h, m/s, knots, and ft/s.",
    "aliases": [],
    "icon": "Gauge"
  },
  {
    "name": "Time Converter",
    "route": "/calc/convert/time",
    "category": "calc",
    "shortDescription": "Convert between seconds, minutes, hours, days, weeks, and years.",
    "aliases": [],
    "icon": "Clock"
  },
  {
    "name": "Data Size Converter",
    "route": "/calc/convert/data",
    "category": "calc",
    "shortDescription": "Convert between bytes, KB, MB, GB, TB, and bits.",
    "aliases": [],
    "icon": "Binary"
  },
  {
    "name": "Pressure Converter",
    "route": "/calc/convert/pressure",
    "category": "calc",
    "shortDescription": "Convert between PSI, bar, atm, pascal, and mmHg.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Energy Converter",
    "route": "/calc/convert/energy",
    "category": "calc",
    "shortDescription": "Convert between joules, calories, BTU, kWh, and more.",
    "aliases": [],
    "icon": "Zap"
  },
  {
    "name": "Frequency Converter",
    "route": "/calc/convert/frequency",
    "category": "calc",
    "shortDescription": "Convert between Hz, kHz, MHz, and GHz.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Fuel Economy Converter",
    "route": "/calc/convert/fuel-economy",
    "category": "calc",
    "shortDescription": "Convert between MPG, L/100km, and km/L.",
    "aliases": [],
    "icon": "Gauge"
  },
  {
    "name": "Angle Converter",
    "route": "/calc/convert/angle",
    "category": "calc",
    "shortDescription": "Convert between degrees, radians, gradians, and arcseconds.",
    "aliases": [],
    "icon": "Compass"
  },
  {
    "name": "Power Converter",
    "route": "/calc/convert/power",
    "category": "calc",
    "shortDescription": "Convert between watts, kilowatts, horsepower, and BTU/hr.",
    "aliases": [],
    "icon": "Zap"
  },
  {
    "name": "Force Converter",
    "route": "/calc/convert/force",
    "category": "calc",
    "shortDescription": "Convert between newtons, pounds-force, kilogram-force, and dynes.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Cooking Converter",
    "route": "/calc/convert/cooking",
    "category": "calc",
    "shortDescription": "Convert between cups, tablespoons, teaspoons, ml, and fluid ounces.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "CM to Inches Converter",
    "route": "/calc/convert/cm-to-inches",
    "category": "calc",
    "shortDescription": "Convert centimeters to inches instantly with reference table.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "KG to Pounds Converter",
    "route": "/calc/convert/kg-to-lbs",
    "category": "calc",
    "shortDescription": "Convert kilograms to pounds instantly with reference table.",
    "aliases": [],
    "icon": "Weight"
  },
  {
    "name": "Miles to Kilometers Converter",
    "route": "/calc/convert/miles-to-km",
    "category": "calc",
    "shortDescription": "Convert miles to kilometers instantly with reference table.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "Fahrenheit to Celsius Converter",
    "route": "/calc/convert/fahrenheit-to-celsius",
    "category": "calc",
    "shortDescription": "Convert Fahrenheit to Celsius instantly with reference table.",
    "aliases": [],
    "icon": "Thermometer"
  },
  {
    "name": "Feet to Meters Converter",
    "route": "/calc/convert/feet-to-meters",
    "category": "calc",
    "shortDescription": "Convert feet to meters instantly with reference table.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "Ounces to Grams Converter",
    "route": "/calc/convert/oz-to-grams",
    "category": "calc",
    "shortDescription": "Convert ounces to grams instantly with reference table.",
    "aliases": [],
    "icon": "Weight"
  },
  {
    "name": "Liters to Gallons Converter",
    "route": "/calc/convert/liters-to-gallons",
    "category": "calc",
    "shortDescription": "Convert liters to gallons instantly with reference table.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Inches to Feet Converter",
    "route": "/calc/convert/inches-to-feet",
    "category": "calc",
    "shortDescription": "Convert inches to feet instantly with reference table.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "Meters to Feet Converter",
    "route": "/calc/convert/meters-to-feet",
    "category": "calc",
    "shortDescription": "Convert meters to feet instantly with reference table.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "Cups to Milliliters Converter",
    "route": "/calc/convert/cups-to-ml",
    "category": "calc",
    "shortDescription": "Convert cups to milliliters instantly with reference table.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Pounds to KG Converter",
    "route": "/calc/convert/lbs-to-kg",
    "category": "calc",
    "shortDescription": "Convert pounds to kilograms instantly with reference table.",
    "aliases": [],
    "icon": "Weight"
  },
  {
    "name": "Millimeters to Inches Converter",
    "route": "/calc/convert/mm-to-inches",
    "category": "calc",
    "shortDescription": "Convert millimeters to inches instantly with reference table.",
    "aliases": [],
    "icon": "Ruler"
  },
  {
    "name": "Acres to Square Feet Converter",
    "route": "/calc/convert/acres-to-sq-ft",
    "category": "calc",
    "shortDescription": "Convert acres to square feet instantly with reference table.",
    "aliases": [],
    "icon": "ArrowLeftRight"
  },
  {
    "name": "Mbps to Gbps Converter",
    "route": "/calc/convert/mbps-to-gbps",
    "category": "calc",
    "shortDescription": "Convert megabits to gigabits per second instantly.",
    "aliases": [],
    "icon": "Binary"
  },
  {
    "name": "CPS Test",
    "route": "/type/cps-test",
    "category": "type",
    "shortDescription": "Test how many clicks per second you can do.",
    "aliases": [
      "clicks per second"
    ],
    "icon": "MousePointer2"
  },
  {
    "name": "Reaction Time Test",
    "route": "/type/reaction-time",
    "category": "type",
    "shortDescription": "Measure your reaction time in milliseconds.",
    "aliases": [
      "reflex test"
    ],
    "icon": "Activity"
  }
];
