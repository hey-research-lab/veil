import type { Metadata } from "next";
import { Suspense } from "react";
import { ComposerDemo } from "../../components/dark-etf/ComposerDemo";
import { WaitlistForm } from "../../components/dark-etf/WaitlistForm";
import { TickerHeroGrid } from "../../components/dark-etf/TickerHeroGrid";
import {
  Shield,
  Sliders,
  Shuffle,
  ArrowDown,
  Lock,
  EyeOff,
  AlertTriangle,
  HelpCircle,
  FileText,
  Sparkles,
} from "lucide-react";

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
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "40px 20px 80px",
  display: "flex",
  flexDirection: "column",
  gap: "56px",
};

const eyebrowBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-muted)",
  marginBottom: "12px",
};

const h1Style: React.CSSProperties = {
  fontFamily: "var(--font-headline)",
  fontSize: "clamp(2.3rem, 4.6vw, 3.5rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.025em",
  color: "var(--color-text)",
  fontWeight: 600,
  margin: "0 0 16px 0",
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-headline)",
  fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  color: "var(--color-text)",
  fontWeight: 600,
  margin: "0 0 10px 0",
};

const bodyIntro: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
  lineHeight: 1.6,
  color: "var(--color-muted)",
  maxWidth: "680px",
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  padding: "28px 24px",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border)",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 20px rgba(26, 26, 26, 0.03)",
};

const ctaPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "13px 24px",
  minHeight: "44px",
  borderRadius: "var(--radius-sm)",
  backgroundColor: "var(--color-accent)",
  color: "var(--color-accent-contrast)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  fontWeight: 700,
  textDecoration: "none",
  letterSpacing: "0.02em",
  transition: "all var(--duration-fast) var(--ease-out)",
};

const ctaGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "13px 22px",
  minHeight: "44px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border-strong)",
  backgroundColor: "#ffffff",
  color: "var(--color-text)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  fontWeight: 600,
  textDecoration: "none",
  transition: "all var(--duration-fast) var(--ease-out)",
};

