import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og/fonts";
import { OG_HEADLINE, OG_SUB, SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "goread — every classic, free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#15120E";
const CREAM = "#F3ECDE";
const MUTED = "#A2937C";
const GOLD = "#F0A92B";

export default async function OpengraphImage() {
  const fonts = await ogFonts();
  const [line1, line2] = OG_HEADLINE.split("\n");
  const host = SITE_URL.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "72px 80px",
          background: `linear-gradient(140deg, ${INK} 0%, #1E180F 55%, #241B10 100%)`,
          fontFamily: "Inter",
          overflow: "hidden",
        }}
      >
        {/* warm glow */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,169,43,0.20) 0%, rgba(240,169,43,0) 70%)",
            display: "flex",
          }}
        />
        {/* oversized serif quote watermark */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -20,
            fontFamily: "Playfair Display",
            fontWeight: 700,
            fontSize: 620,
            lineHeight: 1,
            color: "rgba(240,169,43,0.06)",
            display: "flex",
          }}
        >
          ”
        </div>

        {/* wordmark row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: GOLD,
                display: "flex",
                marginRight: 14,
              }}
            />
            <div style={{ fontSize: 30, fontWeight: 600, color: CREAM, letterSpacing: -0.5 }}>
              goread
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: MUTED, letterSpacing: 0.5 }}>
            {host}
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            fontFamily: "Playfair Display",
            fontWeight: 700,
            fontSize: 118,
            lineHeight: 1.02,
            letterSpacing: -2,
          }}
        >
          <div style={{ display: "flex", color: CREAM }}>{line1}</div>
          <div style={{ display: "flex", color: GOLD }}>{line2}</div>
        </div>

        {/* sub */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            fontWeight: 500,
            color: MUTED,
            letterSpacing: -0.2,
          }}
        >
          {OG_SUB}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
