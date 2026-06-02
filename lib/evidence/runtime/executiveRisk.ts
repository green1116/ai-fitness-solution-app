import type {
  BuildExecutiveOversightInput,
  ExecutiveRiskAssessment,
  ExecutiveRiskLevel,
} from "../types";

export type ExecutiveQualityFactors = {
  coverageQuality: number;
  validationQuality: number;
  auditQuality: number;
  governanceQuality: number;
  decisionQuality: number;
  ocrTraceability: number;
  criticalPenalty: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * 确定性高管风险因子
 */
export function assessExecutiveQualityFactors(
  input: BuildExecutiveOversightInput,
): ExecutiveQualityFactors {
  const cov = input.coverage;
  const val = input.validation;
  const audit = input.audit;
  const gov = input.governance;
  const dec = input.decision;

  const coverageQuality = cov
    ? clamp(cov.summary.coverageRatio * 100)
    : 50;

  const validationQuality =
    val?.outcome === "approved"
      ? 95
      : val?.outcome === "conditional"
        ? 70
        : val?.outcome === "rejected"
          ? 20
          : 40;

  const auditQuality =
    audit?.governanceStatus === "clear"
      ? 92
      : audit?.governanceStatus === "review_required"
        ? 65
        : audit?.governanceStatus === "blocked"
          ? 15
          : 55;

  const governanceQuality =
    gov?.posture === "proceed"
      ? 90
      : gov?.posture === "escalate"
        ? 68
        : gov?.posture === "hold"
          ? 45
          : gov?.posture === "halt"
            ? 10
            : 50;

  const decisionQuality =
    dec?.status === "recommended"
      ? 92
      : dec?.status === "conditional"
        ? 72
        : dec?.status === "high-risk"
          ? 48
          : dec?.status === "rejected"
            ? 18
            : 50;

  const ocrDocs = input.ocrDocuments || [];
  const matchesWithLoc = input.linking?.matches.filter((m) => m.locations.length > 0).length ?? 0;
  const totalMatches = input.linking?.matches.length ?? 0;
  const ocrBlockCount = ocrDocs.reduce((n, d) => n + d.blocks.length, 0);
  let ocrTraceability = 40;
  if (ocrDocs.length > 0 && ocrBlockCount > 0) {
    const locRatio = totalMatches ? matchesWithLoc / totalMatches : 0;
    const hasCoords = ocrDocs.every((d) => d.blocks.every((b) => b.coordinates.width > 0));
    ocrTraceability = clamp(locRatio * 60 + (hasCoords ? 35 : 10));
  }

  const criticalPenalty =
    (val?.summary.criticalCount ?? 0) * 12 +
    (gov?.controls.filter((c) => !c.passed && c.riskLevel === "critical").length ?? 0) * 15 +
    (cov?.summary.mandatoryMissing ?? 0) * 18;

  return {
    coverageQuality,
    validationQuality,
    auditQuality,
    governanceQuality,
    decisionQuality,
    ocrTraceability,
    criticalPenalty,
  };
}

/**
 * calculateExecutiveRisk — 确定性高管风险等级
 */
export function calculateExecutiveRisk(
  input: BuildExecutiveOversightInput,
): ExecutiveRiskAssessment {
  const f = assessExecutiveQualityFactors(input);
  const raw =
    f.coverageQuality * 0.22 +
    f.validationQuality * 0.2 +
    f.auditQuality * 0.18 +
    f.governanceQuality * 0.2 +
    f.decisionQuality * 0.12 +
    f.ocrTraceability * 0.08 -
    f.criticalPenalty;

  const executiveScore = clamp(raw);

  let executiveRisk: ExecutiveRiskLevel = "acceptable";
  if (executiveScore < 45 || f.criticalPenalty >= 25) {
    executiveRisk = "critical";
  } else if (executiveScore < 62 || f.governanceQuality < 50) {
    executiveRisk = "high";
  } else if (executiveScore < 80 || f.ocrTraceability < 55) {
    executiveRisk = "attention";
  }

  return { executiveRisk, executiveScore };
}
