import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveAspSuite } from "../app/api/asp/sync/route";
import {
  TESTNET_BOW_V3_ENTRYPOINT,
  TESTNET_BOW_V3_ETH_POOL,
  TESTNET_BOW_V3_VEIL_POOL,
} from "../lib/privacy-pools";

describe("ASP auto-sync chain parity", () => {
  it("resolves the testnet v3 suite for 46630", () => {
    const suite = resolveAspSuite(46630);
    expect(suite).not.toBeNull();
    expect(suite?.entrypoint).toBe(TESTNET_BOW_V3_ENTRYPOINT);
    expect(suite?.pools).toEqual([TESTNET_BOW_V3_ETH_POOL, TESTNET_BOW_V3_VEIL_POOL]);
  });

  it("fails closed for mainnet while the suite is unconfigured", () => {
    if (!process.env.NEXT_PUBLIC_0XBOW_ENTRYPOINT) {
      expect(resolveAspSuite(4663)).toBeNull();
    }
  });

  it("rejects unknown chains", () => {
    expect(resolveAspSuite(1)).toBeNull();
    expect(resolveAspSuite(0)).toBeNull();
  });

  it("route serves mainnet through the same guarded path as testnet", () => {
    const src = readFileSync("app/api/asp/sync/route.ts", "utf8");
    expect(src).toContain("MAINNET_0XBOW");
    expect(src).toContain("isMainnetBowConfigured");
    expect(src).not.toContain("Only testnet 46630 supported");
  });

  it("policy authorizes mainnet auto-sync before code ships it", () => {
    const policy = readFileSync("docs/ASP-POLICY.md", "utf8");
    expect(policy).toContain("4663");
    expect(policy).toContain("v2");
  });
});
