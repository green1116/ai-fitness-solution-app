import type {
  FederationActivationResult,
  FederationConsensusLifecycleState,
  FederationContinuityHandoff,
  FederationDomainLifecycleState,
  FederationFreezeThawResult,
  FederationLifecycleLineageGraph,
  FederationPolicyLifecycleState,
  FederationRecoveryLifecycleState,
  FederationRetirementArchivalResult,
} from "./continuity-types";

export function buildFederationLifecycleLineageGraph(input: {
  deploymentId: string;
  domainLifecycle: FederationDomainLifecycleState[];
  policyLifecycle: FederationPolicyLifecycleState;
  consensusLifecycle: FederationConsensusLifecycleState;
  recoveryLifecycle: FederationRecoveryLifecycleState;
  activation: FederationActivationResult;
  freezeThaw: FederationFreezeThawResult;
  retirement: FederationRetirementArchivalResult;
  handoff: FederationContinuityHandoff;
}): FederationLifecycleLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `federation-lifecycle-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-domain-${input.deploymentId}`,
        event: "domain",
        detail: `domains=${input.domainLifecycle.length} active=${input.domainLifecycle.filter((d) => d.activated).length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-policy-${input.policyLifecycle.lifecycleId}`,
        event: "policy",
        detail: `phase=${input.policyLifecycle.phase} status=${input.policyLifecycle.propagationStatus}`,
        timestamp: now,
      },
      {
        entryId: `lineage-consensus-${input.consensusLifecycle.lifecycleId}`,
        event: "consensus",
        detail: `decision=${input.consensusLifecycle.decision} quorum=${input.consensusLifecycle.quorumReached}`,
        timestamp: now,
      },
      {
        entryId: `lineage-recovery-${input.recoveryLifecycle.lifecycleId}`,
        event: "recovery",
        detail: `action=${input.recoveryLifecycle.recoveryAction} pending=${input.recoveryLifecycle.stabilizationPending}`,
        timestamp: now,
      },
      {
        entryId: `lineage-activation-${input.activation.activationId}`,
        event: "activation",
        detail: `mode=${input.activation.activationMode} activated=${input.activation.activatedDomains.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-freeze-${input.freezeThaw.continuityId}`,
        event: "freeze",
        detail: `frozen=${input.freezeThaw.frozenDomains.length} thawed=${input.freezeThaw.thawedDomains.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-retirement-${input.retirement.retirementId}`,
        event: "retirement",
        detail: `retired=${input.retirement.retiredDomains.length} archived=${input.retirement.archivedDomains.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-handoff-${input.handoff.handoffId}`,
        event: "handoff",
        detail: `${input.handoff.sourceDomainId}>${input.handoff.targetDomainId} preserved=${input.handoff.continuityPreserved}`,
        timestamp: now,
      },
    ],
  };
}
