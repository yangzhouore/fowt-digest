export const translations = {
  en: {
    briefing: "Briefing", explore: "Explore", preferences: "Preferences",
    menu: "Menu", exploreNavigation: "Explore navigation", skipToContent: "Skip to content",
    companies: "Companies", industry: "Industry",
    language: "Language", engineering: "Engineering", research: "Research",
    industryMap: "Industry Map", projects: "Projects", digitalAi: "Digital & AI",
    methodology: "Methodology", search: "Search", subscribe: "Subscribe", theme: "Theme", light: "Light", dark: "Dark",
    english: "EN", chinese: "中文", source: "Source", sources: "Sources",
    evidence: "Evidence", clearFilters: "Clear filters", all: "All", primaryNavigation: "Primary navigation",
  },
  zh: {
    briefing: "简报", explore: "探索", preferences: "偏好设置",
    menu: "菜单", exploreNavigation: "探索导航", skipToContent: "跳到正文",
    companies: "企业", industry: "产业",
    language: "语言", engineering: "工程", research: "研究",
    industryMap: "产业图谱", projects: "项目", digitalAi: "数字化与 AI",
    methodology: "方法论", search: "搜索", subscribe: "订阅", theme: "主题", light: "浅色", dark: "深色",
    english: "EN", chinese: "中文", source: "来源", sources: "来源",
    evidence: "证据", clearFilters: "清除筛选", all: "全部", primaryNavigation: "主导航",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function translate(language: Language, key: TranslationKey): string {
  return translations[language][key];
}
