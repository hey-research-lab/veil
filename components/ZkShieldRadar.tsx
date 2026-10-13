"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { parseAbi, formatEther, toHex, type Address } from "viem";
import { publicClient } from "@/lib/balances";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "@/lib/contracts";
import { APP_CHAIN_ID } from "@/lib/chains";

// Live Robinhood Mainnet 4663 deployments via the shared address source.
// Literals below are fallbacks only and match lib/contracts.ts defaults.
const POOL_ADDRESS = (CONTRACT_ADDRESSES.poolEth ||
  "0x10c17b7538e13c63b890fea52708846e88bb1932") as Address;
const TREASURY_ADDRESS = (CONTRACT_ADDRESSES.treasury ||
  "0xb68c3d25e5e9902363e8e10d5c0a471e65be8152") as Address;
const HOOK_ADDRESS = (CONTRACT_ADDRESSES.hook ||
  "0xf95f041462ee34c2ea7b953a879838133ef820c4") as Address;

const EMPTY_ROOT = ("0x" + "00".repeat(32)) as `0x${string}`;

const BOW_POOL_ABI = parseAbi([
  "function currentTreeSize() view returns (uint256)",
  "function currentTreeDepth() view returns (uint256)",
  "function currentRoot() view returns (uint256)",
  "function DEPOSIT_DENOMINATION() view returns (uint256)",
]);

const POOL_ABI = parseAbi([
  "function nextIndex() view returns (uint32)",
  "function totalDeposits() view returns (uint256)",
  "function denomination() view returns (uint256)",
  "function poolCap() view returns (uint256)",
  "function rootHistory(uint256 index) view returns (bytes32)",
  "function guardian() view returns (address)",
  "function depositsPaused() view returns (bool)",
  "function TREE_DEPTH() view returns (uint8)",
]);

const TREASURY_ABI = parseAbi([
  "function buybackShareBps() view returns (uint256)",
]);

