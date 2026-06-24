/**
 * V62 P13 — Pilot scale decision
 */

import { computePilotSuccessScore } from "../pilot/pilot-success.engine";
import { buildIssueTriageReport } from "../issues/issue-triage.engine";
import { buildPilotHealthDashboard } from "../pilot/pilot-health.engine";

export type ScaleDecision = "Pilot Stable" | "Pilot Needs Fixes" | "Ready to Scale";

export type ScaleDecisionReport = {
  decision: ScaleDecision;
  successScore: number;
  healthScore: number;
  blockerCount: number;
  reasons: string[];
  generatedAt: string;
};

export function evaluateScaleDecision(organizationId?: string): ScaleDecisionReport {
  const success = computePilotSuccessScore(organizationId);
  const health = buildPilotHealthDashboard(organizationId);
  const issues = buildIssueTriageReport(organizationId);
  const reasons: string[] = [];

  let decision: ScaleDecision;

  if (issues.blockerCount > 0) {
    decision = "Pilot Needs Fixes";
    reasons.push(`${issues.blockerCount} blocker issue(s) open`);
  } else if (success.metThreshold && health.overallHealth >= 80) {
    decision = "Ready to Scale";
    reasons.push(`Success score ${success.overallScore}`);
    reasons.push(`Health ${health.overallHealth}`);
  } else if (success.overallScore >= 60 && issues.blockerCount === 0) {
    decision = "Pilot Stable";
    reasons.push("No blockers; pilot metrics within acceptable range");
  } else {
    decision = "Pilot Needs Fixes";
    reasons.push(`Success score ${success.overallScore} below threshold`);
  }

  return {
    decision,
    successScore: success.overallScore,
    healthScore: health.overallHealth,
    blockerCount: issues.blockerCount,
    reasons,
    generatedAt: new Date().toISOString(),
  };
}
