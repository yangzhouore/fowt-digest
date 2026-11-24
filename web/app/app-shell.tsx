"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { useLanguage } from "./i18n/language-context";
import { SiteHeader } from "./site-header";

const primaryLinks = [
  { href: "/", label: "briefing", families: ["/briefings", "/engineering", "/weekly", "/papers", "/archive"] },
  { href: "/explore", label: "explore", families: ["/projects", "/companies", "/industry", "/digital-ai"] },
  { href: "/search", label: "search", families: [], prefetch: false },
  { href: "/subscribe", label: "subscribe", families: ["/subscribe"], prefetch: false },
] as const;

const exploreLinks = [
  { href: "/projects", label: "projects" },
  { href: "/companies", label: "companies" },
  { href: "/industry", label: "industry" },
  { href: "/digital-ai", label: "digitalAi" },
] as const;

function isRouteFamily(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuOpen = openPath === pathname;
  const closeMenu = () => setOpenPath(null);

  return (
    <div className="app-shell" onKeyDown={(event) => {
      if (event.key !== "Escape" || !menuOpen || !menuButton.current?.getClientRects().length) return;
      closeMenu();
      menuButton.current.focus();
    }}>
      <a className="shell-skip-link" href="#route-content">{t("skipToContent")}</a>
      <SiteHeader menuOpen={menuOpen} menuButton={menuButton}
        onMenuToggle={() => setOpenPath(menuOpen ? null : pathname)} onNavigate={closeMenu} />
      <div className="shell-columns">
        <div className="shell-navigation" id="shell-navigation" data-open={menuOpen}>
          <nav aria-label={t("primaryNavigation")}>
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} onNavigate={closeMenu}
                prefetch={"prefetch" in link ? link.prefetch : undefined}
                aria-current={pathname === link.href ? "page" : undefined}
                data-active={pathname === link.href || link.families.some((family) => isRouteFamily(pathname, family))}>
                {t(link.label)}
              </Link>
            ))}
          </nav>
          <nav aria-label={t("exploreNavigation")}>
            <p>{t("explore")}</p>
            {exploreLinks.map((link) => (
              <Link key={link.href} href={link.href} onNavigate={closeMenu}
                aria-current={pathname === link.href ? "page" : undefined}
                data-active={isRouteFamily(pathname, link.href)}>
                {t(link.label)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="shell-content" id="route-content" tabIndex={-1}>
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
