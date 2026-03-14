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
  customTemplate("drake", "Drake Hotline Bling", "/memes/drake.jpg", 1080, 1350, [
    field({
      id: "reject",
      label: "Top panel",
      x: 700,
      y: 335,
      maxWidth: 520,
      fontSize: 92,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "approve",
      label: "Bottom panel",
      x: 700,
      y: 1015,
      maxWidth: 520,
      fontSize: 92,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
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
        fontSize: 64,
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
        fontSize: 60,
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
        fontSize: 60,
        align: "center",
        color: "#FFFFFF",
        outline: true,
      }),
    ]
  ),
  splitTemplate("two-buttons", "Two Buttons", "/memes/two-buttons.jpg", [
    "Left button",
    "Right button",
    "Sweating guy",
  ]),
  customTemplate(
    "change-my-mind",
    "Change My Mind",
    "/memes/change-my-mind.jpg",
    1280,
    720,
    [
      field({
        id: "sign",
        label: "Sign text",
        x: 495,
        y: 505,
        maxWidth: 420,
        fontSize: 54,
        align: "center",
        color: "#111827",
        outline: false,
      }),
    ]
  ),
  stackedTemplate("expanding-brain", "Expanding Brain", "/memes/expanding-brain.jpg", 4),
  splitTemplate("woman-yelling-cat", "Woman Yelling at Cat", "/memes/woman-yelling-cat.jpg", [
    "Woman",
    "Cat",
  ]),
  topBottomTemplate(
    "one-does-not-simply",
    "One Does Not Simply",
    "/memes/one-does-not-simply.jpg",
    1200,
    675
  ),
  topBottomTemplate("success-kid", "Success Kid", "/memes/success-kid.jpg", 1080, 1080),
  splitTemplate("is-this-a-pigeon", "Is This a Pigeon?", "/memes/is-this-a-pigeon.jpg", [
    "Man",
    "Butterfly",
    "What is this?",
  ]),
  splitTemplate("left-exit-12-off-ramp", "Left Exit 12 Off Ramp", "/memes/left-exit-12-off-ramp.jpg", [
    "Car",
    "Exit",
  ]),
  splitTemplate("running-away-balloon", "Running Away Balloon", "/memes/running-away-balloon.jpg", [
    "Runner",
    "Balloon",
    "Problem",
  ]),
  customTemplate("roll-safe", "Roll Safe", "/memes/roll-safe.jpg", 1080, 1080, [
    field({
      id: "caption",
      label: "Main caption",
      x: 620,
      y: 240,
      maxWidth: 700,
      fontSize: 78,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "subcaption",
      label: "Bottom text",
      x: 540,
      y: 900,
      maxWidth: 900,
      fontSize: 84,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  topBottomTemplate("disaster-girl", "Disaster Girl", "/memes/disaster-girl.jpg", 1200, 900),
  splitTemplate("batman-slapping-robin", "Batman Slapping Robin", "/memes/batman-slapping-robin.jpg", [
    "Robin",
    "Batman",
  ]),
  stackedTemplate("gru-plan", "Gru's Plan", "/memes/gru-plan.jpg", 4),
  topBottomTemplate("surprised-pikachu", "Surprised Pikachu", "/memes/surprised-pikachu.jpg"),
  topBottomTemplate("ancient-aliens", "Ancient Aliens", "/memes/ancient-aliens.jpg", 1200, 900),
  topBottomTemplate("mocking-spongebob", "Mocking SpongeBob", "/memes/mocking-spongebob.jpg"),
  stackedTemplate("boardroom-meeting", "Boardroom Meeting", "/memes/boardroom-meeting.jpg", 4, 1200, 1200),
  splitTemplate("blank-nut-button", "Blank Nut Button", "/memes/blank-nut-button.jpg", [
    "Button",
    "Guy",
  ]),
  topBottomTemplate("waiting-skeleton", "Waiting Skeleton", "/memes/waiting-skeleton.jpg", 1200, 900),
  customTemplate("epic-handshake", "Epic Handshake", "/memes/epic-handshake.jpg", 1200, 900, [
    field({
      id: "left",
      label: "Left side",
      x: 240,
      y: 450,
      maxWidth: 240,
      fontSize: 60,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "center",
      label: "Handshake",
      x: 600,
      y: 690,
      maxWidth: 420,
      fontSize: 68,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "right",
      label: "Right side",
      x: 960,
      y: 450,
      maxWidth: 240,
      fontSize: 60,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
  topBottomTemplate("x-everywhere", "X, X Everywhere", "/memes/x-everywhere.jpg", 1200, 900),
  topBottomTemplate("this-is-fine", "This Is Fine", "/memes/this-is-fine.jpg", 1200, 900),
  splitTemplate("uno-draw-25", "UNO Draw 25", "/memes/uno-draw-25.jpg", [
    "Normal option",
    "Wild option",
  ]),
  stackedTemplate("bike-fall", "Bike Fall", "/memes/bike-fall.jpg", 4, 1200, 1200),
  topBottomTemplate("hide-the-pain-harold", "Hide the Pain Harold", "/memes/hide-the-pain-harold.jpg", 1200, 900),
  customTemplate("doge", "Doge", "/memes/doge.jpg", 1080, 1080, [
    field({
      id: "top-left",
      label: "Top left",
      x: 230,
      y: 170,
      maxWidth: 260,
      fontSize: 56,
      align: "center",
      color: "#FDE68A",
      outline: false,
    }),
    field({
      id: "top-right",
      label: "Top right",
      x: 825,
      y: 210,
      maxWidth: 260,
      fontSize: 56,
      align: "center",
      color: "#93C5FD",
      outline: false,
    }),
    field({
      id: "middle-left",
      label: "Middle left",
      x: 245,
      y: 610,
      maxWidth: 260,
      fontSize: 58,
      align: "center",
      color: "#F9A8D4",
      outline: false,
    }),
    field({
      id: "middle-right",
      label: "Middle right",
      x: 815,
      y: 620,
      maxWidth: 280,
      fontSize: 58,
      align: "center",
      color: "#86EFAC",
      outline: false,
    }),
    field({
      id: "bottom",
      label: "Bottom",
      x: 555,
      y: 930,
      maxWidth: 320,
      fontSize: 62,
      align: "center",
      color: "#C4B5FD",
      outline: false,
    }),
  ]),
  topBottomTemplate("cheems", "Cheems", "/memes/cheems.jpg", 1200, 900),
  customTemplate("always-has-been", "Always Has Been", "/memes/always-has-been.jpg", 1200, 900, [
    field({
      id: "earth",
      label: "Earth",
      x: 625,
      y: 420,
      maxWidth: 430,
      fontSize: 66,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "astronaut",
      label: "Astronaut",
      x: 930,
      y: 255,
      maxWidth: 220,
      fontSize: 50,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
    field({
      id: "phrase",
      label: "Phrase",
      x: 875,
      y: 635,
      maxWidth: 290,
      fontSize: 56,
      align: "center",
      color: "#FFFFFF",
      outline: true,
    }),
  ]),
];
