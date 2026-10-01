import { ImageResponse } from "next/og";

export const alt = "Ankur Research — You built the media machine.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f120f",
        color: "#eaf2ea",
        padding: "58px 68px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: 25, fontWeight: 700, letterSpacing: 2 }}>
        <span>ANKUR / RESEARCH</span>
        <span style={{ color: "#96f78d" }}>FIELD NOTE 01</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 8 }}>
        <span style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 700, letterSpacing: -4 }}>You built the</span>
        <span style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 700, letterSpacing: -4, color: "#96f78d" }}>media machine.</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", borderTop: "2px solid #344334", paddingTop: 22, fontSize: 24 }}>
        <span>An independent look at the Outlever machine</span>
        <span>01 OCT 2026</span>
      </div>
    </div>,
    size,
  );
}
