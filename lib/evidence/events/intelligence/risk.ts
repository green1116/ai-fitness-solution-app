import type { RuntimeEventOrchestrationResult, RuntimeEventType } from "../types";
import { FAILURE_EVENTS } from "./constants";
import type {
  BuildRuntimeEventIntelligenceInput,
  EventTimelineIntelligence,
  IntelligenceSeverity,
  RuntimeRiskDimension,
  RuntimeRiskIntelligence,
} from "./types";

function countByType(
  orchestration: RuntimeEventOrchestrationResult,
): Map<RuntimeEventType, number> {
  const counts = new Map<RuntimeEventType, number>();
  const seen = new Set<string>();
  for (const r of orchestration.records) {
    if (seen.has(r.eventId)) continue;
    seen.add(r.eventId);
    counts.set(r.eventType, (counts.get(r.eventType) ?? 0) + 1);
  }
  return counts;
}

function severityFromScore(score: number): IntelligenceSeverity {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

function dim(
  score: number,
  accumulated: number,
  signals: string[],
): RuntimeRiskDimension {
  return {
    score: Math.min(100, Math.round(score)),
    severity: severityFromScore(score),
    accumulated: Math.round(accumulated * 10) / 10,
    signals,
  };
}

export function buildRuntimeRiskIntelligence(
  orchestration: RuntimeEventOrchestrationResult,
  timeline: EventTimelineIntelligence,
  input?: BuildRuntimeEventIntelligenceInput,
): RuntimeRiskIntelligence {
  const counts = countByType(orchestration);
  const prior = input?.priorSnapshots ?? [];
  const priorValidationFails = prior.reduce(
    (n, p) => n + (p.validationFailures ?? 0),
    0,
  );
  const priorValidationRisk = prior.reduce(
    (n, p) => n + (p.validationRisk ?? 0),
    0,
  );
  const priorGovernanceRisk = prior.reduce(
    (n, p) => n + (p.governanceRisk ?? 0),
    0,
  );

  const validationFails = counts.get("VALIDATION_FAILED") ?? 0;
  const validationSignals: string[] = [];
  let validationScore =
    validationFails * 28 +
    (counts.get("VALIDATION_RECHECKED") ?? 0) * 3 +
    priorValidationRisk * 0.15;
  if (validationFails > 0) {
    validationSignals.push(`${validationFails}× VALIDATION_FAILED`);
  }
  if (validationFails + priorValidationFails >= 2) {
    validationScore += 15;
    validationSignals.push("repeated-validation-failure-pattern");
  }
  if (input?.runtimeSnapshot?.validationOutcome === "rejected") {
    validationScore += 10;
    validationSignals.push("runtime-validation-outcome-rejected");
  }

  const govEsc = counts.get("GOVERNANCE_ESCALATED") ?? 0;
  const govFail = counts.get("GOVERNANCE_FAILED") ?? 0;
  const governanceSignals: string[] = [];
  let governanceScore =
    govEsc * 32 + govFail * 40 + priorGovernanceRisk * 0.15;
  if (govEsc > 0) governanceSignals.push(`${govEsc}× GOVERNANCE_ESCALATED`);
  if (govFail > 0) governanceSignals.push(`${govFail}× GOVERNANCE_FAILED`);
  if (orchestration.flags.governanceEscalated) {
    governanceScore += 12;
    governanceSignals.push("orchestration-governance-escalated-flag");
  }

  const releaseBlocks = counts.get("RELEASE_BLOCKED") ?? 0;
  const releaseSignals: string[] = [];
  let releaseScore = releaseBlocks * 22;
  if (orchestration.flags.releaseBlocked) {
    releaseScore += 18;
    releaseSignals.push("release-blocked-flag-active");
  }
  if (releaseBlocks > 1) {
    releaseScore += 10;
    releaseSignals.push("multiple-release-blocks-in-run");
  }
  const enableCount = counts.get("RELEASE_ENABLED") ?? 0;
  if (releaseBlocks > 0 && enableCount > 0) {
    releaseScore += 8;
    releaseSignals.push("release-oscillation-block-then-enable");
  }

  const auditReject = counts.get("AUDIT_REJECTED") ?? 0;
  const auditSignals: string[] = [];
  let auditScore = auditReject * 30;
  if (input?.runtimeSnapshot?.auditGovernanceStatus === "blocked") {
    auditScore += 15;
    auditSignals.push("audit-governance-blocked");
  }
  if (input?.runtimeSnapshot?.auditGovernanceStatus === "review_required") {
    auditScore += 8;
    auditSignals.push("audit-review-required");
  }

  const execReject = counts.get("EXECUTIVE_REJECTED") ?? 0;
  const executiveSignals: string[] = [];
  let executiveScore =
    execReject * 35 +
    (counts.get("EXECUTIVE_REVIEW_UNLOCKED") ?? 0) * 5;
  if (
    !orchestration.flags.executiveReviewUnlocked &&
    timeline.failureNodes.length > 0
  ) {
    executiveScore += 6;
    executiveSignals.push("executive-review-not-unlocked-after-failures");
  }
  if (orchestration.flags.manifestRequested) {
    executiveScore = Math.max(0, executiveScore - 8);
    executiveSignals.push("manifest-generation-requested");
  }

  const dimensions = {
    validation: dim(
      validationScore,
      validationFails + priorValidationFails,
      validationSignals,
    ),
    governance: dim(governanceScore, govEsc + govFail, governanceSignals),
    release: dim(releaseScore, releaseBlocks, releaseSignals),
    audit: dim(auditScore, auditReject, auditSignals),
    executive: dim(executiveScore, execReject, executiveSignals),
  };

  const overallScore = Math.min(
    100,
    Math.round(
      dimensions.validation.score * 0.25 +
        dimensions.governance.score * 0.25 +
        dimensions.release.score * 0.2 +
        dimensions.audit.score * 0.15 +
        dimensions.executive.score * 0.15,
    ),
  );

  const failureRepeated = [...counts.entries()]
    .filter(([t, c]) => c > 1 && FAILURE_EVENTS.has(t))
    .map(([eventType, count]) => ({ eventType, count }));

  const instabilityDetected =
    overallScore >= 45 ||
    releaseBlocks > 1 ||
    validationFails + priorValidationFails >= 2;

  const escalationPredicted =
    dimensions.validation.score >= 40 &&
    dimensions.governance.score < 60 &&
    !orchestration.flags.releaseEnabled;

  return {
    overallScore,
    severity: severityFromScore(overallScore),
    dimensions,
    instabilityDetected,
    escalationPredicted,
    repeatedFailures: failureRepeated,
  };
}
