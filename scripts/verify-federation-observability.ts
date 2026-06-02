/**
 * V4-A3-R10 Operational Governance Federation Observability Runtime — verification
 */
import {
  buildGovernanceFederationObservabilityRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION,
  buildFederationHealthSnapshot,
  observeFederationTopology,
  observeFederationConsensus,
  observeFederationPropagation,
  observeFederationLifecycle,
  observeFederationRecovery,
  buildFederationRiskProfile,
  computeFederationGovernanceScore,
  buildFederationObservabilityLineageGraph,
  buildFederationObservabilityAuditRecords,
  runFederationObservabilityHooks,
  buildGovernanceFederationRuntime,
  buildGovernanceFederationConsensusRuntime,
  buildGovernanceFederationPolicyPropagationRuntime,
  buildGovernanceFederationLifecycleContinuityRuntime,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-federation-observability",
  });
  assert(
    runtime.governanceFederationObservabilityVersion ===
      GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION,
    "observability version",
  );
  assert(runtime.governanceFederationObservabilityHealth.snapshotId.length > 0, "health snapshot");
  assert(runtime.governanceFederationObservabilityHealth.healthScore >= 0, "health score");
  assert(runtime.governanceFederationObservabilityTopology.domainCount >= 4, "topology observability");
  assert(
    runtime.governanceFederationObservabilityConsensus.observabilityId.length > 0,
    "consensus observability",
  );
  assert(
    runtime.governanceFederationObservabilityPropagation.observabilityId.length > 0,
    "propagation observability",
  );
  assert(
    runtime.governanceFederationObservabilityLifecycle.observabilityId.length > 0,
    "lifecycle observability",
  );
  assert(
    runtime.governanceFederationObservabilityRecovery.observabilityId.length > 0,
    "recovery observability",
  );
  assert(runtime.governanceFederationObservabilityRisk.profileId.length > 0, "risk profile");
  assert(
    runtime.governanceFederationObservabilityGovernanceScore.compositeScore >= 0,
    "governance score",
  );
  assert(runtime.governanceFederationObservabilityLineage.entries.length >= 8, "observability lineage");
  assert(runtime.governanceFederationObservabilityAudit.length > 0, "observability audit");
  assert(runtime.governanceFederationObservabilityHooks.length >= 6, "observability hooks");
  assert(runtime.governanceFederationObservabilitySummary.length > 0, "observability summary");
  assert(
    ["healthy", "degraded", "critical", "unknown"].includes(
      runtime.governanceFederationObservabilityStatus,
    ),
    "observability status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-obs-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-obs-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-obs-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const lifecycleContinuity = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "unit-obs-lifecycle",
    federation,
    consensus,
    policyPropagation,
  });

  const health = buildFederationHealthSnapshot({
    deploymentId: "unit-obs",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  assert(health.activeDomains.length >= 0, "unit health");
  const topology = observeFederationTopology({ deploymentId: "unit-obs", federation });
  assert(topology.topologyHealthScore >= 0, "unit topology");
  const consensusObs = observeFederationConsensus({ deploymentId: "unit-obs", consensus });
  assert(consensusObs.votingSuccessRate >= 0, "unit consensus obs");
  const propagation = observeFederationPropagation({
    deploymentId: "unit-obs",
    policyPropagation,
  });
  assert(propagation.fanoutSuccessRate >= 0, "unit propagation obs");
  const lifecycle = observeFederationLifecycle({
    deploymentId: "unit-obs",
    lifecycleContinuity,
  });
  assert(lifecycle.activeDomains >= 0, "unit lifecycle obs");
  const recovery = observeFederationRecovery({
    deploymentId: "unit-obs",
    federation,
    consensus,
    lifecycleContinuity,
  });
  assert(recovery.recoveryHealthScore >= 0, "unit recovery obs");
  const risk = buildFederationRiskProfile({
    deploymentId: "unit-obs",
    health,
    topology,
    consensus: consensusObs,
    propagation,
    lifecycle,
    recovery,
  });
  assert(risk.overallRisk.length > 0, "unit risk");
  const governanceScore = computeFederationGovernanceScore({
    deploymentId: "unit-obs",
    health,
    risk,
    lifecycleContinuity,
  });
  assert(governanceScore.confidenceScore >= 0, "unit governance score");
  const lineage = buildFederationObservabilityLineageGraph({
    deploymentId: "unit-obs",
    health,
    topology,
    consensus: consensusObs,
    propagation,
    lifecycle,
    recovery,
    risk,
    governanceScore,
  });
  assert(lineage.entries.length >= 8, "unit lineage");
  const audit = buildFederationObservabilityAuditRecords({
    observabilityId: "unit-obs",
    federationId: federation.registry.federationId,
    healthScore: health.healthScore,
    governanceScore,
    risk,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runFederationObservabilityHooks({
    sourceDomainId: federation.policy.sourceDomainId,
    health,
    risk,
    governanceScore,
  });
  assert(hooks.some((h) => h.phase === "afterGovernanceScoring"), "unit hooks");

  const direct = buildGovernanceFederationObservabilityRuntime({
    deploymentId: "v4-verify-observability-direct",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  assert(direct.registry.snapshotCount >= 1, "direct observability registry");

  console.log("✓ governance federation observability runtime");
  console.log(" ", runtime.governanceFederationObservabilitySummary);
  console.log("OBSERVABILITY VERIFY PASS");
}

main();
