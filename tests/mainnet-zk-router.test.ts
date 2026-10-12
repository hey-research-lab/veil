import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("mainnet ZK router parity", () => {
  it("migration script deploys VeilZkRouter with checkpoint resume", () => {
    const src = readFileSync("scripts/migrate-mainnet-0xbow.mjs", "utf8");
    expect(src).toContain("VeilZkRouter");
    expect(src).toContain("zkRouter");
    expect(src).toContain("NEXT_PUBLIC_0XBOW_ZK_ROUTER");
    // Constructor wiring must bind the fresh entrypoint + canonical PoolManager.
    expect(src).toContain("V4_PM_MAINNET");
    // Post-deploy verification, same discipline as routerFixed/legacy pools.
    expect(src).toContain("poolManager");
  });

  it("lib exposes a fail-closed mainnet ZK router address", async () => {
    const mod = await import("../lib/zk-router");
    expect(typeof mod.MAINNET_ZK_ROUTER_ADDRESS).toBe("string");
    expect(typeof mod.isMainnetZkConfigured).toBe("function");
    // Unconfigured default (empty env) must fail closed, never a zero address.
    if (!process.env.NEXT_PUBLIC_0XBOW_ZK_ROUTER) {
      expect(mod.MAINNET_ZK_ROUTER_ADDRESS).toBe("");
      expect(mod.isMainnetZkConfigured()).toBe(false);
    }
  });

  it("runbook documents the ZK router migration step", () => {
    const runbook = readFileSync("docs/MAINNET_RUNBOOK.md", "utf8");
    expect(runbook).toContain("VeilZkRouter");
    expect(runbook).toContain("NEXT_PUBLIC_0XBOW_ZK_ROUTER");
  });
});
