/**
 * V4-A2 Operational Decision Support (read-only, no auto-execution)
 */

import { generateOperationalRecommendations, summarizeOperationalRecommendations } from "./recommendations";
import { deriveOperationalInsights, summarizeOperationalInsights } from "./insights";
import { identifyOperationalBottlenecks, summarizeOperationalBottlenecks } from "./bottlenecks";
import { buildOperationalHealthSnapshot } from "./health";
import type {
  OperationalDecisionSupport,
  OperationalDecisionStatus,
  OperationalDecisionType,
} from "./types";
import { V4A2_INTELLIGENCE_VERSION } from "./types";

function resolveDecisionStatus(input: {
  healthStatus: string;
  highRecs: number;
  criticalInsights: number;
}): OperationalDecisionStatus {
  if (input.criticalInsights >= 2 || input.highRecs >= 3) return "escalate";
  if (input.highRecs >= 1) return "mitigate";
  if (input.healthStatus === "degraded" || input.healthStatus === "critical") return "investigate";
  if (input.healthStatus === "watch") return "monitor";
  return "proceed";
}

function resolveDecisionType(status: OperationalDecisionStatus): OperationalDecisionType {
  switch (status) {
    case "escalate":
      return "riskMitigation";
    case "mitigate":
    case "investigate":
      return "operationalReview";
    case "hold":
      return "stabilityHold";
    case "monitor":
      return "operationalReview";
    default:
      return "recoveryPlanning";
  }
}

export function buildOperationalDecisionSupport(input?: {
  deploymentId?: string;
}): OperationalDecisionSupport {
  const deploymentId = input?.deploymentId ?? "operational-decision";
  const decisionSupportId = `ODS-V4A2-${deploymentId.slice(0, 8)}`;
  const traceRoot = `trace-decision-${deploymentId.slice(0, 8)}`;
  const health = buildOperationalHealthSnapshot({ deploymentId });
  const insights = deriveOperationalInsights({ deploymentId });
  const bottlenecks = identifyOperationalBottlenecks({ deploymentId });
  const recommendations = generateOperationalRecommendations({ deploymentId });
  const observedAt = health.observedAt;

  const highRecs = recommendations.filter((r) => r.priority === "high").length;
  const criticalInsights = insights.filter((i) => i.priority === "critical").length;
  const status = resolveDecisionStatus({
    healthStatus: health.status,
    highRecs,
    criticalInsights,
  });
  const decisionType = resolveDecisionType(status);
  const top = recommendations[0];

  const recommendedAction =
    status === "proceed"
      ? "Proceed with standard production operations monitoring."
      : top?.action ?? "Monitor and review operational intelligence summary.";

  const rationale = [
    summarizeOperationalInsights(insights),
    summarizeOperationalBottlenecks(bottlenecks),
    summarizeOperationalRecommendations(recommendations),
    `health=${health.status} score=${health.healthScore}`,
  ].join("; ");

  return {
    version: V4A2_INTELLIGENCE_VERSION,
    decisionSupportId,
    decisionType,
    status,
    recommendedAction,
    rationale,
    source: "decision.derive",
    traceId: `${traceRoot}-support`,
    observedAt,
    confidence: top?.confidence ?? 85,
    evidence: [
      health.summary,
      ...insights.slice(0, 3).map((i) => i.insightId),
      ...recommendations.slice(0, 3).map((r) => r.recommendationId),
    ],
    relatedRecommendations: recommendations.map((r) => r.recommendationId),
    explanation: `Decision ${status} based on ${insights.length} insight(s), ${bottlenecks.length} bottleneck(s), ${recommendations.length} recommendation(s). No automatic execution.`,
    summary: `decision-support id=${decisionSupportId} status=${status} action=${recommendedAction.slice(0, 60)}`,
  };
}

export function summarizeOperationalDecisionSupport(
  support: OperationalDecisionSupport,
): string {
  return `decision: status=${support.status} type=${support.decisionType} confidence=${support.confidence} recommendations=${support.relatedRecommendations.length}`;
}
