import type { MemeTemplate, TextFieldConfig } from "@/lib/memes/types";

function field(config: TextFieldConfig): TextFieldConfig {
  return config;
}

function topBottomTemplate(
  id: string,
  name: string,
  src: string,
  width = 1080,
  height = 1080
): MemeTemplate {
  const fontSize = Math.round(Math.min(width, height) * 0.086);
  return {
    id,
    name,
    src,
    width,
    height,
    textFields: [
      field({
        id: "top",
        label: "Top text",
        x: width / 2,
        y: height * 0.12,
        maxWidth: width * 0.88,
        fontSize,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      }),
      field({
        id: "bottom",
        label: "Bottom text",
        x: width / 2,
        y: height * 0.88,
        maxWidth: width * 0.88,
        fontSize,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      }),
    ],
  };
}

function stackedTemplate(
  id: string,
  name: string,
  src: string,
  rows: number,
  width = 1080,
  height = 1350
): MemeTemplate {
  const rowHeight = height / rows;
  const fontSize = Math.round(Math.min(width, rowHeight) * 0.16);

  return {
    id,
    name,
    src,
    width,
    height,
    textFields: Array.from({ length: rows }, (_, index) =>
      field({
        id: `panel-${index + 1}`,
        label: `Panel ${index + 1}`,
        x: width / 2,
        y: rowHeight * index + rowHeight / 2,
        maxWidth: width * 0.84,
        fontSize,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      })
    ),
  };
}

function splitTemplate(
  id: string,
  name: string,
  src: string,
  labels: string[],
  width = 1200,
  height = 900
): MemeTemplate {
  const columns = labels.length;
  const columnWidth = width / columns;
  const fontSize = Math.round(Math.min(columnWidth, height) * 0.11);

  return {
    id,
    name,
    src,
    width,
    height,
    textFields: labels.map((label, index) =>
      field({
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        x: columnWidth * index + columnWidth / 2,
        y: height * 0.84,
        maxWidth: columnWidth * 0.82,
        fontSize,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      })
    ),
  };
}

function customTemplate(
  id: string,
  name: string,
  src: string,
  width: number,
  height: number,
  textFields: TextFieldConfig[]
): MemeTemplate {
  return { id, name, src, width, height, textFields };
}

