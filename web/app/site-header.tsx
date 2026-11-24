"use client";

import Link from "next/link";
import type { Ref } from "react";
import { useLanguage } from "./i18n/language-context";

type SiteHeaderProps = {
  menuOpen: boolean;
  menuButton: Ref<HTMLButtonElement>;
  onMenuToggle: () => void;
  onNavigate: () => void;
};

export function SiteHeader({ menuOpen, menuButton, onMenuToggle, onNavigate }: SiteHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="site-header">
      <Link className="site-name" href="/" onNavigate={onNavigate}>
        <svg className="site-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 21l1-10m0 0 1-5m-1 5 5 3m-5-3-5 3M7 23q4-3 9 0t9 0M8 27q4-2 8 0t8 0" />
          <circle cx="16" cy="11" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        <span>Floating Wind Digest</span>
      </Link>
      <div className="preference-switches">
        <Link className="site-search-entry" href="/search" prefetch={false} onNavigate={onNavigate}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="4.75" /><path d="m12 12 4 4" />
          </svg>
          {language === "zh" ? "搜索情报" : "Search intelligence"}
        </Link>
        <fieldset className="language-toggle" aria-label={t("language")}>
          <legend>{t("language")}</legend>
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{t("english")}</button>
          <button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>{t("chinese")}</button>
        </fieldset>
        <details className="theme-preferences">
          <summary>{t("preferences")}</summary>
          <fieldset className="theme-toggle" aria-label={t("theme")}>
            <legend>{t("theme")}</legend>
            <input id="theme-light" name="theme" type="radio" defaultChecked />
            <label htmlFor="theme-light">{t("light")}</label>
            <input id="theme-dark" name="theme" type="radio" />
            <label htmlFor="theme-dark">{t("dark")}</label>
          </fieldset>
        </details>
        <button className="shell-menu-button" type="button" ref={menuButton}
          aria-expanded={menuOpen} aria-controls="shell-navigation" onClick={onMenuToggle}>
          {t("menu")}
        </button>
      </div>
    </header>
  );
}
