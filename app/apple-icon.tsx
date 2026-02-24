import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#1D4ED8",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 32 32">
          <polygon points="17,3 7,18 15,18 13,29 25,14 17,14" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
