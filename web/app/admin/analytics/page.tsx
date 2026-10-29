import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { adminAuth } from "../../../lib/admin-auth";
import { loadGitHub, loadVercel, websiteDays, type Source, type TrafficRow } from "../../../lib/admin-analytics";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Owner analytics", robots: { index: false, follow: false } };
const format = (value: number | undefined) => value === undefined ? "—" : value.toLocaleString("en-US");

function Table({ title, rows, first = "Page", metric = "Views", unique = "Visitors" }: { title: string; rows: TrafficRow[]; first?: string; metric?: string; unique?: string }) {
  return <section className={styles.panel}><h3>{title}</h3>{rows.length ? <div className={styles.scroll}><table><thead><tr><th>{first}</th><th>{metric}</th><th>{unique}</th></tr></thead><tbody>{rows.map((row, index) => <tr key={index}><td>{row.label}</td><td>{format(row.views)}</td><td>{format(row.visitors)}</td></tr>)}</tbody></table></div> : <p>No data returned for this report.</p>}</section>;
}
function Metric({ label, value }: { label: string; value: number | undefined }) {
  return <div className={styles.metric}><dt>{label}</dt><dd>{format(value)}</dd></div>;
}
function Website({ source }: { source: Source }) {
  if (!source.report) return <p role="status" className={styles.notice}>{source.error}</p>;
  const report = source.report;
  return <><p>{report.status}. Today is partial; group visitor counts are not additive.</p><div className={styles.grid}>
    <Table title="Visitors over time" rows={report.trend} first="UTC day" metric="Page views" />
    <Table title="Top pages" rows={report.pages} metric="Page views" />
    <Table title="Top referrers" rows={report.referrers} first="Referrer" metric="Page views" />
    <Table title="Visitor countries" rows={report.countries} first="Country (ISO code)" metric="Page views" />
  </div></>;
}
function GitHub({ source }: { source: Source }) {
  if (!source.report) return <p role="status" className={styles.notice}>{source.error}</p>;
  const report = source.report;
  return <><dl className={styles.metrics}><Metric label="Repository views" value={report.totals.views} /><Metric label="Unique visitors" value={report.totals.visitors} /><Metric label="Clones" value={report.clones?.views} /><Metric label="Unique cloners" value={report.clones?.visitors} /></dl>
    <div className={styles.grid}><Table title="Views over time" rows={report.trend} first="UTC day" unique="Unique visitors" /><Table title="Clones over time" rows={report.cloneTrend ?? []} first="UTC day" metric="Clones" unique="Unique cloners" /><Table title="Top referrers" rows={report.referrers} first="Referrer" unique="Unique visitors" /><Table title="Popular repository content" rows={report.pages} unique="Unique visitors" /></div></>;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string | string[] }> }) {
  // Check again at the data boundary, independently of Proxy.
  if (adminAuth((await headers()).get("authorization")) !== "ok") notFound();
  const days = websiteDays((await searchParams).days);
  const [website, github] = await Promise.all([loadVercel(days), loadGitHub()]);
  return <main className={styles.dashboard}><header><p className={styles.eyebrow}>Private · Site owner</p><h1>Analytics</h1><p>Read-only website and repository traffic. Data is requested live; no snapshots are stored.</p></header>
    <h2>Overview</h2><p>Website: {days ?? "unsupported"} days, including today (UTC). GitHub: trailing 14 days.</p>
    <dl className={styles.metrics}><Metric label="Website visitors" value={website.report?.totals.visitors} /><Metric label="Website page views" value={website.report?.totals.views} /><Metric label="GitHub visitors" value={github.report?.totals.visitors} /><Metric label="GitHub views" value={github.report?.totals.views} /></dl>
    <section aria-labelledby="website-heading"><h2 id="website-heading">Website</h2><form method="get" className={styles.range}><label htmlFor="days">Website range</label><select id="days" name="days" defaultValue={days ?? 7}><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select><button type="submit">Apply</button></form><p>Vercel Web Analytics · production only · availability depends on your account reporting window.</p><Website source={website} /></section>
    <section aria-labelledby="github-heading"><h2 id="github-heading">GitHub</h2><p>GitHub retains traffic for the trailing 14 days only. Referrers and popular content use that same fixed window; a 30-day repository report is unavailable. Unique totals come directly from GitHub.</p><GitHub source={github} /></section>
    <footer className={styles.privacy}><p>Privacy: country aggregates only. No raw IP addresses, fingerprinting, session replay, tracking cookies or historical snapshots are collected by this dashboard.</p><p>Unavailable values appear as —. Empty tables mean no rows were returned, not a reconstructed history.</p></footer>
  </main>;
}
