import type {
  BuildExecutiveOversightInput,
  ExecutiveOversightPackage,
  ExecutiveOversightResult,
  ExecutiveRecommendation,
} from "../types";
import { EXECUTIVE_OVERSIGHT_RUNTIME_VERSION } from "../types";
import { formatExecutiveDebug } from "../debug/executiveDebug";
import { calculateExecutiveScore } from "../scoring/executiveScore";
import {
  auditPassed,
  buildExecutiveFindings,
  governancePassed,
  hasCriticalCompliance,
  ocrTraceabilityComplete,
} from "./buildExecutiveFindings";
import { calculateExecutiveRisk } from "./executiveRisk";
import { buildExecutiveRecommendations } from "./executiveRecommendations";

function resolveRecommendation(
  input: BuildExecutiveOversightInput,
  findings: ReturnType<typeof buildExecutiveFindings>,
): ExecutiveRecommendation {
  const criticalFindings = findings.filter((f) => f.level === "critical");
  const missingCriticalEvidence =
    (input.coverage?.summary.mandatoryMissing ?? 0) > 0 ||
    findings.some(
      (f) =>
        f.level === "critical" &&
        (f.category === "coverage" || f.summary.includes("Missing")),
    );

  // Rule 4: Reject
  if (
    hasCriticalCompliance(input) ||
    !auditPassed(input) ||
    !governancePassed(input) ||
    missingCriticalEvidence ||
    input.validation?.outcome === "rejected" ||
    input.governance?.posture === "halt" ||
    criticalFindings.length > 0
  ) {
    return "reject";
  }

  const weakOcr = !ocrTraceabilityComplete(input);
  const governanceInconsistent =
    input.governance?.controls.some((c) => c.controlId === "decision_alignment" && !c.passed) ??
    false;
  const unresolvedValidation =
    input.validation?.outcome === "conditional" ||
    (input.validation?.complianceChecks.some((c) => !c.passed) ?? false);

  // Rule 3: Review Required
  if (unresolvedValidation || governanceInconsistent || weakOcr) {
    return "review-required";
  }

  const moderateGov =
    input.governance?.riskLevel === "medium" ||
    input.governance?.riskLevel === "high" ||
    input.governance?.posture === "escalate" ||
    input.governance?.posture === "hold";
  const partialGaps =
    (input.coverage?.summary.partial ?? 0) > 0 ||
    (input.coverage?.summary.missing ?? 0) > 0;
  const lowAuditRisk =
    input.audit?.governanceStatus === "review_required" ||
    input.audit?.governanceStatus === "clear";

  // Rule 2: Conditional Approval
  if (moderateGov && partialGaps && lowAuditRisk) {
    return "conditional-approve";
  }
  if (
    input.decision?.status === "conditional" ||
    input.validation?.outcome === "conditional"
  ) {
    return "conditional-approve";
  }

  // Rule 1: Approve
  if (
    governancePassed(input) &&
    auditPassed(input) &&
    !hasCriticalCompliance(input) &&
    ocrTraceabilityComplete(input)
  ) {
    return "approve";
  }

  if (input.decision?.status === "recommended" && governancePassed(input)) {
    return "approve";
  }

  return "review-required";
}

/**
 * V3.4-E9 Executive Oversight Runtime（确定性）
 */
export function buildExecutiveOversightRuntime(
  input: BuildExecutiveOversightInput,
): ExecutiveOversightPackage {
  const findings = buildExecutiveFindings(input);
  const risk = calculateExecutiveRisk(input);
  const scoreResult = calculateExecutiveScore(input);
  const recommendation = resolveRecommendation(input, findings);
  const recommendationTexts = buildExecutiveRecommendations(input, findings);

  const executiveApproved =
    recommendation === "approve" ||
    (recommendation === "conditional-approve" && scoreResult.executiveApproved);

  const result: ExecutiveOversightResult = {
    executiveApproved,
    executiveScore: scoreResult.executiveScore,
    findings,
    recommendation,
  };

  const debug = formatExecutiveDebug({
    result,
    risk,
    input,
    recommendationTexts,
  });

  return {
    version: EXECUTIVE_OVERSIGHT_RUNTIME_VERSION,
    ...result,
    risk,
    recommendations: recommendationTexts,
    debug,
  };
}
