import type {
  PriceBand,
  ProductPlaceholder,
  ProjectInput,
  SiteType,
} from "@/lib/domain/tender";
import {
  resolveEquipmentFocus,
  type EquipmentFocus,
  type StudioFocus,
  type StudioFocusAllocation,
} from "@/lib/product-engine/configuration-strategy";

/**
 * Quantity semantics for per-user templates.
 * - legacy-v1: ceil(users / perUserDivisor × area / 120) — Quotes without a marker.
 * - per-user-v2: ceil(users / perUserDivisor) — every Quote generated after C.0.
 */
export const QUANTITY_MODEL_LEGACY_V1 = "legacy-v1" as const;
export const QUANTITY_MODEL_PER_USER_V2 = "per-user-v2" as const;
export type QuantityModel =
  | typeof QUANTITY_MODEL_LEGACY_V1
  | typeof QUANTITY_MODEL_PER_USER_V2;

export type BuildPlaceholdersOptions = {
  /** Defaults to per-user-v2; Quote-scoped callers must pass the Quote's own model. */
  quantityModel?: QuantityModel;
};

/** Reads `Quote.content.quantityModel`; a missing or unknown marker means legacy-v1. */
export function resolveQuoteQuantityModel(content: unknown): QuantityModel {
  if (content && typeof content === "object") {
    const marker = (content as { quantityModel?: unknown }).quantityModel;
    if (marker === QUANTITY_MODEL_PER_USER_V2) return QUANTITY_MODEL_PER_USER_V2;
  }
  return QUANTITY_MODEL_LEGACY_V1;
}

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

type StudioTemplate = {
  category: string;
  subCategory: string;
  specTags: string[];
  priceBand: PriceBand;
  unit: string;
  /** Floor area per unit inside the focus zone, incl. spacing. */
  m2PerUnit: number;
  /** Area unknown: conservative base quantity by focus role. */
  baseQuantity: Record<StudioFocusAllocation["role"], number>;
  minQuantity: number;
  maxQuantity: number;
  recommendationReason: string;
};

const STUDIO_TEMPLATES: Record<StudioFocus, StudioTemplate> = {
  pilates: {
    category: "普拉提设备",
    subCategory: "普拉提核心床（Reformer）",
    specTags: ["商用级", "弹簧阻力可调", "静音滑轨", "可调脚杆与肩托"],
    priceBand: "mid",
    unit: "台",
    m2PerUnit: 6,
    baseQuantity: { primary: 4, secondary: 2 },
    minQuantity: 2,
    maxQuantity: 12,
    recommendationReason: "用于核心、体态与低冲击力量训练，适合小班课与私教场景。",
  },
  yoga: {
    category: "瑜伽垫上设备",
    subCategory: "瑜伽垫与辅具套装（瑜伽垫/瑜伽砖/伸展带）",
    specTags: ["防滑", "高回弹", "易清洁", "可收纳"],
    priceBand: "low",
    unit: "套",
    m2PerUnit: 2.5,
    baseQuantity: { primary: 12, secondary: 6 },
    minQuantity: 6,
    maxQuantity: 30,
    recommendationReason: "用于瑜伽、垫上训练与拉伸，按垫位配置。",
  },
  functional: {
    category: "功能训练设备",
    subCategory: "功能训练架与小器械组合（壶铃/药球/战绳/训练垫）",
    specTags: ["商用级", "模块化", "多人共享", "开放地面适配"],
    priceBand: "mid",
    unit: "套",
    m2PerUnit: 25,
    baseQuantity: { primary: 2, secondary: 1 },
    minQuantity: 1,
    maxQuantity: 6,
    recommendationReason: "用于功能性与体能训练，配合开放训练地面使用。",
  },
};

function clampQuantity(quantity: number, min?: number, max?: number): number {
  let value = Math.max(1, Math.round(quantity));
  if (typeof min === "number") value = Math.max(min, value);
  if (typeof max === "number") value = Math.min(max, value);
  return value;
}

function knownTargetUsers(input: ProjectInput): number | undefined {
  return typeof input.targetUsers === "number" && input.targetUsers > 0
    ? input.targetUsers
    : undefined;
}

function knownAreaM2(input: ProjectInput): number | undefined {
  return typeof input.areaM2 === "number" && input.areaM2 > 0 ? input.areaM2 : undefined;
}

/** Cardio / strength that is not itself a primary focus while a studio focus is. */
function isCompressedByStudio(template: Template, focus: EquipmentFocus): boolean {
  if (!focus.studioPrimary) return false;
  if (template.category === "有氧设备") return !focus.primary.includes("cardio");
  if (template.category === "力量设备") return !focus.strengthPrimary;
  return false;
}

function estimateQuantity(
  template: Template,
  input: ProjectInput,
  focus: EquipmentFocus,
  quantityModel: QuantityModel,
): number {
  const targetUsers = knownTargetUsers(input);
  const knownArea = knownAreaM2(input);
  const areaScale =
    quantityModel === QUANTITY_MODEL_LEGACY_V1 && knownArea != null ? knownArea / 120 : 1;
  // Unknown headcount: conservative template base quantity, never a default headcount.
  const userFactor =
    template.perUserDivisor && targetUsers != null
      ? Math.ceil((targetUsers / template.perUserDivisor) * areaScale)
      : template.baseQuantity;

  let raw = Math.max(template.baseQuantity, userFactor);

  if (focus.strengthPrimary) {
    if (template.category === "有氧设备") {
      raw = Math.max(1, Math.round(raw * 0.65));
    } else if (template.category === "力量设备") {
      raw = Math.max(template.baseQuantity, Math.round(raw * 1.45));
    }
  } else if (focus.cardioPrimary) {
    if (template.category === "有氧设备") {
      raw = Math.max(template.baseQuantity, Math.round(raw * 1.45));
    } else if (template.category === "力量设备") {
      raw = Math.max(1, Math.round(raw * 0.65));
    }
  }

  if (isCompressedByStudio(template, focus)) {
    // Template minimums assume cardio / strength is the main floor; not here.
    return clampQuantity(Math.max(1, Math.round(raw * 0.5)), undefined, template.maxQuantity);
  }

  return clampQuantity(raw, template.minQuantity, template.maxQuantity);
}

