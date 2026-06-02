import type { ScoreMappingRow } from "@/lib/pdf/tender/types";
import type {
  TenderAttachmentRefItem,
  TenderAttachmentRefKey,
  TenderAttachmentRefMap,
} from "@/lib/pdf/tender/refs/attachmentRefs";
import type { TenderSectionPageRefs } from "@/lib/pdf/tender/refs/pageRefs";

export type TenderScoreMappingSectionKey = keyof TenderSectionPageRefs;

export type TenderScoreMappingRow = {
  scoreId?: string;
  scoreItem: string;
  responseSection: string;
  responseSectionKey?: TenderScoreMappingSectionKey;
  responseRefIds?: string[];
  evidence: string;
  evidenceAttachmentKeys?: TenderAttachmentRefKey[];
  risk: string;
};

function safeStr(v: unknown) {
  return String(v || "").trim();
}

function uniqStrings(arr: Array<string | undefined | null>) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    const s = String(item || "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function normalizeRefId(v: string) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[\u3000\s]+/g, "")
    .replace(/－/g, "-");
}

/** 评分项第一列标题化，避免把招标文件原文整段搬进评分对照页 */
function normalizeScoreTitle(raw: string) {
  const s = safeStr(raw);

  if (!s) return "评分项";

  if (/评标|评分法|综合评分法|评标细则|总分/.test(s)) {
    return "评标方法与评分规则";
  }
  if (/报价|价格|预算|金额|计分公式|报价得分/.test(s)) {
    return "报价与价格评审";
  }
  if (/技术|参数|设备|功能|配置|核心产品/.test(s)) {
    return "技术参数响应程度";
  }
  if (/商务|条款|合同|付款|履约/.test(s)) {
    return "商务条款响应程度";
  }
  if (/实施|进度|交付|方案/.test(s)) {
    return "实施方案与交付能力";
  }
  if (/售后|服务|维保|培训/.test(s)) {
    return "售后服务与运维保障";
  }
  if (/资质|业绩|案例|团队|履约能力/.test(s)) {
    return "企业资质与履约能力";
  }

  return s.length > 26 ? `${s.slice(0, 26)}...` : s;
}

/** 按标题归一化结果纠偏归因，避免泛价格匹配把各项都打进预算 */
function refineByScoreTitle(title: string): {
  responseSectionKey?: TenderScoreMappingSectionKey;
  responseSection?: string;
  responseRefIds?: string[];
} | null {
  const s = safeStr(title);

  // ===== 价格类（最明确）=====
  if (/报价与价格评审|价格评审|报价评分/.test(s)) {
    return {
      responseSectionKey: "budget",
      responseSection: "预算与报价",
      responseRefIds: ["A-10"],
    };
  }

  // ===== 商务类 =====
  if (/商务条款响应程度|商务响应/.test(s)) {
    return {
      responseSectionKey: "businessResponse",
      responseSection: "商务条款响应表",
      responseRefIds: ["B-01", "B-02"],
    };
  }

  // ===== 技术类（补回来！）=====
  if (/技术参数响应程度|技术评审|设备配置/.test(s)) {
    return {
      responseSectionKey: "technicalResponse",
      responseSection: "技术响应表",
      responseRefIds: ["T-01", "T-02", "T-03"],
    };
  }

  // ===== 资质类 =====
  if (/企业资质与履约能力/.test(s)) {
    return {
      responseSectionKey: "attachmentIndex",
      responseSection: "附件索引",
      responseRefIds: ["A-01", "A-02", "A-06"],
    };
  }

  // ===== 售后类 =====
  if (/售后服务与运维保障/.test(s)) {
    return {
      responseSectionKey: "businessResponse",
      responseSection: "商务条款响应表",
      responseRefIds: ["B-20", "B-22", "B-25"],
    };
  }

  // ===== 方案类（关键修复）=====
  if (/评标方法与评分规则|实施方案|交付能力/.test(s)) {
    return {
      responseSectionKey: "plan",
      responseSection: "建设方案",
      responseRefIds: ["A-08"],
    };
  }

  return null;
}

function sectionLabelFromKey(
  key?: TenderScoreMappingSectionKey,
  fallback?: string
): string {
  switch (key) {
    case "businessResponse":
      return "商务条款响应表";
    case "technicalResponse":
      return "技术响应表";
    case "businessDeviation":
      return "商务偏离表";
    case "technicalDeviation":
      return "技术偏离表";
    case "score":
      return "评分项对照页";
    case "attachmentIndex":
      return "附件索引";
    case "plan":
      return "建设方案";
    case "budget":
      return "预算与报价";
    case "conclusion":
      return "商务说明";
    default:
      return safeStr(fallback) || "-";
  }
}