export default function DarkEtfPage() {
  return (
    <main style={shell}>
      {/* 1. HERO SECTION */}
      <section style={{ position: "relative" }}>
        <div style={eyebrowBadge}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(26, 26, 26, 0.05)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontWeight: 700,
            }}
          >
            ROBINHOOD MAINNET 46631
          </span>
          <span>// CONFIDENTIAL STOCK BASKETS</span>
        </div>

        <h1 style={h1Style}>Your own ETF. Nobody sees what&apos;s inside.</h1>

        <p style={bodyIntro}>
          Build a private basket of Stock Tokens on Robinhood Chain. Hold it shielded, rebalance it in the dark.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
          <a href="#waitlist" style={ctaPrimary}>
            <span>Join the waitlist</span>
            <ArrowDown size={14} />
          </a>
          <a href="#how" style={ctaGhost}>
            How it works
          </a>
        </div>

        {/* Interactive Holographic / Halftone Stock Token Grid */}
        <TickerHeroGrid />
      </section>

      {/* 2. THE PROBLEM */}
      <section style={cardStyle}>
        <div style={eyebrowBadge}>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>[01]</span>
          <span>// THE SURVEILLANCE PROBLEM</span>
        </div>
        <h2 style={h2Style}>The Problem</h2>
        <p style={{ ...bodyIntro, maxWidth: "780px" }}>
          Every on-chain portfolio is a public billboard. Your weights, your entries, your rebalances — all indexed
          forever on public block explorers, enabling MEV extraction and copy-trader front-running.
        </p>

        {/* Side-by-side terminal comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          {/* Public Mempool Billboard */}
          <div
            style={{
              padding: "18px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(239, 68, 68, 0.03)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#DC2626",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={14} />
                PUBLIC EXPLORER (MEMPOOL BILLBOARD)
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(220, 38, 38, 0.12)",
                }}
              >
                EXPOSED
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "var(--color-text)" }}>
              <div>
                <span style={{ color: "var(--color-muted)" }}>Target Wallet: </span>
                <span style={{ fontWeight: 600 }}>0x7a29…41c8</span>
              </div>
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <div style={{ fontWeight: 600, color: "#991B1B" }}>Public Positions:</div>
                <div style={{ marginTop: "4px", fontSize: "11px" }}>
                  • NVDA: 40% (45.2 Shares) · $5,420
                  <br />
                  • SPY: 30% (120.4 Shares) · $4,065
                  <br />
                  • TSLA: 30% (88.1 Shares) · $4,065
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "2px" }}>
                ⚠ Open to MEV sandwiching, copy-trader tracking &amp; wallet surveillance.
              </div>
            </div>
          </div>

          {/* Veil Shielded Note */}
          <div
            style={{
              padding: "18px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#141210",
              color: "#ffffff",
              border: "1px solid rgba(255, 140, 0, 0.35)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "var(--color-accent)",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Shield size={14} />
                VEIL SHIELDED COMMITMENT
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(255, 140, 0, 0.15)",
                }}
              >
                SHIELDED
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>
                <span style={{ color: "#8c8c8c" }}>Commitment Hash: </span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>0x7f3a8c19b02a…9b12fe04</span>
              </div>
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--color-accent)" }}>Shielded Payload:</div>
                <div style={{ marginTop: "4px", fontSize: "11px", color: "#d4d4d4" }}>
                  • Poseidon Merkle Leaf: #1,048,576
                  <br />
                  • Basket Weights: [ENCRYPTED IN ZK-NOTE]
                  <br />
                  • Rebalance Strategy: Off-chain batch auction
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "#10B981", marginTop: "2px" }}>
                ✓ Zero individual trade leak. Only net difference touches Uniswap v4.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how">
        <div style={eyebrowBadge}>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>[02]</span>
          <span>// THREE-STAGE ARCHITECTURE</span>
        </div>
        <h2 style={h2Style}>How It Works</h2>
        <p style={bodyIntro}>
          Three coordinated cryptographic steps that allow private index construction and batch rebalancing.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          {[
            {
              step: "01",
              title: "Compose",
              icon: <Sliders size={18} style={{ color: "var(--color-accent)" }} />,
              desc: "Pick Stock Tokens and customize your target weights. Compose your bespoke ETF with dynamic weight normalization.",
            },
            {
              step: "02",
              title: "Shield",
              icon: <Shield size={18} style={{ color: "var(--color-accent)" }} />,
              desc: "Your basket is minted as an encrypted private note in a Veil privacy pool. The chain sees only a Poseidon commitment.",
            },
            {
              step: "03",
              title: "Rebalance in the Dark",
              icon: <Shuffle size={18} style={{ color: "var(--color-accent)" }} />,
              desc: "Rebalancing trades match peer-to-peer inside an off-chain batch auction. Only the net aggregate delta touches Uniswap v4.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(255, 140, 0, 0.08)",
                  }}
                >
                  STEP {item.step}
                </span>
                {item.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: "4px 0",
                }}
              >
                {item.title}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--color-muted)",
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BASKET COMPOSER DEMO */}
      <section style={cardStyle}>
        <div style={eyebrowBadge}>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>[03]</span>
          <span>// INTERACTIVE SIMULATION</span>
        </div>
        <h2 style={h2Style}>Try the Composer (Simulation)</h2>
        <p style={{ ...bodyIntro, marginBottom: "20px" }}>
          Interact with simulated Stock Tokens and observe how the 4-stage zero-knowledge pipeline conceals portfolio
          allocations from outside observers.
        </p>
        <ComposerDemo />
      </section>

      {/* 5. WAITLIST SECTION */}
      <section id="waitlist" style={cardStyle}>
        <div style={eyebrowBadge}>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>[04]</span>
          <span>// EARLY ACCESS QUEUE</span>
        </div>
        <h2 style={h2Style}>Get in Line</h2>
        <p style={bodyIntro}>
          Be first in line when Dark ETF opens. No wallet signature required. Double opt-in confirmation protects your
          privacy.
        </p>
        <Suspense>
          <WaitlistForm />
        </Suspense>
      </section>

      {/* 6. FAQ */}
      <section>
        <div style={eyebrowBadge}>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>[05]</span>
          <span>// PROTOCOL INTEL</span>
        </div>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {[
            {
              q: "Is Dark ETF live?",
              a: "Not yet — this page is an announcement. Join the waitlist and we will notify you when early access opens.",
            },
            {
              q: "Which assets are supported?",
              a: "Stock Tokens on Robinhood Chain. The final whitelisted asset registry will be announced at launch.",
            },
            {
              q: "Who can use it?",
              a: "Access follows Stock Token jurisdictional limits. Strictly not available to U.S. persons or restricted territories.",
            },
            {
              q: "Is this an investment fund?",
              a: "No. Each basket is owned and controlled solely by a single user. There is no pooled fund management, no custodial intermediary, and no collective vehicle.",
            },
          ].map((f, i) => (
            <div
              key={f.q}
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                }}
              >
                Q0{i + 1}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                }}
              >
                {f.q}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--color-muted)",
                  margin: 0,
                }}
              >
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REGULATORY & JURISDICTIONAL DISCLAIMER */}
      <section
        style={{
          padding: "20px 24px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          backgroundColor: "rgba(26, 26, 26, 0.025)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "8px",
          }}
        >
          <FileText size={13} style={{ color: "var(--color-accent)" }} />
          <span>// REGULATORY &amp; JURISDICTIONAL NOTICE</span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            lineHeight: 1.6,
            color: "var(--color-muted)",
            margin: 0,
          }}
        >
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
