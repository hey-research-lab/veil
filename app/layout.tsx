import type { Metadata } from "next";
import "./globals.css";
import { AppLayoutWrapper } from "../components/AppLayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.veilpools.tech"),
  title: {
    default: "Veil Protocol — Private Swaps on Uniswap v4",
    template: "%s | Veil Protocol",
  },
  description:
    "Zero-knowledge privacy layer for Uniswap v4 on Robinhood Chain. Non-custodial shielded pools, association sets, and autonomous protocol fee buyback & burn.",
  keywords: [
    "Veil Protocol",
    "Zero Knowledge",
    "ZK-SNARK",
    "Uniswap v4",
    "Robinhood Chain",
    "Chain 4663",
    "Privacy Pools",
    "LeanIMT",
    "Groth16",
    "Shielded Swaps",
    "Swap-to-Shield",
  ],
  authors: [{ name: "Veil Protocol" }],
  creator: "@veilpools",
  openGraph: {
    title: "Veil Protocol — Private Swaps on Uniswap v4",
    description:
      "Zero-knowledge privacy layer for Uniswap v4 on Robinhood Chain. Non-custodial shielded pools, association sets, and autonomous protocol fee buyback & burn.",
    url: "https://www.veilpools.tech",
    siteName: "Veil Protocol",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Veil Protocol — Zero-Knowledge Privacy Layer for Uniswap v4",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@veilpools",
    creator: "@veilpools",
    title: "Veil Protocol — Private Swaps on Uniswap v4",
    description:
      "Zero-knowledge privacy layer for Uniswap v4 on Robinhood Chain. Non-custodial shielded pools, association sets, and autonomous protocol fee buyback & burn.",
    images: ["/og-banner.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/veil-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="lp-on">
      <body className="min-h-screen flex flex-col antialiased relative overflow-x-hidden" style={{ color: "var(--color-text)" }}>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