export const memeTemplates: MemeTemplate[] = [
  // Drake — two horizontal panels, text on right side
  customTemplate("drake", "Drake Hotline Bling", "/memes/drake.jpg", 1200, 1200, [
    field({
      id: "reject",
      label: "Top panel",
      x: 900,
      y: 300,
      maxWidth: 480,
      fontSize: 72,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "approve",
      label: "Bottom panel",
      x: 900,
      y: 900,
      maxWidth: 480,
      fontSize: 72,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  // Distracted Boyfriend — three people, labels on each
  customTemplate(
    "distracted-boyfriend",
    "Distracted Boyfriend",
    "/memes/distracted-boyfriend.jpg",
    1200,
    800,
    [
      field({
        id: "boyfriend",
        label: "Boyfriend",
        x: 700,
        y: 670,
        maxWidth: 260,
        fontSize: 54,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      }),
      field({
        id: "girlfriend",
        label: "Girlfriend",
        x: 405,
        y: 680,
        maxWidth: 260,
        fontSize: 50,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      }),
      field({
        id: "other",
        label: "Other person",
        x: 930,
        y: 415,
        maxWidth: 260,
        fontSize: 50,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      }),
    ]
  ),
  // Two Buttons — top/bottom panels
  customTemplate("two-buttons", "Two Buttons", "/memes/two-buttons.jpg", 600, 908, [
    field({
      id: "left-button",
      label: "Left button",
      x: 155,
      y: 120,
      maxWidth: 150,
      fontSize: 30,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "right-button",
      label: "Right button",
      x: 380,
      y: 120,
      maxWidth: 150,
      fontSize: 30,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "sweating-guy",
      label: "Sweating guy",
      x: 300,
      y: 780,
      maxWidth: 500,
      fontSize: 40,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  // Change My Mind — sign text
  customTemplate(
    "change-my-mind",
    "Change My Mind",
    "/memes/change-my-mind.jpg",
    482,
    361,
    [
      field({
        id: "sign",
        label: "Sign text",
        x: 200,
        y: 260,
        maxWidth: 200,
        fontSize: 26,
        align: "center",
        color: "#111827",
        outline: false,
      }),
    ]
  ),
  // Expanding Brain — 4 panels stacked
  stackedTemplate("expanding-brain", "Expanding Brain", "/memes/expanding-brain.jpg", 4, 857, 1202),
  // Woman Yelling at Cat — two side-by-side panels
  splitTemplate("woman-yelling-cat", "Woman Yelling at Cat", "/memes/woman-yelling-cat.jpg", [
    "Woman",
    "Cat",
  ], 680, 438),
  topBottomTemplate(
    "one-does-not-simply",
    "One Does Not Simply",
    "/memes/one-does-not-simply.jpg",
    568,
    335
  ),
  topBottomTemplate("success-kid", "Success Kid", "/memes/success-kid.jpg", 500, 500),
  // Is This a Pigeon — labels on characters + butterfly
  customTemplate("is-this-a-pigeon", "Is This a Pigeon?", "/memes/is-this-a-pigeon.jpg", 1587, 1425, [
    field({
      id: "man",
      label: "Man",
      x: 360,
      y: 1200,
      maxWidth: 500,
      fontSize: 90,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "butterfly",
      label: "Butterfly",
      x: 1100,
      y: 280,
      maxWidth: 500,
      fontSize: 80,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "caption",
      label: "Is this...?",
      x: 793,
      y: 1350,
      maxWidth: 1200,
      fontSize: 100,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  // Left Exit 12 Off Ramp — labels on car and signs
  customTemplate("left-exit-12-off-ramp", "Left Exit 12 Off Ramp", "/memes/left-exit-12-off-ramp.jpg", 804, 767, [
    field({
      id: "straight",
      label: "Straight",
      x: 530,
      y: 120,
      maxWidth: 200,
      fontSize: 36,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "exit",
      label: "Exit",
      x: 280,
      y: 190,
      maxWidth: 200,
      fontSize: 36,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "car",
      label: "Car",
      x: 470,
      y: 560,
      maxWidth: 350,
      fontSize: 44,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  // Running Away Balloon
  customTemplate("running-away-balloon", "Running Away Balloon", "/memes/running-away-balloon.jpg", 761, 1024, [
    field({
      id: "runner",
      label: "Runner",
      x: 480,
      y: 820,
      maxWidth: 250,
      fontSize: 44,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "balloon",
      label: "Balloon",
      x: 350,
      y: 150,
      maxWidth: 300,
      fontSize: 44,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  // Roll Safe — think about it
  customTemplate("roll-safe", "Roll Safe", "/memes/roll-safe.jpg", 702, 395, [
    field({
      id: "caption",
      label: "Main caption",
      x: 351,
      y: 50,
      maxWidth: 600,
      fontSize: 38,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "subcaption",
      label: "Bottom text",
      x: 351,
      y: 350,
      maxWidth: 600,
      fontSize: 38,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  topBottomTemplate("disaster-girl", "Disaster Girl", "/memes/disaster-girl.jpg", 500, 375),
  splitTemplate("batman-slapping-robin", "Batman Slapping Robin", "/memes/batman-slapping-robin.jpg", [
    "Robin",
    "Batman",
  ], 400, 387),
  stackedTemplate("gru-plan", "Gru's Plan", "/memes/gru-plan.jpg", 4, 700, 449),
  topBottomTemplate("surprised-pikachu", "Surprised Pikachu", "/memes/surprised-pikachu.jpg", 1893, 1892),
  topBottomTemplate("ancient-aliens", "Ancient Aliens", "/memes/ancient-aliens.jpg", 500, 436),
  topBottomTemplate("mocking-spongebob", "Mocking SpongeBob", "/memes/mocking-spongebob.jpg", 502, 353),
  stackedTemplate("boardroom-meeting", "Boardroom Meeting", "/memes/boardroom-meeting.jpg", 4, 500, 649),
  // Blank Nut Button — button and guy panels
  customTemplate("blank-nut-button", "Blank Nut Button", "/memes/blank-nut-button.jpg", 600, 446, [
    field({
      id: "button",
      label: "Button",
      x: 300,
      y: 60,
      maxWidth: 420,
      fontSize: 36,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "guy",
      label: "Guy",
      x: 300,
      y: 380,
      maxWidth: 500,
      fontSize: 40,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  topBottomTemplate("waiting-skeleton", "Waiting Skeleton", "/memes/waiting-skeleton.jpg", 298, 403),
  // Epic Handshake — left, center, right labels
  customTemplate("epic-handshake", "Epic Handshake", "/memes/epic-handshake.jpg", 900, 645, [
    field({
      id: "left",
      label: "Left side",
      x: 180,
      y: 320,
      maxWidth: 200,
      fontSize: 44,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "center",
      label: "Handshake",
      x: 450,
      y: 520,
      maxWidth: 350,
      fontSize: 50,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "right",
      label: "Right side",
      x: 720,
      y: 320,
      maxWidth: 200,
      fontSize: 44,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  topBottomTemplate("x-everywhere", "X, X Everywhere", "/memes/x-everywhere.jpg", 2118, 1440),
  topBottomTemplate("this-is-fine", "This Is Fine", "/memes/this-is-fine.jpg", 580, 282),
  // UNO Draw 25
  customTemplate("uno-draw-25", "UNO Draw 25", "/memes/uno-draw-25.jpg", 500, 494, [
    field({
      id: "card",
      label: "Card text",
      x: 140,
      y: 250,
      maxWidth: 180,
      fontSize: 28,
      align: "center",
      color: "#111827",
      outline: false,
    }),
    field({
      id: "guy",
      label: "Guy",
      x: 370,
      y: 420,
      maxWidth: 220,
      fontSize: 32,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  stackedTemplate("bike-fall", "Bike Fall", "/memes/bike-fall.jpg", 3, 500, 680),
  topBottomTemplate("hide-the-pain-harold", "Hide the Pain Harold", "/memes/hide-the-pain-harold.jpg", 480, 601),
  // Doge — scattered text
  customTemplate("doge", "Doge", "/memes/doge.jpg", 620, 620, [
    field({
      id: "top-left",
      label: "Top left",
      x: 130,
      y: 100,
      maxWidth: 180,
      fontSize: 34,
      align: "center",
      color: "#FDE68A",
      outline: false,
    }),
    field({
      id: "top-right",
      label: "Top right",
      x: 480,
      y: 120,
      maxWidth: 180,
      fontSize: 34,
      align: "center",
      color: "#93C5FD",
      outline: false,
    }),
    field({
      id: "middle-left",
      label: "Middle left",
      x: 140,
      y: 350,
      maxWidth: 180,
      fontSize: 36,
      align: "center",
      color: "#F9A8D4",
      outline: false,
    }),
    field({
      id: "middle-right",
      label: "Middle right",
      x: 480,
      y: 360,
      maxWidth: 180,
      fontSize: 36,
      align: "center",
      color: "#86EFAC",
      outline: false,
    }),
    field({
      id: "bottom",
      label: "Bottom",
      x: 310,
      y: 540,
      maxWidth: 200,
      fontSize: 38,
      align: "center",
      color: "#C4B5FD",
      outline: false,
    }),
  ]),
  // Cheems (Buff Doge vs Cheems) — two side-by-side panels
  customTemplate("cheems", "Buff Doge vs Cheems", "/memes/cheems.png", 937, 720, [
    field({
      id: "buff",
      label: "Buff Doge",
      x: 234,
      y: 100,
      maxWidth: 350,
      fontSize: 50,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "cheems",
      label: "Cheems",
      x: 703,
      y: 100,
      maxWidth: 350,
      fontSize: 50,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  // Always Has Been — astronauts
  customTemplate("always-has-been", "Always Has Been", "/memes/always-has-been.png", 960, 540, [
    field({
      id: "earth",
      label: "Earth",
      x: 290,
      y: 240,
      maxWidth: 280,
      fontSize: 36,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "astronaut",
      label: "Astronaut",
      x: 680,
      y: 120,
      maxWidth: 200,
      fontSize: 30,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "phrase",
      label: "Phrase",
      x: 750,
      y: 400,
      maxWidth: 250,
      fontSize: 34,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
];
