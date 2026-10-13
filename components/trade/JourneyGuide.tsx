"use client";

import React from "react";

export type JourneyTab = "buy_and_shield" | "shielded_swap" | "withdraw" | "vault";

export interface JourneyGuideProps {
  activeTab: JourneyTab;
  onTab: (tab: JourneyTab) => void;
  notesCount: number;
  attested: boolean | null;
  showTraderEntry: boolean;
  onTradeEntry: () => void;
}

/** Guided journey 1-2-3-4: plain human language, zero jargon up front.
 * Technical terms live in the <details> glossary below (progressive
 * disclosure). Never sends transactions; only switches tabs / scrolls. */
export const JourneyGuide: React.FC<JourneyGuideProps> = ({
  activeTab,
  onTab,
  notesCount,
  attested,
  showTraderEntry,
  onTradeEntry,
}) => {
  const hasNotes = notesCount > 0;
  const steps: { n: string; title: string; plain: string; tab: JourneyTab; state: "done" | "current" | "todo" }[] = [
    {
      n: "1",
      title: "Hide it",
      plain: "Put 0.001 in. You get a secret ticket. Back it up.",
      tab: "buy_and_shield",
      state: hasNotes ? "done" : activeTab === "buy_and_shield" ? "current" : "todo",
    },
    {
      n: "2",
      title: "Swap in the dark (optional)",
      plain: "Trade your ticket for another one. Nobody sees the swap.",
      tab: "shielded_swap",
      state: hasNotes ? "current" : "todo",
    },
    {
      n: "3",
      title: "Cash out clean",
      plain: "Burn the ticket. Money lands in a fresh address, unlinkable.",
      tab: "withdraw",
      state: hasNotes ? "current" : "todo",
    },
    {
      n: "4",
      title: "Done",
      plain: "Clean funds in a fresh wallet. Nothing links back.",
      tab: "vault",
      state: "todo",
    },
  ];
  return (
    <div
      style={{
        padding: "var(--space-4)",
        borderRadius: "var(--radius-md)",
        backgroundColor: "rgba(26, 26, 26, 0.025)",
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <div style={{ fontSize: "var(--text-caption)", fontWeight: 700, color: "var(--color-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        New here? Follow the steps
      </div>
      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          gap: "var(--space-2)",
          flexWrap: "wrap",
        }}
      >
        {steps.map((s) => (
          <li key={s.n} style={{ flex: "1 1 120px", minWidth: "120px" }}>
            <button
              type="button"
              onClick={() => onTab(s.tab)}
              aria-current={activeTab === s.tab ? "true" : undefined}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border:
                  s.state === "current"
                    ? "1px solid var(--color-accent)"
                    : "1px solid var(--color-border)",
                backgroundColor: s.state === "done" ? "rgba(26, 26, 26, 0.04)" : "#ffffff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: s.state === "todo" ? "var(--color-muted)" : "var(--color-accent-ink)" }}>
                {s.state === "done" ? `✓ ${s.n}` : s.n}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", marginTop: "2px" }}>
                {s.title}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "2px", lineHeight: 1.45 }}>
                {s.plain}
              </div>
            </button>
          </li>
        ))}
      </ol>
      <div style={{ fontSize: "12px", color: "var(--color-text)", lineHeight: 1.5 }} role="status">
        {hasNotes
          ? `You hold ${notesCount} secret ticket${notesCount === 1 ? "" : "s"}. Next: swap it in the dark, or cash it out to a fresh address.`
          : "You hold no tickets yet. Start at step 1."}
        {attested === true ? " You are attested — the trader pool below is unlocked." : ""}
      </div>
      {showTraderEntry && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            flexWrap: "wrap",
            borderTop: "1px solid var(--color-border)",
            paddingTop: "var(--space-3)",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--color-muted)", lineHeight: 1.5 }}>
            Here to trade, not hide? Register once, then swap in the gated pool below.
          </span>
          <button
            type="button"
            onClick={onTradeEntry}
            style={{
              padding: "8px 14px",
              minHeight: "36px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "transparent",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Go to trader pool ↓
          </button>
        </div>
      )}
      <details style={{ fontSize: "12px", color: "var(--color-muted)" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>What do these words mean?</summary>
        <div style={{ marginTop: "6px", lineHeight: 1.6 }}>
          Ticket = your secret claim code (a “note”). Vault = where the app keeps
          your tickets on this device. Proof = math that convinces the chain you
          own a ticket without revealing which one (takes minutes). Association
          set = the public guest list your ticket must be on. Attest = a free
          one-time registration that unlocks the trader pool.
        </div>
      </details>
    </div>
  );
};

export default JourneyGuide;
