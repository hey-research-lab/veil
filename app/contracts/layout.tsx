import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Contracts Registry",
  description:
    "Verified smart contract deployments on Robinhood Chain Mainnet (4663). Bytecode, ABIs, and Uniswap v4 Hook bitflags.",
  openGraph: {
    title: "Verified Contracts Registry | Veil Protocol",
    description:
      "Verified smart contract deployments on Robinhood Chain Mainnet (4663). Bytecode, ABIs, and Uniswap v4 Hook bitflags.",
    images: ["/og-banner.png"],
  },
};

export default function ContractsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
