"use client";

import React, { useEffect, useRef, useState } from "react";

/** Waitlist form: posts to /api/dark-etf/waitlist, handles ?confirm= links. */
export const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [wallet, setWallet] = useState("");
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      setSource(q.get("utm_source") || "");
      const token = q.get("confirm") || "";
      if (/^[0-9a-f]{64}$/.test(token)) {
        fetch(`/api/dark-etf/waitlist?token=${token}`)
          .then((r) => r.json())
          .then((j) => setConfirmState(j.message || (j.success ? "Confirmed." : "Link invalid.")))
          .catch(() => setConfirmState("Could not confirm. Try again later."));
      }
    } catch {
      /* non-browser (SSR prerender) — skip */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNote(null);
    window.dispatchEvent(new CustomEvent("veil:cta_waitlist_click"));
    try {
      const res = await fetch("/api/dark-etf/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, xHandle, wallet, consent, source, website: honeypotRef.current?.value || "" }),
      });
      const j = await res.json();
      if (j.success) {
        setNote(j.message || "You're on the list.");
        window.dispatchEvent(new CustomEvent("veil:waitlist_submit_success"));
        setEmail("");
        setXHandle("");
        setWallet("");
        setConsent(false);
      } else {
        setNote(j.error || "Something went wrong. Try again.");
      }
    } catch {
      setNote("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    minHeight: "44px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border-strong)",
    backgroundColor: "#ffffff",
    color: "var(--color-text)",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  return (
    <div>
      {confirmState && (
        <p role="status" style={{ fontWeight: 600, color: "var(--color-text)" }}>
          {confirmState}
        </p>
      )}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <label htmlFor="wl-email" style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-faint)" }}>
          EMAIL (REQUIRED)
        </label>
        <input
          id="wl-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
        <label htmlFor="wl-x" style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-faint)" }}>
          X HANDLE (OPTIONAL)
        </label>
        <input
          id="wl-x"
          type="text"
          autoComplete="off"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          placeholder="@handle"
          style={inputStyle}
        />
        <label htmlFor="wl-wallet" style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-faint)" }}>
          WALLET ADDRESS (OPTIONAL, NO SIGNATURE)
        </label>
        <input
          id="wl-wallet"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="0x…"
          style={{ ...inputStyle, fontFamily: "monospace" }}
        />
        {/* Honeypot: invisible to humans, bots fill it. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
          <label htmlFor="wl-website">Website</label>
          <input id="wl-website" ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", cursor: "pointer" }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: "3px" }} />
          <span>
            Contact me about Dark ETF. I confirm I am not a U.S. person and this is not available where restricted.
          </span>
        </label>
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "12px 18px",
            minHeight: "44px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            backgroundColor: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            fontWeight: 700,
            fontSize: "16px",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Joining…" : "Join the waitlist"}
        </button>
        {note && (
          <p role="status" style={{ fontWeight: 600 }}>
            {note}
          </p>
        )}
      </form>
    </div>
  );
};

export default WaitlistForm;
