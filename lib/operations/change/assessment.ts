import type {
  ChangeAssessment,
  ChangeRequest,
  ChangeRisk,
  DependencyAssessment,
  ImpactAssessment,
  RiskAssessment,
  RollbackAssessment,
} from "./types";
import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";

function buildImpactAssessment(request: ChangeRequest): ImpactAssessment {
  const base =
    request.risk === "critical" ? 80 : request.risk === "elevated" ? 60 : request.risk === "moderate" ? 40 : 20;
  return {
    assessmentId: `impact-${request.requestId}`,
    requestId: request.requestId,
    stabilityImpact: base,
    continuityImpact: request.changeType === "recovery" ? base + 10 : base - 5,
    userImpact: request.scope === "platform" ? base + 5 : base,
    overallImpact: Math.min(100, base + (request.priority === "critical" ? 15 : 0)),
  };
}

function buildRiskAssessment(request: ChangeRequest): RiskAssessment {
  const score =
    request.risk === "critical" ? 90 : request.risk === "elevated" ? 70 : request.risk === "moderate" ? 45 : 20;
  const factors: string[] = [`type=${request.changeType}`, `scope=${request.scope}`];
  if (request.priority === "critical") factors.push("critical-priority");

  return {
    assessmentId: `risk-${request.requestId}`,
    requestId: request.requestId,
    risk: request.risk,
    score,
    factors,
  };
}

function buildDependencyAssessment(request: ChangeRequest, autonomous: GovernanceAutonomousRuntimeResult): DependencyAssessment {
  const upstream: string[] = [];
  const downstream: string[] = [];
  const blockedBy: string[] = [];

  if (request.changeType === "policy" || request.changeType === "rule") {
    upstream.push("governance-rulebook");
    downstream.push("orchestration");
  }
  if (request.changeType === "recovery") {
    upstream.push("federation-consensus");
    downstream.push("lifecycle-continuity");
  }
  if (autonomous.approval.status === "blocked") {
    blockedBy.push("governance-approval-blocked");
  }

  return {
    assessmentId: `dependency-${request.requestId}`,
    requestId: request.requestId,
    upstream,
    downstream,
    blockedBy,
  };
}

function buildRollbackAssessment(request: ChangeRequest, autonomous: GovernanceAutonomousRuntimeResult): RollbackAssessment {
  const reversible = !request.title.includes("failover");
  return {
    assessmentId: `rollback-${request.requestId}`,
    requestId: request.requestId,
    rollbackReady: reversible && autonomous.executionPlan.rollbackPlan.length > 0,
    strategy: autonomous.executionPlan.rollbackPlan || "snapshot-restore",
    estimatedDurationMs: request.changeType === "recovery" ? 5000 : 2000,
  };
}

export function assessChangeRequests(input: {
  deploymentId: string;
  requests: ChangeRequest[];
  autonomous: GovernanceAutonomousRuntimeResult;
}): ChangeAssessment[] {
  return input.requests.map((request) => {
    const impact = buildImpactAssessment(request);
    const risk = buildRiskAssessment(request);
    const dependency = buildDependencyAssessment(request, input.autonomous);
    const rollback = buildRollbackAssessment(request, input.autonomous);

    const compositeScore = Math.round(
      (100 - impact.overallImpact + (100 - risk.score) + (rollback.rollbackReady ? 20 : 0)) / 3,
    );
    const approvedForWorkflow =
      dependency.blockedBy.length === 0 &&
      risk.risk !== "critical" &&
      (request.priority !== "critical" || rollback.rollbackReady);

    return {
      assessmentId: `change-assessment-${request.requestId}`,
      requestId: request.requestId,
      impact,
      risk,
      dependency,
      rollback,
      compositeScore,
      approvedForWorkflow,
    };
  });
}

export function overallChangeRisk(assessments: ChangeAssessment[]): ChangeRisk {
  if (assessments.some((a) => a.risk.risk === "critical")) return "critical";
  if (assessments.some((a) => a.risk.risk === "elevated")) return "elevated";
  if (assessments.some((a) => a.risk.risk === "moderate")) return "moderate";
  return "minimal";
}
