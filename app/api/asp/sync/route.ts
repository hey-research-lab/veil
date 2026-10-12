import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { robinhoodMainnet, robinhoodTestnet } from "@/lib/chains";
import { createBypassTransport } from "@/lib/rpc-transport";
import {
  MAINNET_0XBOW,
  MAINNET_CHAIN_ID,
  TESTNET_BOW_V3_ENTRYPOINT,
  TESTNET_BOW_V3_ETH_POOL,
  TESTNET_BOW_V3_VEIL_POOL,
  TESTNET_CHAIN_ID,
  isMainnetBowConfigured,
} from "@/lib/privacy-pools";
import { fetchBowPoolEvents } from "@/lib/0xbow-client";
import { buildBowAssociationSet } from "@/lib/0xbow-association";

export interface AspSyncSuite {
  chainId: number;
  chain: typeof robinhoodTestnet | typeof robinhoodMainnet;
  entrypoint: Address;
  pools: [Address, Address];
  tag: string;
}

// Chain-aware suite selector. Testnet resolves to the fresh v3 constants;
// mainnet resolves to the migrated env suite and fails closed (null) until
// `pnpm migrate:mainnet` populates it. Unknown chains always fail closed.
export function resolveAspSuite(chainId: number): AspSyncSuite | null {
  if (chainId === TESTNET_CHAIN_ID) {
    return {
      chainId,
      chain: robinhoodTestnet,
      entrypoint: TESTNET_BOW_V3_ENTRYPOINT,
      pools: [TESTNET_BOW_V3_ETH_POOL, TESTNET_BOW_V3_VEIL_POOL],
      tag: "46630",
    };
  }
  if (chainId === MAINNET_CHAIN_ID && isMainnetBowConfigured()) {
    return {
      chainId,
      chain: robinhoodMainnet,
      entrypoint: MAINNET_0XBOW.entrypoint,
      pools: [MAINNET_0XBOW.poolEth, MAINNET_0XBOW.poolVeil as Address],
      tag: "4663",
    };
  }
  return null;
}

// Fresh suite inputs (entrypoint 0xb68c… on testnet).
// Scans BOTH pools' full history like scripts/publish-asp.mjs: omitting old
// labels would censor dormant depositors, so partial ranges are not acceptable.
async function fetchAspInputs(publicClient: any, pools: [Address, Address]) {
  const [eth, veil] = await Promise.all([
    fetchBowPoolEvents(publicClient, pools[0]),
    fetchBowPoolEvents(publicClient, pools[1]),
  ]);
  return {
    labels: [...eth.labels, ...veil.labels.filter((l) => !eth.labels.some((e) => e === l))],
    depositLogs: [...eth.depositLogs, ...veil.depositLogs],
  };
}