function pageOfSectionKey(
  key: TenderScoreMappingSectionKey | undefined,
  refs?: TenderSectionPageRefs
): number | undefined {
  if (!key || !refs) return undefined;
  const pageNo = refs[key];
  return typeof pageNo === "number" && Number.isFinite(pageNo) && pageNo > 0
    ? pageNo
    : undefined;
}

function parseRefKind(refId: string): "T" | "B" | "A" | "S" | "" {
  const norm = normalizeRefId(refId);
  if (/^T-\d{2,3}$/.test(norm)) return "T";
  if (/^B-\d{2,3}$/.test(norm)) return "B";
  if (/^A-\d{2,3}$/.test(norm)) return "A";
  if (/^S-\d{2,3}$/.test(norm)) return "S";
  return "";
}

function inferSectionFromRefIds(
  refIds: string[],
  preciseRefPageMap?: Record<string, number>,
  refs?: TenderSectionPageRefs
): { label: string; page?: number } | null {
  const clean = uniqStrings(refIds.map(normalizeRefId));
  if (!clean.length) return null;

  const techRefs = clean.filter((x) => parseRefKind(x) === "T");
  if (techRefs.length) {
    const precisePage = techRefs
      .map((x) => preciseRefPageMap?.[x])
      .find((x) => typeof x === "number");
    return {
      label: "技术响应表",
      page:
        (typeof precisePage === "number" ? precisePage : undefined) ??
        pageOfSectionKey("technicalResponse", refs),
    };
  }

  const bizRefs = clean.filter((x) => parseRefKind(x) === "B");
  if (bizRefs.length) {
    const precisePage = bizRefs
      .map((x) => preciseRefPageMap?.[x])
      .find((x) => typeof x === "number");
    return {
      label: "商务条款响应表",
      page:
        (typeof precisePage === "number" ? precisePage : undefined) ??
        pageOfSectionKey("businessResponse", refs),
    };
  }

  const attachmentRefs = clean.filter((x) => parseRefKind(x) === "A");
  if (attachmentRefs.length) {
    const precisePage = attachmentRefs
      .map((x) => preciseRefPageMap?.[x])
      .find((x) => typeof x === "number");
    return {
      label: "附件索引",
      page:
        (typeof precisePage === "number" ? precisePage : undefined) ??
        pageOfSectionKey("attachmentIndex", refs),
    };
  }

  const scoreRefs = clean.filter((x) => parseRefKind(x) === "S");
  if (scoreRefs.length) {
    const precisePage = scoreRefs
      .map((x) => preciseRefPageMap?.[x])
      .find((x) => typeof x === "number");
    return {
      label: "评分项对照页",
      page:
        (typeof precisePage === "number" ? precisePage : undefined) ??
        pageOfSectionKey("score", refs),
    };
  }

  return null;
}

export function formatSectionWithPage(
  row: TenderScoreMappingRow,
  refs?: TenderSectionPageRefs
) {
  const label = sectionLabelFromKey(row.responseSectionKey, row.responseSection);
  const pageNo = pageOfSectionKey(row.responseSectionKey, refs);
  if (!pageNo) return label;
  return `${label}（第 ${pageNo} 页）`;
}

export function formatSectionWithPageAndRefs(
  row: TenderScoreMappingRow,
  refs?: TenderSectionPageRefs,
  preciseRefPageMap?: Record<string, number>
) {
  const cleanRefIds = uniqStrings((row.responseRefIds || []).map(normalizeRefId)).slice(0, 3);

  // 价格类：主章节为「预算与报价」，不以 A-xx 反推为「附件索引」
  if (row.responseSectionKey === "budget" && cleanRefIds.length) {
    const primaryLabel = sectionLabelFromKey("budget", row.responseSection);
    const primaryPage = pageOfSectionKey("budget", refs);
    const refText = cleanRefIds.join("、");
    if (primaryPage && refText) {
      return `${primaryLabel}（第 ${primaryPage} 页） / ${refText}`;
    }
    if (primaryPage) {
      return `${primaryLabel}（第 ${primaryPage} 页）`;
    }
    if (refText) {
      return `${primaryLabel} / ${refText}`;
    }
    return primaryLabel;
  }

  const inferred = inferSectionFromRefIds(cleanRefIds, preciseRefPageMap, refs);
  const fallbackLabel = sectionLabelFromKey(
    row.responseSectionKey,
    row.responseSection
  );
  const fallbackPage = pageOfSectionKey(row.responseSectionKey, refs);

  const primaryLabel = inferred?.label || fallbackLabel || "-";
  const primaryPage = inferred?.page ?? fallbackPage;
  const refText = cleanRefIds.join("、");

  if (primaryPage && refText) {
    return `${primaryLabel}（第 ${primaryPage} 页） / ${refText}`;
  }
  if (primaryPage) {
    return `${primaryLabel}（第 ${primaryPage} 页）`;
  }
  if (refText) {
    return `${primaryLabel} / ${refText}`;
  }
  return primaryLabel;
}

