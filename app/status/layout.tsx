import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chain & Pool Health Monitor",
  description:
    "Live cryptographic state, Merkle tree history, and operational parameters of Veil Shielded Pools on Robinhood Chain Mainnet (4663).",
  openGraph: {
    title: "Chain & Pool Health Monitor | Veil Protocol",
    description:
      "Live cryptographic state, Merkle tree history, and operational parameters of Veil Shielded Pools on Robinhood Chain Mainnet (4663).",
    images: ["/og-banner.png"],
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
