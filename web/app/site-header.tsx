import Link from "next/link";
import { currentEdition } from "../data/mock-papers";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-name" href="/">
        FOWT Research Digest
      </Link>
      <div className="header-actions">
        <nav aria-label="Primary navigation">
          <Link href={`/weekly/${currentEdition.slug}`}>Weekly</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/about">About</Link>
        </nav>
        <fieldset className="theme-toggle" aria-label="Theme mode">
          <legend>Theme</legend>
          <input id="theme-light" name="theme" type="radio" defaultChecked />
          <label htmlFor="theme-light">Light</label>
          <input id="theme-dark" name="theme" type="radio" />
          <label htmlFor="theme-dark">Dark</label>
        </fieldset>
      </div>
    </header>
  );
}
