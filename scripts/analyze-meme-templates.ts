/**
 * Analyzes meme template images using Claude vision to determine
 * where text should be placed. Run once to generate template metadata.
 *
 * Usage: ANTHROPIC_API_KEY=... npx tsx scripts/analyze-meme-templates.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic();

const MEMES_DIR = path.join(process.cwd(), "public/memes");
const OUTPUT_FILE = path.join(process.cwd(), "lib/memes/template-zones.json");

interface ZoneResult {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  outline: boolean;
  align: "center" | "left" | "right";
  valign: "top" | "middle" | "bottom";
}

const PROMPT = (name: string) => `You are analyzing a meme template image called "${name}" to determine where user-entered text should be placed.

Look at this meme template and identify ALL text zones where a user would typically add their own text when creating a meme with this template.

For each text zone, provide:
- id: a short descriptive ID (e.g., "top", "bottom", "panel1", "sign", "left", "right")
- label: a human-readable label for the text input (e.g., "Top Text", "Sign Text", "Drake No", "Drake Yes")
- x: the LEFT edge of the text region as a percentage of image width (0-100)
- y: the TOP edge of the text region as a percentage of image height (0-100)
- width: the width of the text region as a percentage of image width (0-100)
- height: the height of the text region as a percentage of image height (0-100)
- fontSize: recommended base font size in pixels (for an image rendered at 600px wide)
- color: recommended text color as hex (e.g., "#FFFFFF" for white, "#000000" for black)
- outline: whether the text needs a contrasting outline for readability (true/false)
- align: text alignment inside the region ("center", "left", or "right")
- valign: vertical alignment inside the region ("top", "middle", or "bottom")

Rules:
- Text zones should be where text CONVENTIONALLY goes in this specific meme format
- For panel memes (like Drake), each panel gets its own text zone positioned in the correct half/quadrant
- For sign/label memes (like Change My Mind), the text zone should be precisely ON the sign/label area
- Prefer bounded rectangles that match the actual caption area, chat bubble, sign, or panel region
- Don't place text zones on top of the main subject/character unless that's the convention
- width should prevent text from bleeding outside the intended zone
- height should define the vertical boundary so text wrapping stays within the zone
- Choose text color and outline based on the background in that zone (white+outline on busy/dark backgrounds, black without outline on clean/light areas)
- The fontSize should be large enough to read but small enough that a typical meme caption (5-15 words) fits in the zone

Respond with ONLY a JSON array of text zones. No explanation, no markdown, no backticks. Just the raw JSON array.`;

async function analyzeTemplate(
  id: string,
  name: string,
  filePath: string
): Promise<ZoneResult[] | null> {
  const imageBuffer = fs.readFileSync(filePath);
  const base64 = imageBuffer.toString("base64");
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mediaType: "image/png" | "image/jpeg" =
    ext === "png" ? "image/png" : "image/jpeg";

  console.log(`  Analyzing: ${name} (${id})...`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: PROMPT(name) },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const zones: ZoneResult[] = JSON.parse(cleaned);
    console.log(`    → ${zones.length} zones found`);
    return zones;
  } catch {
    console.error(`    ✗ Failed to parse response for ${name}:`, text.slice(0, 200));
    return null;
  }
}

// Map of template IDs to display names
const TEMPLATE_NAMES: Record<string, string> = {
  "always-has-been": "Always Has Been",
  "ancient-aliens": "Ancient Aliens",
  "batman-slapping-robin": "Batman Slapping Robin",
  "bike-fall": "Bike Fall",
  "blank-nut-button": "Blank Nut Button",
  "boardroom-meeting": "Boardroom Meeting Suggestion",
  "change-my-mind": "Change My Mind",
  "cheems": "Buff Doge vs Cheems",
  "disaster-girl": "Disaster Girl",
  "distracted-boyfriend": "Distracted Boyfriend",
  "doge": "Doge",
  "drake": "Drake Hotline Bling",
  "epic-handshake": "Epic Handshake",
  "expanding-brain": "Expanding Brain",
  "gru-plan": "Gru's Plan",
  "hide-the-pain-harold": "Hide the Pain Harold",
  "is-this-a-pigeon": "Is This a Pigeon?",
  "left-exit-12-off-ramp": "Left Exit 12 Off Ramp",
  "mocking-spongebob": "Mocking SpongeBob",
  "one-does-not-simply": "One Does Not Simply",
  "roll-safe": "Roll Safe Think About It",
  "running-away-balloon": "Running Away Balloon",
  "success-kid": "Success Kid",
  "surprised-pikachu": "Surprised Pikachu",
  "this-is-fine": "This Is Fine",
  "two-buttons": "Two Buttons",
  "uno-draw-25": "UNO Draw 25",
  "waiting-skeleton": "Waiting Skeleton",
  "woman-yelling-cat": "Woman Yelling at Cat",
  "x-everywhere": "X, X Everywhere",
};

async function main() {
  const files = fs
    .readdirSync(MEMES_DIR)
    .filter((f) => /\.(jpg|jpeg|png)$/.test(f))
    .sort();

  console.log(`Found ${files.length} template images\n`);

  const results: Record<string, ZoneResult[]> = {};
  let count = 0;

  for (const file of files) {
    const id = file.replace(/\.(jpg|jpeg|png)$/, "");
    const name = TEMPLATE_NAMES[id] || id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const filePath = path.join(MEMES_DIR, file);

    const zones = await analyzeTemplate(id, name, filePath);
    if (zones) {
      results[id] = zones;
      count++;
    }

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${count} template zones to ${OUTPUT_FILE}`);
}

main().catch(console.error);
