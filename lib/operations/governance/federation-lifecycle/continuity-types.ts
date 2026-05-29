import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import type { PolicyPropagationRuntimeResult } from "../federation-policy/propagation-types";

export const GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION =
  "v4-a3-r9.6-federation-lifecycle-continuity-runtime-1" as const;
export type GovernanceFederationLifecycleContinuityRuntimeVersion =
  typeof GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION;

export type FederationLifecyclePhase =
  | "provisioning"
  | "active"
  | "degraded"
  | "frozen"
  | "recovering"
  | "retiring"
  | "archived";

export type FederationContinuityStatus = "continuous" | "partial" | "handoff" | "disrupted" | "retired";

export type FederationDomainLifecycleState = {
  domainId: string;
  phase: FederationLifecyclePhase;
  activated: boolean;
  lastTransitionAt: string;
};

export type FederationNodeLifecycleState = {
  nodeId: string;
  domainId: string;
  phase: FederationLifecyclePhase;
  active: boolean;
};

export type FederationPolicyLifecycleState = {
  lifecycleId: string;
  bundleId: string;
  phase: FederationLifecyclePhase;
  propagationStatus: string;
  version: string;
};

export type FederationConsensusLifecycleState = {
  lifecycleId: string;
  proposalId: string;
  phase: FederationLifecyclePhase;
  decision: string;
  quorumReached: boolean;
};

export type FederationRecoveryLifecycleState = {
  lifecycleId: string;
  phase: FederationLifecyclePhase;
  recoveryAction: string;
  stabilizationPending: boolean;
};

export type FederationActivationResult = {
  activationId: string;
  activatedDomains: string[];
  deactivatedDomains: string[];
  activationMode: "full" | "partial" | "restricted";
};

export type FederationFreezeThawResult = {
  continuityId: string;
  frozenDomains: string[];
  thawedDomains: string[];
  thawEligible: boolean;
};

export type FederationRetirementArchivalResult = {
  retirementId: string;
  retiredDomains: string[];
  archivedDomains: string[];
  archivalComplete: boolean;
};

export type FederationContinuityHandoff = {
  handoffId: string;
  sourceDomainId: string;
  targetDomainId: string;
  handoffReason: string;
  continuityPreserved: boolean;
};

export type FederationLifecycleLineageEntry = {
  entryId: string;
  event:
    | "domain"
    | "node"
    | "policy"
    | "consensus"
    | "recovery"
    | "activation"
    | "freeze"
    | "retirement"
    | "handoff";
  detail: string;
  timestamp: string;
};

export type FederationLifecycleLineageGraph = {
  graphId: string;
  entries: FederationLifecycleLineageEntry[];
};

export type FederationLifecycleAuditRecord = {
  continuityId: string;
  federationId: string;
  phase: FederationLifecyclePhase;
  domainsAffected: string[];
  handoffApplied: boolean;
  archivalApplied: boolean;
  timestamp: string;
};

export type FederationLifecycleHookPhase =
  | "beforeLifecycleTransition"
  | "afterLifecycleTransition"
  | "beforeContinuityHandoff"
  | "afterContinuityHandoff"
  | "beforeFederationRetirement"
  | "afterFederationRetirement";

export type FederationLifecycleHookEvent = {
  phase: FederationLifecycleHookPhase;
  domainId: string;
  payload: string;
};

export type LifecycleContinuityRuntimeInput = {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  policyPropagation: PolicyPropagationRuntimeResult;
  requestedPhase?: FederationLifecyclePhase;
};

export type LifecycleContinuityRuntimeResult = {
  version: GovernanceFederationLifecycleContinuityRuntimeVersion;
  registry: { continuityId: string; domainCount: number; nodeCount: number };
  domainLifecycle: FederationDomainLifecycleState[];
  nodeLifecycle: FederationNodeLifecycleState[];
  policyLifecycle: FederationPolicyLifecycleState;
  consensusLifecycle: FederationConsensusLifecycleState;
  recoveryLifecycle: FederationRecoveryLifecycleState;
  activation: FederationActivationResult;
  freezeThaw: FederationFreezeThawResult;
  retirement: FederationRetirementArchivalResult;
  handoff: FederationContinuityHandoff;
  lineage: FederationLifecycleLineageGraph;
  audit: FederationLifecycleAuditRecord[];
  hooks: FederationLifecycleHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: FederationContinuityStatus;
  phase: FederationLifecyclePhase;
};
