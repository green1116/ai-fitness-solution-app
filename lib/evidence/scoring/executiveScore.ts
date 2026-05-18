import type { BuildExecutiveOversightInput, ExecutiveScoreResult } from "../types";
import { assessExecutiveQualityFactors } from "../runtime/executiveRisk";

const APPROVE_THRESHOLD = 75;

/**
 * calculateExecutiveScore — 确定性加权高管分（0–100）
 */
export function calculateExecutiveScore(
  input: BuildExecutiveOversightInput,
): ExecutiveScoreResult {
  const f = assessExecutiveQualityFactors(input);
  const maxScore = 100;

  const executiveScore = Math.max(
    0,
    Math.min(
      maxScore,
      Math.round(
        f.coverageQuality * 0.25 +
          f.validationQuality * 0.22 +
          f.auditQuality * 0.18 +
          f.governanceQuality * 0.2 +
          f.decisionQuality * 0.1 +
          f.ocrTraceability * 0.05 -
          f.criticalPenalty * 0.5,
      ),
    ),
  );

  const governancePassed =
    input.governance?.posture === "proceed" || input.governance?.posture === "escalate";
  const auditPassed = input.audit?.governanceStatus !== "blocked";
  const noCriticalCompliance =
    (input.validation?.summary.criticalCount ?? 0) === 0;

  const executiveApproved =
    executiveScore >= APPROVE_THRESHOLD &&
    governancePassed &&
    auditPassed &&
    noCriticalCompliance &&
    input.decision?.status !== "rejected";

  return {
    executiveScore,
    maxScore,
    executiveApproved,
  };
}
