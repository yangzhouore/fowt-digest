"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { useLanguage } from "./i18n/language-context";
import { SiteHeader } from "./site-header";

const primaryLinks = [
  { href: "/", label: "briefing", families: ["/briefings", "/engineering", "/weekly", "/papers", "/archive"] },
  { href: "/projects", label: "projects" },
  { href: "/companies", label: "companies" },
  { href: "/industry", label: "industry" },
  { href: "/digital-ai", label: "digitalAi" },
  { href: "/subscribe", label: "subscribe", prefetch: false },
] as const;

const icons = {
  briefing: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10M7 12h4m3 0h3M7 16h10" /></>,
  projects: <><path d="M12 11v9M12 8l1-6m0 7 6 3m-8-2-5 4M4 21q4-2 8 0t8 0" /><circle cx="12" cy="9" r="1.5" /></>,
  companies: <path d="M3 21h18M5 21V4h10v17m0-13h4v13M8 8h1m2 0h1m-4 4h1m2 0h1m-3 9v-5h3v5" />,
  industry: <path d="M3 21V10l6 3V8l6 3V4h4l2 17H3Zm4-4h1m3 0h1m3 0h1" />,
  digitalAi: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3" /></>,
  subscribe: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3.5 7 8.5 6L20.5 7" /></>,
};

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
                data-active={isRouteFamily(pathname, link.href) || ("families" in link && link.families.some((family) => isRouteFamily(pathname, family)))}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  {icons[link.label]}
                </svg>
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
