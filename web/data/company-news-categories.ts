export const companyNewsCategories = {
  projects_contracts: { en: "Projects & contracts", zh: "项目与合同" },
  technology_engineering: { en: "Technology & engineering", zh: "技术与工程" },
  digital_ai: { en: "Digital & AI", zh: "数字化与人工智能" },
  manufacturing_supply_chain: { en: "Manufacturing & supply chain", zh: "制造与供应链" },
  corporate_market: { en: "Corporate & market", zh: "企业与市场" },
} as const;

export type CompanyNewsCategory = keyof typeof companyNewsCategories;
