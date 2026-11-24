import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "./subscribe.module.css";

export const metadata: Metadata = { title: "Subscribe", referrer: "no-referrer" };

export default function SubscribeLayout({ children }: { children: ReactNode }) {
  return <main><div className={styles.content}>{children}</div></main>;
}