function formatNumber(val: number): string {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type HookPermissions = Record<string, boolean>;

export const ZkShieldRadar: React.FC = () => {
  const [nextIndex, setNextIndex] = useState<number>(0);
  const [totalDepositsEth, setTotalDepositsEth] = useState<string>("0");
  const [treeDepth, setTreeDepth] = useState<number | null>(null);
  const [merkleRoot, setMerkleRoot] = useState<`0x${string}`>(EMPTY_ROOT);
  const [buybackBps, setBuybackBps] = useState<bigint | null>(null);
  const [hookPermissions, setHookPermissions] = useState<HookPermissions | null>(null);
  const [copiedRoot, setCopiedRoot] = useState(false);
  const [isLiveLoaded, setIsLiveLoaded] = useState(false);
  const [rpcError, setRpcError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTelemetry() {
      try {
        const [bps, perms] = await Promise.all([
          publicClient.readContract({
            address: TREASURY_ADDRESS,
            abi: TREASURY_ABI,
            functionName: "buybackShareBps",
          }),
          publicClient.readContract({
            address: HOOK_ADDRESS,
            abi: CONTRACT_ABIS.VeilHook,
            functionName: "getHookPermissions",
          }),
        ]);

        let nextIdx = 0;
        let totalEth = "0";
        let depth = 32;
        let root: `0x${string}` = EMPTY_ROOT;

        try {
          // Primary: 0xbow live privacy pool
          const [treeSize, treeDepthRaw, rootRaw, denom] = await Promise.all([
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "currentTreeSize",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "currentTreeDepth",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "currentRoot",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "DEPOSIT_DENOMINATION",
            }),
          ]);

          nextIdx = Number(treeSize);
          depth = Number(treeDepthRaw) || 32;
          totalEth = Number(formatEther(treeSize * denom)).toFixed(3);
          root = toHex(rootRaw, { size: 32 });
        } catch {
          // Fallback: legacy pool ABI
          const [legacyIdx, legacyTotal, legacyDepth] = await Promise.all([
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: POOL_ABI,
              functionName: "nextIndex",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: POOL_ABI,
              functionName: "totalDeposits",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: POOL_ABI,
              functionName: "TREE_DEPTH",
            }),
          ]);
          nextIdx = Number(legacyIdx);
          totalEth = Number(formatEther(legacyTotal)).toFixed(3);
          depth = Number(legacyDepth);
          if (nextIdx > 0) {
            root = await publicClient.readContract({
              address: POOL_ADDRESS,
              abi: POOL_ABI,
              functionName: "rootHistory",
              args: [BigInt(nextIdx - 1)],
            });
          }
        }

        if (isMounted) {
          setNextIndex(nextIdx);
          setTotalDepositsEth(totalEth);
          setTreeDepth(depth);
          setBuybackBps(bps);
          setHookPermissions({ ...(perms as unknown as HookPermissions) });
          setMerkleRoot(root);
          setIsLiveLoaded(true);
          setRpcError(false);
        }
      } catch (e) {
        console.warn("Telemetry read failed, retrying:", e);
        if (isMounted) setRpcError(true);
      }
    }

    loadTelemetry();
    const timer = setInterval(loadTelemetry, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  function handleCopyRoot() {
    navigator.clipboard.writeText(merkleRoot);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  }

  const enabledFlags = hookPermissions
    ? Object.entries(hookPermissions).filter(([, v]) => v === true).map(([k]) => k)
    : [];
  const burnShareLabel = buybackBps === null ? "—" : `${Number(buybackBps) / 100}% Burn`;
  const capacityLabel = treeDepth === null ? "—" : formatNumber(2 ** treeDepth);
  const depthLabel = treeDepth === null ? "—" : `${treeDepth} Levels`;
  const statusLabel = rpcError
    ? isLiveLoaded
      ? "Reconnecting…"
      : "RPC unreachable"
    : isLiveLoaded
    ? "Hook live"
    : "Syncing…";
  const statusDotColor = rpcError ? "#b45309" : isLiveLoaded ? "#16a34a" : "#ca8a04";

  return (
    <div
      className="veil-card-white"
      style={{
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        backgroundColor: "#ffffff",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 8px 24px -4px rgba(26, 26, 26, 0.05)",
      }}
    >
      {/* Telemetry Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "var(--space-4)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-headline)",
              fontSize: "var(--text-h4)",
              color: "var(--color-text)",
              fontWeight: 500,
            }}
          >
            Cryptographic Telemetry
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            Live on-chain state validation of Robinhood privacy pools &amp; Uniswap v4 hook.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)" }}>
          <span
            aria-hidden="true"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: statusDotColor,
              display: "inline-block",
            }}
          />
          <span>Robinhood {APP_CHAIN_ID}</span>
          <span aria-hidden="true" style={{ opacity: 0.4 }}>/</span>
          <span>{statusLabel}</span>
        </div>
      </div>

      {!isLiveLoaded && !rpcError && (
        <p style={{ margin: 0, fontSize: "var(--text-body-sm)", color: "var(--color-muted)", fontFamily: "monospace" }}>
          Loading live state…
        </p>
      )}
      {rpcError && !isLiveLoaded && (
        <p style={{ margin: 0, fontSize: "var(--text-body-sm)", color: "#b45309", fontFamily: "monospace" }}>
          RPC unreachable, retrying…
        </p>
      )}
      {rpcError && isLiveLoaded && (
        <p style={{ margin: 0, fontSize: "11px", color: "#b45309", fontFamily: "monospace" }}>
          RPC unreachable, retrying… showing last synced values.
        </p>
      )}

      {/* 4 Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-3)",
        }}
      >
        {/* Metric 1 */}
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(26, 26, 26, 0.02)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            LeanIMT Depth
          </div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.35rem", fontWeight: 600, color: "var(--color-text)" }}>
            {depthLabel}
          </div>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-faint)", marginTop: "4px" }}>
            {capacityLabel} Capacity · Leaf #{formatNumber(nextIndex)}
          </div>
        </div>

        {/* Metric 2 */}
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(26, 26, 26, 0.02)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            On-Chain Shielded Notes
          </div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.35rem", fontWeight: 600, color: "var(--color-text)" }}>
            {formatNumber(nextIndex)} Notes
          </div>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-faint)", marginTop: "4px" }}>
            Total: {totalDepositsEth} ETH Deposited
          </div>
        </div>

        {/* Metric 3 */}
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(26, 26, 26, 0.02)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Hook Permissions
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 600, color: "var(--color-text)" }}>
            {hookPermissions ? `${enabledFlags.length} enabled` : "—"}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              color: "var(--color-faint)",
              marginTop: "4px",
              maxHeight: "72px",
              overflowY: "auto",
            }}
          >
            {hookPermissions
              ? Object.entries(hookPermissions).map(([flag, on]) => (
                  <div key={flag}>
                    {flag}: {String(on)}
                  </div>
                ))
              : "Loading live state…"}
          </div>
        </div>

        {/* Metric 4 */}
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(26, 26, 26, 0.02)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Fee Burn Allocation
          </div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.35rem", fontWeight: 600, color: "var(--color-text)" }}>
            {burnShareLabel}
          </div>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-faint)", marginTop: "4px" }}>
            VeilTreasury Engine · On-Chain
          </div>
        </div>
      </div>

      {/* Merkle Root Surface */}
      <div
        style={{
          padding: "var(--space-4)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(26, 26, 26, 0.025)",
          border: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Current Merkle Root (live)
          </span>
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-accent-ink)", fontWeight: 600 }}>
            {isLiveLoaded ? "Live Sync" : "Syncing…"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            gap: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              color: "var(--color-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {!isLiveLoaded ? "Loading live state…" : nextIndex === 0 ? "Empty pool — no deposits yet" : merkleRoot}
          </span>

          <button
            type="button"
            onClick={handleCopyRoot}
            disabled={!isLiveLoaded || nextIndex === 0}
            title="Copy Merkle Root"
            aria-label="Copy full Merkle root hash"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              minHeight: "24px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(26, 26, 26, 0.04)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "11px",
              fontFamily: "monospace",
              cursor: "pointer",
              flexShrink: 0,
            }}
            className="hover:border-[#FF8C00] transition-colors"
          >
            {copiedRoot ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
