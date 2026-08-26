export const translations = {
  en: {
    language: "Language", engineering: "Engineering", research: "Research",
    industryMap: "Industry Map", projects: "Projects", digitalAi: "Digital & AI",
    methodology: "Methodology", theme: "Theme", light: "Light", dark: "Dark",
    english: "EN", chinese: "中文", source: "Source", sources: "Sources",
    evidence: "Evidence", clearFilters: "Clear filters", all: "All", primaryNavigation: "Primary navigation",
  },
  zh: {
    language: "语言", engineering: "工程", research: "研究",
    industryMap: "产业图谱", projects: "项目", digitalAi: "数字化与 AI",
    methodology: "方法论", theme: "主题", light: "浅色", dark: "深色",
    english: "EN", chinese: "中文", source: "来源", sources: "来源",
    evidence: "证据", clearFilters: "清除筛选", all: "全部", primaryNavigation: "主导航",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function translate(language: Language, key: TranslationKey): string {
  return translations[language][key];
}
