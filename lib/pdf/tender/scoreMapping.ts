import type { ScoreMappingRow } from "@/lib/pdf/tender/types";
import type {
  TenderAttachmentRefItem,
  TenderAttachmentRefKey,
  TenderAttachmentRefMap,
} from "@/lib/pdf/tender/attachmentRefs";
import type { TenderSectionPageRefs } from "@/lib/pdf/tender/pageRefs";
import { formatResponseRefs } from "@/lib/pdf/tender/refFormat";

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

export function formatSectionWithPage(
  row: TenderScoreMappingRow,
  refs?: TenderSectionPageRefs
) {
  const base = String(row.responseSection || "").trim() || "-";
  const key = row.responseSectionKey;
  if (!key || !refs) return base;
  const pageNo = refs[key];
  if (!pageNo || !Number.isFinite(pageNo)) return base;
  return `${base}（第 ${pageNo} 页）`;
}

export function formatSectionWithPageAndRefs(
  row: TenderScoreMappingRow,
  refs?: TenderSectionPageRefs
) {
  const base = formatSectionWithPage(row, refs);
  const refText = formatResponseRefs(row.responseRefIds);
  if (!refText) return base;
  return `${base} / ${refText}`;
}

export function buildDefaultTenderScoreMappings(): TenderScoreMappingRow[] {
  return [
    {
      scoreItem: "项目理解与总体实施方案",
      responseSection: "实施方案",
      responseSectionKey: "plan",
      evidence: "项目实施方案、建设思路、空间规划说明",
      evidenceAttachmentKeys: ["delivery_plan"],
      risk: "如实施路径不够具体，可能影响方案分",
    },
    {
      scoreItem: "设备配置合理性与适配性",
      responseSection: "预算书",
      responseSectionKey: "budget",
      evidence: "设备清单、品牌参数、配置逻辑说明",
      evidenceAttachmentKeys: ["product_datasheet", "product_brochure", "price_detail"],
      risk: "如参数映射不充分，可能被认定为配置依据不足",
    },
    {
      scoreItem: "技术参数响应程度",
      responseSection: "技术响应表",
      responseSectionKey: "technicalResponse",
      responseRefIds: ["T-01", "T-02", "T-03"],
      evidence: "技术响应表、参数说明、产品资料",
      evidenceAttachmentKeys: ["product_datasheet", "test_report"],
      risk: "存在待确认或偏离项时，需重点补充佐证",
    },
    {
      scoreItem: "商务条款响应程度",
      responseSection: "商务条款响应表",
      responseSectionKey: "businessResponse",
      responseRefIds: ["B-01", "B-02"],
      evidence: "商务响应表、服务承诺、交付与售后说明",
      evidenceAttachmentKeys: ["service_commitment", "delivery_plan"],
      risk: "商务条件表述不完整时，可能影响符合性判断",
    },
    {
      scoreItem: "实施进度与交付保障",
      responseSection: "实施方案",
      responseSectionKey: "plan",
      evidence: "进度计划、阶段安排、交付节点说明",
      evidenceAttachmentKeys: ["delivery_plan"],
      risk: "如缺少明确节点，可能影响履约可信度",
    },
    {
      scoreItem: "售后服务与运维保障",
      responseSection: "商务条款响应表",
      responseSectionKey: "businessResponse",
      responseRefIds: ["B-03"],
      evidence: "售后承诺、服务机制、质保与维保说明",
      evidenceAttachmentKeys: ["service_commitment"],
      risk: "售后响应机制不明确时，容易丢分",
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
      risk: "如附件索引未建立完整，评审查找成本高",
    },
    {
      scoreItem: "报价完整性与预算逻辑",
      responseSection: "预算书",
      responseSectionKey: "budget",
      evidence: "预算明细、报价口径说明、价格条件说明",
      evidenceAttachmentKeys: ["price_detail"],
      risk: "预算口径不清或边界不明，可能影响价格评审",
    },
  ];
}

/** 将规则匹配生成的评分对照行映射为 V2 四列评审映射结构 */
export function mapScoreMappingToTenderRow(r: ScoreMappingRow): TenderScoreMappingRow {
  const blob = `${r.scoreItem} ${r.criteria} ${r.responseSummary} ${r.proof}`;
  const parts: string[] = [];
  if (/技术|参数|设备|功能|配置|系统/.test(blob)) {
    parts.push("技术响应表", "技术偏离表");
  }
  if (/商务|付款|交付|售后|服务|合同|发票|报价/.test(blob)) {
    parts.push("商务条款响应表", "商务偏离表");
  }
  parts.push("建设方案", "预算与报价", "附件索引");
  const responseSection = Array.from(new Set(parts)).join(" / ");

  const hasTech = /技术|参数|设备|功能|配置|系统/.test(blob);
  const hasBiz = /商务|付款|交付|售后|服务|合同|发票|报价/.test(blob);
  const hasPrice = /报价|价格|预算|金额/.test(blob);
  const hasQual = /资质|业绩|附件|证明|证书|营业执照|团队/.test(blob);
  let responseSectionKey: TenderScoreMappingSectionKey | undefined;
  if (hasTech && !hasBiz && !hasPrice) {
    responseSectionKey = "technicalResponse";
  } else if (hasBiz && !hasTech) {
    responseSectionKey = "businessResponse";
  } else if (hasPrice && !hasTech && !hasBiz) {
    responseSectionKey = "budget";
  } else if (hasQual && !hasTech && !hasBiz) {
    responseSectionKey = "attachmentIndex";
  }

  const evidenceAttachmentKeys = inferAttachmentKeys(blob);

  const evidence =
    safeStr(r.proof) ||
    "见投标包内对应章节、响应表及附件材料。";

  const risk =
    r.note === "low-confidence"
      ? "该评分项与方案条目对应关系较弱，建议评委重点核查响应表、偏离表及证明材料。"
      : "请关注是否存在待确认或偏离项，并结合附件索引与正式投标附件综合审阅。";

  return {
    scoreItem: r.scoreItem,
    responseSection,
    responseSectionKey,
    responseRefIds: hasTech ? ["T-01", "T-02"] : hasBiz ? ["B-01", "B-02"] : undefined,
    evidence,
    evidenceAttachmentKeys,
    risk,
  };
}

function safeStr(s: string) {
  return String(s || "").trim();
}

export function formatEvidenceWithAttachments(
  row: TenderScoreMappingRow,
  attachmentRefs?: TenderAttachmentRefMap
) {
  const base = String(row.evidence || "").trim() || "-";
  const keys = row.evidenceAttachmentKeys || [];
  if (!keys.length || !attachmentRefs) return base;

  const refs: TenderAttachmentRefItem[] = keys
    .map((key) => attachmentRefs[key])
    .filter(Boolean) as TenderAttachmentRefItem[];
  if (!refs.length) return base;

  const refText = refs.map((item) => `${item.code}：${item.name}`).join("；");
  return `${base}\n建议查阅：${refText}`;
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
  "说明：建议结合技术响应表、商务响应表、偏离表及附件索引进行综合审阅。";