export function buildDefaultTenderScoreMappings(): TenderScoreMappingRow[] {
  return [
    {
      scoreItem: "项目理解与总体实施方案",
      responseSection: "建设方案",
      responseSectionKey: "plan",
      evidence: "项目实施方案、建设思路、空间规划说明",
      evidenceAttachmentKeys: ["delivery_plan"],
      risk: "如实施路径不够具体，可能影响方案分。",
    },
    {
      scoreItem: "设备配置合理性与适配性",
      responseSection: "预算与报价",
      responseSectionKey: "budget",
      evidence: "设备清单、品牌参数、配置逻辑说明",
      evidenceAttachmentKeys: [
        "product_datasheet",
        "product_brochure",
        "price_detail",
      ],
      risk: "如参数映射不充分，可能被认定为配置依据不足。",
    },
    {
      scoreItem: "技术参数响应程度",
      responseSection: "技术响应表",
      responseSectionKey: "technicalResponse",
      responseRefIds: ["T-01", "T-02", "T-03"],
      evidence: "技术响应表、参数说明、产品资料",
      evidenceAttachmentKeys: ["product_datasheet", "test_report"],
      risk: "存在待确认或偏离项时，需重点补充佐证。",
    },
    {
      scoreItem: "商务条款响应程度",
      responseSection: "商务条款响应表",
      responseSectionKey: "businessResponse",
      responseRefIds: ["B-01", "B-02"],
      evidence: "商务响应表、服务承诺、交付与售后说明",
      evidenceAttachmentKeys: ["service_commitment", "delivery_plan"],
      risk: "商务条款表述不完整时，可能影响符合性判断。",
    },
    {
      scoreItem: "实施进度与交付保障",
      responseSection: "建设方案",
      responseSectionKey: "plan",
      evidence: "进度计划、阶段安排、交付节点说明",
      evidenceAttachmentKeys: ["delivery_plan"],
      risk: "如缺少明确节点，可能影响履约可信度。",
    },
    {
      scoreItem: "售后服务与运维保障",
      responseSection: "商务条款响应表",
      responseSectionKey: "businessResponse",
      responseRefIds: ["B-03"],
      evidence: "售后承诺、服务机制、质保与维保说明",
      evidenceAttachmentKeys: ["service_commitment"],
      risk: "售后响应机制不明确时，容易失分。",
    },
    {
      scoreItem: "企业资质与履约能力",
      responseSection: "附件索引",
      responseSectionKey: "attachmentIndex",
      evidence: "营业执照、资质证书、业绩材料、团队说明",
      evidenceAttachmentKeys: [
        "business_license",
        "qualification_cert",
        "project_cases",
        "team_resume",
      ],
      risk: "如附件索引未建立完整，评审查找成本较高。",
    },
    {
      scoreItem: "报价完整性与预算逻辑",
      responseSection: "预算与报价",
      responseSectionKey: "budget",
      evidence: "预算明细、报价口径说明、价格条件说明",
      evidenceAttachmentKeys: ["price_detail"],
      risk: "预算口径不清或边界不明，可能影响价格评审。",
    },
  ];
}

