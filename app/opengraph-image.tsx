import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Smart Study Platform social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #020617 0%, #312e81 50%, #7c3aed 100%)",
        color: "#ffffff",
        padding: "56px",
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -0.4,
          opacity: 0.95,
        }}
      >
        Smart Study Platform
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: -1.5,
            maxWidth: "1000px",
          }}
        >
          Study faster, even with a busy schedule.
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 500,
            opacity: 0.95,
          }}
        >
          Built for students and working learners in Nigeria.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 24,
          fontWeight: 600,
          opacity: 0.92,
        }}
      >
        AI summaries · Flashcards · Practice questions
      </div>
    </div>,
    size,
  );
}
