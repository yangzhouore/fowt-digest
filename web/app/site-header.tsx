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
        <span>Floating Wind Digest</span>
      </Link>
      <div className="preference-switches">
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
