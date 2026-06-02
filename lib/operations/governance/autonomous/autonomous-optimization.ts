import type { GovernanceOptimizationProposal } from "./autonomous-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";

export function buildGovernanceOptimizationProposals(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  observability: FederationObservabilityRuntimeResult;
}): GovernanceOptimizationProposal[] {
  const optimizations: GovernanceOptimizationProposal[] = [];

  optimizations.push({
    optimizationId: `opt-governance-${input.deploymentId}`,
    category: "governance",
    action: "tune-governance-confidence-thresholds",
    expectedGain: Math.max(0, 100 - input.intelligence.intelligenceScore.compositeScore),
  });

  if (input.observability.topology.degradedRoutes > 0) {
    optimizations.push({
      optimizationId: `opt-routing-${input.deploymentId}`,
      category: "routing",
      action: "optimize-federation-routing-path",
      expectedGain: 15,
    });
  }

  if (input.observability.propagation.syncLatencyMs > 100) {
    optimizations.push({
      optimizationId: `opt-policy-${input.deploymentId}`,
      category: "policy",
      action: "reduce-policy-sync-latency",
      expectedGain: 10,
    });
  }

  optimizations.push({
    optimizationId: `opt-federation-${input.deploymentId}`,
    category: "federation",
    action: "balance-domain-activation-load",
    expectedGain: input.observability.health.degradedDomains.length > 0 ? 12 : 5,
  });

  optimizations.push({
    optimizationId: `opt-resilience-${input.deploymentId}`,
    category: "resilience",
    action: "strengthen-shared-recovery-coordination",
    expectedGain: input.observability.recovery.stabilizationPending ? 20 : 8,
  });

  return optimizations;
}
