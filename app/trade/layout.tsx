import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Swap & Shield Terminal",
  description:
    "Execute atomic Swap-to-Shield, private pool-to-pool swaps, and unlinked Groth16 zero-knowledge withdrawals on Uniswap v4.",
  openGraph: {
    title: "Private Swap & Shield Terminal | Veil Protocol",
    description:
      "Execute atomic Swap-to-Shield, private pool-to-pool swaps, and unlinked Groth16 zero-knowledge withdrawals on Uniswap v4.",
    images: ["/og-banner.png"],
  },
};

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
