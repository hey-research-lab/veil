"use client";

import { useEffect, useState } from "react";
import { formatEther, parseAbi, parseAbiItem, toHex, type Address } from "viem";
import { publicClient } from "@/lib/balances";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, POOL_DEPLOYMENT_BLOCK } from "@/lib/contracts";
import { appChain, APP_CHAIN_ID } from "@/lib/chains";
import { BOW_DEPOSITED_EVENT, BOW_WITHDRAWN_EVENT } from "@/lib/0xbow-client";

const POOL_ADDRESS = (CONTRACT_ADDRESSES.poolEth ||
  "0x10c17b7538e13c63b890fea52708846e88bb1932") as Address;

const BOW_POOL_ABI = parseAbi([
  "function currentTreeSize() view returns (uint256)",
  "function DEPOSIT_DENOMINATION() view returns (uint256)",
  "function LIFETIME_DEPOSIT_CAP() view returns (uint256)",
  "function guardian() view returns (address)",
  "function depositsPaused() view returns (bool)",
  "function currentRoot() view returns (uint256)",
]);

const DEPOSIT_EVENT = parseAbiItem(
  "event Deposit(uint32 indexed index, bytes32 indexed commitment, uint256 leafIndex, uint256 timestamp)"
);
const WITHDRAW_EVENT = parseAbiItem(
  "event Withdraw(bytes32 indexed nullifierHash, address indexed recipient, address indexed relayer, uint256 fee)"
);

interface DepositRow {
  txHash: string;
  blockNumber: bigint;
  index: string;
  commitment: string;
}

interface WithdrawRow {
  txHash: string;
  blockNumber: bigint;
  nullifierHash: string;
  recipient: string;
}

