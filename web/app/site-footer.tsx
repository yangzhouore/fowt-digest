import Link from "next/link";
import { LocalizedCopy } from "./i18n/localized-copy";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <LocalizedCopy en="Floating Wind Digest is a source-backed weekly reference for floating wind engineering, research, and industry context." zh="Floating Wind Digest 是一份有来源依据的浮式风电工程、研究与产业周度参考。" />
      </p>
      <nav aria-labelledby="footer-nav-label">
        <span id="footer-nav-label" className="context-sr-only"><LocalizedCopy en="Further reading" zh="延伸阅读" /></span>
        <Link href="/methodology"><LocalizedCopy en="Methodology" zh="方法论" /></Link>
        <Link href="/about"><LocalizedCopy en="About" zh="关于" /></Link>
      </nav>
    </footer>
  );
}
