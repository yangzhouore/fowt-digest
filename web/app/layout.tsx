import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./i18n/language-context";
import { AppShell } from "./app-shell";
import { SiteFooter } from "./site-footer";
import "./app-shell.css";

export const metadata: Metadata = {
  title: {
    default: "FOWT Research Digest",
    template: "%s | FOWT Research Digest",
  },
  description:
    "A deterministic weekly research digest for Floating Offshore Wind Turbines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AppShell footer={<SiteFooter />}>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
