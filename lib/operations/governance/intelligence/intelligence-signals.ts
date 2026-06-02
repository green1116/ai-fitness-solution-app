import type { GovernanceSignal, GovernanceSignalBundle } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function buildGovernanceSignalBundle(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
}): GovernanceSignalBundle {
  const obs = input.observability;
  const now = new Date().toISOString();
  const signals: GovernanceSignal[] = [
    { signalId: "sig-federation-health", source: "federation", metric: "healthScore", value: obs.health.healthScore, weight: 1.2 },
    { signalId: "sig-topology-health", source: "topology", metric: "topologyHealthScore", value: obs.topology.topologyHealthScore, weight: 1 },
    { signalId: "sig-consensus-quorum", source: "consensus", metric: "quorumReachRate", value: obs.consensus.quorumReachRate * 100, weight: 1.1 },
    { signalId: "sig-consensus-voting", source: "consensus", metric: "votingSuccessRate", value: obs.consensus.votingSuccessRate * 100, weight: 1 },
    { signalId: "sig-propagation-fanout", source: "propagation", metric: "fanoutSuccessRate", value: obs.propagation.fanoutSuccessRate * 100, weight: 1 },
    { signalId: "sig-propagation-sync", source: "propagation", metric: "syncLatencyMs", value: obs.propagation.syncLatencyMs, weight: 0.8 },
    { signalId: "sig-lifecycle-active", source: "lifecycle", metric: "activeDomains", value: obs.lifecycle.activeDomains, weight: 0.9 },
    { signalId: "sig-lifecycle-frozen", source: "lifecycle", metric: "frozenDomains", value: obs.lifecycle.frozenDomains, weight: 0.9 },
    { signalId: "sig-recovery-health", source: "recovery", metric: "recoveryHealthScore", value: obs.recovery.recoveryHealthScore, weight: 1.1 },
    { signalId: "sig-governance-composite", source: "governance", metric: "compositeScore", value: obs.governanceScore.compositeScore, weight: 1.3 },
    { signalId: "sig-risk-overall", source: "risk", metric: "overallRisk", value: riskLevelToScore(obs.risk.overallRisk), weight: 1.2 },
  ];

  return {
    bundleId: `governance-signals-${input.deploymentId}`,
    federationId: obs.health.federationId,
    signals,
    collectedAt: now,
  };
}

function riskLevelToScore(level: string): number {
  switch (level) {
    case "low":
      return 90;
    case "medium":
      return 65;
    case "high":
      return 40;
    case "critical":
      return 15;
    default:
      return 50;
  }
}
