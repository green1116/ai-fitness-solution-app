import type { ComplianceResult, TechnicalDeviation, TechnicalRequirement } from "./types";

let deviationSeq = 0;

function nextDeviationId(): string {
  deviationSeq += 1;
  return `DEV-${String(deviationSeq).padStart(4, "0")}`;
}

/**
 * 自动识别技术偏离
 */
export function detectDeviation(
  requirements: TechnicalRequirement[],
  results: ComplianceResult[],
): TechnicalDeviation[] {
  const byReq = new Map(results.map((r) => [r.requirementId, r]));
  const deviations: TechnicalDeviation[] = [];

  for (const req of requirements) {
    const res = byReq.get(req.id);
    if (!res) continue;

    if (res.status === "failed" && res.missingParameters?.length) {
      deviations.push({
        id: nextDeviationId(),
        requirementId: req.id,
        deviationType: "parameter",
        severity: req.mandatory ? "high" : "medium",
        description: `参数未满足：${res.missingParameters.join("、")}（${req.requirementText.slice(0, 48)}）`,
        suggestedFix: "调整选型或提供参数偏离说明及替代证明材料",
      });
    }

    if (req.category === "certification" && res.status !== "covered") {
      deviations.push({
        id: nextDeviationId(),
        requirementId: req.id,
        deviationType: "certification",
        severity: "high",
        description: `缺少招标要求的认证/资质：${req.requirementText.slice(0, 48)}`,
        suggestedFix: "补充 ISO/检测报告/型式检验等附件",
      });
    }

    if (/SLA|售后|响应时间/.test(req.requirementText) && res.status !== "covered") {
      deviations.push({
        id: nextDeviationId(),
        requirementId: req.id,
        deviationType: "service",
        severity: "medium",
        description: `服务条款需进一步对齐：${req.requirementText.slice(0, 48)}`,
        suggestedFix: "在售后服务承诺书中明确响应时效",
      });
    }

    if (res.evidenceRequired && res.status !== "covered") {
      deviations.push({
        id: nextDeviationId(),
        requirementId: req.id,
        deviationType: "documentation",
        severity: "medium",
        description: `需补充证明材料以支撑符合性：${req.requirementText.slice(0, 40)}`,
        suggestedFix: "纳入投标附件索引：检测报告、参数表、业绩证明",
      });
    }
  }

  return deviations;
}
