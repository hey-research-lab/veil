"use client";

import React, { useEffect, useState } from "react";
import { Lock, Unlock, Eye, Sparkles } from "lucide-react";

interface TickerMeta {
  symbol: string;
  name: string;
  category: string;
  simulatedWeight: string;
  color: string;
}

const TICKER_LIST: TickerMeta[] = [
  { symbol: "NVDA", name: "Nvidia Corp", category: "AI Compute", simulatedWeight: "35.0%", color: "#10B981" },
  { symbol: "SPY", name: "S&P 500 ETF", category: "Index Trust", simulatedWeight: "25.0%", color: "#3B82F6" },
  { symbol: "TSLA", name: "Tesla Inc", category: "EV & Robot", simulatedWeight: "20.0%", color: "#F43F5E" },
  { symbol: "AAPL", name: "Apple Inc", category: "Consumer Hardware", simulatedWeight: "10.0%", color: "#A855F7" },
  { symbol: "MSFT", name: "Microsoft Corp", category: "Enterprise Cloud", simulatedWeight: "10.0%", color: "#F59E0B" },
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
    <div style={{ marginTop: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--color-muted)",
          letterSpacing: "0.06em",
          marginBottom: "10px",
          textTransform: "uppercase",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={12} style={{ color: "var(--color-accent)" }} />
          Shielded Basket Grid (Stock Tokens)
        </span>
        <span style={{ color: "var(--color-faint)" }}>
          {reducedMotion ? "Static View" : "[Hover card to unveil note preview]"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "10px",
        }}
      >
        {TICKER_LIST.map((t) => {
          const isHovered = hoveredTicker === t.symbol;
          const showClear = reducedMotion || isHovered;

          return (
            <div
              key={t.symbol}
              onMouseEnter={() => setHoveredTicker(t.symbol)}
              onMouseLeave={() => setHoveredTicker(null)}
              style={{
                position: "relative",
                padding: "16px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#141210",
                color: "#ffffff",
                border: isHovered
                  ? "1px solid var(--color-accent)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                transition: reducedMotion ? "none" : "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: isHovered && !reducedMotion ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHovered
                  ? "0 8px 24px rgba(255, 140, 0, 0.15)"
                  : "0 2px 10px rgba(0, 0, 0, 0.15)",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {/* Subtle top color bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: t.color,
                  opacity: isHovered ? 1 : 0.6,
                }}
              />

              {/* Ticker Symbol & Status Icon */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "15px",
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                      color: isHovered ? "var(--color-accent)" : "#ffffff",
                    }}
                  >
                    {t.symbol}
                  </span>
                </div>
                {showClear ? (
                  <Unlock size={13} style={{ color: "var(--color-accent)" }} />
                ) : (
                  <Lock size={13} style={{ color: "#737373" }} />
                )}
              </div>

              {/* Company / Asset label */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "#a3a3a3",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  marginBottom: "12px",
                }}
              >
                {t.name}
              </div>

              {/* Blurred vs Revealed Weight Allocation */}
              <div
                style={{
                  padding: "6px 8px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                <span style={{ fontSize: "10px", color: "#737373" }}>WEIGHT</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: showClear ? "#ffffff" : "#737373",
                    filter: showClear ? "none" : "blur(3px)",
                    transition: reducedMotion ? "none" : "filter 0.2s ease",
                    userSelect: "none",
                  }}
                >
                  {showClear ? t.simulatedWeight : "??.?%"}
                </span>
              </div>

              {/* Bottom tag indicator */}
              <div
                style={{
                  marginTop: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: isHovered ? "var(--color-accent)" : "#525252",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: isHovered ? "var(--color-accent)" : "#525252",
                  }}
                />
                {isHovered ? "Note Unveiled" : "Shielded Note"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TickerHeroGrid;