const ENTRYPOINT_ABI = [
  {
    type: "function",
    name: "updateRoot",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_root", type: "uint256" },
      { name: "_ipfsCID", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "latestRoot",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chainId = Number(searchParams.get("chainId") || TESTNET_CHAIN_ID);
    const suite = resolveAspSuite(chainId);
    if (!suite) {
      return NextResponse.json(
        {
          error:
            chainId === MAINNET_CHAIN_ID
              ? "Mainnet 0xbow suite pending migration — ASP auto-sync opens after `pnpm migrate:mainnet`"
              : "Unsupported chainId for ASP auto-sync",
        },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: suite.chain,
      transport: createBypassTransport(suite.chainId),
    });

    const { labels, depositLogs } = await fetchAspInputs(publicClient as any, suite.pools);
    const aspSet = buildBowAssociationSet(labels);
    const onchainRoot = await publicClient.readContract({
      address: suite.entrypoint,
      abi: ENTRYPOINT_ABI,
      functionName: "latestRoot",
    });

    const isCurrent = BigInt(onchainRoot) === aspSet.root;
    return NextResponse.json({
      success: true,
      chainId,
      labelCount: labels.length,
      depositCount: depositLogs.length,
      computedRoot: aspSet.root.toString(),
      onchainRoot: onchainRoot.toString(),
      isCurrent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to inspect ASP root" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const chainId = Number(body.chainId || TESTNET_CHAIN_ID);
    const suite = resolveAspSuite(chainId);
    if (!suite) {
      return NextResponse.json(
        {
          error:
            chainId === MAINNET_CHAIN_ID
              ? "Mainnet 0xbow suite pending migration — ASP auto-sync opens after `pnpm migrate:mainnet`"
              : "Unsupported chainId for ASP auto-sync",
        },
        { status: 400 }
      );
    }

    const rawKey = (process.env.PRIVATE_KEY || "").trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(rawKey)) {
      return NextResponse.json(
        { success: false, error: "Postman private key not configured on server" },
        { status: 500 }
      );
    }

    const publicClient = createPublicClient({
      chain: suite.chain,
      transport: createBypassTransport(suite.chainId),
    });

    const { labels, depositLogs } = await fetchAspInputs(publicClient as any, suite.pools);
    const aspSet = buildBowAssociationSet(labels);
    const onchainRoot = await publicClient.readContract({
      address: suite.entrypoint,
      abi: ENTRYPOINT_ABI,
      functionName: "latestRoot",
    });

    if (BigInt(onchainRoot) === aspSet.root) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: "ASP root is already up-to-date",
        root: aspSet.root.toString(),
        labelCount: labels.length,
        depositCount: depositLogs.length,
      });
    }

    const account = privateKeyToAccount(rawKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: suite.chain,
      transport: createBypassTransport(suite.chainId),
    });

    const head = await publicClient.getBlockNumber();

    // Root-audit hardening (2026-10-08, deep-audit tuned): unauthenticated
    // POST used to let anyone force a server-signed updateRoot (gas
    // griefing). Throttle: at most one publish per THROTTLE_BLOCKS (~5 min
    // at testnet pace) unless (a) the sentinel override token
    // (x-asp-publish-token == ASP_PUBLISH_TOKEN) is presented, or (b) the
    // caller names a label that IS in the freshly computed set but CANNOT be
    // in the stale onchain root (roots only change via this endpoint, so a
    // computed-but-unpublished label proves genuine inclusion need — and each
    // such publish costs the attacker a real 0.001 deposit, bounding grief).
    const THROTTLE_BLOCKS = 1200n;
    const requestedLabel =
      typeof body.label === "string" && body.label.length > 0 ? body.label : null;
    const sentinelToken = (process.env.ASP_PUBLISH_TOKEN || "").trim();
    const presented = (req.headers.get("x-asp-publish-token") || "").trim();
    const hasToken = sentinelToken.length > 0 && presented === sentinelToken;
    let requestedLabelLive = false;
    if (requestedLabel !== null) {
      try {
        const want = BigInt(requestedLabel);
        requestedLabelLive =
          aspSet.labels.some((l) => l === want) && aspSet.root !== BigInt(onchainRoot);
      } catch {
        requestedLabelLive = false;
      }
    }
    if (!hasToken && !requestedLabelLive) {
      const rootUpdatedLogs = await publicClient.getLogs({
        address: suite.entrypoint,
        event: {
          type: "event",
          name: "RootUpdated",
          inputs: [
            { type: "uint256", name: "_root" },
            { type: "string", name: "_ipfsCID" },
            { type: "uint256", name: "_timestamp" },
          ],
        } as const,
        fromBlock: head > 200000n ? head - 200000n : 0n,
        toBlock: head,
      });
      const lastBlock = rootUpdatedLogs.reduce<bigint>(
        (m, l) => (l.blockNumber > m ? l.blockNumber : m),
        0n
      );
      if (lastBlock > 0n && head - lastBlock < THROTTLE_BLOCKS) {
        return NextResponse.json(
          {
            success: false,
            throttled: true,
            error:
              "ASP root was published recently; the publisher is cooling down (~5 minutes). Wait a few minutes and try the withdrawal again, or use the sentinel token.",
          },
          { status: 429 }
        );
      }
    }

    const cid = `auto-asp-${suite.tag}-b${head}-l${labels.length}`.padEnd(33, "0");

    const txHash = await walletClient.writeContract({
      address: suite.entrypoint,
      abi: ENTRYPOINT_ABI,
      functionName: "updateRoot",
      args: [aspSet.root, cid],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      throw new Error(`updateRoot transaction reverted: ${txHash}`);
    }

    return NextResponse.json({
      success: true,
      updated: true,
      txHash,
      blockNumber: receipt.blockNumber.toString(),
      root: aspSet.root.toString(),
      labelCount: labels.length,
      depositCount: depositLogs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to sync ASP root" },
      { status: 500 }
    );
  }
}
