import type {
  BuildExecutiveOversightInput,
  ExecutiveDebugOutput,
  ExecutiveOversightResult,
  ExecutiveRiskAssessment,
} from "../types";

function riskLabel(level: string): string {
  switch (level) {
    case "acceptable":
      return "LOW RISK";
    case "attention":
      return "MEDIUM RISK";
    case "high":
      return "HIGH RISK";
    case "critical":
      return "CRITICAL RISK";
    default:
      return level.toUpperCase();
  }
}

function mapRecommendationDisplay(rec: ExecutiveOversightResult["recommendation"]): string {
  switch (rec) {
    case "approve":
      return "approve";
    case "conditional-approve":
      return "conditional-approve";
    case "review-required":
      return "review-required";
    case "reject":
      return "reject";
    default:
      return rec;
  }
}

export type FormatExecutiveDebugInput = {
  result: ExecutiveOversightResult;
  risk: ExecutiveRiskAssessment;
  input: BuildExecutiveOversightInput;
  recommendationTexts: string[];
};

/**
 * 确定性 Executive Debug 四段文本
 */
export function formatExecutiveDebug(
  input: FormatExecutiveDebugInput,
): ExecutiveDebugOutput {
  const { result, risk, input: ctx, recommendationTexts } = input;
  const maxScore = 100;

  const summary = [
    "[ExecutiveRuntime]",
    `Executive Score: ${result.executiveScore} / ${maxScore}`,
    `Executive Recommendation: ${mapRecommendationDisplay(result.recommendation)}`,
    `Executive Approved: ${result.executiveApproved}`,
    `Executive Risk: ${risk.executiveRisk}`,
  ].join("\n");

  const govRaw = ctx.governance?.riskLevel;
  const govRisk: string =
    govRaw === "low"
      ? "acceptable"
      : govRaw === "medium"
        ? "attention"
        : govRaw === "high"
          ? "high"
          : govRaw === "critical"
            ? "critical"
            : risk.executiveRisk;
  const auditRisk =
    ctx.audit?.governanceStatus === "blocked"
      ? "critical"
      : ctx.audit?.governanceStatus === "review_required"
        ? "attention"
        : "acceptable";
  const complianceRisk =
    (ctx.validation?.summary.criticalCount ?? 0) > 0
      ? "critical"
      : (ctx.validation?.summary.errorCount ?? 0) > 0
        ? "high"
        : (ctx.validation?.summary.warningCount ?? 0) > 0
          ? "attention"
          : "acceptable";

  const findings = [
    "Executive Findings:",
    `Governance: ${riskLabel(govRisk)}`,
    `Audit: ${riskLabel(auditRisk)}`,
    `Compliance: ${riskLabel(complianceRisk)}`,
    `Coverage Score: ${ctx.coverage?.summary.validationScore ?? "—"}`,
    `Decision: ${ctx.decision?.status ?? "—"}`,
  ].join("\n");

  const critical = result.findings.filter(
    (f) => f.level === "critical" || f.level === "high",
  );
  const missingLines = critical.length
    ? critical.map((f) => f.summary)
    : ["(none)"];
  const criticalFindings = ["Executive Critical Findings:", "Missing:", ...missingLines].join(
    "\n",
  );

  const recLines =
    recommendationTexts.length > 0
      ? recommendationTexts
      : ["(no additional recommendations)"];
  const recommendations = ["Executive Recommendations:", ...recLines].join("\n");

  return {
    summary,
    findings,
    criticalFindings,
    recommendations,
  };
}
