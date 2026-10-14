"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Shield, Lock, Eye, EyeOff, RotateCcw, Check, Sparkles, Sliders, ArrowRight, CheckCircle2 } from "lucide-react";
import { getStockLogo } from "../StockLogos";

const TICKER_INFO = {
  NVDA: { name: "NVIDIA Corp", category: "AI & Semi", shareWeight: 40 },
  SPY: { name: "SPDR S&P 500", category: "Index Trust", shareWeight: 30 },
  TSLA: { name: "Tesla Inc", category: "EV & Tech", shareWeight: 30 },
  AAPL: { name: "Apple Inc", category: "Hardware", shareWeight: 0 },
  MSFT: { name: "Microsoft Corp", category: "Enterprise Cloud", shareWeight: 0 },
} as const;

type Ticker = keyof typeof TICKER_INFO;
const TICKERS = Object.keys(TICKER_INFO) as Ticker[];

const STAGES = [
  { label: "Compose", desc: "Setting allocation weights" },
  { label: "Commit", desc: "Generating Poseidon hash" },
  { label: "Shield", desc: "Minting note to LeanIMT pool" },
  { label: "Hidden", desc: "Shielded · Zero mempool footprint" },
] as const;

function normalizeWeights(picked: Ticker[], changed: Ticker, value: number): Record<Ticker, number> {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const others = picked.filter((t) => t !== changed);
  const out = {} as Record<Ticker, number>;
  if (others.length === 0) {
    out[changed] = 100;
    return out;
  }
  const rest = 100 - v;
  let acc = 0;
  const base = rest / others.length;
  others.forEach((t, i) => {
    if (i === others.length - 1) {
      out[t] = Math.max(0, rest - acc);
    } else {
      const w = Math.max(0, Math.round(base));
      out[t] = w;
      acc += w;
    }
  });
  out[changed] = v;
  const total = picked.reduce((s, t) => s + (out[t] ?? 0), 0);
  out[changed] = Math.max(0, Math.min(100, v + (100 - total)));
  return out;
}

function fakeHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return "0x" + Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const ComposerDemo: React.FC = () => {
  const [picked, setPicked] = useState<Ticker[]>(["NVDA", "SPY", "TSLA"]);
  const [weights, setWeights] = useState<Record<Ticker, number>>({
    NVDA: 40,
    SPY: 30,
    TSLA: 30,
  } as Record<Ticker, number>);
  const [stage, setStage] = useState<number>(-1);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [noteLeaf, setNoteLeaf] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const total = useMemo(
    () => picked.reduce((s, t) => s + (weights[t] ?? 0), 0),
    [picked, weights]
  );

  function toggle(t: Ticker) {
    if (picked.includes(t)) {
      if (picked.length <= 2) return;
      const next = picked.filter((x) => x !== t);
      const share = Math.floor(100 / next.length);
      const w = {} as Record<Ticker, number>;
      next.forEach((x, i) => (w[x] = i === next.length - 1 ? 100 - share * (next.length - 1) : share));
      setPicked(next);
      setWeights(w);
    } else {
      if (picked.length >= 5) return;
      const next = [...picked, t];
      setPicked(next);
      setWeights(normalizeWeights(next, t, Math.floor(100 / next.length)));
    }
    setStage(-1);
    setCommitment(null);
  }

  function onSlide(t: Ticker, v: number) {
    setWeights(normalizeWeights(picked, t, v));
    setStage(-1);
    setCommitment(null);
  }

  function shield() {
    window.dispatchEvent(new CustomEvent("veil:composer_shield_click"));
    const fake = fakeHex(32);
    const leaf = Math.floor(100000 + Math.random() * 900000);
    if (reducedMotion) {
      setStage(4);
      setCommitment(fake);
      setNoteLeaf(leaf);
      return;
    }
    setStage(0);
    setCommitment(null);
    setNoteLeaf(null);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    [1, 2, 3, 4].forEach((s, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(s);
          if (s === 4) {
            setCommitment(fake);
            setNoteLeaf(leaf);
          }
        }, 750 * (i + 1))
      );
    });
  }

  function reset() {
    setStage(-1);
    setCommitment(null);
    setNoteLeaf(null);
    timers.current.forEach((t) => window.clearTimeout(t));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Simulation Banner Notice */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={14} style={{ color: "var(--color-accent)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              fontWeight: 600,
            }}
          >
            Illustrative preview — not live · No wallet, no prices, no chain
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-text)",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(255, 140, 0, 0.1)",
            border: "1px solid rgba(255, 140, 0, 0.25)",
          }}
        >
          ALLOCATION TOTAL: {total}%
        </div>
      </div>

      {/* Ticker Selector Chips with Official Logos */}
      <div>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 600,
          }}
        >
          <span>Select 2 to 5 Stock Tokens</span>
          <span>{picked.length}/5 Selected</span>
        </div>
        <div
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
          role="group"
          aria-label="Choose 2 to 5 tickers"
        >
          {TICKERS.map((t) => {
            const on = picked.includes(t);
            const info = TICKER_INFO[t];
            const Logo = getStockLogo(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                aria-pressed={on}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 14px",
                  minHeight: "42px",
                  borderRadius: "var(--radius-md)",
                  border: on ? "1px solid var(--color-accent)" : "1px solid var(--color-border-strong)",
                  backgroundColor: on ? "rgba(255, 140, 0, 0.08)" : "#ffffff",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--duration-fast) var(--ease-out)",
                  boxShadow: on ? "0 2px 8px rgba(255, 140, 0, 0.15)" : "none",
                }}
              >
                <Logo size={18} />
                <span style={{ fontWeight: 800 }}>{t}</span>
                <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: 400 }}>
                  {info.name}
                </span>
                {on && <Check size={14} style={{ color: "var(--color-accent)", marginLeft: "4px" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Clean Composition Visualizer */}
      <div
        style={{
          padding: "16px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(26, 26, 26, 0.02)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--color-muted)",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          <span>PROPORTIONAL BASKET DISTRIBUTION</span>
          <span>100% BALANCED</span>
        </div>

        {/* Stacked Composition Bar */}
        <div
          style={{
            height: "12px",
            width: "100%",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            display: "flex",
            backgroundColor: "rgba(26, 26, 26, 0.08)",
          }}
        >
          {picked.map((t, idx) => {
            const w = weights[t] ?? 0;
            if (w === 0) return null;
            // Alternating elegant brand shades
            const bg = idx === 0 ? "var(--color-accent)" : idx === 1 ? "#1A1A1A" : idx === 2 ? "#525252" : idx === 3 ? "#8C8C8C" : "#A3A3A3";
            return (
              <div
                key={t}
                style={{
                  width: `${w}%`,
                  backgroundColor: bg,
                  transition: "width 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                title={`${t}: ${w}%`}
              />
            );
          })}
        </div>

        {/* Token allocation readouts */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "12px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          {picked.map((t) => {
            const Logo = getStockLogo(t);
            return (
              <div key={t} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Logo size={14} />
                <span style={{ fontWeight: 700 }}>{t}:</span>
                <span style={{ color: "var(--color-text)" }}>{weights[t] ?? 0}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sliders Area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {picked.map((t) => {
          const info = TICKER_INFO[t];
          const val = weights[t] ?? 0;
          const Logo = getStockLogo(t);
          return (
            <div
              key={t}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 65px",
                alignItems: "center",
                gap: "14px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-border)",
                boxShadow: "0 2px 6px rgba(26, 26, 26, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Logo size={20} />
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", lineHeight: 1.1 }}>
                    {t}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {info.category}
                  </div>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={val}
                onChange={(e) => onSlide(t, Number(e.target.value))}
                aria-label={`${t} weight percent`}
                aria-valuetext={`${t} ${val} percent`}
                style={{
                  width: "100%",
                  cursor: "ew-resize",
                  accentColor: "var(--color-accent)",
                  minHeight: "36px",
                }}
              />

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: 800,
                  textAlign: "right",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(26, 26, 26, 0.04)",
                  color: "var(--color-text)",
                }}
              >
                {val}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Shield CTA Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
        <button
          type="button"
          onClick={shield}
          disabled={stage >= 0 && stage < 4}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 26px",
            minHeight: "44px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            backgroundColor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            fontFamily: "var(--font-mono)",
            fontSize: "14px",
            fontWeight: 700,
            cursor: stage >= 0 && stage < 4 ? "wait" : "pointer",
            transition: "all var(--duration-fast) var(--ease-out)",
            boxShadow: "0 4px 14px rgba(255, 140, 0, 0.3)",
          }}
        >
          <Shield size={16} />
          {stage >= 0 && stage < 4 ? "Generating ZK Proof…" : "Shield basket"}
        </button>

        {stage >= 4 && (
          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              minHeight: "44px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "#ffffff",
              color: "var(--color-text)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            Reconfigure Basket
          </button>
        )}
      </div>

      {/* 4-Stage Motion Pipeline Display */}
      {stage >= 0 && (
        <div
          role="status"
          style={{
            padding: "18px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(26, 26, 26, 0.02)",
            border: "1px solid var(--color-border)",
            animation: "tabContentEnter 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {STAGES.map((s, idx) => {
              const isPast = stage > idx;
              const isCurrent = stage === idx;
              return (
                <div
                  key={s.label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isCurrent
                      ? "rgba(255, 140, 0, 0.12)"
                      : isPast
                      ? "#ffffff"
                      : "transparent",
                    border: isCurrent
                      ? "1px solid var(--color-accent)"
                      : isPast
                      ? "1px solid var(--color-border-strong)"
                      : "1px dashed var(--color-border)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isCurrent
                        ? "var(--color-accent)"
                        : isPast
                        ? "var(--color-text)"
                        : "var(--color-muted)",
                    }}
                  >
                    <span>
                      0{idx + 1}. {s.label}
                    </span>
                    {isPast && <Check size={12} style={{ color: "var(--color-accent)" }} />}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--color-muted)",
                      marginTop: "4px",
                      lineHeight: 1.3,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outcome Split View */}
          {stage >= 4 && commitment && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginTop: "12px",
              }}
            >
              {/* Left: User's Private View */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#ffffff",
                  border: "1px solid var(--color-border-strong)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  <Eye size={14} />
                  <span>YOUR SHIELDED BASKET (CLIENT DECRYPTION)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div>
                    <span style={{ color: "var(--color-muted)" }}>Commitment: </span>
                    <span style={{ fontWeight: 600 }}>{commitment.slice(0, 18)}…</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-muted)" }}>LeanIMT Leaf: </span>
                    <span>#{noteLeaf ?? 104857}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-muted)" }}>Weights (Secret): </span>
                    <span style={{ fontWeight: 600 }}>
                      {picked.map((t) => `${t} ${weights[t]}%`).join(" · ")}
                    </span>
                  </div>
                  <div style={{ color: "var(--color-accent)", fontSize: "11px", marginTop: "4px" }}>
                    ✓ Encrypted note saved in client-side storage
                  </div>
                </div>
              </div>

              {/* Right: What Outsiders See */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#8c8c8c",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  <EyeOff size={14} />
                  <span>WHAT OUTSIDERS / EXPLORERS SEE</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div>
                    <span style={{ color: "#8c8c8c" }}>Transaction: </span>
                    <span>0x{fakeHex(6).slice(2)}… (Shield Deposit)</span>
                  </div>
                  <div>
                    <span style={{ color: "#8c8c8c" }}>Asset Breakdown: </span>
                    <span style={{ color: "#ff8c00" }}>[??? HIDDEN]</span>
                  </div>
                  <div>
                    <span style={{ color: "#8c8c8c" }}>Portfolio Weights: </span>
                    <span style={{ color: "#ff8c00" }}>0x… · ??? · Zero trace</span>
                  </div>
                  <div style={{ color: "#8c8c8c", fontSize: "11px", marginTop: "4px" }}>
                    Protected against front-running and copy-trading
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComposerDemo;
