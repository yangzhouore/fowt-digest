import Link from "next/link";
import { currentEdition } from "../data/mock-papers";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        FOWT Research Digest is a prototype editorial reference for floating
        offshore wind turbine literature.
      </p>
      <nav aria-label="Footer navigation">
        <Link href="/">Home</Link>
        <Link href={`/weekly/${currentEdition.slug}`}>Current edition</Link>
        <Link href="/archive">Archive</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/about">About</Link>
      </nav>
      <p>Current paper data is fictional mock content for MVP development.</p>
    </footer>
  );
}