type PlaceholderRow = Pick<
  ProductPlaceholder,
  "category" | "subCategory" | "specTags" | "quantity" | "priceBand" | "recommendationReason"
>;

function buildStudioRow(
  allocation: StudioFocusAllocation,
  input: ProjectInput,
): PlaceholderRow {
  const tpl = STUDIO_TEMPLATES[allocation.focus];
  const area = knownAreaM2(input);
  const roleText =
    allocation.role === "primary"
      ? `按客户以${allocation.label}为主的要求配置。`
      : `按客户${allocation.label}需求少量配置。`;
  let quantity: number;
  let sizing: string;
  if (area != null) {
    const zoneArea = Math.round((area * allocation.sharePct) / 100);
    const raw = Math.floor(zoneArea / tpl.m2PerUnit);
    quantity = clampQuantity(raw, tpl.minQuantity, tpl.maxQuantity);
    sizing = `按${allocation.zone}约 ${zoneArea}㎡（总面积 ${area}㎡ × ${allocation.sharePct}%）、约 ${tpl.m2PerUnit}㎡/${tpl.unit}估算`;
    if (quantity > raw) {
      sizing += `，按最低配置 ${tpl.minQuantity} ${tpl.unit}，需确认场地可容纳`;
    } else if (quantity < raw) {
      sizing += `，按单项上限 ${tpl.maxQuantity} ${tpl.unit}配置`;
    }
    sizing += "。";
  } else {
    quantity = clampQuantity(tpl.baseQuantity[allocation.role], tpl.minQuantity, tpl.maxQuantity);
    sizing = "（面积待确认：数量按基础配置暂估，确认面积后按分区调整）";
  }
  return {
    category: tpl.category,
    subCategory: tpl.subCategory,
    specTags: tpl.specTags,
    quantity,
    priceBand: tpl.priceBand,
    recommendationReason: `${tpl.recommendationReason} ${roleText}${sizing}`,
  };
}

function focusAdjustmentReason(template: Template, focus: EquipmentFocus): string | null {
  if (focus.strengthPrimary && template.category === "力量设备") {
    return "按客户偏重力量器械要求提高配置占比。";
  }
  if (focus.strengthPrimary && template.category === "有氧设备") {
    return "按力量优先配置相应压缩有氧规模。";
  }
  if (isCompressedByStudio(template, focus)) {
    const labels = focus.studio
      .filter((s) => s.role === "primary")
      .map((s) => s.label)
      .join("、");
    return `按${labels}为主的配置压缩为基础补充。`;
  }
  if (focus.cardioPrimary && template.category === "有氧设备") {
    return "按客户有氧优先要求提高配置占比。";
  }
  if (focus.cardioPrimary && template.category === "力量设备") {
    return "按有氧优先配置相应压缩力量规模。";
  }
  return null;
}

export function buildPlaceholders(
  projectId: string,
  input: ProjectInput,
  options: BuildPlaceholdersOptions = {},
): ProductPlaceholder[] {
  const quantityModel = options.quantityModel ?? QUANTITY_MODEL_PER_USER_V2;
  const now = new Date().toISOString();
  const focus = resolveEquipmentFocus(input.notes);
  const headcountUnknown = knownTargetUsers(input) == null;
  // Strength as a non-primary item does not get a large free-weight zone.
  const dropFreeWeight = focus.studioPrimary && !focus.strengthPrimary;

  const rows: PlaceholderRow[] = [];
  for (const tpl of TEMPLATE_POOL) {
    if (tpl.siteTypes && !tpl.siteTypes.includes(input.siteType)) continue;
    if (dropFreeWeight && tpl.subCategory === "自由力量区设备") continue;
    const quantity = estimateQuantity(tpl, input, focus, quantityModel);
    const adjustment = focusAdjustmentReason(tpl, focus);
    const baseReason = adjustment
      ? `${tpl.recommendationReason} ${adjustment}`
      : tpl.recommendationReason;
    const recommendationReason =
      headcountUnknown && tpl.perUserDivisor
        ? `${baseReason}（人数待确认：数量按基础配置暂估，确认人数后调整）`
        : baseReason;
    rows.push({
      category: tpl.category,
      subCategory: tpl.subCategory,
      specTags: tpl.specTags,
      quantity,
      priceBand: tpl.priceBand,
      recommendationReason,
    });
  }

  let insertAt = 0;
  rows.forEach((row, i) => {
    if (row.category === "有氧设备" || row.category === "力量设备") insertAt = i + 1;
  });
  rows.splice(insertAt, 0, ...focus.studio.map((s) => buildStudioRow(s, input)));

  return rows.map((row, idx) => ({
    id: `${projectId}-ph-${idx + 1}`,
    projectId,
    ...row,
    replaceable: true,
    createdAt: now,
    updatedAt: now,
  }));
}
