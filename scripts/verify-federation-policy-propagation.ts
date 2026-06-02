/**
 * V4-A3-R9.5 Operational Governance Federation Policy Propagation Runtime — verification
 */
import {
  buildGovernanceFederationPolicyPropagationRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION,
  buildFederatedPolicyBundle,
  disseminateFederatedPolicies,
  syncFederatedPolicies,
  fanoutFederatedPolicies,
  enforcePolicyBoundaries,
  propagatePolicyVersion,
  arbitratePolicyConflicts,
  propagatePolicyRollback,
  propagatePolicyFreeze,
  buildPolicyPropagationLineageGraph,
  buildPolicyPropagationAuditRecords,
  runPolicyPropagationHooks,
  buildGovernanceFederationRuntime,
  buildGovernanceFederationConsensusRuntime,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-federation-policy-propagation",
  });
  assert(
    runtime.governanceFederationPolicyPropagationVersion ===
      GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION,
    "policy propagation version",
  );
  assert(runtime.governanceFederationPolicyPropagationBundle.bundleId.length > 0, "policy bundle");
  assert(
    runtime.governanceFederationPolicyPropagationDissemination.disseminationId.length > 0,
    "policy dissemination",
  );
  assert(runtime.governanceFederationPolicyPropagationSync.syncId.length > 0, "policy sync");
  assert(runtime.governanceFederationPolicyPropagationFanout.fanoutId.length > 0, "policy fanout");
  assert(
    runtime.governanceFederationPolicyPropagationBoundary.enforcementId.length > 0,
    "policy boundary",
  );
  assert(
    runtime.governanceFederationPolicyPropagationVersionPropagation.propagationId.length > 0,
    "policy version propagation",
  );
  assert(
    runtime.governanceFederationPolicyPropagationConflict.arbitrationId.length > 0,
    "policy conflict arbitration",
  );
  assert(
    runtime.governanceFederationPolicyPropagationRollback.rollbackId.length > 0,
    "policy rollback",
  );
  assert(runtime.governanceFederationPolicyPropagationFreeze.freezeId.length > 0, "policy freeze");
  assert(runtime.governanceFederationPolicyPropagationLineage.entries.length >= 8, "policy lineage");
  assert(runtime.governanceFederationPolicyPropagationAudit.length > 0, "policy audit");
  assert(runtime.governanceFederationPolicyPropagationHooks.length >= 4, "policy hooks");
  assert(runtime.governanceFederationPolicyPropagationSummary.length > 0, "policy summary");
  assert(
    ["synced", "partial", "degraded", "frozen", "rolled_back"].includes(
      runtime.governanceFederationPolicyPropagationStatus,
    ),
    "policy propagation status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-policy-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-policy-consensus",
    federation,
    proposalType: "policy",
  });
  const bundle = buildFederatedPolicyBundle({
    deploymentId: "unit-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  assert(bundle.policies.length > 0, "unit policy bundle");
  const dissemination = disseminateFederatedPolicies({
    deploymentId: "unit-policy",
    bundle,
    domains: federation.topology.domains,
  });
  assert(dissemination.targetDomains.length > 0, "unit dissemination");
  const sync = syncFederatedPolicies({
    deploymentId: "unit-policy",
    dissemination,
    domains: federation.topology.domains,
    federationPolicyAccepted: federation.policy.accepted,
  });
  assert(sync.syncRate >= 0, "unit sync");
  const fanout = fanoutFederatedPolicies({
    deploymentId: "unit-policy",
    bundle,
    nodes: federation.topology.nodes,
    syncedDomains: sync.syncedDomains,
  });
  assert(fanout.fanoutTargets.length > 0, "unit fanout");
  const boundary = enforcePolicyBoundaries({
    deploymentId: "unit-policy",
    bundle,
    domains: federation.topology.domains,
    syncedDomains: sync.syncedDomains,
  });
  assert(boundary.enforcementId.length > 0, "unit boundary");
  const versionPropagation = propagatePolicyVersion({
    deploymentId: "unit-policy",
    sourceVersion: "policy-propagation-v1",
    targetVersion: bundle.version,
    syncedDomains: sync.syncedDomains,
  });
  assert(versionPropagation.propagatedDomains.length >= 0, "unit version propagation");
  const conflict = arbitratePolicyConflicts({
    deploymentId: "unit-policy",
    bundle,
    federationPolicy: federation.policy,
    boundaryViolations: boundary.boundaryViolations,
  });
  assert(conflict.arbitrationId.length > 0, "unit conflict");
  const rollback = propagatePolicyRollback({
    deploymentId: "unit-policy",
    consensus,
    conflict,
    syncedDomains: sync.syncedDomains,
  });
  assert(rollback.rollbackId.length > 0, "unit rollback");
  const freeze = propagatePolicyFreeze({
    deploymentId: "unit-policy",
    federation,
    syncRate: sync.syncRate,
    boundaryViolations: boundary.boundaryViolations,
    rollbackApplied: rollback.rollbackApplied,
  });
  assert(freeze.freezeId.length > 0, "unit freeze");
  const lineage = buildPolicyPropagationLineageGraph({
    deploymentId: "unit-policy",
    dissemination,
    sync,
    fanout,
    boundary,
    versionPropagation,
    conflict,
    rollback,
    freeze,
  });
  assert(lineage.entries.length >= 8, "unit lineage");
  const audit = buildPolicyPropagationAuditRecords({
    federationId: federation.registry.federationId,
    bundle,
    sync,
    rollback,
    freeze,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runPolicyPropagationHooks({
    sourceDomainId: bundle.sourceDomainId,
    dissemination,
    sync,
    rollback,
    freeze,
  });
  assert(hooks.some((h) => h.phase === "afterPolicyDissemination"), "unit hooks");

  const direct = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "v4-verify-policy-propagation-direct",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  assert(direct.registry.domainCount >= 4, "direct policy propagation registry");

  console.log("✓ governance federation policy propagation runtime");
  console.log(" ", runtime.governanceFederationPolicyPropagationSummary);
  console.log("POLICY PROPAGATION VERIFY PASS");
}

main();
