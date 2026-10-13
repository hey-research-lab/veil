"use client";

import React from "react";
import { formatEther } from "viem";
import { Lock } from "lucide-react";
import { MAINNET_BOW_V3_VEIL_TOKEN, TESTNET_BOW_V3_VEIL_TOKEN, TESTNET_CHAIN_ID } from "../../lib/privacy-pools";

export type BowDepositAsset = "ETH" | "VEIL";

export interface BuyAndShieldPanelProps {
  chainId: number;
  depositAsset: BowDepositAsset;
  onSelectDepositAsset: (asset: BowDepositAsset) => void;
  depositAmount: string;
  onDepositAmount: (v: string) => void;
  ethDenomination: bigint;
  veilMinimum: bigint | null;
  veilBalance: string | null;
  ethBalance: string;
  connectedAddress: string | null;
  isExecuting: boolean;
  amountValid: boolean;
  executeDisabled: boolean;
  onExecute: () => void;
}

/** Buy & Shield tab: 0xbow-only shield surface (native ETH + ERC20 VEIL).
 * Fixed 0.001 denomination is enforced by on-chain privacy pool contracts
 * to guarantee zero-knowledge anonymity and unlinkability. */
export const BuyAndShieldPanel: React.FC<BuyAndShieldPanelProps> = ({
  chainId,
  depositAsset,
  onSelectDepositAsset,
  depositAmount,
  onDepositAmount,
  ethDenomination,
  veilMinimum,
  veilBalance,
  ethBalance,
  connectedAddress,
  isExecuting,
  amountValid,
  executeDisabled,
  onExecute,
}) => {
  const isEth = depositAsset === "ETH";
  const isMainnet = chainId !== TESTNET_CHAIN_ID;
  const veilTokenShown = isMainnet ? MAINNET_BOW_V3_VEIL_TOKEN : TESTNET_BOW_V3_VEIL_TOKEN;
  const denomLabel = isEth
    ? `${formatEther(ethDenomination)} ETH`
    : veilMinimum !== null
    ? `${formatEther(veilMinimum)} VEIL`
    : "0.001 VEIL";
  const balanceLabel = isEth ? `${ethBalance} ETH` : `${veilBalance ?? "…"} VEIL`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Pay / Deposit Surface */}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            You Deposit (Public Wallet)
          </span>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", fontFamily: "monospace" }}>
            Bal: {balanceLabel}
          </span>
        </div>

        {/* Fixed Amount Display & Asset Selector Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "clamp(1.75rem, 2.5vw, 2.35rem)",
                fontFamily: "var(--font-headline)",
                fontWeight: 600,
                color: "var(--color-text)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {isEth ? formatEther(ethDenomination) : "0.001"}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--color-muted)",
                backgroundColor: "rgba(26, 26, 26, 0.06)",
                padding: "3px 7px",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontWeight: 600,
              }}
              title="Fixed denomination enforced by 0xbow privacy pool contracts for anonymity unlinkability"
            >
              <Lock size={10} style={{ opacity: 0.6 }} />
              Fixed
            </span>
          </div>

          {/* Shield-asset toggle: native ETH or VEIL */}
          <div
            role="group"
            aria-label={isMainnet ? "Shield asset: ETH or VEIL" : "Shield asset: test ETH or test VEIL"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              padding: "4px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(26, 26, 26, 0.04)",
              border: "1px solid var(--color-border)",
            }}
          >
            {(["ETH", "VEIL"] as const).map((sym) => {
              const active = depositAsset === sym;
              return (
                <button
                  key={sym}
                  type="button"
                  aria-pressed={active}
                  aria-label={isMainnet ? `Shield ${sym}` : `Shield test ${sym}`}
                  onClick={() => {
                    onSelectDepositAsset(sym);
                    onDepositAmount(sym === "ETH" ? formatEther(ethDenomination) : "0.001");
                  }}
                  style={{
                    padding: "6px 14px",
                    minHeight: "28px",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body-sm)",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    border: active
                      ? "1px solid var(--color-border-strong)"
                      : "1px solid transparent",
                    backgroundColor: active ? "#ffffff" : "transparent",
                    color: active ? "var(--color-text)" : "var(--color-muted)",
                    boxShadow: active ? "0 1px 3px rgba(26, 26, 26, 0.05)" : "none",
                    transition: "all var(--duration-fast)",
                  }}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Why Fixed Helper Strip */}
        <div
          style={{
            fontSize: "11px",
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1.45,
            paddingTop: "6px",
            borderTop: "1px solid var(--color-hairline)",
          }}
        >
          Each deposit mints 1 private note of exactly {denomLabel} to keep all commitments identical and unlinkable onchain.
        </div>
      </div>

      {/* Receive / Shield Output Surface */}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            You Receive (Private Vault)
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "monospace" }}>
            1 Encrypted Note
          </span>
        </div>

        <div
          style={{
            fontSize: "clamp(1.75rem, 2.5vw, 2.35rem)",
            fontFamily: "var(--font-headline)",
            fontWeight: 600,
            color: "var(--color-text)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {denomLabel}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-caption)", color: "var(--color-muted)", fontFamily: "monospace" }}>
          <span>
            {isEth
              ? "Entrypoint.deposit — native ETH to 0xbow ETH note"
              : "Entrypoint.deposit(asset, value, precommitment) — VEIL to 0xbow VEIL note"}
          </span>
          <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>
            Groth16 Proof Payload
          </span>
        </div>
      </div>

      {/* Asset guidance */}
      <div
        role="status"
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "rgba(26, 26, 26, 0.025)",
          border: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          fontSize: "var(--text-caption)",
          fontFamily: "monospace",
          minWidth: 0,
        }}
      >
        <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)", lineHeight: 1.5, overflowWrap: "anywhere", wordBreak: "break-word", minWidth: 0 }}>
          {isEth
            ? isMainnet
              ? "You need real ETH for gas plus the 0.001 shield — Robinhood Mainnet has no faucet."
              : "Fund testnet ETH at the testnet faucet (https://faucet.testnet.chain.robinhood.com/) — gas plus shield input both need it."
            : isMainnet
            ? `Needs VEIL already in your wallet — there is no onchain faucet. VEIL: ${veilTokenShown}. VEIL deposits approve the entrypoint first; the app sends the approval in the same flow when allowance is short.`
            : `Needs test VEIL already in your wallet — there is no onchain faucet. Test VEIL: ${veilTokenShown}. VEIL deposits approve the entrypoint first; the app sends the approval in the same flow when allowance is short.`}
        </span>
      </div>

      {/* Main Action Button */}
      <button
        onClick={onExecute}
        disabled={executeDisabled}
        className="group active:scale-[0.99] transition-all"
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          padding: "16px 24px",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-body)",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          cursor: executeDisabled ? "not-allowed" : "pointer",
          backgroundColor: executeDisabled ? "rgba(26, 26, 26, 0.05)" : "var(--color-brand)",
          color: executeDisabled ? "var(--color-muted)" : "#ffffff",
          border: executeDisabled ? "1px solid var(--color-border)" : "none",
          boxShadow: executeDisabled ? "none" : "0 4px 16px rgba(255, 140, 0, 0.25)",
          transition: "all var(--duration-fast)",
        }}
      >
        <span>
          {isExecuting
            ? "Shielding Deposit…"
            : !connectedAddress
            ? "Connect Wallet to Shield"
            : `Shield ${denomLabel}`}
        </span>
      </button>
    </div>
  );
};

export default BuyAndShieldPanel;
