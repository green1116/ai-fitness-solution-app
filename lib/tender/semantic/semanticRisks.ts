import type { SemanticRequirement, SemanticScoringItem } from "./types";
import type { SemanticRisk, SemanticRiskSeverity, SemanticRiskType } from "./types";

type RiskTemplate = {
  type: SemanticRiskType;
  pattern: RegExp;
  title: string;
  description: string;
  severity: SemanticRiskSeverity;
  mitigation?: string;
};

const RISK_TEMPLATES: RiskTemplate[] = [
  {
    type: "technical",
    pattern: /参数|规格|兼容|不满足|偏离/,
    title: "技术参数偏离风险",
    description: "招标参数与方案配置可能存在不一致或无法满足硬性指标。",
    severity: "high",
    mitigation: "逐项对照参数表，补充检测报告与偏离说明。",
  },
  {
    type: "procurement",
    pattern: /供货|品牌|替代|交期|周期/,
    title: "采购与供货风险",
    description: "供货周期、品牌锁定或替代策略可能影响投标合规与交付。",
    severity: "medium",
    mitigation: "明确供货周期与备选 SKU，预留安全库存。",
  },
  {
    type: "delivery",
    pattern: /施工|现场|安装|窗口|工期/,
    title: "交付实施风险",
    description: "现场条件、施工窗口或并行资源不足可能导致延期。",
    severity: "medium",
    mitigation: "制定里程碑与应急预案，关键路径复核。",
  },
  {
    type: "commercial",
    pattern: /付款|质保|商务|报价|合同/,
    title: "商务条款风险",
    description: "付款节点、质保范围或报价口径与招标要求不一致。",
    severity: "medium",
    mitigation: "商务条款逐条响应，明确边界与例外。",
  },
  {
    type: "compliance",
    pattern: /资质|ISO|证书|业绩|授权/,
    title: "合规与资质风险",
    description: "资质、认证或业绩材料缺失将影响资格审查或评分。",
    severity: "high",
    mitigation: "提前收集证书与案例材料，建立附件索引。",
  },
];

function matchRequirements(
  reqs: SemanticRequirement[],
  pattern: RegExp,
): string[] {
  return reqs
    .filter((r) => pattern.test(r.requirement) || pattern.test(r.title))
    .map((r) => r.id);
}

/**
 * 从 requirements / scoring 推断语义风险
 */
export function buildSemanticRisks(
  requirements: SemanticRequirement[],
  scoringItems: SemanticScoringItem[],
): SemanticRisk[] {
  const risks: SemanticRisk[] = [];
  let seq = 0;
  const seen = new Set<string>();

  for (const tpl of RISK_TEMPLATES) {
    const linked = matchRequirements(requirements, tpl.pattern);
    const fromScoring = scoringItems
      .filter((s) => tpl.pattern.test(s.title))
      .map((s) => s.id);
    if (!linked.length && !fromScoring.length) continue;

    const key = tpl.type + tpl.title;
    if (seen.has(key)) continue;
    seen.add(key);

    seq += 1;
    risks.push({
      id: `RSK-${String(seq).padStart(4, "0")}`,
      riskType: tpl.type,
      title: tpl.title,
      description: tpl.description,
      severity: tpl.severity,
      mitigation: tpl.mitigation,
      linkedRequirements: linked,
      linkedScoringItems: fromScoring,
    });
  }

  for (const r of requirements) {
    if (!r.measurable && r.importance === "mandatory") {
      const key = `ambig-${r.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      seq += 1;
      risks.push({
        id: `RSK-${String(seq).padStart(4, "0")}`,
        riskType: "compliance",
        title: "条款表述模糊风险",
        description: `强制条款缺少可量化指标：${r.title}`,
        severity: "low",
        mitigation: "补充量化承诺或引用标准条款。",
        linkedRequirements: [r.id],
      });
    }
  }

  return risks;
}

export function mapRiskIdsToRequirements(
  risks: SemanticRisk[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const risk of risks) {
    for (const reqId of risk.linkedRequirements || []) {
      const cur = map.get(reqId) || [];
      cur.push(risk.id);
      map.set(reqId, cur);
    }
  }
  return map;
}
