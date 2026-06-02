import type { GovernanceDecisionCandidate } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";

export function buildGovernanceDecisionCandidates(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  observability: FederationObservabilityRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
}): GovernanceDecisionCandidate[] {
  const candidates: GovernanceDecisionCandidate[] = [];
  const riskLevel = input.observability.risk.overallRisk;

  candidates.push({
    candidateId: `decision-risk-${input.deploymentId}`,
    domain: "risk",
    decision: riskLevel === "critical" ? "apply-restricted-governance" : "maintain-risk-posture",
    confidence: input.intelligence.riskIntelligence.confidenceScore,
    riskAware: true,
    policyAware: false,
    topologyAware: false,
    lifecycleAware: false,
  });

  if (input.observability.propagation.rollbackCount > 0 || input.observability.propagation.conflictCount > 2) {
    candidates.push({
      candidateId: `decision-policy-${input.deploymentId}`,
      domain: "policy",
      decision: "reconcile-policy-propagation",
      confidence: 70,
      riskAware: true,
      policyAware: true,
      topologyAware: false,
      lifecycleAware: false,
    });
  }

  if (input.observability.topology.degradedRoutes > 0) {
    candidates.push({
      candidateId: `decision-topology-${input.deploymentId}`,
      domain: "topology",
      decision: "reroute-federation-topology",
      confidence: 75,
      riskAware: true,
      policyAware: false,
      topologyAware: true,
      lifecycleAware: false,
    });
  }

  if (input.lifecycleContinuity.status !== "continuous") {
    candidates.push({
      candidateId: `decision-lifecycle-${input.deploymentId}`,
      domain: "lifecycle",
      decision: "advance-continuity-handoff",
      confidence: 68,
      riskAware: true,
      policyAware: false,
      topologyAware: false,
      lifecycleAware: true,
    });
  }

  if (input.observability.recovery.stabilizationPending) {
    candidates.push({
      candidateId: `decision-recovery-${input.deploymentId}`,
      domain: "recovery",
      decision: "initiate-shared-recovery",
      confidence: 80,
      riskAware: true,
      policyAware: false,
      topologyAware: true,
      lifecycleAware: true,
    });
  }

  const urgentRec = input.intelligence.recommendations.find((r) => r.priority === "urgent");
  if (urgentRec) {
    candidates.push({
      candidateId: `decision-optimization-${input.deploymentId}`,
      domain: "optimization",
      decision: urgentRec.action,
      confidence: 72,
      riskAware: true,
      policyAware: true,
      topologyAware: true,
      lifecycleAware: true,
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      candidateId: `decision-maintain-${input.deploymentId}`,
      domain: "optimization",
      decision: "maintain-autonomous-watch",
      confidence: 85,
      riskAware: true,
      policyAware: true,
      topologyAware: true,
      lifecycleAware: true,
    });
  }

  return candidates;
}
