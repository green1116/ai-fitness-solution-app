import type { ScoreMappingRow } from "@/lib/pdf/tender/types";

export type TenderScoreMappingRow = {
  scoreItem: string;
  responseSection: string;
  evidence: string;
  risk: string;
};

export function buildDefaultTenderScoreMappings(): TenderScoreMappingRow[] {
  return [
    {
      scoreItem: "项目理解与总体实施方案",
      responseSection: "实施方案 / 项目总体说明 / 建设目标",
      evidence: "项目实施方案、建设思路、空间规划说明",
      risk: "如实施路径不够具体，可能影响方案分",
    },
    {
      scoreItem: "设备配置合理性与适配性",
      responseSection: "设备配置清单 / 预算明细 / 功能分区说明",
      evidence: "设备清单、品牌参数、配置逻辑说明",
      risk: "如参数映射不充分，可能被认定为配置依据不足",
    },
    {
      scoreItem: "技术参数响应程度",
      responseSection: "技术响应表 / 技术偏离表",
      evidence: "技术响应表、参数说明、产品资料",
      risk: "存在待确认或偏离项时，需重点补充佐证",
    },
    {
      scoreItem: "商务条款响应程度",
      responseSection: "商务响应表 / 商务偏离表 / 响应声明",
      evidence: "商务响应表、服务承诺、交付与售后说明",
      risk: "商务条件表述不完整时，可能影响符合性判断",
    },
    {
      scoreItem: "实施进度与交付保障",
      responseSection: "实施计划 / 交付安排 / 项目进度说明",
      evidence: "进度计划、阶段安排、交付节点说明",
      risk: "如缺少明确节点，可能影响履约可信度",
    },
    {
      scoreItem: "售后服务与运维保障",
      responseSection: "售后服务说明 / 商务响应表",
      evidence: "售后承诺、服务机制、质保与维保说明",
      risk: "售后响应机制不明确时，容易丢分",
    },
    {
      scoreItem: "企业资质与履约能力",
      responseSection: "附件索引 / 响应声明 / 商务响应表",
      evidence: "营业执照、资质证书、业绩材料、团队说明",
      risk: "如附件索引未建立完整，评审查找成本高",
    },
    {
      scoreItem: "报价完整性与预算逻辑",
      responseSection: "预算书 / 预算说明 / 价格条款",
      evidence: "预算明细、报价口径说明、价格条件说明",
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
    parts.push("商务响应表", "商务偏离表");
  }
  parts.push("建设方案", "预算与报价", "附件索引");
  const responseSection = Array.from(new Set(parts)).join(" / ");

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
    evidence,
    risk,
  };
}

function safeStr(s: string) {
  return String(s || "").trim();
}

export const SCORE_MAPPING_PAGE_SUBTITLE =
  "本页用于建立评审关注点与本投标文件主要响应内容之间的对应关系，便于快速查阅与复核。";

export const SCORE_MAPPING_PAGE_FOOTNOTE =
  "说明：建议结合技术响应表、商务响应表、偏离表及附件索引进行综合审阅。";
