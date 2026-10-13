import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Architecture & Mathematical Invariants",
  description:
    "Mathematical guarantees, zero-knowledge verification, and non-custodial privacy invariants across the Veil protocol stack.",
  openGraph: {
    title: "Privacy Architecture | Veil Protocol",
    description:
      "Mathematical guarantees, zero-knowledge verification, and non-custodial privacy invariants across the Veil protocol stack.",
    images: ["/og-banner.png"],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
