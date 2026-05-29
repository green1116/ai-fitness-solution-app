import type { GovernanceAnomaly } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";

export function detectGovernanceAnomalies(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
}): GovernanceAnomaly[] {
  const now = new Date().toISOString();
  const anomalies: GovernanceAnomaly[] = [];

  if (
    input.observability.consensus.quorumReachRate < 0.7 ||
    input.observability.consensus.recoveryConsensusCount > 0
  ) {
    anomalies.push({
      anomalyId: `anomaly-consensus-${input.deploymentId}`,
      category: "consensus_instability",
      severity: input.observability.consensus.quorumReachRate < 0.5 ? "critical" : "high",
      description: `quorum=${input.observability.consensus.quorumReachRate.toFixed(2)} recoveryConsensus=${input.observability.consensus.recoveryConsensusCount}`,
      detectedAt: now,
    });
  }

  if (
    input.observability.propagation.fanoutSuccessRate < 0.8 ||
    input.observability.propagation.rollbackCount > 0 ||
    input.observability.propagation.conflictCount > 2
  ) {
    anomalies.push({
      anomalyId: `anomaly-propagation-${input.deploymentId}`,
      category: "propagation_degradation",
      severity: input.observability.propagation.rollbackCount > 0 ? "high" : "medium",
      description: `fanout=${input.observability.propagation.fanoutSuccessRate.toFixed(2)} conflicts=${input.observability.propagation.conflictCount}`,
      detectedAt: now,
    });
  }

  if (
    input.observability.lifecycle.frozenDomains > 0 ||
    input.observability.lifecycle.retiringDomains > 0 ||
    input.lifecycleContinuity.status !== "continuous"
  ) {
    anomalies.push({
      anomalyId: `anomaly-lifecycle-${input.deploymentId}`,
      category: "lifecycle_abnormality",
      severity: input.lifecycleContinuity.status === "disrupted" ? "high" : "medium",
      description: `frozen=${input.observability.lifecycle.frozenDomains} continuity=${input.lifecycleContinuity.status}`,
      detectedAt: now,
    });
  }

  if (
    input.observability.recovery.stabilizationPending ||
    input.observability.recovery.failoverActive ||
    input.observability.recovery.recoveryHealthScore < 60
  ) {
    anomalies.push({
      anomalyId: `anomaly-recovery-${input.deploymentId}`,
      category: "recovery_failure_trend",
      severity: input.observability.recovery.failoverActive ? "critical" : "high",
      description: `pending=${input.observability.recovery.stabilizationPending} score=${input.observability.recovery.recoveryHealthScore}`,
      detectedAt: now,
    });
  }

  if (
    input.observability.health.isolatedDomains.length > 1 ||
    input.observability.topology.degradedRoutes > 0
  ) {
    anomalies.push({
      anomalyId: `anomaly-fragmentation-${input.deploymentId}`,
      category: "federation_fragmentation",
      severity: input.observability.health.isolatedDomains.length > 2 ? "high" : "medium",
      description: `isolated=${input.observability.health.isolatedDomains.length} degradedRoutes=${input.observability.topology.degradedRoutes}`,
      detectedAt: now,
    });
  }

  return anomalies;
}
