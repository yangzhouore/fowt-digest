"use client";

import Link from "next/link";
import { useLanguage } from "./i18n/language-context";
export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="site-header">
      <Link className="site-name" href="/">
        <span>Floating Wind Digest</span>
      </Link>
      <div className="header-actions">
        <nav aria-label={t("primaryNavigation")}>
          <Link href="/engineering">{t("engineering")}</Link>
          <Link href="/industry">{t("industryMap")}</Link>
          <Link href="/projects">{t("projects")}</Link>
          <Link href="/digital-ai">{t("digitalAi")}</Link>
          <Link href="/archive">{t("research")}</Link>
          <Link href="/methodology">{t("methodology")}</Link>
        </nav>
        <div className="preference-switches">
          <fieldset className="language-toggle" aria-label={t("language")}>
            <legend>{t("language")}</legend>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{t("english")}</button>
            <button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>{t("chinese")}</button>
          </fieldset>
          <fieldset className="theme-toggle" aria-label={t("theme")}>
            <legend>{t("theme")}</legend>
            <input id="theme-light" name="theme" type="radio" defaultChecked />
            <label htmlFor="theme-light">{t("light")}</label>
            <input id="theme-dark" name="theme" type="radio" />
            <label htmlFor="theme-dark">{t("dark")}</label>
          </fieldset>
        </div>
      </div>
    </header>
  );
}
