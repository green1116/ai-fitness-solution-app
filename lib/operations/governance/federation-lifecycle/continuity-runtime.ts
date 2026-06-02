import {
  GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION,
  type FederationContinuityStatus,
  type LifecycleContinuityRuntimeInput,
  type LifecycleContinuityRuntimeResult,
} from "./continuity-types";
import { resolveFederationLifecyclePhase } from "./continuity-registry";
import { buildFederationDomainLifecycle } from "./continuity-domain";
import { buildFederationNodeLifecycle } from "./continuity-node";
import { buildFederationPolicyLifecycle } from "./continuity-policy";
import { buildFederationConsensusLifecycle } from "./continuity-consensus";
import { buildFederationRecoveryLifecycle } from "./continuity-recovery";
import { coordinateFederationActivation } from "./continuity-activation";
import { coordinateFederationFreezeThaw } from "./continuity-freeze";
import { coordinateFederationRetirementArchival } from "./continuity-retirement";
import { coordinateFederationContinuityHandoff } from "./continuity-handoff";
import { buildFederationLifecycleLineageGraph } from "./continuity-lineage";
import { buildFederationLifecycleAuditRecords } from "./continuity-audit";
import { runFederationLifecycleHooks } from "./continuity-hooks";

export function buildGovernanceFederationLifecycleContinuityRuntime(
  input: LifecycleContinuityRuntimeInput,
): LifecycleContinuityRuntimeResult {
  const { federation, consensus, policyPropagation } = input;
  const domains = federation.topology.domains;
  const nodes = federation.topology.nodes;

  const phase = resolveFederationLifecyclePhase({
    federationStatus: federation.status,
    consensusStatus: consensus.status,
    policyPropagationStatus: policyPropagation.status,
    requestedPhase: input.requestedPhase,
  });

  const domainLifecycle = buildFederationDomainLifecycle({ domains, globalPhase: phase });
  const nodeLifecycle = buildFederationNodeLifecycle({ nodes, globalPhase: phase });
  const policyLifecycle = buildFederationPolicyLifecycle({
    deploymentId: input.deploymentId,
    policyPropagation,
    globalPhase: phase,
  });
  const consensusLifecycle = buildFederationConsensusLifecycle({
    deploymentId: input.deploymentId,
    consensus,
    globalPhase: phase,
  });
  const recoveryLifecycle = buildFederationRecoveryLifecycle({
    deploymentId: input.deploymentId,
    federation,
    consensus,
    globalPhase: phase,
  });
  const activation = coordinateFederationActivation({
    deploymentId: input.deploymentId,
    domainLifecycle,
  });
  const freezeThaw = coordinateFederationFreezeThaw({
    deploymentId: input.deploymentId,
    policyPropagation,
    domainLifecycle,
  });
  const retirement = coordinateFederationRetirementArchival({
    deploymentId: input.deploymentId,
    globalPhase: phase,
    domainLifecycle,
  });
  const handoff = coordinateFederationContinuityHandoff({
    deploymentId: input.deploymentId,
    federation,
    activationMode: activation.activationMode,
    stabilizationPending: recoveryLifecycle.stabilizationPending,
  });

  const lineage = buildFederationLifecycleLineageGraph({
    deploymentId: input.deploymentId,
    domainLifecycle,
    policyLifecycle,
    consensusLifecycle,
    recoveryLifecycle,
    activation,
    freezeThaw,
    retirement,
    handoff,
  });

  const continuityId = `federation-lifecycle-${input.deploymentId}`;
  const federationId = federation.registry.federationId;
  const domainsAffected = domainLifecycle.map((d) => d.domainId);

  const audit = buildFederationLifecycleAuditRecords({
    continuityId,
    federationId,
    phase,
    domainsAffected,
    handoff,
    retirement,
  });

  const hooks = runFederationLifecycleHooks({
    sourceDomainId: federation.policy.sourceDomainId,
    phase,
    handoff,
    retirement,
  });

  let status: FederationContinuityStatus = "continuous";
  if (phase === "archived" || phase === "retiring") status = "retired";
  else if (handoff.continuityPreserved && handoff.handoffReason !== "steady-state") status = "handoff";
  else if (phase === "degraded" || phase === "recovering" || activation.activationMode === "partial") {
    status = "partial";
  } else if (phase === "frozen" || federation.status === "isolated") status = "disrupted";

  const traceId = `federation-lifecycle-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION,
    registry: {
      continuityId,
      domainCount: domains.length,
      nodeCount: nodes.length,
    },
    domainLifecycle,
    nodeLifecycle,
    policyLifecycle,
    consensusLifecycle,
    recoveryLifecycle,
    activation,
    freezeThaw,
    retirement,
    handoff,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `federation-lifecycle-summary-${Date.now()}`,
      text: `continuity=${continuityId} phase=${phase} activation=${activation.activationMode} handoff=${handoff.handoffReason} frozen=${freezeThaw.frozenDomains.length} retired=${retirement.retiredDomains.length} status=${status}`,
      traceId,
    },
    status,
    phase,
  };
}

export { GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION };
