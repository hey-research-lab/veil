"use client";

import React, { useEffect, useState } from "react";
import { Lock, Unlock, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { getStockLogo } from "../StockLogos";

interface TickerMeta {
  symbol: string;
  name: string;
  assetClass: string;
  simulatedWeight: string;
  underlying: string;
}

const TICKER_LIST: TickerMeta[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", assetClass: "AI & Semiconductors", simulatedWeight: "35.0%", underlying: "Stock Token" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", assetClass: "Broad Market Index", simulatedWeight: "25.0%", underlying: "Stock Token" },
  { symbol: "TSLA", name: "Tesla, Inc.", assetClass: "EV & Autonomous Tech", simulatedWeight: "20.0%", underlying: "Stock Token" },
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "Consumer Technology", simulatedWeight: "10.0%", underlying: "Stock Token" },
  { symbol: "MSFT", name: "Microsoft Corporation", assetClass: "Cloud & AI Enterprise", simulatedWeight: "10.0%", underlying: "Stock Token" },
];

export const TickerHeroGrid: React.FC = () => {
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div style={{ width: "100%", marginTop: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--color-muted)",
          letterSpacing: "0.08em",
          marginBottom: "12px",
          textTransform: "uppercase",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
          <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
          Whitelisted Stock Tokens · Robinhood Chain
        </span>
        <span style={{ color: "var(--color-muted)", fontSize: "10px" }}>
          {reducedMotion ? "Fixed Preview" : "Interactive Preview · Hover to De-Anonymize"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
        }}
      >
        {TICKER_LIST.map((t) => {
          const isHovered = hoveredTicker === t.symbol;
          const showClear = reducedMotion || isHovered;
          const LogoComponent = getStockLogo(t.symbol);

          return (
            <div
              key={t.symbol}
              onMouseEnter={() => setHoveredTicker(t.symbol)}
              onMouseLeave={() => setHoveredTicker(null)}
              style={{
                position: "relative",
                padding: "18px 16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#ffffff",
                border: isHovered
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border-strong)",
                transition: reducedMotion
                  ? "none"
                  : "all 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: isHovered && !reducedMotion ? "translateY(-3px)" : "translateY(0)",
                boxShadow: isHovered
                  ? "0 12px 28px -6px rgba(255, 140, 0, 0.2)"
                  : "0 4px 16px -2px rgba(26, 26, 26, 0.05)",
                cursor: "pointer",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              {/* Top Accent Line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  backgroundColor: isHovered ? "var(--color-accent)" : "transparent",
                  transition: "background-color 0.2s ease",
                }}
              />

              {/* Logo + Ticker Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <LogoComponent
                    size={28}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: isHovered && !reducedMotion ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "var(--color-text)",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.1,
                      }}
                    >
                      {t.symbol}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--color-muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.underlying}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "4px 6px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: showClear ? "rgba(255, 140, 0, 0.1)" : "rgba(26, 26, 26, 0.05)",
                    color: showClear ? "var(--color-accent)" : "var(--color-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={showClear ? "Decrypted Note Preview" : "Shielded In Pool"}
                >
                  {showClear ? <Unlock size={14} /> : <Lock size={14} />}
                </div>
              </div>

              {/* Company Full Name */}
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "4px",
                }}
              >
                {t.name}
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--color-muted)",
                  marginBottom: "14px",
                }}
              >
                {t.assetClass}
              </div>

              {/* Blurred vs Revealed Allocation */}
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(26, 26, 26, 0.03)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 600 }}>
                  ALLOCATION
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: showClear ? "var(--color-accent)" : "var(--color-muted)",
                    filter: showClear ? "none" : "blur(4px)",
                    transition: reducedMotion ? "none" : "filter 0.25s ease",
                    userSelect: "none",
                  }}
                >
                  {showClear ? t.simulatedWeight : "??.?%"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TickerHeroGrid;
