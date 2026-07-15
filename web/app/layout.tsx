import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FOWT Research Digest",
    template: "%s | FOWT Research Digest",
  },
  description:
    "A prototype weekly digest of fictional floating offshore wind turbine research for MVP development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
