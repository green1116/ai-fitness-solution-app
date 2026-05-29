import type {
  RecoveryAssessment,
  RecoveryImpactAssessment,
  RecoveryRequest,
  RecoveryRiskAssessment,
  RecoverySeverity,
} from "./types";
import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";

function buildImpactAssessment(request: RecoveryRequest): RecoveryImpactAssessment {
  const base =
    request.severity === "critical" ? 80 : request.severity === "high" ? 60 : request.severity === "medium" ? 40 : 20;
  return {
    assessmentId: `recovery-impact-${request.requestId}`,
    requestId: request.requestId,
    stabilityImpact: request.recoveryType === "service" ? base + 10 : base,
    continuityImpact: request.recoveryType === "dependency" ? base + 8 : base,
    blastRadius: request.recoveryType === "policy" || request.recoveryType === "configuration" ? base + 5 : base - 5,
    overallImpact: Math.min(100, base + (request.priority === "critical" ? 12 : 0)),
  };
}

function buildRiskAssessment(
  request: RecoveryRequest,
  intelligence: GovernanceIntelligenceRuntimeResult,
): RecoveryRiskAssessment {
  const factors = [`type=${request.recoveryType}`, `source=${request.source}`];
  if (intelligence.analysis.trendDirection === "degrading") factors.push("degrading-trend");
  if (request.recoveryType === "execution") factors.push("execution-failure-context");

  return {
    assessmentId: `recovery-risk-${request.requestId}`,
    requestId: request.requestId,
    riskLevel: request.severity,
    score:
      request.severity === "critical" ? 90 : request.severity === "high" ? 70 : request.severity === "medium" ? 45 : 20,
    factors,
  };
}

function buildDependencyAssessment(
  request: RecoveryRequest,
  autonomous: GovernanceAutonomousRuntimeResult,
): RecoveryAssessment["dependency"] {
  const upstream: string[] = ["governance-foundation"];
  const downstream: string[] = [];
  const blockedBy: string[] = [];

  if (request.recoveryType === "dependency" || request.recoveryType === "service") {
    upstream.push("federation-consensus", "policy-propagation");
    downstream.push("lifecycle-continuity");
  }
  if (autonomous.approval.status === "blocked") blockedBy.push("governance-approval-blocked");
  if (request.source === "execution") upstream.push("execution-runtime");

  return {
    assessmentId: `recovery-dependency-${request.requestId}`,
    requestId: request.requestId,
    upstream,
    downstream,
    blockedBy,
  };
}

export function assessRecoveryRequests(input: {
  deploymentId: string;
  requests: RecoveryRequest[];
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
}): RecoveryAssessment[] {
  return input.requests.map((request) => {
    const impact = buildImpactAssessment(request);
    const risk = buildRiskAssessment(request, input.intelligence);
    const dependency = buildDependencyAssessment(request, input.autonomous);

    const compositeScore = Math.round((100 - impact.overallImpact + (100 - risk.score)) / 2);
    const recoveryReady =
      dependency.blockedBy.length === 0 &&
      (request.severity !== "critical" || autonomousHasRollback(input.autonomous));

    return {
      assessmentId: `recovery-assessment-${request.requestId}`,
      requestId: request.requestId,
      impact,
      risk,
      dependency,
      compositeScore,
      recoveryReady,
    };
  });
}

function autonomousHasRollback(autonomous: GovernanceAutonomousRuntimeResult): boolean {
  return autonomous.executionPlan.rollbackPlan.length > 0;
}

export function overallRecoverySeverity(assessments: RecoveryAssessment[]): RecoverySeverity {
  if (assessments.some((a) => a.risk.riskLevel === "critical")) return "critical";
  if (assessments.some((a) => a.risk.riskLevel === "high")) return "high";
  if (assessments.some((a) => a.risk.riskLevel === "medium")) return "medium";
  return "low";
}
