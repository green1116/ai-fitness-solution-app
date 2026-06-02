import type {
  TenderRequirementCategory,
  TenderSection,
} from "@/lib/tender/types";

const CATEGORY_PATTERNS: {
  category: TenderRequirementCategory;
  patterns: RegExp[];
}[] = [
  {
    category: "scoring",
    patterns: [/评分/, /得分/, /满分/, /评标/, /综合评分/, /\d+\s*分/],
  },
  {
    category: "qualification",
    patterns: [/ISO\s*\d+/i, /资质/, /资格/, /信用/, /营业执照/, /业绩/, /证书/],
  },
  {
    category: "attachment",
    patterns: [/附件/, /须提供/, /提交.*复印件/, /检测报告/, /授权书/, /承诺函/],
  },
  {
    category: "commercial",
    patterns: [
      /交付/,
      /工期/,
      /质保/,
      /付款/,
      /报价/,
      /合同/,
      /售后/,
      /天\s*内/,
      /%\s*预付/,
    ],
  },
  {
    category: "technical",
    patterns: [
      /≥|<=|≥|≤|km\/h|kg|mm|cm|m²|平方米/,
      /参数/,
      /规格/,
      /配置/,
      /设备/,
      /技术/,
      /安装/,
    ],
  },
];

const SECTION_CATEGORY_MAP: Record<string, TenderRequirementCategory> = {
  technical: "technical",
  commercial: "commercial",
  qualification: "qualification",
  scoring: "scoring",
  attachment: "attachment",
  notice: "commercial",
  overview: "commercial",
};

function sectionCategoryHint(section: TenderSection | undefined): TenderRequirementCategory | undefined {
  if (!section) return undefined;
  const id = section.id.split("-")[0];
  return SECTION_CATEGORY_MAP[id];
}

/**
 * 自动分类 requirement（规则 + 章节 hint）
 */
export function classifyRequirement(
  text: string,
  section?: TenderSection,
): TenderRequirementCategory {
  const hint = sectionCategoryHint(section);
  const t = text.trim();

  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some((p) => p.test(t))) return category;
  }

  if (hint) return hint;
  return "technical";
}
