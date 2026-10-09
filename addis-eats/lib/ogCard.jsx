import { ImageResponse } from "next/og";

// 1200 × 630 is the size every platform expects; anything else is cropped through the middle of the text.
export const OG_SIZE = { width: 1200, height: 630 };

// ImageResponse supports only a subset of CSS: flexbox and basic properties, no grid. Every element that
// holds more than one child therefore sets display: "flex". No emoji (they are fetched over the network).
export function ogCard({ eyebrow, title, subtitle, footer, price, titleSize = 92 }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#fffaf4", color: "#241b17", borderBottom: "18px solid #d95f25" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "#d95f25", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>AE</div>
          <div style={{ display: "flex", marginLeft: 18, fontSize: 36, fontWeight: 700 }}>Addis Eats</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 4, color: "#d95f25", marginBottom: 20 }}>{eyebrow}</div>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 34, lineHeight: 1.35, color: "#756963", marginTop: 24, maxWidth: 1000 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#756963" }}>{footer}</div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#d95f25" }}>{price || ""}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
