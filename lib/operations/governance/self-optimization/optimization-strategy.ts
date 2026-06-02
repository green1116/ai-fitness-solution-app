import type { GovernanceStrategyOptimization } from "./optimization-types";
import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function optimizeGovernanceStrategies(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
}): GovernanceStrategyOptimization[] {
  const strategies: GovernanceStrategyOptimization[] = [];

  strategies.push({
    optimizationId: `strategy-policy-${input.deploymentId}`,
    domain: "policy",
    currentStrategy: input.observability.propagation.rollbackCount > 0 ? "rollback-active" : "standard-propagation",
    recommendedStrategy:
      input.observability.propagation.conflictCount > 2 ? "reconcile-then-propagate" : "maintain-propagation",
    expectedGain: input.observability.propagation.conflictCount > 0 ? 15 : 5,
    priority: input.observability.propagation.rollbackCount > 0 ? "high" : "low",
  });

  strategies.push({
    optimizationId: `strategy-orchestration-${input.deploymentId}`,
    domain: "orchestration",
    currentStrategy: "cross-runtime-orchestration",
    recommendedStrategy: input.autonomous.executionPlan.safestPath ? "maintain-orchestration" : "strict-orchestration",
    expectedGain: input.autonomous.executionPlan.safestPath ? 5 : 12,
    priority: "medium",
  });

  strategies.push({
    optimizationId: `strategy-recovery-${input.deploymentId}`,
    domain: "recovery",
    currentStrategy: input.observability.recovery.recoveryActions > 0 ? "active-recovery" : "passive",
    recommendedStrategy: input.observability.recovery.stabilizationPending
      ? "escalate-shared-recovery"
      : "maintain-recovery",
    expectedGain: input.observability.recovery.stabilizationPending ? 20 : 8,
    priority: input.observability.recovery.failoverActive ? "high" : "medium",
  });

  strategies.push({
    optimizationId: `strategy-federation-${input.deploymentId}`,
    domain: "federation",
    currentStrategy: `routing-${input.observability.status}`,
    recommendedStrategy:
      input.observability.topology.degradedRoutes > 0 ? "topology-reroute" : "maintain-federation",
    expectedGain: input.observability.topology.degradedRoutes > 0 ? 18 : 6,
    priority: "high",
  });

  strategies.push({
    optimizationId: `strategy-consensus-${input.deploymentId}`,
    domain: "consensus",
    currentStrategy: input.observability.consensus.quorumReachRate >= 1 ? "quorum-stable" : "quorum-degraded",
    recommendedStrategy:
      input.observability.consensus.quorumReachRate < 0.7 ? "fallback-consensus" : "maintain-consensus",
    expectedGain: input.observability.consensus.quorumReachRate < 0.7 ? 22 : 5,
    priority: input.observability.consensus.recoveryConsensusCount > 0 ? "high" : "medium",
  });

  strategies.push({
    optimizationId: `strategy-lifecycle-${input.deploymentId}`,
    domain: "lifecycle",
    currentStrategy: `frozen=${input.observability.lifecycle.frozenDomains}`,
    recommendedStrategy:
      input.observability.lifecycle.frozenDomains > 0 ? "thaw-and-handoff" : "maintain-lifecycle",
    expectedGain: input.observability.lifecycle.frozenDomains > 0 ? 14 : 4,
    priority: "medium",
  });

  return strategies;
}
