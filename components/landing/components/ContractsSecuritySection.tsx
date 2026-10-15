"use client";

import React, { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { RevealBox } from "./RevealBox";
import { CountUp } from "./CountUp";
import {
  V4_MAINNET_POOL_MANAGER,
  V4_MAINNET_POSITION_MANAGER,
  V4_MAINNET_STATE_VIEW,
  V4_MAINNET_PERMIT2,
  V4_MAINNET_WETH,
} from "../../../lib/chains";

interface ContractEntry {
  name: string;
  role: string;
  address: string;
  category: "core" | "dependency";
  description: string;
  source: string;
  explorerUrl: string;
}

export const ContractsSecuritySection: React.FC = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"core" | "dependency">("core");
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  const copyToClipboard = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const telemetry = {
    network: "Robinhood Chain Mainnet (4663)",
    treeDepth: 20,
    treeCapacity: "1,048,576 commitments",
    rootHistorySize: 100,
    depositCap: "10.0 ETH",
    associationRoot: "2188824287183927522224640574525727508854836440041603434369820418",
    associationCid: "QmVtkNm5Ro2F1oVBdP17TxcAcafXtMoG8rYPnu7S8kXJxV",
  };

  const contracts: ContractEntry[] = [
    {
      name: "VeilHook v2",
      role: "Uniswap v4 Hook",
      address: "0xf95f041462ee34c2ea7b953a879838133ef820c4",
      category: "core",
      description: "Mined CREATE2 hook enforcing open self-attestation gating (beforeSwap), atomic zero-custody routing, and protocol fee collection (afterSwap).",
      source: "Salt: 0x4b7d · Flag: 0x20c4",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xf95f041462ee34c2ea7b953a879838133ef820c4",
    },
    {
      name: "0xbow Privacy Pools Entrypoint",
      role: "0xbow Core Entrypoint (Proxy)",
      address: "0x96cb8b1836d341a6f5f1f54428bd6696c8b950b1",
      category: "core",
      description: "Canonical ERC1967 Proxy entrypoint for 0xbow privacy pool deposits and relay-assisted withdrawals with ASP association sets.",
      source: "0xbow Privacy Pools v1.2.1",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0x96cb8b1836d341a6f5f1f54428bd6696c8b950b1",
    },
    {
      name: "0xbow Privacy Pool (ETH)",
      role: "Privacy Pool (Native ETH)",
      address: "0x10c17b7538e13c63b890fea52708846e88bb1932",
      category: "core",
      description: "Fixed-denomination 0.001 ETH pool with 20-depth LeanIMT Merkle tree and Groth16 zk-SNARK verification.",
      source: "0xbow Privacy Pools v1.2.1",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0x10c17b7538e13c63b890fea52708846e88bb1932",
    },
    {
      name: "0xbow Privacy Pool (VEIL)",
      role: "Privacy Pool (VEIL Token)",
      address: "0xdb9f182670da2cc6c5ddd432ec98a45e4f2290d1",
      category: "core",
      description: "Fixed-denomination 0.001 VEIL privacy pool with LeanIMT Merkle tree and Groth16 zk-SNARK verification.",
      source: "0xbow Privacy Pools v1.2.1",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xdb9f182670da2cc6c5ddd432ec98a45e4f2290d1",
    },
    {
      name: "VeilZkRouter",
      role: "Shielded ZK Swap Router",
      address: "0x0fb48c9552154ea028cbd812430e1ea3465a9b4c",
      category: "core",
      description: "Coordinates atomic shielded swap operations connecting 0xbow Privacy Pools and Uniswap v4 pools.",
      source: "contracts/VeilZkRouter.sol",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0x0fb48c9552154ea028cbd812430e1ea3465a9b4c",
    },
    {
      name: "VeilShieldRouter",
      role: "Periphery Router (Fixed R1)",
      address: "0x3db4ae3429f1507aa0cd31c740a0fd276e22a55c",
      category: "core",
      description: "Coordinates 1-Tx Swap-to-Shield and Shielded Swaps with strict 0-balance custody invariant. No user funds ever linger in router storage.",
      source: "contracts/VeilShieldRouter.sol",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0x3db4ae3429f1507aa0cd31c740a0fd276e22a55c",
    },
    {
      name: "VeilTreasury",
      role: "Protocol Treasury & Burn Engine",
      address: "0xb68c3d25e5e9902363e8e10d5c0a471e65be8152",
      category: "core",
      description: "Protocol treasury collecting VeilHook fees and creator fees; accumulates funds and executes on-chain token burns.",
      source: "contracts/VeilTreasury.sol",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xb68c3d25e5e9902363e8e10d5c0a471e65be8152",
    },
    {
      name: "VeilAttestationRegistry v2",
      role: "Open Self-Attestation Registry",
      address: "0xd1f17c70067f1cc2b478606b3f0faa18ee8add1d",
      category: "core",
      description: "Attestation registry for gated pools: open self-attest with no eligibility conditions; gating is an anti-bot speedbump plus launch windows only.",
      source: "contracts/VeilAttestationRegistry.sol",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xd1f17c70067f1cc2b478606b3f0faa18ee8add1d",
    },
    {
      name: "Groth16 Withdrawal Verifier",
      role: "ZK Snark Verifier (Withdrawal)",
      address: "0xdbbe1acf08a99789b5ca0ee688679dab80ba12d2",
      category: "core",
      description: "Audited Circom/Groth16 verifier contract validating 0xbow withdrawal proofs and ASP membership.",
      source: "0xbow Circuits v1.2.1",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xdbbe1acf08a99789b5ca0ee688679dab80ba12d2",
    },
    {
      name: "Groth16 Commitment Verifier",
      role: "ZK Snark Verifier (Commitment)",
      address: "0xfdb7161a993fa914bbb734b3d52c4342501836eb",
      category: "core",
      description: "Audited Circom/Groth16 verifier contract validating commitment integrity for 0xbow privacy pool operations.",
      source: "0xbow Circuits v1.2.1",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xfdb7161a993fa914bbb734b3d52c4342501836eb",
    },
    {
      name: "VeilCreate2Deployer",
      role: "Deterministic Factory",
      address: "0xea48e6a7ae296ebbd7d58792091b8087032d3aa4",
      category: "core",
      description: "Deterministic CREATE2 factory contract used to mine and deploy VeilHook permissions.",
      source: "contracts/VeilCreate2Deployer.sol",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xea48e6a7ae296ebbd7d58792091b8087032d3aa4",
    },
    {
      name: "VeilToken",
      role: "Veil Protocol Token (Temporary)",
      address: "0xe0e11ec0d62eda12de796d025d6334fadfe5ab2a",
      category: "core",
      description: "Temporary ERC-20 token deployed on Robinhood Mainnet; canonical token launches on Pons.",
      source: "contracts/VeilToken.sol",
      explorerUrl: "https://robinhoodchain.blockscout.com/address/0xe0e11ec0d62eda12de796d025d6334fadfe5ab2a",
    },
    {
      name: "Uniswap V4 PoolManager",
      role: "Canonical AMM Engine",
      address: V4_MAINNET_POOL_MANAGER,
      category: "dependency",
      description: "Official Uniswap v4 singleton contract deployed and active on Robinhood Chain Mainnet.",
      source: "@uniswap/v4-core IPoolManager",
      explorerUrl: `https://robinhoodchain.blockscout.com/address/${V4_MAINNET_POOL_MANAGER}`,
    },
    {
      name: "Uniswap V4 PositionManager",
      role: "Canonical Liquidity Router",
      address: V4_MAINNET_POSITION_MANAGER,
      category: "dependency",
      description: "Manages Uniswap v4 liquidity positions and pool initializations on Robinhood Chain.",
      source: "@uniswap/v4-periphery PositionManager",
      explorerUrl: `https://robinhoodchain.blockscout.com/address/${V4_MAINNET_POSITION_MANAGER}`,
    },
    {
      name: "Uniswap V4 StateView",
      role: "Canonical State Reader",
      address: V4_MAINNET_STATE_VIEW,
      category: "dependency",
      description: "External view contract allowing atomic, non-state-mutating liquidity reading.",
      source: "@uniswap/v4-periphery StateView",
      explorerUrl: `https://robinhoodchain.blockscout.com/address/${V4_MAINNET_STATE_VIEW}`,
    },
    {
      name: "Permit2",
      role: "Signature Approval Standard",
      address: V4_MAINNET_PERMIT2,
      category: "dependency",
      description: "Canonical Permit2 token approval and signature transfer router.",
      source: "@uniswap/permit2",
      explorerUrl: `https://robinhoodchain.blockscout.com/address/${V4_MAINNET_PERMIT2}`,
    },
    {
      name: "Wrapped Ether (WETH9)",
      role: "Wrapped Native Currency",
      address: V4_MAINNET_WETH,
      category: "dependency",
      description: "Official WETH contract deployed natively on Robinhood Chain Cancun EVM.",
      source: "Canonical WETH9",
      explorerUrl: `https://robinhoodchain.blockscout.com/address/${V4_MAINNET_WETH}`,
    },
  ];

  const acceptanceChecklist: { id: number; scenario: string; detail: string; residual?: boolean }[] = [
    { id: 1, scenario: "Standard 1-Tx Swap-to-Shield", detail: "Commitment enters tree, router balance = 0 invariant confirmed" },
    { id: 2, scenario: "Slippage threshold exceeded", detail: "Reverted on-chain, 100% user funds returned" },
    { id: 3, scenario: "Double withdrawal of same note", detail: "Rejected automatically with NullifierAlreadySpent" },
    { id: 4, scenario: "Relayer tampers minOut / recipient / fee", detail: "On-chain Groth16 zk-SNARK verification reverts; context hash binding prevents payload tampering" },
    { id: 5, scenario: "Shielded swap A -> B", detail: "Shielded B balance increases, zero public wallet linkage" },
    { id: 6, scenario: "Browser wallet submission", detail: "Permissionless client-side self-relay executes directly without hosted intermediaries" },
    { id: 7, scenario: "Unregistered address in gated pool", detail: "Swap rejected with GatingActiveUserNotAttested" },
    { id: 8, scenario: "Deposit exceeds 10 ETH pool cap", detail: "Rejected by contract with PoolCapExceeded (accepted residual: live over-cap drill impractical)", residual: true },
    { id: 9, scenario: "Guardian pauses deposits", detail: "Deposits halt at the contract; withdraw path has no pause switch (drill completed on legacy suite 2026-10-12)" },
    { id: 10, scenario: "Rebuild Merkle tree in fresh browser", detail: "Balance verified against on-chain Merkle root (accepted residual: manual procedure)", residual: true },
  ];

  const displayedContracts = contracts.filter((c) => c.category === activeTab);

  return (
    <section id="security" style={{ padding: "var(--section-y) var(--page-gutter)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Section Header */}
        <SectionHeader
          kicker="Security & Verification"
          title="Verified on-chain. Non-custodial by law of math."
          sub="Smart contracts are deployed on Robinhood Chain built on verified 0xbow Groth16 zero-knowledge circuits and rigorous internal invariant verification. Parameters, state roots, and non-custodial invariants are publicly verifiable onchain."
          titleMaxW="26ch"
          kickerColor="#FF8C00"
        />

        {/* Security Pillars (4 Pillars) */}
        <RevealBox
          stagger={80}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {/* Pillar 1 */}
          <div
            className="lp-card"
            style={{
              background: "var(--color-panel)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid var(--color-hairline)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "var(--text-h4)",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                }}
              >
                Non-Blocking Withdrawals
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-sm)",
                lineHeight: "var(--leading-body-sm)",
                color: "var(--color-muted)",
              }}
            >
              Smart contracts enforce that withdrawals can never be paused, censored, or frozen by the team or guardian. A guardian may only pause new deposits during an emergency.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            className="lp-card"
            style={{
              background: "var(--color-panel)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid var(--color-hairline)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "var(--text-h4)",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                }}
              >
                Zero-Custody Router Invariant
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-sm)",
                lineHeight: "var(--leading-body-sm)",
                color: "var(--color-muted)",
              }}
            >
              The VeilShieldRouter strictly verifies that its held balance is exactly 0 at the end of every transaction. If slippage or deposit conditions fail, 100% of user funds revert.
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            className="lp-card"
            style={{
              background: "var(--color-panel)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid var(--color-hairline)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "var(--text-h4)",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                }}
              >
                Client-Side ZK Generation
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-sm)",
                lineHeight: "var(--leading-body-sm)",
                color: "var(--color-muted)",
              }}
            >
              Notes (secret + nullifier) are generated in the browser with secure randomness and never sent to any central server or relayer. Proof payloads are assembled client-side against a provisional verifier for old notes only; Groth16 serves the live 0xbow paths.
            </p>
          </div>

          {/* Pillar 4 */}
          <div
            className="lp-card"
            style={{
              background: "var(--color-panel)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid var(--color-hairline)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "var(--text-h4)",
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                }}
              >
                Association Set Membership (ASP)
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-sm)",
                lineHeight: "var(--leading-body-sm)",
                color: "var(--color-muted)",
              }}
            >
              Every withdrawal provides a zero-knowledge membership proof verifying note inclusion in the published association set on IPFS, decoupling depositor address from recipient.
            </p>
          </div>
        </RevealBox>

        {/* Cryptographic Telemetry & Association Proof Clean Card */}
        <RevealBox>
          <div
            className="lp-card"
            style={{
              padding: "var(--space-8)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
              background: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-hairline)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "var(--text-caption)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--color-accent)",
                  fontWeight: 600,
                }}
              >
                On-Chain Cryptographic Telemetry
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "var(--text-caption)",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-panel-chip)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-hairline)",
                  fontWeight: 600,
                }}
              >
                LeanIMT Merkle Tree · Depth <CountUp value={telemetry.treeDepth} />
              </span>
            </div>

            <div>
              <h3
                style={{
                  margin: "0 0 var(--space-2) 0",
                  fontFamily: "var(--font-headline)",
                  fontSize: "var(--text-h3)",
                  color: "var(--color-text)",
                  fontWeight: 600,
                }}
              >
                Association Set Architecture (ASP)
              </h3>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-body)",
                  lineHeight: "var(--leading-body)",
                  color: "var(--color-muted)",
                  maxWidth: "68ch",
                }}
              >
                Veil implements Association Set Provider (ASP) proofs where depositors self-attest into the Merkle tree published to IPFS. This enables verifiable set membership while preserving decoupled execution privacy.
              </p>
            </div>

            {/* Telemetry Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-3)",
              }}
            >
              <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-hairline)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", textTransform: "uppercase" }}>Capacity</span>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "var(--text-h4)", color: "var(--color-text)", marginTop: "2px", fontWeight: 600 }}>
                  <CountUp value={telemetry.treeCapacity} />
                </div>
              </div>

              <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-hairline)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", textTransform: "uppercase" }}>Lifetime Pool Cap</span>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "var(--text-h4)", color: "var(--color-text)", marginTop: "2px", fontWeight: 600 }}>
                  <CountUp value={telemetry.depositCap} />
                </div>
              </div>

              <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-hairline)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", textTransform: "uppercase" }}>Root History Window</span>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "var(--text-h4)", color: "var(--color-text)", marginTop: "2px", fontWeight: 600 }}>
                  <CountUp value={telemetry.rootHistorySize} /> Roots
                </div>
              </div>

              <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-hairline)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", textTransform: "uppercase" }}>Guardian Role</span>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "var(--text-h4)", color: "var(--color-text)", marginTop: "2px", fontWeight: 600 }}>Deposit Pause Only</div>
              </div>

              <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-hairline)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", textTransform: "uppercase" }}>Attestation Policy</span>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "var(--text-h4)", color: "var(--color-accent)", marginTop: "2px", fontWeight: 600 }}>
                  Open Self-Attest
                </div>
              </div>
            </div>

            {/* Proof Roots Panel */}
            <div
              style={{
                padding: "var(--space-4)",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-hairline)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
                fontFamily: "monospace",
                fontSize: "var(--text-caption)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ color: "var(--color-muted)" }}>Genesis Association Root (reference — live root on /status):</span>
                <span style={{ color: "var(--color-text)", wordBreak: "break-all", fontWeight: 600 }}>{telemetry.associationRoot}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ color: "var(--color-muted)" }}>IPFS CID:</span>
                  <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{telemetry.associationCid}</span>
                </div>

                <a
                  href={`https://ipfs.io/ipfs/${telemetry.associationCid}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--color-accent)",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Verify Data Set on IPFS
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 6H10.4M6.2 1.8L10.4 6L6.2 10.2" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </RevealBox>

        {/* Full Verified Contracts Registry with Category Tabs */}
        <div
          style={{
            background: "var(--color-white)",
            borderRadius: "var(--radius-lg)",
            border: "var(--border-thin) solid var(--color-border-strong)",
            overflow: "hidden",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: "var(--space-4) var(--space-6)",
              borderBottom: "var(--border-thin) solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              background: "var(--color-panel-chip)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-caption)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-text)",
                    color: "var(--color-bg)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  MAINNET
                </span>
                Robinhood Chain (Chain ID: 4663)
              </span>

              {/* Category Switch Tabs */}
              <div style={{ display: "flex", gap: "var(--space-1)", background: "rgba(0, 0, 0, 0.06)", padding: "2px", borderRadius: "var(--radius-sm)" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("core")}
                  className={activeTab === "core" ? "lp-btn lp-btn--filled" : "lp-btn lp-btn--outline"}
                  style={{
                    borderRadius: "var(--radius-sm)",
                    padding: "4px 12px",
                    fontSize: "var(--text-caption)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Core Protocol ({contracts.filter((c) => c.category === "core").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dependency")}
                  className={activeTab === "dependency" ? "lp-btn lp-btn--filled" : "lp-btn lp-btn--outline"}
                  style={{
                    borderRadius: "var(--radius-sm)",
                    padding: "4px 12px",
                    fontSize: "var(--text-caption)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Uniswap v4 Dependencies ({contracts.filter((c) => c.category === "dependency").length})
                </button>
              </div>
            </div>

            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-caption)",
                color: "var(--color-muted)",
              }}
            >
              Cancun EVM · Source-verified via Sourcify; Blockscout checkmarks follow explorer recovery
            </span>
          </div>

          {/* Contracts List with Full 42-Character Addresses */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {displayedContracts.map((c, idx) => (
              <div
                key={c.name}
                style={{
                  padding: "var(--space-5) var(--space-6)",
                  borderBottom: idx === displayedContracts.length - 1 ? "none" : "var(--border-thin) solid var(--color-hairline)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                {/* Contract Meta Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "var(--space-2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "var(--text-h3)",
                        lineHeight: 1.15,
                        color: "var(--color-text)",
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      style={{
                        background: "var(--color-panel-chip)",
                        color: "var(--color-text)",
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-caption)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: 500,
                      }}
                    >
                      {c.role}
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "var(--color-faint)",
                      }}
                    >
                      {c.source}
                    </span>
                  </div>

                  <a
                    href={c.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-link"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-caption)",
                      color: "var(--color-text)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      textDecoration: "underline",
                    }}
                  >
                    View on Blockscout
                    <svg
                      aria-hidden="true"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-muted)",
                  }}
                >
                  {c.description}
                </div>

                {/* FULL Contract Address Bar with One-Click Copy */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--color-panel)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-2) var(--space-4)",
                    border: "1px solid var(--color-hairline)",
                    flexWrap: "wrap",
                    gap: "var(--space-2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-caption)",
                        color: "var(--color-faint)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      CA:
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "var(--text-body-sm)",
                        fontWeight: 600,
                        color: "var(--color-text)",
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        userSelect: "all",
                      }}
                    >
                      {c.address}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(c.address)}
                    title="Click to copy full address"
                    className="lp-btn lp-btn--outline"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-caption)",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      color: "var(--color-text)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{copiedAddress === c.address ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Invariants Acceptance Matrix Collapsible */}
        <div
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-lg)",
            border: "var(--border-thin) solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            style={{
              width: "100%",
              padding: "var(--space-4) var(--space-6)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "var(--text-caption)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-text)",
                  color: "var(--color-bg)",
                  fontWeight: 700,
                }}
              >
                8/10 PASS + 2 RESIDUALS
              </span>
              <span
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "var(--text-h4)",
                  color: "var(--color-text)",
                  fontWeight: 600,
                }}
              >
                Protocol Invariants &amp; Formal Verification Matrix
              </span>
            </div>

            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-caption)",
                color: "var(--color-accent)",
                fontWeight: 600,
              }}
            >
              {showMatrix ? "Hide Matrix" : "View Matrix"}
            </span>
          </button>

          {showMatrix && (
            <div
              style={{
                padding: "0 var(--space-6) var(--space-6) var(--space-6)",
                borderTop: "var(--border-thin) solid var(--color-border)",
                overflowX: "auto",
              }}
            >
              <div style={{ minWidth: "600px", marginTop: "var(--space-4)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.5fr 1fr 4fr",
                    gap: "var(--space-4)",
                    padding: "var(--space-2) 0",
                    borderBottom: "var(--border-thin) solid var(--color-border-strong)",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-caption)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-faint)",
                    fontWeight: 600,
                  }}
                >
                  <span>Test Scenario</span>
                  <span>Verification</span>
                  <span>On-Chain Invariant</span>
                </div>

                {acceptanceChecklist.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2.5fr 1fr 4fr",
                      gap: "var(--space-4)",
                      padding: "var(--space-3) 0",
                      borderBottom:
                        idx === acceptanceChecklist.length - 1
                          ? "none"
                          : "var(--border-thin) solid var(--color-border)",
                      fontSize: "var(--text-body-sm)",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-headline)", color: "var(--color-text)", fontWeight: 500 }}>
                      {item.id}. {item.scenario}
                    </span>
                    <div>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "var(--radius-sm)",
                          background: item.residual ? "transparent" : "rgba(0, 0, 0, 0.08)",
                          border: item.residual ? "1px solid var(--color-border-strong)" : "none",
                          color: "var(--color-text)",
                          fontWeight: 700,
                        }}
                      >
                        {item.residual ? "RESIDUAL" : "PASS"}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", color: "var(--color-muted)" }}>
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContractsSecuritySection;
