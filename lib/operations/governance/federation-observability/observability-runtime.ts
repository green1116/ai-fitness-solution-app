import {
  GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION,
  type FederationObservabilityRuntimeInput,
  type FederationObservabilityRuntimeResult,
  type FederationObservabilityStatus,
} from "./observability-types";
import { buildFederationHealthSnapshot } from "./observability-health";
import { observeFederationTopology } from "./observability-topology";
import { observeFederationConsensus } from "./observability-consensus";
import { observeFederationPropagation } from "./observability-propagation";
import { observeFederationLifecycle } from "./observability-lifecycle";
import { observeFederationRecovery } from "./observability-recovery";
import { buildFederationRiskProfile } from "./observability-risk";
import { computeFederationGovernanceScore } from "./observability-score";
import { buildFederationObservabilityLineageGraph } from "./observability-lineage";
import { buildFederationObservabilityAuditRecords } from "./observability-audit";
import { runFederationObservabilityHooks } from "./observability-hooks";

export function buildGovernanceFederationObservabilityRuntime(
  input: FederationObservabilityRuntimeInput,
): FederationObservabilityRuntimeResult {
  const { federation, consensus, policyPropagation, lifecycleContinuity } = input;

  const health = buildFederationHealthSnapshot({
    deploymentId: input.deploymentId,
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  const topology = observeFederationTopology({ deploymentId: input.deploymentId, federation });
  const consensusObs = observeFederationConsensus({ deploymentId: input.deploymentId, consensus });
  const propagation = observeFederationPropagation({
    deploymentId: input.deploymentId,
    policyPropagation,
  });
  const lifecycle = observeFederationLifecycle({
    deploymentId: input.deploymentId,
    lifecycleContinuity,
  });
  const recovery = observeFederationRecovery({
    deploymentId: input.deploymentId,
    federation,
    consensus,
    lifecycleContinuity,
  });
  const risk = buildFederationRiskProfile({
    deploymentId: input.deploymentId,
    health,
    topology,
    consensus: consensusObs,
    propagation,
    lifecycle,
    recovery,
  });
  const governanceScore = computeFederationGovernanceScore({
    deploymentId: input.deploymentId,
    health,
    risk,
    lifecycleContinuity,
  });

  const lineage = buildFederationObservabilityLineageGraph({
    deploymentId: input.deploymentId,
    health,
    topology,
    consensus: consensusObs,
    propagation,
    lifecycle,
    recovery,
    risk,
    governanceScore,
  });

  const observabilityId = `federation-observability-${input.deploymentId}`;
  const federationId = federation.registry.federationId;
  const audit = buildFederationObservabilityAuditRecords({
    observabilityId,
    federationId,
    healthScore: health.healthScore,
    governanceScore,
    risk,
  });

  const hooks = runFederationObservabilityHooks({
    sourceDomainId: federation.policy.sourceDomainId,
    health,
    risk,
    governanceScore,
  });

  let status: FederationObservabilityStatus = "healthy";
  if (risk.overallRisk === "critical" || health.healthScore < 40) status = "critical";
  else if (risk.overallRisk === "high" || health.healthScore < 65) status = "degraded";
  else if (health.healthScore === 0) status = "unknown";

  const traceId = `federation-observability-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION,
    registry: { observabilityId, snapshotCount: 1 },
    health,
    topology,
    consensus: consensusObs,
    propagation,
    lifecycle,
    recovery,
    risk,
    governanceScore,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `federation-observability-summary-${Date.now()}`,
      text: `observability=${observabilityId} health=${health.healthScore} composite=${governanceScore.compositeScore} risk=${risk.overallRisk} quorum=${consensusObs.quorumReachRate.toFixed(2)} sync=${propagation.syncLatencyMs}ms status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION };
