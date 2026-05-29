import type {
  GovernanceAnomaly,
  GovernancePrediction,
  GovernanceRecommendation,
} from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function generateGovernanceRecommendations(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  anomalies: GovernanceAnomaly[];
  prediction: GovernancePrediction;
}): GovernanceRecommendation[] {
  const recommendations: GovernanceRecommendation[] = [];

  if (input.observability.recovery.stabilizationPending || input.prediction.recoveryTrend < 60) {
    recommendations.push({
      recommendationId: `rec-recovery-${input.deploymentId}`,
      category: "recovery",
      priority: input.observability.recovery.failoverActive ? "urgent" : "high",
      action: "initiate-shared-recovery-coordination",
      rationale: "Recovery stabilization pending or projected recovery trend below threshold",
    });
  }

  if (input.observability.topology.degradedRoutes > 0 || input.prediction.federationDegradationProbability > 0.4) {
    recommendations.push({
      recommendationId: `rec-topology-${input.deploymentId}`,
      category: "topology",
      priority: "high",
      action: "reroute-federation-topology",
      rationale: "Degraded routes or elevated federation degradation probability",
    });
  }

  if (input.observability.propagation.rollbackCount > 0 || input.observability.propagation.conflictCount > 2) {
    recommendations.push({
      recommendationId: `rec-policy-${input.deploymentId}`,
      category: "policy",
      priority: "medium",
      action: "reconcile-policy-propagation",
      rationale: "Policy rollback or conflicts detected in propagation layer",
    });
  }

  if (input.observability.lifecycle.frozenDomains > 0 || input.observability.lifecycle.recoveringDomains > 0) {
    recommendations.push({
      recommendationId: `rec-lifecycle-${input.deploymentId}`,
      category: "lifecycle",
      priority: "medium",
      action: "advance-lifecycle-continuity-handoff",
      rationale: "Frozen or recovering domains require lifecycle coordination",
    });
  }

  if (input.observability.risk.overallRisk === "high" || input.observability.risk.overallRisk === "critical") {
    recommendations.push({
      recommendationId: `rec-risk-${input.deploymentId}`,
      category: "risk_mitigation",
      priority: input.observability.risk.overallRisk === "critical" ? "urgent" : "high",
      action: "apply-restricted-governance-mode",
      rationale: `Overall risk level is ${input.observability.risk.overallRisk}`,
    });
  }

  if (input.prediction.consensusFailureProbability > 0.5) {
    recommendations.push({
      recommendationId: `rec-consensus-${input.deploymentId}`,
      category: "recovery",
      priority: "high",
      action: "trigger-fallback-consensus-mode",
      rationale: `Consensus failure probability ${input.prediction.consensusFailureProbability.toFixed(2)}`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      recommendationId: `rec-maintain-${input.deploymentId}`,
      category: "risk_mitigation",
      priority: "low",
      action: "maintain-current-governance-posture",
      rationale: "No elevated anomalies; continue observability cycle",
    });
  }

  return recommendations;
}
