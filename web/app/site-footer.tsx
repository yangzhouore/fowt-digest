import Link from "next/link";
import { currentDigest } from "../data/digest-adapter";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        FOWT Research Digest is a prototype editorial reference for floating
        offshore wind turbine literature.
      </p>
      <nav aria-label="Footer navigation">
        <Link href="/">Home</Link>
        <Link href={`/weekly/${currentDigest.slug}`}>Current digest</Link>
        <Link href="/archive">Archive</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/about">About</Link>
      </nav>
      <p>Current digest data is a static local copy of pipeline output.</p>
    </footer>
  );
}
