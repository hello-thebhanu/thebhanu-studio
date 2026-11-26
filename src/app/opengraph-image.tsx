import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 82% 28%, rgba(120,155,85,0.34), rgba(43,46,39,0) 52%), #2B2E27",
          color: "#F4F5EF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #A5CE79, #527B48)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.14em",
            }}
          >
            THE BHANU
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Ideas. Designed. Engineered.
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#A5CE79",
            }}
          >
            Ideas into Digital Products.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(244,245,239,0.16)",
            paddingTop: "24px",
            fontSize: "20px",
            color: "#D5D8CE",
          }}
        >
          <span>Digital Product Studio &amp; Software Engineering</span>
          <span style={{ color: "#A5CE79" }}>https://thebhanu.in</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
