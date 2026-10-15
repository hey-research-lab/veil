"use client";

import { useEffect, useState, useMemo } from "react";
import type { Address } from "viem";
import { publicClient } from "@/lib/balances";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "@/lib/contracts";
import { appChain, APP_CHAIN_ID } from "@/lib/chains";
import { Copy, Check, ExternalLink, Search, Shield, Cpu, Code2, Layers, CheckCircle2 } from "lucide-react";

const EXPLORER = appChain.blockExplorers.default.url;

type AddressBook = Record<string, string>;

const BOOK = CONTRACT_ADDRESSES as unknown as AddressBook;

export type ContractCategory = "all" | "veil" | "0xbow" | "verifier" | "infra";

interface ContractRow {
  key: string;
  label: string;
  category: "veil" | "0xbow" | "verifier" | "infra";
  categoryLabel: string;
  address: string;
  note?: string;
  description?: string;
}

const ROWS: ContractRow[] = [
  {
    key: "hook",
    label: "Veil Hook v2 (Uniswap v4)",
    category: "veil",
    categoryLabel: "Veil Core",
    address: BOOK.hook || "0xf95f041462ee34c2ea7b953a879838133ef820c4",
    note: "CREATE2 flag 0x20c4 (salt 0x4b7d)",
    description: "Intercepts swaps to enforce open self-attestation gating and collect protocol fee share.",
  },
  {
    key: "bowEntrypoint",
    label: "0xbow Privacy Pool Entrypoint",
    category: "0xbow",
    categoryLabel: "0xbow Suite",
    address: process.env.NEXT_PUBLIC_0XBOW_ENTRYPOINT || "0x96cb8b1836d341a6f5f1f54428bd6696c8b950b1",
    note: "ERC1967 Proxy entrypoint",
    description: "Canonical entrypoint proxy coordinating shielded commitments, root updates, and relay withdrawals.",
  },
  {
    key: "bowPoolEth",
    label: "0xbow Privacy Pool (ETH)",
    category: "0xbow",
    categoryLabel: "0xbow Suite",
    address: process.env.NEXT_PUBLIC_0XBOW_POOL_ETH || "0x10c17b7538e13c63b890fea52708846e88bb1932",
    note: "0.001 ETH fixed denomination",
    description: "Fixed-denomination native ETH pool with 20-depth LeanIMT Merkle tree.",
  },
  {
    key: "bowPoolVeil",
    label: "0xbow Privacy Pool (VEIL)",
    category: "0xbow",
    categoryLabel: "0xbow Suite",
    address: process.env.NEXT_PUBLIC_0XBOW_POOL_VEIL || "0xdb9f182670da2cc6c5ddd432ec98a45e4f2290d1",
    note: "0.001 VEIL fixed denomination",
    description: "Fixed-denomination VEIL token privacy pool with LeanIMT Merkle tree.",
  },
  {
    key: "zkRouter",
    label: "Veil ZkRouter",
    category: "veil",
    categoryLabel: "Veil Core",
    address: process.env.NEXT_PUBLIC_0XBOW_ZK_ROUTER || "0x0fb48c9552154ea028cbd812430e1ea3465a9b4c",
    note: "Shielded ZK Swap Router",
    description: "Multi-pool atomic shielded swap router connecting 0xbow pools with Uniswap v4.",
  },
  {
    key: "router",
    label: "Veil Shield Router",
    category: "veil",
    categoryLabel: "Veil Core",
    address: BOOK.router || "0x3db4ae3429f1507aa0cd31c740a0fd276e22a55c",
    note: "Periphery Router (Fixed R1)",
    description: "1-Tx atomic Swap-to-Shield router with strict zero held-custody invariant.",
  },
  {
    key: "treasury",
    label: "Veil Treasury",
    category: "veil",
    categoryLabel: "Veil Core",
    address: BOOK.treasury || "0xb68c3d25e5e9902363e8e10d5c0a471e65be8152",
    note: "Protocol Fee Engine",
    description: "Accumulates swap fee revenue from VeilHook and autonomously executes token buybacks & burns.",
  },
  {
    key: "registry",
    label: "Attestation Registry v2",
    category: "veil",
    categoryLabel: "Veil Core",
    address: BOOK.registry || "0xd1f17c70067f1cc2b478606b3f0faa18ee8add1d",
    note: "Open self-attestation",
    description: "Open permissionless caller registry verifying trade compliance before hook execution.",
  },
  {
    key: "withdrawalVerifier",
    label: "Groth16 Withdrawal Verifier",
    category: "verifier",
    categoryLabel: "ZK Cryptography",
    address: "0xdbbe1acf08a99789b5ca0ee688679dab80ba12d2",
    note: "Audited Circom/Groth16 verifier",
    description: "On-chain SNARK verifier proving validity of Merkle tree membership and nullifier uniqueness.",
  },
  {
    key: "commitmentVerifier",
    label: "Groth16 Commitment Verifier",
    category: "verifier",
    categoryLabel: "ZK Cryptography",
    address: "0xfdb7161a993fa914bbb734b3d52c4342501836eb",
    note: "Audited Circom/Groth16 verifier",
    description: "On-chain SNARK verifier validating association set proof (ASP) inclusion.",
  },
  {
    key: "deployer",
    label: "Create2 Deployer",
    category: "infra",
    categoryLabel: "Infrastructure",
    address: BOOK.deployer || "0xea48e6a7ae296ebbd7d58792091b8087032d3aa4",
    note: "Deterministic Factory",
    description: "Canonical CREATE2 deployer factory used to generate deterministic bytecode across chains.",
  },
  {
    key: "token",
    label: "Veil Token (temporary)",
    category: "veil",
    categoryLabel: "Veil Core",
    address: BOOK.token || "0xe0e11ec0d62eda12de796d025d6334fadfe5ab2a",
    note: "ERC20 Utility Token",
    description: "Temporary utility token; canonical token launches on Pons.",
  },
];

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  beforeInitialize: "Hook logic before pool initialization",
  afterInitialize: "Hook logic after pool initialization",
  beforeAddLiquidity: "Liquidity provision guard check",
  afterAddLiquidity: "Liquidity provision accounting update",
  beforeRemoveLiquidity: "Liquidity removal guard check",
  afterRemoveLiquidity: "Liquidity removal accounting update",
  beforeSwap: "Enforces open self-attestation gating registry",
  afterSwap: "Accrues 30 BPS protocol fee to VeilTreasury",
  beforeDonate: "Custom donate logic prior to donation",
  afterDonate: "Custom donate logic post donation",
  beforeSwapReturnDelta: "Custom swap return delta override",
  afterSwapReturnDelta: "Custom fee return delta override",
  afterAddLiquidityReturnDelta: "Custom liquidity delta override",
  afterRemoveLiquidityReturnDelta: "Custom liquidity delta override",
};