/** 将规则匹配生成的评分对照行映射为 V2 四列表结构 */
export function mapScoreMappingToTenderRow(
  r: ScoreMappingRow
): TenderScoreMappingRow {
  const blob = `${r.scoreItem} ${r.criteria} ${r.responseSummary} ${r.proof}`;
  const scoreTitle = normalizeScoreTitle(r.scoreItem);

  const refined = refineByScoreTitle(scoreTitle);
  if (refined) {
    const evidenceAttachmentKeys = inferAttachmentKeys(blob);
    const evidence = "";
    const risk =
      r.note === "low-confidence"
        ? "该评分项与方案条目对应关系较弱，建议重点核查响应表、偏离表及证明材料。"
        : "请关注是否存在待确认或偏离项，并结合附件索引与正式投标附件综合审阅。";

    return {
      scoreItem: scoreTitle,
      responseSection: refined.responseSection || "建设方案",
      responseSectionKey: refined.responseSectionKey,
      responseRefIds: refined.responseRefIds,
      evidence,
      evidenceAttachmentKeys,
      risk,
    };
  }

  const hasTech =
    /技术|参数|设备|功能|配置|系统|核心产品|检测|第三方检测|技术条款/.test(blob);
  const hasBiz =
    /商务|付款|交付|售后|服务|合同|履约|培训|维保|质保/.test(blob);
  const hasQual =
    /资质|业绩|案例|附件|证明|证书|营业执照|团队|履约能力/.test(blob);
  const hasPlan = /实施|进度|方案|建设|交付计划|项目理解/.test(blob);

  const isPriceStrong =
    /报价得分|价格得分|计分公式|报价评分|价格评分|报价完整性|预算逻辑/.test(
      blob
    ) || /报价与价格评审/.test(scoreTitle);

  const isRuleStrong =
    /评标方法|评分规则|综合评分法|评标细则|总分100|详细评审/.test(blob) ||
    /评标方法与评分规则/.test(scoreTitle);

  let responseSectionKey: TenderScoreMappingSectionKey | undefined = "plan";
  let responseSection = "建设方案";
  let responseRefIds: string[] | undefined;

  // 先做「强匹配」，避免被价格类泛吃掉
  if (isPriceStrong) {
    responseSectionKey = "budget";
    responseSection = "预算与报价";
    responseRefIds = ["A-10"];
  } else if (isRuleStrong) {
    responseSectionKey = "plan";
    responseSection = "建设方案";
    responseRefIds = ["A-08"];
  } else if (hasTech && !hasBiz) {
    responseSectionKey = "technicalResponse";
    responseSection = "技术响应表";
    responseRefIds = ["T-01", "T-02", "T-03"];
  } else if (hasBiz && !hasTech) {
    responseSectionKey = "businessResponse";
    responseSection = "商务条款响应表";
    responseRefIds = ["B-01", "B-02", "B-03"];
  } else if (hasQual) {
    responseSectionKey = "attachmentIndex";
    responseSection = "附件索引";
    responseRefIds = ["A-01", "A-02", "A-06"];
  } else if (hasPlan) {
    responseSectionKey = "plan";
    responseSection = "建设方案";
    responseRefIds = ["A-08"];
  } else if (hasTech) {
    responseSectionKey = "technicalResponse";
    responseSection = "技术响应表";
    responseRefIds = ["T-01", "T-02"];
  } else if (hasBiz) {
    responseSectionKey = "businessResponse";
    responseSection = "商务条款响应表";
    responseRefIds = ["B-01", "B-02"];
  }

  const evidenceAttachmentKeys = inferAttachmentKeys(blob);
  const evidence = "";

  const risk =
    r.note === "low-confidence"
      ? "该评分项与方案条目对应关系较弱，建议重点核查响应表、偏离表及证明材料。"
      : "请关注是否存在待确认或偏离项，并结合附件索引与正式投标附件综合审阅。";

  return {
    scoreItem: scoreTitle,
    responseSection,
    responseSectionKey,
    responseRefIds,
    evidence,
    evidenceAttachmentKeys,
    risk,
  };
}

export function formatEvidenceWithAttachments(
  row: TenderScoreMappingRow,
  attachmentRefs?: TenderAttachmentRefMap
) {
  const keys = row.evidenceAttachmentKeys || [];
  if (!keys.length || !attachmentRefs) {
    return safeStr(row.evidence) || "-";
  }

  const refs: TenderAttachmentRefItem[] = keys
    .map((key) => attachmentRefs[key])
    .filter(Boolean) as TenderAttachmentRefItem[];

  if (!refs.length) {
    return safeStr(row.evidence) || "-";
  }

  const refText = refs.map((item) => `${item.code}：${item.name}`).join("；");
  return `建议查阅：${refText}`;
}

function inferAttachmentKeys(blob: string): TenderAttachmentRefKey[] {
  const keys: TenderAttachmentRefKey[] = [];
  if (/营业执照/.test(blob)) keys.push("business_license");
  if (/资质|证书/.test(blob)) keys.push("qualification_cert");
  if (/参数|技术|设备|配置/.test(blob)) keys.push("product_datasheet");
  if (/彩页|样册|手册/.test(blob)) keys.push("product_brochure");
  if (/检测|测试|第三方/.test(blob)) keys.push("test_report");
  if (/业绩|案例/.test(blob)) keys.push("project_cases");
  if (/售后|维保|服务承诺/.test(blob)) keys.push("service_commitment");
  if (/交付|进度|实施/.test(blob)) keys.push("delivery_plan");
  if (/团队|人员|项目经理/.test(blob)) keys.push("team_resume");
  if (/报价|预算|价格|金额/.test(blob)) keys.push("price_detail");
  return Array.from(new Set(keys));
}

export const SCORE_MAPPING_PAGE_SUBTITLE =
  "本页用于建立评审关注点与本投标文件主要响应内容之间的对应关系，便于快速查阅与复核。";

export const SCORE_MAPPING_PAGE_FOOTNOTE =
  "说明：建议结合技术响应表、商务条款响应表、偏离表及附件索引进行综合审阅。";