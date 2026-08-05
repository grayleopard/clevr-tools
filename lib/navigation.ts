export interface NavigationToolLink {
  label: string;
  route: string;
  description: string;
}

export interface NavigationCategory {
  id: string;
  label: string;
  route: string;
  description: string;
  featured: readonly NavigationToolLink[];
}

export interface PlayLink {
  label: string;
  route: string;
  description: string;
  icon: "hash" | "image";
}

/** Curated header links. Category pages remain the complete directory. */
export const navigationCategories: readonly NavigationCategory[] = [
  {
    "id": "files",
    "label": "Files",
    "route": "/files",
    "description": "Compress, convert, and transform files directly in your browser.",
    "featured": [
      {
        "label": "Image Compressor",
        "route": "/compress/image",
        "description": "Compress JPG, PNG & WebP images and compare the result."
      },
      {
        "label": "GIF Compressor",
        "route": "/tools/gif-compressor",
        "description": "Compress animated GIFs in your browser while preserving motion."
      },
      {
        "label": "Image Resizer",
        "route": "/tools/resize-image",
        "description": "Resize images by dimensions, presets, or target file size."
      },
      {
        "label": "PDF to JPG Converter",
        "route": "/convert/pdf-to-jpg",
        "description": "Convert PDF pages to high-quality JPG images — batch supported."
      },
      {
        "label": "Merge PDF",
        "route": "/tools/merge-pdf",
        "description": "Combine multiple PDF files into one — drag to reorder."
      },
      {
        "label": "PDF Compressor",
        "route": "/compress/pdf",
        "description": "Strip metadata and reduce PDF file size in your browser."
      }
    ]
  },
  {
    "id": "text-code",
    "label": "Text & Code",
    "route": "/text-code",
    "description": "Write, format, analyze, and transform text and code.",
    "featured": [
      {
        "label": "Word Counter",
        "route": "/text/word-counter",
        "description": "Count words, characters, sentences, paragraphs, and more — in real time."
      },
      {
        "label": "JSON Formatter",
        "route": "/dev/json-formatter",
        "description": "Format, validate, and minify JSON. Instant error detection with line numbers."
      },
      {
        "label": "Password Generator",
        "route": "/generate/password",
        "description": "Generate random passwords with custom length and character sets."
      },
      {
        "label": "QR Code Generator",
        "route": "/generate/qr-code",
        "description": "Generate QR codes for URLs or text. Download as PNG or SVG."
      },
      {
        "label": "Base64 Encode / Decode",
        "route": "/dev/base64",
        "description": "Encode text to Base64 or decode Base64 back to plain text. Handles Unicode."
      },
      {
        "label": "Color Picker",
        "route": "/dev/color-picker",
        "description": "Pick colors and convert between HEX, RGB, HSL, and HSB formats instantly."
      }
    ]
  },
  {
    "id": "calculate",
    "label": "Calculate",
    "route": "/calculate",
    "description": "Financial calculators, health tools, and everyday math.",
    "featured": [
      {
        "label": "Salary Calculator",
        "route": "/calc/salary",
        "description": "Convert hourly pay to annual salary and see your earnings breakdown."
      },
      {
        "label": "Calorie Calculator (TDEE)",
        "route": "/calc/calorie",
        "description": "Calculate daily calories needed to lose, maintain, or gain weight."
      },
      {
        "label": "Sleep Calculator",
        "route": "/calc/sleep",
        "description": "Find optimal bedtimes or wake times based on 90-minute sleep cycles."
      },
      {
        "label": "Auto Loan Calculator",
        "route": "/calc/auto-loan",
        "description": "Calculate car loan payments with trade-in and term comparison."
      },
      {
        "label": "Credit Card Payoff Calculator",
        "route": "/calc/credit-card-payoff",
        "description": "See how long it takes to pay off credit card debt and the total interest cost."
      },
      {
        "label": "Odds Calculator",
        "route": "/calc/odds-calculator",
        "description": "Convert betting odds, calculate parlays, payouts, and implied probability."
      }
    ]
  },
  {
    "id": "time",
    "label": "Time",
    "route": "/time",
    "description": "Timers, stopwatches, and productivity tools.",
    "featured": [
      {
        "label": "Timer",
        "route": "/time/timer",
        "description": "Countdown timer with sound alerts and quick presets. Works in background tabs."
      },
      {
        "label": "Stopwatch",
        "route": "/time/stopwatch",
        "description": "Precise online stopwatch with lap timing. Highlights fastest and slowest laps."
      },
      {
        "label": "Pomodoro Timer",
        "route": "/time/pomodoro",
        "description": "Pomodoro Technique timer with focus/break cycles and customizable intervals."
      }
    ]
  },
  {
    "id": "type",
    "label": "Type",
    "route": "/type",
    "description": "Improve your typing speed and accuracy.",
    "featured": [
      {
        "label": "Typing Test",
        "route": "/type/typing-test",
        "description": "Test your typing speed and character accuracy. See measured WPM, raw WPM, and a live performance chart."
      },
      {
        "label": "WPM Test",
        "route": "/type/wpm-test",
        "description": "Measure your typing speed in 60 seconds."
      },
      {
        "label": "Keyboard Tester",
        "route": "/type/keyboard-tester",
        "description": "Press any key to verify it registers correctly."
      },
      {
        "label": "Typing Practice",
        "route": "/type/typing-practice",
        "description": "Structured typing lessons with per-key performance tracking."
      }
    ]
  }
];

export const playLinks: readonly PlayLink[] = [
  {
    "label": "Numble",
    "route": "/play/numble",
    "description": "Daily number puzzle",
    "icon": "hash"
  }
];
