import type { FederationRiskProfile } from "./observability-types";
import type { FederationConsensusObservability } from "./observability-types";
import type { FederationHealthSnapshot } from "./observability-types";
import type { FederationLifecycleObservability } from "./observability-types";
import type { FederationPropagationObservability } from "./observability-types";
import type { FederationRecoveryObservability } from "./observability-types";
import type { FederationTopologyObservability } from "./observability-types";
import { scoreToRiskLevel } from "./observability-registry";

export function buildFederationRiskProfile(input: {
  deploymentId: string;
  health: FederationHealthSnapshot;
  topology: FederationTopologyObservability;
  consensus: FederationConsensusObservability;
  propagation: FederationPropagationObservability;
  lifecycle: FederationLifecycleObservability;
  recovery: FederationRecoveryObservability;
}): FederationRiskProfile {
  const topologyScore = input.topology.topologyHealthScore;
  const consensusScore = input.consensus.quorumReachRate * 100;
  const propagationScore = input.propagation.fanoutSuccessRate * 100 - input.propagation.conflictCount * 5;
  const lifecycleScore =
    100 -
    input.lifecycle.frozenDomains * 10 -
    input.lifecycle.retiringDomains * 15 -
    input.lifecycle.recoveringDomains * 8;
  const recoveryScore = input.recovery.recoveryHealthScore;

  const riskFactors: string[] = [];
  if (input.health.degradedDomains.length > 0) riskFactors.push("degraded-domains");
  if (input.health.failedNodes.length > 0) riskFactors.push("failed-nodes");
  if (!input.consensus.quorumReachRate || input.consensus.quorumReachRate < 1) riskFactors.push("quorum-gap");
  if (input.propagation.rollbackCount > 0) riskFactors.push("policy-rollback");
  if (input.propagation.freezeCount > 0) riskFactors.push("policy-freeze");
  if (input.recovery.stabilizationPending) riskFactors.push("recovery-pending");

  const scores = [topologyScore, consensusScore, propagationScore, lifecycleScore, recoveryScore];
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    profileId: `federation-risk-${input.deploymentId}`,
    overallRisk: scoreToRiskLevel(overallScore),
    topologyRisk: scoreToRiskLevel(topologyScore),
    consensusRisk: scoreToRiskLevel(consensusScore),
    propagationRisk: scoreToRiskLevel(propagationScore),
    lifecycleRisk: scoreToRiskLevel(lifecycleScore),
    recoveryRisk: scoreToRiskLevel(recoveryScore),
    riskFactors,
  };
}
