import type { Metadata } from "next";
import Link from "next/link";
import { getCompanyIndex } from "../../data/company-intelligence-adapter";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";
import { CompanyDirectory } from "./company-filters";
import styles from "./companies.module.css";

export const metadata: Metadata = {
  title: "Company Intelligence",
  description: "Explore source-backed company developments retained by FOWT Digest.",
};

export default function CompaniesPage() {
  return (
    <main>
      <div className={styles.content}>
        <header className={styles.intro}>
          <Link href="/industry#industry-catalogue"><Copy en="Industry directory" zh="产业目录" /></Link>
          <h1><Copy en="Company Intelligence" zh="企业动态" /></h1>
          <p><Copy en="Explore the Industry catalogue by company and find source-backed offshore and floating wind developments retained by FOWT Digest." zh="按企业浏览产业目录，查看 FOWT Digest 收录的、有来源依据的海上风电与浮式风电相关动态。" /></p>
        </header>
        <CompanyDirectory companies={getCompanyIndex()} />
      </div>
    </main>
  );
}
