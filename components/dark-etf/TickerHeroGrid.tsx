"use client";

import React, { useEffect, useState } from "react";
import { Lock, Unlock, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { getStockLogo } from "../StockLogos";

interface TickerMeta {
  symbol: string;
  name: string;
  assetClass: string;
  simulatedWeight: string;
  underlying: string;
  price: string;
  change: string;
  sparkline: string;
}

const TICKER_LIST: TickerMeta[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "AI & Semiconductors",
    simulatedWeight: "35.0%",
    underlying: "Stock Token",
    price: "$138.25",
    change: "+3.12%",
    sparkline: "M 0 24 Q 15 20, 30 18 T 60 12 T 90 15 T 120 4",
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    assetClass: "Broad Market Index",
    simulatedWeight: "25.0%",
    underlying: "Stock Token",
    price: "$582.10",
    change: "+0.84%",
    sparkline: "M 0 22 Q 25 19, 50 16 T 80 13 T 100 10 T 120 6",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    assetClass: "EV & Autonomous Tech",
    simulatedWeight: "20.0%",
    underlying: "Stock Token",
    price: "$224.50",
    change: "+1.95%",
    sparkline: "M 0 25 Q 20 26, 40 18 T 70 20 T 95 10 T 120 5",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "Consumer Technology",
    simulatedWeight: "10.0%",
    underlying: "Stock Token",
    price: "$231.80",
    change: "+0.45%",
    sparkline: "M 0 21 Q 25 20, 50 16 T 75 14 T 100 11 T 120 7",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetClass: "Cloud & AI Enterprise",
    simulatedWeight: "10.0%",
    underlying: "Stock Token",
    price: "$448.20",
    change: "+1.10%",
    sparkline: "M 0 23 Q 20 21, 50 17 T 80 14 T 105 10 T 120 6",
  },
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

  const handleSelectTicker = (symbol: string) => {
    window.dispatchEvent(new CustomEvent("veil:select_ticker", { detail: { symbol } }));
    const composerEl = document.getElementById("composer");
    if (composerEl) {
      composerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{ width: "100%", marginTop: "4px" }}>
      {/* Sub-header row with live indicator */}
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
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "var(--color-signal)",
              boxShadow: "0 0 8px rgba(0, 194, 45, 0.6)",
              display: "inline-block",
            }}
          />
          <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
          <span>Whitelisted Stock Tokens · Robinhood Chain</span>
        </div>
        <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>
          {reducedMotion ? "Fixed Preview" : "Interactive · Hover to Decrypt · Click to Compose"}
        </span>
      </div>

      {/* Grid of 5 Stock Tokens */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
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
              onClick={() => handleSelectTicker(t.symbol)}
              onMouseEnter={() => setHoveredTicker(t.symbol)}
              onMouseLeave={() => setHoveredTicker(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectTicker(t.symbol);
                }
              }}
              title={`Click to add ${t.symbol} to Basket Composer`}
              style={{
                position: "relative",
                padding: "16px 16px 14px 16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#ffffff",
                border: isHovered
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border-strong)",
                transition: reducedMotion
                  ? "none"
                  : "all 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: isHovered && !reducedMotion ? "translateY(-3px)" : "translateY(0)",
                boxShadow: isHovered
                  ? "0 12px 28px -6px rgba(255, 140, 0, 0.18)"
                  : "0 2px 12px -2px rgba(26, 26, 26, 0.04)",
                cursor: "pointer",
                boxSizing: "border-box",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {/* Subtle top indicator bar */}
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

              {/* Header: Logo, Ticker, Shield Lock */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <LogoComponent
                      size={28}
                      style={{
                        transition: "transform 0.2s ease",
                        transform: isHovered && !reducedMotion ? "scale(1.08)" : "scale(1)",
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
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {t.symbol}
                        <ArrowUpRight
                          size={12}
                          style={{
                            color: isHovered ? "var(--color-accent)" : "transparent",
                            transition: "all 0.2s ease",
                            transform: isHovered ? "translate(1px, -1px)" : "none",
                          }}
                        />
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

                  {/* Shield Status Badge */}
                  <div
                    style={{
                      padding: "4px 7px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: showClear ? "rgba(255, 140, 0, 0.1)" : "rgba(26, 26, 26, 0.05)",
                      color: showClear ? "var(--color-accent)" : "var(--color-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    title={showClear ? "Decrypted Note Preview" : "Shielded In Pool"}
                  >
                    {showClear ? <Unlock size={13} /> : <Lock size={13} />}
                  </div>
                </div>

                {/* Company Name & Asset Class */}
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--color-muted)",
                    marginTop: "2px",
                  }}
                >
                  {t.assetClass}
                </div>
              </div>

              {/* Sparkline & Price Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "6px",
                  borderTop: "1px dashed var(--color-border)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--color-text)",
                    }}
                  >
                    {t.price}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#16a34a",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <TrendingUp size={10} />
                    <span>{t.change}</span>
                  </div>
                </div>

                {/* Simulated Mini Sparkline SVG */}
                <div style={{ width: "64px", height: "26px", position: "relative" }}>
                  <svg
                    viewBox="0 0 120 30"
                    fill="none"
                    style={{ width: "100%", height: "100%", overflow: "visible" }}
                  >
                    <path
                      d={t.sparkline}
                      stroke={isHovered ? "var(--color-accent)" : "#16a34a"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="120"
                      cy={t.sparkline.endsWith("4") ? "4" : t.sparkline.endsWith("5") ? "5" : t.sparkline.endsWith("6") ? "6" : "7"}
                      r={isHovered ? "3.5" : "2.5"}
                      fill={isHovered ? "var(--color-accent)" : "#16a34a"}
                      style={{ transition: "all 0.2s ease" }}
                    />
                  </svg>
                </div>
              </div>

              {/* Allocation Readout: Blurred vs Decrypted */}
              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(26, 26, 26, 0.03)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                }}
              >
                <span style={{ fontSize: "10px", color: "var(--color-muted)", fontWeight: 600 }}>
                  ALLOCATION
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "12px",
                    color: showClear ? "var(--color-accent)" : "var(--color-muted)",
                    filter: showClear ? "none" : "blur(4px)",
                    transition: reducedMotion ? "none" : "filter 0.22s ease",
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