export default function StatusPage() {
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [totalDeposits, setTotalDeposits] = useState<string | null>(null);
  const [denomination, setDenomination] = useState<string | null>(null);
  const [poolCap, setPoolCap] = useState<string | null>(null);
  const [guardian, setGuardian] = useState<string | null>(null);
  const [depositsPaused, setDepositsPaused] = useState<boolean | null>(null);
  const [latestRoot, setLatestRoot] = useState<string | null>(null);
  const [rootKnown, setRootKnown] = useState<boolean | null>(null);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rpcError, setRpcError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        let idxNum = 0;
        let totalStr = "0";
        let denomStr = "0.001";
        let capStr = "10.0";
        let guardStr = "";
        let pausedBool = false;
        let rootStr: `0x${string}` | null = null;
        let isKnown: boolean | null = true;
        let depRows: DepositRow[] = [];
        let wdRows: WithdrawRow[] = [];

        try {
          // Primary: 0xbow Privacy Pool
          const [treeSize, denom, cap, guard, paused, rootRaw] = await Promise.all([
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "currentTreeSize",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "DEPOSIT_DENOMINATION",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "LIFETIME_DEPOSIT_CAP",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "guardian",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "depositsPaused",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: BOW_POOL_ABI,
              functionName: "currentRoot",
            }),
          ]);

          idxNum = Number(treeSize);
          totalStr = formatEther(treeSize * denom);
          denomStr = formatEther(denom);
          capStr = formatEther(cap);
          guardStr = guard;
          pausedBool = paused;
          rootStr = toHex(rootRaw, { size: 32 });
          isKnown = idxNum > 0;

          const [bowDeps, bowWds] = await Promise.all([
            publicClient.getLogs({
              address: POOL_ADDRESS,
              event: BOW_DEPOSITED_EVENT,
              fromBlock: POOL_DEPLOYMENT_BLOCK,
            }),
            publicClient.getLogs({
              address: POOL_ADDRESS,
              event: BOW_WITHDRAWN_EVENT,
              fromBlock: POOL_DEPLOYMENT_BLOCK,
            }),
          ]);

          depRows = bowDeps.map((l, i) => ({
            txHash: l.transactionHash ?? "",
            blockNumber: l.blockNumber ?? 0n,
            index: String(i),
            commitment: l.args._commitment ? toHex(BigInt(l.args._commitment), { size: 32 }) : "",
          }));

          wdRows = bowWds.map((l) => ({
            txHash: l.transactionHash ?? "",
            blockNumber: l.blockNumber ?? 0n,
            nullifierHash: l.args._spentNullifier ? toHex(BigInt(l.args._spentNullifier), { size: 32 }) : "",
            recipient: String(l.args._processooor ?? ""),
          }));
        } catch {
          // Fallback: legacy ShieldedPool
          const [idx, total, denom, cap, guard, paused] = await Promise.all([
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "nextIndex",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "totalDeposits",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "denomination",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "poolCap",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "guardian",
            }),
            publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "depositsPaused",
            }),
          ]);

          idxNum = Number(idx);
          totalStr = formatEther(total);
          denomStr = formatEther(denom);
          capStr = formatEther(cap);
          guardStr = guard;
          pausedBool = paused;

          if (idxNum > 0) {
            rootStr = await publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "rootHistory",
              args: [BigInt(idxNum - 1)],
            });
            isKnown = await publicClient.readContract({
              address: POOL_ADDRESS,
              abi: CONTRACT_ABIS.ShieldedPool,
              functionName: "isKnownRoot",
              args: [rootStr],
            });
          }

          const [legacyDeps, legacyWds] = await Promise.all([
            publicClient.getLogs({
              address: POOL_ADDRESS,
              event: DEPOSIT_EVENT,
              fromBlock: POOL_DEPLOYMENT_BLOCK,
            }),
            publicClient.getLogs({
              address: POOL_ADDRESS,
              event: WITHDRAW_EVENT,
              fromBlock: POOL_DEPLOYMENT_BLOCK,
            }),
          ]);

          depRows = legacyDeps.map((l) => ({
            txHash: l.transactionHash ?? "",
            blockNumber: l.blockNumber ?? 0n,
            index: String(l.args.index ?? ""),
            commitment: String(l.args.commitment ?? ""),
          }));

          wdRows = legacyWds.map((l) => ({
            txHash: l.transactionHash ?? "",
            blockNumber: l.blockNumber ?? 0n,
            nullifierHash: String(l.args.nullifierHash ?? ""),
            recipient: String(l.args.recipient ?? ""),
          }));
        }

        if (mounted) {
          setNextIndex(idxNum);
          setTotalDeposits(totalStr);
          setDenomination(denomStr);
          setPoolCap(capStr);
          setGuardian(guardStr);
          setDepositsPaused(pausedBool);
          setLatestRoot(rootStr);
          setRootKnown(isKnown);
          setDeposits(depRows);
          setWithdrawals(wdRows);
          setLoading(false);
          setRpcError(false);
        }
      } catch (e) {
        console.warn("Status page read failed:", e);
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

  const card = (label: string, value: string) => (
    <div
      key={label}
      className="veil-card-white"
      style={{
        padding: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 600, color: "var(--color-text)", overflowWrap: "anywhere" }}>
        {value}
      </div>
    </div>
  );

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
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginBottom: "var(--space-2)",
            }}
          >
            Robinhood {appChain.name} {APP_CHAIN_ID} // Health Monitor
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(2rem, 3vw, 2.5rem)",
              lineHeight: 1.15,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              fontWeight: 500,
            }}
          >
            Chain &amp; Pool Health
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
            Live cryptographic state, Merkle tree history, and operational parameters of the Shielded Pool on Robinhood {appChain.name} ({APP_CHAIN_ID}).
            Telemetry updates automatically every 15 seconds.
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
          <span>LeanIMT Merkle</span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span>15s Auto-Sync</span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span>Client Verifiable</span>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-muted)", fontFamily: "monospace", fontSize: "var(--text-body-sm)" }}>
          Loading live pool metrics from RPC…
        </div>
      )}
      {rpcError && (
        <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", backgroundColor: "rgba(180, 83, 9, 0.08)", border: "1px solid rgba(180, 83, 9, 0.2)", color: "#b45309", fontFamily: "monospace", fontSize: "var(--text-body-sm)" }}>
          RPC connection error, retrying…
        </div>
      )}

      {!loading && !rpcError && (
        <>
          {/* Key Invariant Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            {card("Next Leaf Index", nextIndex === null ? "—" : String(nextIndex))}
            {card("Total Deposits", totalDeposits === null ? "—" : `${totalDeposits} ETH`)}
            {card("Fixed Denomination", denomination === null ? "—" : `${denomination} ETH`)}
            {card("Pool Lifetime Cap", poolCap === null ? "—" : `${poolCap} ETH`)}
            {card("Guardian Address", guardian ?? "—")}
            {card("Deposits Paused", depositsPaused === null ? "—" : String(depositsPaused))}
            {card("Latest Merkle Root", latestRoot ?? "Empty pool — no deposits yet")}
            {card("Root Known Onchain", rootKnown === null ? "—" : String(rootKnown))}
          </div>

          {/* Log Event Inspection Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(480px, 100%), 1fr))",
              gap: "var(--space-6)",
              alignItems: "start",
            }}
          >
            {/* Column 1: Deposits */}
            <div
              className="veil-card-white"
              style={{
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "var(--text-h3)", color: "var(--color-text)" }}>
                    Onchain Deposits
                  </h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                    Commitments verified in LeanIMT leaves.
                  </p>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", padding: "2px 8px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(26, 26, 26, 0.04)" }}>
                  {deposits.length} Recorded
                </span>
              </div>

              {deposits.length === 0 ? (
                <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-muted)", fontFamily: "monospace", fontSize: "12px", backgroundColor: "rgba(26, 26, 26, 0.02)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border)" }}>
                  No deposits yet recorded on this pool.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxHeight: "420px", overflowY: "auto" }}>
                  {deposits.map((d, i) => (
                    <div
                      key={`${d.txHash}-${i}`}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "rgba(26, 26, 26, 0.02)",
                        border: "1px solid var(--color-border)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "var(--color-text)",
                        overflowWrap: "anywhere",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted)", fontSize: "11px" }}>
                        <span>Leaf #{d.index}</span>
                        <span>Block #{d.blockNumber.toString()}</span>
                      </div>
                      <div style={{ color: "var(--color-text)", fontWeight: 500 }}>
                        {d.commitment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Withdrawals */}
            <div
              className="veil-card-white"
              style={{
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "var(--font-headline)", fontSize: "var(--text-h3)", color: "var(--color-text)" }}>
                    Unlinked Withdrawals
                  </h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "var(--text-body-sm)", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                    Nullifier hashes spent with ZK proofs.
                  </p>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-muted)", padding: "2px 8px", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(26, 26, 26, 0.04)" }}>
                  {withdrawals.length} Recorded
                </span>
              </div>

              {withdrawals.length === 0 ? (
                <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-muted)", fontFamily: "monospace", fontSize: "12px", backgroundColor: "rgba(26, 26, 26, 0.02)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border)" }}>
                  No withdrawals yet recorded on this pool.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxHeight: "420px", overflowY: "auto" }}>
                  {withdrawals.map((w, i) => (
                    <div
                      key={`${w.txHash}-${i}`}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "rgba(26, 26, 26, 0.02)",
                        border: "1px solid var(--color-border)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "var(--color-text)",
                        overflowWrap: "anywhere",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted)", fontSize: "11px" }}>
                        <span>To: {w.recipient.slice(0, 8)}...{w.recipient.slice(-6)}</span>
                        <span>Block #{w.blockNumber.toString()}</span>
                      </div>
                      <div style={{ color: "var(--color-text)", fontWeight: 500 }}>
                        Nullifier: {w.nullifierHash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
