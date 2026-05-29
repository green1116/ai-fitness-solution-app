import type { GovernanceRemediationPlan } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function buildGovernanceRemediationPlans(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  observability: FederationObservabilityRuntimeResult;
}): GovernanceRemediationPlan[] {
  const remediations: GovernanceRemediationPlan[] = [];

  if (
    input.intelligence.anomalies.some((a) => a.category === "consensus_instability") ||
    input.observability.consensus.quorumReachRate < 0.7
  ) {
    remediations.push({
      remediationId: `remediation-consensus-${input.deploymentId}`,
      category: "consensus",
      action: "trigger-fallback-consensus-and-revote",
      priority: "high",
    });
  }

  if (
    input.observability.propagation.rollbackCount > 0 ||
    input.observability.propagation.conflictCount > 0
  ) {
    remediations.push({
      remediationId: `remediation-propagation-${input.deploymentId}`,
      category: "propagation",
      action: "reconcile-and-resync-policy-bundle",
      priority: input.observability.propagation.rollbackCount > 0 ? "urgent" : "medium",
    });
  }

  if (input.observability.lifecycle.frozenDomains > 0 || input.observability.lifecycle.recoveringDomains > 0) {
    remediations.push({
      remediationId: `remediation-lifecycle-${input.deploymentId}`,
      category: "lifecycle",
      action: "thaw-or-handoff-frozen-domains",
      priority: "medium",
    });
  }

  if (input.observability.recovery.stabilizationPending || input.observability.recovery.failoverActive) {
    remediations.push({
      remediationId: `remediation-recovery-${input.deploymentId}`,
      category: "recovery",
      action: "coordinate-shared-recovery-stabilization",
      priority: input.observability.recovery.failoverActive ? "urgent" : "high",
    });
  }

  if (input.observability.topology.degradedRoutes > 0) {
    remediations.push({
      remediationId: `remediation-topology-${input.deploymentId}`,
      category: "topology",
      action: "reroute-degraded-federation-paths",
      priority: "high",
    });
  }

  if (remediations.length === 0) {
    remediations.push({
      remediationId: `remediation-none-${input.deploymentId}`,
      category: "lifecycle",
      action: "no-remediation-required",
      priority: "low",
    });
  }

  return remediations;
}
