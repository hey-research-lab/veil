"use client";

import React from "react";
import { VeilLogo } from "../../VeilLogo";
import { XLogo } from "../../TokenLogos";

export const Header: React.FC = () => {
  return (
    <header
      role="banner"
      className="hero-enter"
      style={{
        position: "relative",
        zIndex: 3,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-5) var(--page-gutter)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <VeilLogo href="/" size="md" />

      <nav
        aria-label="Primary"
        className="flex items-center gap-3 sm:gap-4 md:gap-6"
        style={{
          fontSize: "var(--text-body-sm)",
          fontFamily: "var(--font-body)",
        }}
      >
        <a
          href="#how"
          className="lp-link hidden lg:inline-block"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "opacity var(--duration-fast)",
          }}
        >
          How It Works
        </a>
        <a
          href="#why-veil"
          className="lp-link hidden lg:inline-block"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "opacity var(--duration-fast)",
          }}
        >
          Why Veil
        </a>
        <a
          href="#flywheel"
          className="lp-link hidden xl:inline-block"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "opacity var(--duration-fast)",
          }}
        >
          Flywheel
        </a>
        <a
          href="#security"
          className="lp-link hidden lg:inline-block"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "opacity var(--duration-fast)",
          }}
        >
          Contracts &amp; Proofs
        </a>
        <a
          href="#faq"
          className="lp-link hidden md:inline-block"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "opacity var(--duration-fast)",
          }}
        >
          FAQ
        </a>
        <a
          href="/dark-etf"
          className="lp-link inline-flex items-center gap-1.5"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "opacity var(--duration-fast)",
          }}
        >
          <span>Dark ETF</span>
          <span
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              padding: "1px 5px",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 140, 0, 0.15)",
              color: "var(--color-accent)",
              fontWeight: 700,
            }}
          >
            Soon
          </span>
        </a>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <a
            href="https://x.com/veilpools"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Official X (Twitter) Account @veilpools"
            title="Official X: @veilpools"
            className="lp-btn lp-btn--filled"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.25rem",
              height: "2.25rem",
              minHeight: "2.25rem",
              borderRadius: "var(--radius-md)",
              background: "var(--color-text)",
              color: "var(--color-bg)",
              border: "var(--border-thin) solid transparent",
              boxSizing: "border-box",
              padding: 0,
              transition: "all var(--duration-fast) var(--ease-out)",
              flexShrink: 0,
            }}
          >
            <XLogo size={15} color="var(--color-bg)" />
          </a>
          <a
            href="/trade"
            className="lp-btn lp-btn--filled"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              background: "var(--color-text)",
              color: "var(--color-bg)",
              minHeight: "2.25rem",
              boxSizing: "border-box",
              lineHeight: 1,
              letterSpacing: "0.005em",
              padding: "0 var(--space-4)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontSize: "var(--text-body-sm)",
              whiteSpace: "nowrap",
              transition: "all var(--duration-fast) var(--ease-out)",
            }}
          >
            Launch App
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M1 6H10.4M6.2 1.8L10.4 6L6.2 10.2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
};
