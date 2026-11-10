"use client";

import { createElement, type ReactNode } from "react";
import { useLanguage } from "./language-context";
import { translateContentText } from "./render-content";

export function LocalizedElement({ tag, attributes, children }: {
  tag: string;
  attributes: Record<string, unknown>;
  children?: ReactNode;
}) {
  const { language } = useLanguage();
  const localized = { ...attributes };
  for (const key of ["aria-label", "placeholder"]) {
    if (typeof localized[key] === "string") localized[key] = translateContentText(localized[key], language);
  }
  if (localized.lang === "en" && language === "zh") localized.lang = "zh-CN";
  return createElement(tag, localized, children);
}
