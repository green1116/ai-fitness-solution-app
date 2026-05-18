import type {
  PriceBand,
  ProductPlaceholder,
  ProjectInput,
  SiteType,
} from "@/lib/domain/tender";

type Template = {
  category: string;
  subCategory: string;
  specTags: string[];
  priceBand: PriceBand;
  baseQuantity: number;
  perUserDivisor?: number;
  minQuantity?: number;
  maxQuantity?: number;
  siteTypes?: SiteType[];
  recommendationReason: string;
};

const TEMPLATE_POOL: Template[] = [
  {
    category: "有氧设备",
    subCategory: "商业级跑步机",
    specTags: ["商业级", "静音", "持续运行", "高承重"],
    priceBand: "high",
    baseQuantity: 2,
    perUserDivisor: 15,
    minQuantity: 2,
    recommendationReason:
      "适用于企业健身房的高频使用场景，满足长期稳定运维。",
    siteTypes: ["office", "park", "mixed"],
  },
  {
    category: "有氧设备",
    subCategory: "椭圆机",
    specTags: ["商业级", "低冲击", "耐久", "易维护"],
    priceBand: "mid",
    baseQuantity: 2,
    perUserDivisor: 20,
    minQuantity: 1,
    recommendationReason: "适合多用户共享使用，提升有氧训练覆盖率。",
    siteTypes: ["office", "school", "mixed"],
  },
  {
    category: "力量设备",
    subCategory: "综合训练器",
    specTags: ["商业级", "钢结构", "多功能", "易维护"],
    priceBand: "mid",
    baseQuantity: 2,
    perUserDivisor: 18,
    minQuantity: 2,
    recommendationReason: "适合投标采购中标准化配置，兼顾功能与预算。",
    siteTypes: ["office", "factory", "school", "mixed"],
  },
  {
    category: "力量设备",
    subCategory: "自由力量区设备",
    specTags: ["商业级", "高强度", "防滑", "承重优化"],
    priceBand: "high",
    baseQuantity: 1,
    perUserDivisor: 25,
    minQuantity: 1,
    recommendationReason: "用于补足力量训练功能模块，增强方案完整度。",
    siteTypes: ["office", "mixed"],
  },
  {
    category: "智能系统",
    subCategory: "门禁与会员管理系统",
    specTags: ["身份识别", "门禁联动", "数据统计", "远程管理"],
    priceBand: "mid",
    baseQuantity: 1,
    minQuantity: 1,
    maxQuantity: 1,
    recommendationReason: "提高企业健身空间管理效率，适合投标场景。",
    siteTypes: ["office", "factory", "school", "hospital", "mixed"],
  },
  {
    category: "配套家具",
    subCategory: "储物柜",
    specTags: ["企业级", "防潮", "耐用", "易清洁"],
    priceBand: "low",
    baseQuantity: 6,
    perUserDivisor: 10,
    minQuantity: 4,
    recommendationReason: "满足日常储物与配套管理需求，成本可控。",
    siteTypes: ["office", "factory", "school", "hospital", "mixed"],
  },
  {
    category: "配套家具",
    subCategory: "休息与接待家具",
    specTags: ["耐用", "易维护", "统一风格"],
    priceBand: "low",
    baseQuantity: 1,
    minQuantity: 1,
    recommendationReason: "用于提升企业项目的整体商务感与交付完整度。",
    siteTypes: ["office", "mixed", "hospital"],
  },
  {
    category: "配套设施",
    subCategory: "基础辅材与安装附件",
    specTags: ["安装配套", "施工辅材", "标准化交付"],
    priceBand: "low",
    baseQuantity: 1,
    minQuantity: 1,
    recommendationReason: "保证项目具备完整落地条件，避免投标文件空缺。",
    siteTypes: ["office", "factory", "school", "hospital", "park", "mixed"],
  },
];

function clampQuantity(quantity: number, min?: number, max?: number): number {
  let value = Math.max(1, Math.round(quantity));
  if (typeof min === "number") value = Math.max(min, value);
  if (typeof max === "number") value = Math.min(max, value);
  return value;
}

function estimateQuantity(template: Template, input: ProjectInput): number {
  const targetUsers = input.targetUsers ?? 30;
  const areaFactor = input.areaM2
    ? Math.max(1, Math.round(input.areaM2 / 120))
    : 1;
  const userFactor = template.perUserDivisor
    ? Math.ceil(targetUsers / template.perUserDivisor)
    : template.baseQuantity;

  const raw = Math.max(template.baseQuantity, userFactor, areaFactor);
  return clampQuantity(raw, template.minQuantity, template.maxQuantity);
}

export function buildPlaceholders(
  projectId: string,
  input: ProjectInput,
): ProductPlaceholder[] {
  const now = new Date().toISOString();

  return TEMPLATE_POOL.filter(
    (tpl) => !tpl.siteTypes || tpl.siteTypes.includes(input.siteType),
  ).map((tpl, idx) => {
    const quantity = estimateQuantity(tpl, input);

    return {
      id: `${projectId}-ph-${idx + 1}`,
      projectId,
      category: tpl.category,
      subCategory: tpl.subCategory,
      specTags: tpl.specTags,
      quantity,
      priceBand: tpl.priceBand,
      recommendationReason: tpl.recommendationReason,
      replaceable: true,
      createdAt: now,
      updatedAt: now,
    };
  });
}
