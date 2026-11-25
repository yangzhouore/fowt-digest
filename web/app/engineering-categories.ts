import type { EngineeringBriefingItem } from "../data/engineering-briefing-adapter";

export const categories: Record<EngineeringBriefingItem["category"], { en: string; zh: string }> = {
  project: { en: "Project", zh: "项目" },
  policy: { en: "Policy", zh: "政策" },
  technology: { en: "Technology", zh: "技术" },
  software: { en: "Software", zh: "软件" },
  standards: { en: "Standards", zh: "标准" },
  supply_chain: { en: "Supply chain", zh: "供应链" },
  event: { en: "Event", zh: "活动" },
};
