import { ImageResponse } from "next/og";

export const alt = "clevr.tools — Free Online File Utilities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#1D4ED8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div
            style={{
              width: 88,
              height: 88,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="56" height="56" viewBox="0 0 32 32">
              <polygon points="17,3 7,18 15,18 13,29 25,14 17,14" fill="white" />
            </svg>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            <span style={{ fontSize: 80, fontWeight: 800, color: "white", letterSpacing: -3, lineHeight: 1 }}>
              clevr
            </span>
            <span style={{ fontSize: 80, fontWeight: 800, color: "#93c5fd", letterSpacing: -3, lineHeight: 1 }}>
              .tools
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 400,
            marginBottom: 44,
            letterSpacing: -0.5,
          }}
        >
          Free file tools. No signup.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Compress Images", "Convert Formats", "Generate QR Codes"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                padding: "12px 28px",
                borderRadius: 100,
                fontSize: 24,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
