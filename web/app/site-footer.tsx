import { LocalizedCopy } from "./i18n/localized-copy";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <LocalizedCopy en="Floating Wind Digest is a source-backed weekly reference for floating wind engineering, research, and industry context." zh="Floating Wind Digest 是一份有来源依据的浮式风电工程、研究与产业周度参考。" />
      </p>
    </footer>
  );
}
