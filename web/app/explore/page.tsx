import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedCopy } from "../i18n/localized-copy";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore floating wind through projects, companies, industry, and Digital & AI.",
};

const destinations = [
  { href: "/projects", en: "Projects", zh: "项目",
    description: { en: "Find a project and inspect its status, participants, timeline, and evidence.", zh: "查找项目，了解其状态、参与方、时间线和证据。" } },
  { href: "/companies", en: "Companies", zh: "企业",
    description: { en: "Follow a company's source-backed developments and related projects.", zh: "跟踪有来源依据的企业动态及相关项目。" } },
  { href: "/industry", en: "Industry", zh: "产业",
    description: { en: "Understand supply-chain roles and country context.", zh: "了解供应链角色及各国背景。" } },
  { href: "/digital-ai", en: "Digital & AI", zh: "数字化与 AI",
    description: { en: "Explore practical digital and AI developments connected to offshore wind.", zh: "探索与海上风电相关的数字化与 AI 实践进展。" } },
];

export default function ExplorePage() {
  return (
    <main>
      <section className="intro" aria-labelledby="explore-heading">
        <h1 id="explore-heading"><LocalizedCopy en="Explore floating wind" zh="探索浮式风电" /></h1>
        <ul className="explore-list">
          {destinations.map(({ href, en, zh, description }) => (
            <li key={href}>
              <h2><Link href={href}><LocalizedCopy en={en} zh={zh} /></Link></h2>
              <p><LocalizedCopy {...description} /></p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
