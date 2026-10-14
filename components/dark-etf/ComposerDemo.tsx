"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Shield,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Copy,
} from "lucide-react";
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

const BASKET_TONES = [
  { bg: "#FF8C00", text: "#FFFFFF" }, // Veil Signature Orange
  { bg: "#1A1A1A", text: "#FFFFFF" }, // Veil Obsidian Ink
  { bg: "#786B7E", text: "#FFFFFF" }, // Veil Warm Lilac Slate
  { bg: "#C26700", text: "#FFFFFF" }, // Veil Warm Roasted Cognac
  { bg: "#4A404E", text: "#FFFFFF" }, // Veil Dark Charcoal Lilac
];

const STAGES = [
  { label: "Compose", desc: "Setting allocation weights", log: "PoseidonTree::init() -> Validating asset tokens & weights" },
  { label: "Commit", desc: "Generating Poseidon hash", log: "Poseidon::hash(nullifier, secret) -> Merkle leaf computed" },
  { label: "Shield", desc: "Minting note to LeanIMT pool", log: "Groth16::witness() -> 24,812 R1CS constraints verified" },
  { label: "Hidden", desc: "Shielded · Zero mempool footprint", log: "BatchAuction::match() -> Off-chain P2P netting settled" },
] as const;

const PRESETS = [
  {
    name: "AI & Cloud Leaders",
    desc: "NVDA 40% · MSFT 30% · AAPL 30%",
    tickers: ["NVDA", "MSFT", "AAPL"] as Ticker[],
    weights: { NVDA: 40, MSFT: 30, AAPL: 30 } as Record<Ticker, number>,
  },
  {
    name: "Core Index & Tech",
    desc: "SPY 50% · NVDA 25% · TSLA 25%",
    tickers: ["SPY", "NVDA", "TSLA"] as Ticker[],
    weights: { SPY: 50, NVDA: 25, TSLA: 25 } as Record<Ticker, number>,
  },
  {
    name: "Balanced Mega 5",
    desc: "20% Equal Allocation Across All 5",
    tickers: ["NVDA", "SPY", "TSLA", "AAPL", "MSFT"] as Ticker[],
    weights: { NVDA: 20, SPY: 20, TSLA: 20, AAPL: 20, MSFT: 20 } as Record<Ticker, number>,
  },
];

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
  const [copied, setCopied] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);

    const onSelectTicker = (e: Event) => {
      const customEvent = e as CustomEvent<{ symbol: string }>;
      const sym = customEvent.detail?.symbol as Ticker;
      if (sym && TICKERS.includes(sym)) {
        setPicked((prev) => {
          if (prev.includes(sym)) return prev;
          if (prev.length >= 5) return prev;
          const next = [...prev, sym];
          setWeights((w) => normalizeWeights(next, sym, Math.floor(100 / next.length)));
          setStage(-1);
          setCommitment(null);
          return next;
        });
      }
    };
    window.addEventListener("veil:select_ticker", onSelectTicker);

    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("veil:select_ticker", onSelectTicker);
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

  function applyPreset(preset: typeof PRESETS[0]) {
    setPicked(preset.tickers);
    setWeights({ ...preset.weights });
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
        }, 650 * (i + 1))
      );
    });
  }

  function reset() {
    setStage(-1);
    setCommitment(null);
    setNoteLeaf(null);
    timers.current.forEach((t) => window.clearTimeout(t));
  }

  function copyCommitment() {
    if (!commitment) return;
    navigator.clipboard?.writeText(commitment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(255, 140, 0, 0.12)",
              color: "var(--color-accent)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Illustrative Preview · Not Live
          </span>
          <span style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            No wallet connection or gas required
          </span>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-muted)",
          }}
        >
          <span>BASKET SUM:</span>
          <span
            style={{
              fontWeight: 800,
              color: total === 100 ? "var(--color-accent)" : "var(--color-text)",
            }}
          >
            {total}%
          </span>
        </div>
      </div>

      {/* Preset Strategy Fast Pickers */}
      <div>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Quick Strategy Presets
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {PRESETS.map((p) => {
            const isMatch =
              p.tickers.length === picked.length &&
              p.tickers.every((t) => picked.includes(t)) &&
              p.tickers.every((t) => weights[t] === p.weights[t]);

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: isMatch ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                  backgroundColor: isMatch ? "rgba(255, 140, 0, 0.08)" : "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: isMatch ? "var(--color-accent)" : "var(--color-text)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{p.name}</span>
                <span style={{ fontSize: "10px", color: "var(--color-muted)", fontWeight: 400 }}>
                  ({p.tickers.join("/")})
                </span>
              </button>
            );
          })}
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
                <Logo size={20} />
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
            marginBottom: "12px",
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          <span>PROPORTIONAL BASKET DISTRIBUTION</span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: total === 100 ? "rgba(255, 140, 0, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: total === 100 ? "var(--color-accent)" : "#EF4444",
              fontWeight: 700,
            }}
          >
            {total}% ALLOCATED
          </span>
        </div>

        {/* Brand-Harmonious Composition Bar */}
        <div
          style={{
            height: "28px",
            width: "100%",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            display: "flex",
            backgroundColor: "rgba(26, 26, 26, 0.06)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          {picked.map((t, idx) => {
            const w = weights[t] ?? 0;
            if (w === 0) return null;
            const tone = BASKET_TONES[idx % BASKET_TONES.length];
            const isLast = idx === picked.length - 1;
            const showLabel = w >= 12;

            return (
              <div
                key={t}
                style={{
                  width: `${w}%`,
                  backgroundColor: tone.bg,
                  borderRight: isLast ? "none" : "2px solid #ffffff",
                  transition: "width 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: tone.text,
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  padding: "0 4px",
                  userSelect: "none",
                }}
                title={`${t}: ${w}%`}
              >
                {showLabel && (
                  <span>
                    {t} {w}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Clean Token Allocation Readouts */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "12px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          {picked.map((t, idx) => {
            const w = weights[t] ?? 0;
            const tone = BASKET_TONES[idx % BASKET_TONES.length];
            const Logo = getStockLogo(t);
            return (
              <div
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#ffffff",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "2px",
                    backgroundColor: tone.bg,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <Logo size={16} />
                <span style={{ fontWeight: 800 }}>{t}</span>
                <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{w}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sliders Area (Standard Veil Style) */}
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
                aria-valuetext={`${t} ${val} persen`}
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
                  border: "1px solid var(--color-border)",
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
          {stage >= 0 && stage < 4 ? "Synthesizing ZK Note…" : "Shield basket"}
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

      {/* 4-Stage Motion Pipeline Display & Cryptographic Terminal Log */}
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
          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "rgba(26, 26, 26, 0.08)",
              overflow: "hidden",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: `${stage === 0 ? 25 : stage === 1 ? 50 : stage === 2 ? 75 : 100}%`,
                height: "100%",
                backgroundColor: "var(--color-accent)",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Stage Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              marginBottom: "14px",
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

          {/* Cryptographic Execution Log */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#141210",
              color: "#e5e5e5",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: 1.6,
              border: "1px solid rgba(255, 140, 0, 0.25)",
            }}
          >
            <div style={{ color: "var(--color-accent)", fontWeight: 700, marginBottom: "4px" }}>
              ZK PROVER SIMULATION LOG
            </div>
            {STAGES.slice(0, Math.min(stage + 1, 4)).map((s, i) => (
              <div key={s.label} style={{ opacity: 0.9 }}>
                <span style={{ color: "var(--color-accent)" }}>&gt;</span> {s.log}
              </div>
            ))}
            {stage < 4 && (
              <div style={{ color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>&gt; Computing Groth16 proof</span>
                <span className="zk-shield-breathe">…</span>
              </div>
            )}
          </div>

          {/* Outcome Split View */}
          {stage >= 4 && commitment && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginTop: "14px",
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
                    justifyContent: "space-between",
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Eye size={14} />
                    <span>YOUR SHIELDED BASKET (CLIENT DECRYPTED)</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyCommitment}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "rgba(26, 26, 26, 0.04)",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text)",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? <Check size={11} style={{ color: "var(--color-accent)" }} /> : <Copy size={11} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
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
