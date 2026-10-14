import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  normalizeXHandle,
  normalizeWallet,
  validateWaitlist,
  newConfirmToken,
} from "../lib/dark-etf-waitlist";

describe("dark ETF waitlist validation", () => {
  it("accepts a full valid payload", () => {
    const r = validateWaitlist({
      email: "  Ada@Example.COM ",
      xHandle: "@veilpools",
      wallet: "0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6",
      consent: true,
      source: "x?utm=x",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.email).toBe("ada@example.com");
      expect(r.value.xHandle).toBe("veilpools");
      expect(r.value.wallet).toBe("0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6");
    }
  });

  it("accepts email-only payload", () => {
    const r = validateWaitlist({ email: "a@b.co", consent: true });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.xHandle).toBe(null);
      expect(r.value.wallet).toBe(null);
    }
  });

  it("rejects bad email, bad handle, bad wallet, missing consent", () => {
    expect(validateWaitlist({ email: "nope", consent: true }).ok).toBe(false);
    expect(validateWaitlist({ email: "a@b.co", consent: false }).ok).toBe(false);
    expect(validateWaitlist({ email: "a@b.co", xHandle: "way-too-long-handle!!", consent: true }).ok).toBe(false);
    expect(validateWaitlist({ email: "a@b.co", wallet: "0x123", consent: true }).ok).toBe(false);
  });

  it("normalizes edge cases", () => {
    expect(normalizeEmail(null)).toBe(null);
    expect(normalizeXHandle(undefined)).toBe(null);
    expect(normalizeXHandle("")).toBe(null);
    expect(normalizeWallet("")).toBe(null);
  });

  it("mints unique 64-hex confirm tokens", () => {
    const a = newConfirmToken();
    const b = newConfirmToken();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(b).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });
});
