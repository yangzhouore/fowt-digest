import Link from "next/link";
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-name" href="/">
        <span>Floating Wind Digest</span>
      </Link>
      <div className="header-actions">
        <nav aria-label="Primary navigation">
          <Link href="/engineering">Engineering</Link>
          <Link href="/industry">Industry Map</Link>
          <Link href="/archive">Research</Link>
          <Link href="/methodology">Methodology</Link>
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
