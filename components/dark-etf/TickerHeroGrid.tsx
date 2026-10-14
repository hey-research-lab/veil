"use client";

import React, { useEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { getStockLogo } from "../StockLogos";

interface TickerMeta {
  symbol: string;
  name: string;
  assetClass: string;
  simulatedWeight: string;
  underlying: string;
}

const TICKER_LIST: TickerMeta[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "AI & Semiconductors",
    simulatedWeight: "35.0%",
    underlying: "Stock Token",
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    assetClass: "Broad Market Index",
    simulatedWeight: "25.0%",
    underlying: "Stock Token",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    assetClass: "EV & Autonomous Tech",
    simulatedWeight: "20.0%",
    underlying: "Stock Token",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "Consumer Technology",
    simulatedWeight: "10.0%",
    underlying: "Stock Token",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetClass: "Cloud & AI Enterprise",
    simulatedWeight: "10.0%",
    underlying: "Stock Token",
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
      {/* Sub-header row without dots or clutter icons */}
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
        <span style={{ fontWeight: 600 }}>
          Whitelisted Stock Tokens // Robinhood Chain
        </span>
        <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>
          {reducedMotion ? "Fixed Preview" : "Hover to Decrypt · Click to Compose"}
        </span>
      </div>

      {/* Grid of 5 Stock Tokens */}
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
                padding: "16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#ffffff",
                border: isHovered
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border-strong)",
                transition: reducedMotion
                  ? "none"
                  : "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: isHovered && !reducedMotion ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHovered
                  ? "0 8px 24px -4px rgba(26, 26, 26, 0.08)"
                  : "0 2px 8px -2px rgba(26, 26, 26, 0.03)",
                cursor: "pointer",
                boxSizing: "border-box",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              {/* Header: Logo, Ticker, Privacy Lock */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <LogoComponent size={28} />
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

                  {/* Shield Status Badge */}
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
