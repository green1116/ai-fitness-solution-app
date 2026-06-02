/**
 * V4-A3-R9.6 Operational Governance Federation Lifecycle Continuity Runtime — verification
 */
import {
  buildGovernanceFederationLifecycleContinuityRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION,
  buildFederationDomainLifecycle,
  buildFederationNodeLifecycle,
  buildFederationPolicyLifecycle,
  buildFederationConsensusLifecycle,
  buildFederationRecoveryLifecycle,
  coordinateFederationActivation,
  coordinateFederationFreezeThaw,
  coordinateFederationRetirementArchival,
  coordinateFederationContinuityHandoff,
  buildFederationLifecycleLineageGraph,
  buildFederationLifecycleAuditRecords,
  runFederationLifecycleHooks,
  resolveFederationLifecyclePhase,
  buildGovernanceFederationRuntime,
  buildGovernanceFederationConsensusRuntime,
  buildGovernanceFederationPolicyPropagationRuntime,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-federation-lifecycle-continuity",
  });
  assert(
    runtime.governanceFederationLifecycleContinuityVersion ===
      GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION,
    "lifecycle continuity version",
  );
  assert(runtime.governanceFederationLifecycleContinuityDomainLifecycle.length >= 4, "domain lifecycle");
  assert(runtime.governanceFederationLifecycleContinuityNodeLifecycle.length >= 4, "node lifecycle");
  assert(
    runtime.governanceFederationLifecycleContinuityPolicyLifecycle.lifecycleId.length > 0,
    "policy lifecycle",
  );
  assert(
    runtime.governanceFederationLifecycleContinuityConsensusLifecycle.lifecycleId.length > 0,
    "consensus lifecycle",
  );
  assert(
    runtime.governanceFederationLifecycleContinuityRecoveryLifecycle.lifecycleId.length > 0,
    "recovery lifecycle",
  );
  assert(
    runtime.governanceFederationLifecycleContinuityActivation.activationId.length > 0,
    "activation",
  );
  assert(
    runtime.governanceFederationLifecycleContinuityFreezeThaw.continuityId.length > 0,
    "freeze thaw",
  );
  assert(
    runtime.governanceFederationLifecycleContinuityRetirement.retirementId.length > 0,
    "retirement",
  );
  assert(
    runtime.governanceFederationLifecycleContinuityHandoff.handoffId.length > 0,
    "handoff",
  );
  assert(runtime.governanceFederationLifecycleContinuityLineage.entries.length >= 8, "lifecycle lineage");
  assert(runtime.governanceFederationLifecycleContinuityAudit.length > 0, "lifecycle audit");
  assert(runtime.governanceFederationLifecycleContinuityHooks.length >= 2, "lifecycle hooks");
  assert(runtime.governanceFederationLifecycleContinuitySummary.length > 0, "lifecycle summary");
  assert(
    ["continuous", "partial", "handoff", "disrupted", "retired"].includes(
      runtime.governanceFederationLifecycleContinuityStatus,
    ),
    "continuity status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-lifecycle-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-lifecycle-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-lifecycle-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const phase = resolveFederationLifecyclePhase({
    federationStatus: federation.status,
    consensusStatus: consensus.status,
    policyPropagationStatus: policyPropagation.status,
  });
  assert(phase.length > 0, "unit phase resolution");
  const domainLifecycle = buildFederationDomainLifecycle({
    domains: federation.topology.domains,
    globalPhase: phase,
  });
  assert(domainLifecycle.length >= 4, "unit domain lifecycle");
  const nodeLifecycle = buildFederationNodeLifecycle({
    nodes: federation.topology.nodes,
    globalPhase: phase,
  });
  assert(nodeLifecycle.length >= 4, "unit node lifecycle");
  const policyLifecycle = buildFederationPolicyLifecycle({
    deploymentId: "unit-lifecycle",
    policyPropagation,
    globalPhase: phase,
  });
  assert(policyLifecycle.bundleId.length > 0, "unit policy lifecycle");
  const consensusLifecycle = buildFederationConsensusLifecycle({
    deploymentId: "unit-lifecycle",
    consensus,
    globalPhase: phase,
  });
  assert(consensusLifecycle.proposalId.length > 0, "unit consensus lifecycle");
  const recoveryLifecycle = buildFederationRecoveryLifecycle({
    deploymentId: "unit-lifecycle",
    federation,
    consensus,
    globalPhase: phase,
  });
  assert(recoveryLifecycle.recoveryAction.length > 0, "unit recovery lifecycle");
  const activation = coordinateFederationActivation({
    deploymentId: "unit-lifecycle",
    domainLifecycle,
  });
  assert(activation.activationId.length > 0, "unit activation");
  const freezeThaw = coordinateFederationFreezeThaw({
    deploymentId: "unit-lifecycle",
    policyPropagation,
    domainLifecycle,
  });
  assert(freezeThaw.continuityId.length > 0, "unit freeze thaw");
  const retirement = coordinateFederationRetirementArchival({
    deploymentId: "unit-lifecycle",
    globalPhase: phase,
    domainLifecycle,
  });
  assert(retirement.retirementId.length > 0, "unit retirement");
  const handoff = coordinateFederationContinuityHandoff({
    deploymentId: "unit-lifecycle",
    federation,
    activationMode: activation.activationMode,
    stabilizationPending: recoveryLifecycle.stabilizationPending,
  });
  assert(handoff.handoffId.length > 0, "unit handoff");
  const lineage = buildFederationLifecycleLineageGraph({
    deploymentId: "unit-lifecycle",
    domainLifecycle,
    policyLifecycle,
    consensusLifecycle,
    recoveryLifecycle,
    activation,
    freezeThaw,
    retirement,
    handoff,
  });
  assert(lineage.entries.length >= 8, "unit lineage");
  const audit = buildFederationLifecycleAuditRecords({
    continuityId: "unit-continuity",
    federationId: federation.registry.federationId,
    phase,
    domainsAffected: domainLifecycle.map((d) => d.domainId),
    handoff,
    retirement,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runFederationLifecycleHooks({
    sourceDomainId: federation.policy.sourceDomainId,
    phase,
    handoff,
    retirement,
  });
  assert(hooks.some((h) => h.phase === "afterLifecycleTransition"), "unit hooks");

  const direct = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "v4-verify-lifecycle-direct",
    federation,
    consensus,
    policyPropagation,
  });
  assert(direct.registry.domainCount >= 4, "direct lifecycle registry");

  console.log("✓ governance federation lifecycle continuity runtime");
  console.log(" ", runtime.governanceFederationLifecycleContinuitySummary);
  console.log("LIFECYCLE CONTINUITY VERIFY PASS");
}

main();
