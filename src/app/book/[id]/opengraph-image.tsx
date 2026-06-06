import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og/fonts";
import { getBook } from "@/lib/gutendex";
import { authorByline } from "@/lib/gutendex-normalize";
import { coverUrl as mirrorCover } from "@/lib/gutenberg-mirror";
import { displayTitle } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "Read free on goread";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#15120E";
const CREAM = "#F3ECDE";
const MUTED = "#A2937C";
const GOLD = "#F0A92B";

async function coverDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "goread/1.0 (reader; +https://www.gutenberg.org)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 100) return null;
    const mime = res.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function BookOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fonts = await ogFonts();
  const bookId = Number(id);
  const book = Number.isInteger(bookId) && bookId > 0 ? await getBook(bookId) : null;

  const title = book ? displayTitle(book.title, 90) : "goread";
  const byline = book ? authorByline(book) : "The classics, free.";
  const cover = book ? await coverDataUri(book.coverUrl ?? mirrorCover(book.id, "medium")) : null;
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const initials = title.replace(/[^A-Za-z ]/g, "").trim().slice(0, 2).toUpperCase() || "G";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          padding: 64,
          background: `linear-gradient(140deg, ${INK} 0%, #1E180F 55%, #241B10 100%)`,
          fontFamily: "Inter",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            left: -160,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,169,43,0.18) 0%, rgba(240,169,43,0) 70%)",
            display: "flex",
          }}
        />

        {/* cover */}
        <div
          style={{
            display: "flex",
            width: 334,
            height: 502,
            flexShrink: 0,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
            border: "1px solid rgba(243,236,222,0.12)",
            background: "linear-gradient(160deg, #2A2014, #1A140C)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} width={334} height={502} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div
              style={{
                display: "flex",
                fontFamily: "Playfair Display",
                fontWeight: 700,
                fontSize: 150,
                color: GOLD,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* text column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingLeft: 56,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: GOLD,
                display: "flex",
                marginRight: 12,
              }}
            />
            <div style={{ fontSize: 26, fontWeight: 600, color: CREAM, letterSpacing: -0.4 }}>
              goread
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              fontFamily: "Playfair Display",
              fontWeight: 700,
              fontSize: title.length > 42 ? 60 : 74,
              lineHeight: 1.04,
              letterSpacing: -1.5,
              color: CREAM,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 32,
              fontWeight: 500,
              color: GOLD,
              letterSpacing: -0.2,
            }}
          >
            {byline}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 22px",
                borderRadius: 999,
                background: GOLD,
                color: "#1A140C",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Read free →
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: MUTED }}>
              {host}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
