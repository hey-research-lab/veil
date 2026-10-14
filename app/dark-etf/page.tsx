import type { Metadata } from "next";
import { Suspense } from "react";
import { ComposerDemo } from "../../components/dark-etf/ComposerDemo";
import { WaitlistForm } from "../../components/dark-etf/WaitlistForm";

export const metadata: Metadata = {
  title: "Veil Dark ETF — Coming Soon",
  description:
    "Build a private basket of Stock Tokens on Robinhood Chain. Hold it shielded, rebalance it in the dark.",
  alternates: { canonical: "https://www.veilpools.tech/dark-etf" },
  openGraph: {
    title: "Veil Dark ETF — Coming Soon",
    description:
      "Build a private basket of Stock Tokens on Robinhood Chain. Hold it shielded, rebalance it in the dark.",
    url: "https://www.veilpools.tech/dark-etf",
    siteName: "Veil Protocol",
    images: [{ url: "/dark-etf/opengraph-image", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@veilpools",
    title: "Veil Dark ETF — Coming Soon",
    description:
      "Build a private basket of Stock Tokens on Robinhood Chain. Hold it shielded, rebalance it in the dark.",
    images: ["/dark-etf/opengraph-image"],
  },
};

const shell: React.CSSProperties = {
  maxWidth: "880px",
  margin: "0 auto",
  padding: "48px 20px 64px",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
};

const h1: React.CSSProperties = {
  fontFamily: "var(--font-headline)",
  fontSize: "clamp(2rem, 5vw, 3rem)",
  lineHeight: 1.1,
  margin: "8px 0",
};

const h2: React.CSSProperties = {
  fontFamily: "var(--font-headline)",
  fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
  margin: "0 0 8px 0",
};

const eyebrow: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "var(--color-faint)",
};

const body: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.6,
  color: "var(--color-text)",
  margin: 0,
};

const muted: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "var(--color-muted)",
  margin: 0,
};

const card: React.CSSProperties = {
  padding: "20px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  backgroundColor: "#ffffff",
};

const cta: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 20px",
  minHeight: "44px",
  borderRadius: "var(--radius-sm)",
  backgroundColor: "var(--color-accent)",
  color: "var(--color-accent-contrast)",
  fontWeight: 700,
  textDecoration: "none",
  marginRight: "12px",
};

const ghost: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 20px",
  minHeight: "44px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border-strong)",
  color: "var(--color-text)",
  fontWeight: 600,
  textDecoration: "none",
};

function TickerGrid() {
  const tickers = ["NVDA", "SPY", "TSLA", "AAPL", "MSFT"];
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "10px",
        marginTop: "20px",
        filter: "blur(1px)",
        opacity: 0.85,
      }}
    >
      {tickers.map((t) => (
        <div
          key={t}
          style={{
            padding: "18px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            backgroundColor: "rgba(26,26,26,0.04)",
            fontFamily: "monospace",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {t}
          <div style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "4px" }}>???</div>
        </div>
      ))}
    </div>
  );
}

export default function DarkEtfPage() {
  return (
    <main style={shell}>
      {/* 1. Header uses the site navbar (automatic). Badge lives in navbar. */}

      {/* 2. Hero */}
      <section>
        <div style={eyebrow}>VEIL DARK ETF · COMING SOON</div>
        <h1 style={h1}>Your own ETF. Nobody sees what&apos;s inside.</h1>
        <p style={body}>
          Build a private basket of Stock Tokens on Robinhood Chain. Hold it shielded, rebalance it in the dark.
        </p>
        <div style={{ marginTop: "16px" }}>
          <a href="#waitlist" style={cta}>
            Join the waitlist
          </a>
          <a href="#how" style={ghost}>
            How it works
          </a>
        </div>
        <TickerGrid />
      </section>

      {/* 3. Problem */}
      <section style={card}>
        <h2 style={h2}>The problem</h2>
        <p style={body}>
          Every on-chain portfolio is a public billboard. Your weights, your entries, your rebalances — all indexed
          forever.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "12px" }}>
          <div style={{ padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontFamily: "monospace", fontSize: "12px" }}>
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>Public explorer</div>
            <div>0xabc…: NVDA 40% · SPY 30% · TSLA 30%</div>
          </div>
          <div style={{ padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontFamily: "monospace", fontSize: "12px" }}>
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>With Veil</div>
            <div>commitment: 0x7f3a…9b12 (weights hidden)</div>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how">
        <h2 style={h2}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "12px" }}>
          {[
            { t: "Compose", d: "Pick Stock Tokens and weights." },
            { t: "Shield", d: "The basket is minted as a private note in a Veil pool." },
            { t: "Rebalance in the dark", d: "Rebalances are matched inside a batch; only the net difference touches Uniswap v4." },
          ].map((s, i) => (
            <div key={s.t} style={{ ...card }}>
              <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--color-accent-ink)" }}>
                {i + 1}. {s.t}
              </div>
              <p style={muted}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Composer demo */}
      <section style={card}>
        <h2 style={h2}>Try the composer (demo)</h2>
        <ComposerDemo />
      </section>

      {/* 6. Waitlist */}
      <section id="waitlist" style={card}>
        <h2 style={h2}>Get in line</h2>
        <p style={muted}>Be first in line when Dark ETF opens. No wallet signature required.</p>
        <Suspense>
          <WaitlistForm />
        </Suspense>
      </section>

      {/* 7. FAQ */}
      <section>
        <h2 style={h2}>Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
          {[
            { q: "Is Dark ETF live?", a: "Not yet — this page is an announcement. Join the waitlist and we will tell you when it opens." },
            { q: "Which assets?", a: "Stock Tokens on Robinhood Chain. The final list will be announced at launch." },
            { q: "Who can use it?", a: "Access follows Stock Token jurisdictional limits. Not available to U.S. persons." },
            { q: "Is this a fund?", a: "No. Each basket is owned and controlled by a single user. There is no pooled management." },
          ].map((f) => (
            <div key={f.q} style={card}>
              <div style={{ fontWeight: 700 }}>{f.q}</div>
              <p style={muted}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Footer disclaimer */}
      <section style={{ ...card, backgroundColor: "rgba(26,26,26,0.025)" }}>
        <p style={{ ...muted, fontSize: "13px" }}>
          Veil Dark ETF is under development and not available. This page is for informational purposes only and is
          not an offer to sell or a solicitation to buy any security, token, or financial product. “Dark ETF” is a
          product name; it is not a registered exchange-traded fund. Stock Tokens are issued by third parties and are
          subject to their own terms and jurisdictional restrictions, and are not available to U.S. persons. Veil
          Protocol is not affiliated with or endorsed by Robinhood.
        </p>
      </section>
    </main>
  );
}
