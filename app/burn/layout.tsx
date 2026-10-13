import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protocol Burn Ledger",
  description:
    "Live protocol fee accruals and autonomous VEIL token burns executed on-chain via the Veil Treasury contract.",
  openGraph: {
    title: "Protocol Burn Ledger | Veil Protocol",
    description:
      "Live protocol fee accruals and autonomous VEIL token burns executed on-chain via the Veil Treasury contract.",
    images: ["/og-banner.png"],
  },
};

export default function BurnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
