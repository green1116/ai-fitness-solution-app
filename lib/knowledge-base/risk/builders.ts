import type { RiskCategory, RiskKnowledgeAsset } from "./types";
import { RISK_CATEGORIES } from "./types";

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  schedule: "进度风险 Schedule",
  budget: "预算风险 Budget",
  technical: "技术风险 Technical",
  compliance: "合规风险 Compliance",
  "supply-chain": "供应链风险 Supply Chain",
};

const RISK_PATTERNS: Record<RiskCategory, { name: string; description: string; severity: "low" | "medium" | "high" }> = {
  schedule: { name: "工期延误", description: "安装调试周期超出招标要求", severity: "medium" },
  budget: { name: "成本超支", description: "设备选型导致预算压力", severity: "high" },
  technical: { name: "技术偏离", description: "参数响应不满足评分标准", severity: "medium" },
  compliance: { name: "资质缺失", description: "强制性认证或业绩不满足", severity: "high" },
  "supply-chain": { name: "交付延迟", description: "进口设备物流周期不可控", severity: "medium" },
};

export function buildRiskKnowledgeAssets(input?: {
  deploymentId?: string;
}): RiskKnowledgeAsset[] {
  const deploymentId = input?.deploymentId ?? "risk-knowledge-default";
  return RISK_CATEGORIES.map((category) => {
    const pattern = RISK_PATTERNS[category];
    return {
      assetId: `risk-knowledge-${category}-${deploymentId}`,
      category,
      categoryLabel: CATEGORY_LABELS[category],
      riskPattern: {
        patternId: `risk-pattern-${category}-${deploymentId}`,
        category,
        name: pattern.name,
        description: pattern.description,
        severity: pattern.severity,
      },
      mitigation: {
        mitigationId: `mitigation-${category}-${deploymentId}`,
        category,
        strategy: `${CATEGORY_LABELS[category]}缓释策略`,
        actions: ["提前预案", "备选方案", "责任分工明确"],
        effectiveness: pattern.severity === "high" ? 0.75 : 0.85,
      },
      mode: "readiness-stub" as const,
    };
  });
}

export { RISK_CATEGORIES };