export default function ContractsPage() {
  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(true);
  const [rpcError, setRpcError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ContractCategory>("all");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const hookRow = ROWS.find((r) => r.key === "hook");
        const perms = await publicClient.readContract({
          address: (hookRow ? hookRow.address : BOOK.hook) as Address,
          abi: CONTRACT_ABIS.VeilHook,
          functionName: "getHookPermissions",
        });
        if (mounted) {
          setPermissions({ ...(perms as unknown as Record<string, boolean>) });
          setLoading(false);
          setRpcError(false);
        }
      } catch (e) {
        console.warn("Contracts page read failed:", e);
        if (mounted) {
          setLoading(false);
          setRpcError(true);
        }
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const filteredRows = useMemo(() => {
    return ROWS.filter((row) => {
      const matchesCat = activeCategory === "all" || row.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        row.label.toLowerCase().includes(query) ||
        row.address.toLowerCase().includes(query) ||
        (row.note && row.note.toLowerCase().includes(query)) ||
        (row.description && row.description.toLowerCase().includes(query));
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", width: "100%" }}>
      {/* Editorial Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          paddingBottom: "var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginBottom: "var(--space-2)",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(26, 26, 26, 0.05)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontWeight: 600,
              }}
            >
              ROBINHOOD MAINNET {APP_CHAIN_ID}
            </span>
            <span>// Smart Contracts Registry</span>
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(2rem, 3.2vw, 2.6rem)",
              lineHeight: 1.15,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              fontWeight: 600,
            }}
          >
            Verified Contracts Registry
          </h1>
          <p
            style={{
              margin: "var(--space-2) 0 0 0",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body-sm)",
              color: "var(--color-muted)",
              maxWidth: "680px",
              lineHeight: "1.6",
            }}
          >
            Live smart contract deployments on Robinhood {appChain.name} ({APP_CHAIN_ID}).
            All bytecode, ABIs, and interfaces are source-verified (Sourcify 10/10) and bound to immutable governance rules.
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-muted)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Code2 size={13} style={{ color: "var(--color-accent)" }} />
            Solidity 0.8.37
          </span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={13} />
            Cancun EVM
          </span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} style={{ color: "var(--color-accent)" }} />
            Sourcify Verified
          </span>
        </div>
      </div>

      {/* Main 2-Column Workstation Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(520px, 100%), 1fr))",
          gap: "var(--space-6)",
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Column 1: Core Contracts List & Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Controls: Search & Category Filter Pills */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-border)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <Search size={15} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contracts by name, address, or role..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--color-text)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "2px",
                    cursor: "pointer",
                    color: "var(--color-muted)",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: `All (${ROWS.length})` },
                { id: "veil", label: "Veil Suite (5)" },
                { id: "0xbow", label: "0xbow Pools (3)" },
                { id: "verifier", label: "ZK Verifiers (2)" },
                { id: "infra", label: "Infrastructure (2)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as ContractCategory)}
                  className={activeCategory === cat.id ? "lp-btn lp-btn--filled" : "lp-btn lp-btn--outline"}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts Cards List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {filteredRows.length === 0 ? (
              <div
                className="veil-card-white"
                style={{
                  padding: "var(--space-8)",
                  textAlign: "center",
                  color: "var(--color-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
              >
                No contracts matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredRows.map((row) => (
                <div
                  key={row.key}
                  className="veil-card-white"
                  style={{
                    padding: "var(--space-5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-3)",
                    transition: "all var(--duration-fast)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "var(--color-text)",
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "rgba(26, 26, 26, 0.05)",
                            color: "var(--color-muted)",
                            textTransform: "uppercase",
                          }}
                        >
                          {row.categoryLabel}
                        </span>
                      </div>
                      {row.description && (
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)", lineHeight: 1.4 }}>
                          {row.description}
                        </p>
                      )}
                    </div>

                    {row.note && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "var(--color-accent)",
                          backgroundColor: "rgba(255, 140, 0, 0.08)",
                          border: "1px solid rgba(255, 140, 0, 0.2)",
                          borderRadius: "var(--radius-sm)",
                          padding: "2px 8px",
                          fontWeight: 500,
                          flexShrink: 0,
                        }}
                      >
                        {row.note}
                      </span>
                    )}
                  </div>

                  {/* Address & Actions Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--space-2)",
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "rgba(26, 26, 26, 0.025)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--color-text)",
                        overflowWrap: "anywhere",
                        wordBreak: "break-all",
                        fontWeight: 500,
                      }}
                    >
                      {row.address}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(row.address)}
                        title="Copy contract address"
                        className="lp-btn lp-btn--outline"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                          color: copiedAddress === row.address ? "var(--color-accent)" : "var(--color-text)",
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        {copiedAddress === row.address ? <Check size={12} /> : <Copy size={12} />}
                        {copiedAddress === row.address ? "Copied" : "Copy"}
                      </button>

                      <a
                        href={`${EXPLORER}/address/${row.address}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View contract on Blockscout"
                        className="lp-btn lp-btn--outline"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--color-text)",
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        <span>Explorer</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Hook Permissions & Architecture Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Hook Permissions Card */}
          <div
            className="veil-card-white"
            style={{
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={16} style={{ color: "var(--color-accent)" }} />
                <h2 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "var(--text-h3)", color: "var(--color-text)" }}>
                  Uniswap v4 Hook Permissions
                </h2>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                Verified bitmap permissions queried directly from <code>VeilHook.getHookPermissions()</code> (Flags: <code>0x20c4</code>).
              </p>
            </div>

            {loading && (
              <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                Reading live hook permissions from Robinhood Chain…
              </div>
            )}
            {rpcError && (
              <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(180, 83, 9, 0.08)", color: "#b45309", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                RPC unreachable, retrying…
              </div>
            )}

            {permissions && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(permissions).map(([flag, on]) => (
                  <div
                    key={flag}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: on ? "rgba(255, 140, 0, 0.05)" : "rgba(26, 26, 26, 0.015)",
                      border: on ? "1px solid rgba(255, 140, 0, 0.25)" : "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text)", fontWeight: on ? 600 : 500 }}>
                        {flag}
                      </div>
                      {PERMISSION_DESCRIPTIONS[flag] && (
                        <div style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginTop: "2px" }}>
                          {PERMISSION_DESCRIPTIONS[flag]}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        backgroundColor: on ? "rgba(255, 140, 0, 0.15)" : "rgba(26, 26, 26, 0.06)",
                        color: on ? "var(--color-accent-ink)" : "var(--color-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {on ? "ENABLED" : "OFF"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Mandate Card */}
          <div
            className="veil-card-white"
            style={{
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <h3 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "var(--text-h4)", color: "var(--color-text)" }}>
              Blockscout Verification Mandate (§6.8)
            </h3>
            <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "var(--text-body-sm)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
              Per binding owner decision #15, no pool or router opens for active user deposits before its source code
              and ABI are verified on Blockscout. In the event of explorer verification delays, vendored source
              and byte-identical compilation proofs are permanently published in the repository.
            </p>
            <div
              style={{
                marginTop: "var(--space-2)",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(26, 26, 26, 0.025)",
                border: "1px solid var(--color-border)",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--color-muted)",
              }}
            >
              Note: Explorer verifier forms currently lag solc 0.8.37 support; Sourcify 10/10 proofs serve as immediate cryptographic verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
