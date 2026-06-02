import {
  GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION,
  type PolicyPropagationRuntimeInput,
  type PolicyPropagationRuntimeResult,
  type PolicyPropagationStatus,
} from "./propagation-types";
import { DEFAULT_POLICY_PROPAGATION_VERSION } from "./propagation-registry";
import { buildFederatedPolicyBundle } from "./propagation-bundle";
import { disseminateFederatedPolicies } from "./propagation-dissemination";
import { syncFederatedPolicies } from "./propagation-sync";
import { fanoutFederatedPolicies } from "./propagation-fanout";
import { enforcePolicyBoundaries } from "./propagation-boundary";
import { propagatePolicyVersion } from "./propagation-version";
import { arbitratePolicyConflicts } from "./propagation-conflict";
import { propagatePolicyRollback } from "./propagation-rollback";
import { propagatePolicyFreeze } from "./propagation-freeze";
import { buildPolicyPropagationLineageGraph } from "./propagation-lineage";
import { buildPolicyPropagationAuditRecords } from "./propagation-audit";
import { runPolicyPropagationHooks } from "./propagation-hooks";

export function buildGovernanceFederationPolicyPropagationRuntime(
  input: PolicyPropagationRuntimeInput,
): PolicyPropagationRuntimeResult {
  const { federation, consensus } = input;
  const domains = federation.topology.domains;
  const nodes = federation.topology.nodes;

  const bundle = buildFederatedPolicyBundle({
    deploymentId: input.deploymentId,
    federation,
    consensus,
    policyPackMode: input.policyPackMode,
    requestedPolicyVersion: input.requestedPolicyVersion,
  });

  const dissemination = disseminateFederatedPolicies({
    deploymentId: input.deploymentId,
    bundle,
    domains,
  });

  const sync = syncFederatedPolicies({
    deploymentId: input.deploymentId,
    dissemination,
    domains,
    federationPolicyAccepted: federation.policy.accepted,
  });

  const fanout = fanoutFederatedPolicies({
    deploymentId: input.deploymentId,
    bundle,
    nodes,
    syncedDomains: sync.syncedDomains,
  });

  const boundary = enforcePolicyBoundaries({
    deploymentId: input.deploymentId,
    bundle,
    domains,
    syncedDomains: sync.syncedDomains,
  });

  const versionPropagation = propagatePolicyVersion({
    deploymentId: input.deploymentId,
    sourceVersion: DEFAULT_POLICY_PROPAGATION_VERSION,
    targetVersion: bundle.version,
    syncedDomains: sync.syncedDomains,
  });

  const conflict = arbitratePolicyConflicts({
    deploymentId: input.deploymentId,
    bundle,
    federationPolicy: federation.policy,
    boundaryViolations: boundary.boundaryViolations,
  });

  const rollback = propagatePolicyRollback({
    deploymentId: input.deploymentId,
    consensus,
    conflict,
    syncedDomains: sync.syncedDomains,
  });

  const freeze = propagatePolicyFreeze({
    deploymentId: input.deploymentId,
    federation,
    syncRate: sync.syncRate,
    boundaryViolations: boundary.boundaryViolations,
    rollbackApplied: rollback.rollbackApplied,
  });

  const lineage = buildPolicyPropagationLineageGraph({
    deploymentId: input.deploymentId,
    dissemination,
    sync,
    fanout,
    boundary,
    versionPropagation,
    conflict,
    rollback,
    freeze,
  });

  const federationId = federation.registry.federationId;
  const audit = buildPolicyPropagationAuditRecords({
    federationId,
    bundle,
    sync,
    rollback,
    freeze,
  });

  const hooks = runPolicyPropagationHooks({
    sourceDomainId: bundle.sourceDomainId,
    dissemination,
    sync,
    rollback,
    freeze,
  });

  let status: PolicyPropagationStatus = "synced";
  if (rollback.rollbackApplied) status = "rolled_back";
  else if (freeze.frozenDomains.length > 0) status = "frozen";
  else if (sync.syncRate < 1 && sync.syncRate > 0) status = "partial";
  else if (sync.syncRate === 0 || dissemination.status === "blocked") status = "degraded";
  else if (freeze.partialAvailability) status = "partial";

  const propagationId = `policy-propagation-${input.deploymentId}`;
  const traceId = `policy-propagation-trace-${input.deploymentId}`;

  return {
    version: GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION,
    registry: {
      propagationId,
      bundleCount: 1,
      domainCount: domains.length,
    },
    bundle,
    dissemination,
    sync,
    fanout,
    boundary,
    versionPropagation,
    conflict,
    rollback,
    freeze,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `policy-propagation-summary-${Date.now()}`,
      text: `propagation=${propagationId} bundle=${bundle.bundleId} sync=${sync.syncRate.toFixed(2)} fanout=${fanout.appliedCount} conflicts=${conflict.conflicts.length} rollback=${rollback.rollbackApplied} freeze=${freeze.frozenDomains.length} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION };
