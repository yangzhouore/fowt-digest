import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FOWT Research Digest",
  description:
    "A weekly digest of fictional floating offshore wind turbine research for MVP development.",
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
