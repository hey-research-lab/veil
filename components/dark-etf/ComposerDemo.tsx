"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const TICKERS = ["NVDA", "SPY", "TSLA", "AAPL", "MSFT"] as const;
type Ticker = (typeof TICKERS)[number];

const STAGES = ["Compose", "Commit", "Shield", "Hidden"] as const;

function normalizeWeights(picked: Ticker[], changed: Ticker, value: number): Record<Ticker, number> {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const others = picked.filter((t) => t !== changed);
  const out = {} as Record<Ticker, number>;
  if (others.length === 0) {
    out[changed] = 100;
    return out;
  }
  const rest = 100 - v;
  const prevTotal = others.reduce((s) => s + 0, 0);
  void prevTotal;
  // Proportional split of the remainder; rounding drift lands on the last ticker.
  let acc = 0;
  const base = rest / others.length;
  others.forEach((t, i) => {
    if (i === others.length - 1) {
      out[t] = Math.max(0, rest - acc);
    } else {
      // Keep prior proportions when possible: equal split is deterministic
      // and always sums correctly; user adjusts per-slider after.
      const w = Math.max(0, Math.round(base));
      out[t] = w;
      acc += w;
    }
  });
  out[changed] = v;
  // Fix rounding drift on the changed ticker (never below 0, never above 100).
  const total = picked.reduce((s, t) => s + (out[t] ?? 0), 0);
  out[changed] = Math.max(0, Math.min(100, v + (100 - total)));
  return out;
}

function fakeHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return "0x" + Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Interactive basket-composer SIMULATION (no wallet, no chain, no prices).
 * Everything on screen is labeled illustrative. Weights always sum to 100. */
export const ComposerDemo: React.FC = () => {
  const [picked, setPicked] = useState<Ticker[]>(["NVDA", "SPY", "TSLA"]);
  const [weights, setWeights] = useState<Record<Ticker, number>>({ NVDA: 40, SPY: 30, TSLA: 30 } as Record<Ticker, number>);
  const [stage, setStage] = useState<number>(-1); // -1 idle, 0..3 stages, 4 done
  const [commitment, setCommitment] = useState<string | null>(null);
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

  const total = useMemo(() => picked.reduce((s, t) => s + (weights[t] ?? 0), 0), [picked, weights]);

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
      setPicked([...picked, t]);
      setWeights(normalizeWeights([...picked, t], t, Math.floor(100 / (picked.length + 1))));
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
    if (reducedMotion) {
      setStage(4);
      setCommitment(fake);
      return;
    }
    setStage(0);
    setCommitment(null);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    [1, 2, 3, 4].forEach((s, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(s);
          if (s === 4) setCommitment(fake);
        }, 900 * (i + 1))
      );
    });
  }

  return (
    <div>
      <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "monospace" }}>
        Illustrative preview — not live. No wallet, no prices, no chain.
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "12px 0" }} role="group" aria-label="Choose 2 to 5 tickers">
        {TICKERS.map((t) => {
          const on = picked.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              aria-pressed={on}
              style={{
                padding: "8px 14px",
                minHeight: "44px",
                borderRadius: "var(--radius-sm)",
                border: on ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                backgroundColor: on ? "rgba(255,140,0,0.08)" : "transparent",
                color: "var(--color-text)",
                fontFamily: "monospace",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      {picked.map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
          <span style={{ width: "52px", fontFamily: "monospace", fontWeight: 700 }}>{t}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={weights[t] ?? 0}
            onChange={(e) => onSlide(t, Number(e.target.value))}
            aria-label={`${t} weight percent`}
            aria-valuetext={`${t} ${weights[t] ?? 0} persen`}
            style={{ flex: 1, minHeight: "44px" }}
          />
          <span style={{ width: "56px", textAlign: "right", fontFamily: "monospace" }}>{weights[t] ?? 0}%</span>
        </div>
      ))}
      <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "monospace" }}>
        Total: {total}% (always 100)
      </p>
      <button
        type="button"
        onClick={shield}
        style={{
          padding: "10px 18px",
          minHeight: "44px",
          borderRadius: "var(--radius-sm)",
          border: "none",
          backgroundColor: "var(--color-accent)",
          color: "var(--color-accent-contrast)",
          fontWeight: 700,
          cursor: "pointer",
          marginTop: "8px",
        }}
      >
        Shield basket
      </button>
      {stage >= 0 && (
        <div style={{ marginTop: "12px", fontFamily: "monospace", fontSize: "13px" }} role="status">
          {STAGES.slice(0, Math.min(stage + 1, 4)).join(" → ")}
          {stage >= 4 && commitment && (
            <div style={{ marginTop: "12px", padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontWeight: 700 }}>Your Dark ETF (simulated)</div>
              <div>commitment: {commitment.slice(0, 18)}… (illustrative, not real)</div>
              <div>weights: hidden from outsiders</div>
              <div style={{ marginTop: "8px", color: "var(--color-muted)" }}>
                Public view: 0x… · ???
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComposerDemo;
