import type {
  ComplianceResult,
  ComplianceRiskLevel,
  TechnicalDeviation,
} from "./types";

/**
 * 汇总符合性风险等级
 */
export function evaluateComplianceRisk(
  results: ComplianceResult[],
  deviations: TechnicalDeviation[],
): { riskLevel: ComplianceRiskLevel; risks: string[] } {
  const risks: string[] = [];
  const failed = results.filter((r) => r.status === "failed").length;
  const risky = results.filter((r) => r.status === "risky").length;
  const partial = results.filter((r) => r.status === "partial").length;
  const covered = results.filter((r) => r.status === "covered").length;

  const highDev = deviations.filter((d) => d.severity === "high").length;

  if (failed > 0 || highDev > 0) {
    risks.push(`${failed} 项核心参数未满足，${highDev} 项高严重度偏离`);
  }
  if (risky > 0) {
    risks.push(`${risky} 项存在交期/认证/兼容性风险`);
  }
  if (partial > 0) {
    risks.push(`${partial} 项为部分满足，建议补充证据`);
  }
  if (covered > 0 && risks.length === 0) {
    risks.push("主要技术参数已由推荐 SKU 覆盖，整体风险可控");
  }

  let riskLevel: ComplianceRiskLevel = "low";
  if (failed > 0 || highDev > 0) riskLevel = "high";
  else if (risky > 0) riskLevel = "risky";
  else if (partial > Math.max(1, results.length * 0.35)) riskLevel = "medium";
  else if (partial > 0) riskLevel = "medium";

  return { riskLevel, risks };
}
