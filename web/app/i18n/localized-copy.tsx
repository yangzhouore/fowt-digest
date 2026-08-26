"use client";

import { useLanguage } from "./language-context";

export function LocalizedCopy({ en, zh }: { en: string; zh: string }) {
  const { language } = useLanguage();
  return <>{language === "zh" ? zh : en}</>;
}
