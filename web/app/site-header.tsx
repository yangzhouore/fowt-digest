"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type Ref } from "react";
import { useLanguage } from "./i18n/language-context";

type SiteHeaderProps = {
  menuOpen: boolean;
  menuButton: Ref<HTMLButtonElement>;
  onMenuToggle: () => void;
  onNavigate: () => void;
};

export function SiteHeader({ menuOpen, menuButton, onMenuToggle, onNavigate }: SiteHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
        searchInput.current?.select();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

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
      <form className="site-search-entry" role="search" action="/search" onSubmit={(event) => {
        event.preventDefault();
        const query = searchInput.current?.value.trim();
        onNavigate();
        router.push(query ? `/search?${new URLSearchParams({ q: query })}` : "/search");
      }}>
        <button type="submit" aria-label={language === "zh" ? "提交搜索" : "Submit search"}>
          <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="4.75" /><path d="m12 12 4 4" />
          </svg>
        </button>
        <input ref={searchInput} type="search" name="q" aria-keyshortcuts="Control+K Meta+K"
          aria-label={language === "zh" ? "全站搜索" : "Site-wide search"}
          placeholder={language === "zh" ? "搜索简报、主题、来源…" : "Search briefs, topics, sources…"} />
        <kbd aria-hidden="true">Ctrl K</kbd>
      </form>
      <div className="preference-switches">
        <fieldset className="language-toggle" aria-label={t("language")}>
          <legend>{t("language")}</legend>
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{t("english")}</button>
          <button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>{t("chinese")}</button>
        </fieldset>
        <button className="theme-toggle" type="button" aria-label={t("darkMode")} aria-pressed={darkMode}
          onClick={() => setDarkMode((current) => !current)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {darkMode ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
              </>
            ) : <path d="M20.9 13.35A9 9 0 0 1 10.65 3.1 9 9 0 1 0 20.9 13.35Z" />}
          </svg>
        </button>
        <button className="shell-menu-button" type="button" ref={menuButton}
          aria-expanded={menuOpen} aria-controls="shell-navigation" onClick={onMenuToggle}>
          {t("menu")}
        </button>
      </div>
    </header>
  );
}
