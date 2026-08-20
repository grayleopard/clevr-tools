import { ImageResponse } from "next/og";

export const alt = "clevr.tools — fast, private browser tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#060e20",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          color: "#dee5ff",
          padding: "78px 88px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: "1px solid #243050",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              color: "#6ee7b7",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 5,
            }}
          >
            LOCAL-FIRST UTILITIES
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div
              style={{
                width: 76,
                height: 76,
                border: "8px solid #6ee7b7",
                transform: "rotate(45deg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 24, height: 24, background: "#6ee7b7" }} />
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ fontSize: 88, fontWeight: 900, letterSpacing: -7, lineHeight: 1 }}>
                clevr
              </span>
              <span
                style={{
                  fontSize: 88,
                  fontWeight: 900,
                  color: "#6ee7b7",
                  letterSpacing: -7,
                  lineHeight: 1,
                }}
              >
                .tools
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#a3aac4",
              fontWeight: 500,
              letterSpacing: -1,
            }}
          >
            Fast tools · Clear privacy · No signup
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            gap: 14,
            color: "#a3aac4",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <div style={{ display: "flex" }}>COMPRESS · CONVERT · CALCULATE</div>
          <div style={{ display: "flex", color: "#6ee7b7" }}>CLEVR.TOOLS</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
