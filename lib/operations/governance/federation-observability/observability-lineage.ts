import type {
  FederationConsensusObservability,
  FederationGovernanceScore,
  FederationHealthSnapshot,
  FederationLifecycleObservability,
  FederationObservabilityLineageGraph,
  FederationPropagationObservability,
  FederationRecoveryObservability,
  FederationRiskProfile,
  FederationTopologyObservability,
} from "./observability-types";

export function buildFederationObservabilityLineageGraph(input: {
  deploymentId: string;
  health: FederationHealthSnapshot;
  topology: FederationTopologyObservability;
  consensus: FederationConsensusObservability;
  propagation: FederationPropagationObservability;
  lifecycle: FederationLifecycleObservability;
  recovery: FederationRecoveryObservability;
  risk: FederationRiskProfile;
  governanceScore: FederationGovernanceScore;
}): FederationObservabilityLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `federation-observability-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-health-${input.health.snapshotId}`,
        event: "health",
        detail: `score=${input.health.healthScore} active=${input.health.activeDomains.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-topology-${input.topology.observabilityId}`,
        event: "topology",
        detail: `domains=${input.topology.domainCount} score=${input.topology.topologyHealthScore}`,
        timestamp: now,
      },
      {
        entryId: `lineage-consensus-${input.consensus.observabilityId}`,
        event: "consensus",
        detail: `quorum=${input.consensus.quorumReachRate.toFixed(2)} voting=${input.consensus.votingSuccessRate.toFixed(2)}`,
        timestamp: now,
      },
      {
        entryId: `lineage-propagation-${input.propagation.observabilityId}`,
        event: "propagation",
        detail: `fanout=${input.propagation.fanoutSuccessRate.toFixed(2)} conflicts=${input.propagation.conflictCount}`,
        timestamp: now,
      },
      {
        entryId: `lineage-lifecycle-${input.lifecycle.observabilityId}`,
        event: "lifecycle",
        detail: `active=${input.lifecycle.activeDomains} frozen=${input.lifecycle.frozenDomains}`,
        timestamp: now,
      },
      {
        entryId: `lineage-recovery-${input.recovery.observabilityId}`,
        event: "recovery",
        detail: `actions=${input.recovery.recoveryActions} score=${input.recovery.recoveryHealthScore}`,
        timestamp: now,
      },
      {
        entryId: `lineage-risk-${input.risk.profileId}`,
        event: "risk",
        detail: `overall=${input.risk.overallRisk} factors=${input.risk.riskFactors.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-score-${input.governanceScore.scoreId}`,
        event: "score",
        detail: `composite=${input.governanceScore.compositeScore} confidence=${input.governanceScore.confidenceScore}`,
        timestamp: now,
      },
    ],
  };
}
