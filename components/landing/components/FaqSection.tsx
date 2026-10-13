"use client";

import React, { useState } from "react";
import { SectionHeader } from "./SectionHeader";

interface FaqItem {
  q: string;
  a: string;
}

const faqItems: FaqItem[] = [
  {
    q: "How does Veil guarantee privacy on a public blockchain?",
    a: "Veil shields assets in fixed-denomination Merkle pools. When you deposit, only a commitment enters the onchain tree while the secret stays in your browser; withdrawals submit client-side Groth16 ZK-SNARK proofs verifying ownership without revealing depositor address or note history.",
  },
  {
    q: "How does Veil protect swaps from MEV and front-running?",
    a: "With Swap-to-Shield, swaps settle atomically through the Uniswap v4 hook directly into shielded notes with strict client-side minOut slippage bounds, protecting traders from typical mempool front-running.",
  },
  {
    q: "What chains are supported?",
    a: "Veil is live on Robinhood Chain Mainnet (Chain ID: 4663) leveraging Uniswap v4's custom hook architecture and 0xbow Privacy Pool circuits for high-throughput, low-fee execution.",
  },
  {
    q: "Can anyone freeze my funds or block withdrawals?",
    a: "The withdraw path has no pause or guardian switch, and nullifiers cannot be reused. Withdrawals verify ZK-SNARK proofs onchain against the privacy pool Merkle trees, ensuring non-custodial and trustless exits.",
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" style={{ padding: "var(--section-y) var(--page-gutter)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-4)",
          alignItems: "start",
        }}
      >
        <div>
          <SectionHeader
            kicker="FAQ"
            title="Frequently asked questions."
            titleMaxW="14ch"
            kickerColor="#FF8C00"
          />
        </div>

        <div style={{ minWidth: 0, gridColumn: "span 2" }}>
          <div>
            {faqItems.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    borderBottom: "var(--border-thin) solid var(--color-hairline)",
                    padding: "var(--space-4) 0",
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className="lp-acc-summary"
                    onClick={() => toggleItem(i)}
                    style={{
                      width: "100%",
                      appearance: "none",
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "var(--space-4)",
                      fontFamily: "var(--font-headline)",
                      fontSize: "var(--text-h4)",
                      lineHeight: 1.2,
                    }}
                  >
                    <span style={{ flex: 1 }}>{item.q}</span>
                    <span
                      className="lp-acc-mark"
                      data-open={isOpen ? "true" : "false"}
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "#FF8C00",
                        display: "inline-block",
                        flexShrink: 0,
                        fontSize: "1.25rem",
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div className="lp-acc-panel" data-open={isOpen ? "true" : "false"}>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-body)",
                          lineHeight: "var(--leading-body)",
                          color: "var(--color-muted)",
                          marginTop: "var(--space-3)",
                          maxWidth: "48ch",
                        }}
                      >
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
