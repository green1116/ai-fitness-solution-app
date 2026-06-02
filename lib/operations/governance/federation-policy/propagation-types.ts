import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

export const GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION =
  "v4-a3-r9.5-federation-policy-propagation-runtime-1" as const;
export type GovernanceFederationPolicyPropagationRuntimeVersion =
  typeof GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION;

export type PolicyPropagationStatus = "synced" | "partial" | "degraded" | "frozen" | "rolled_back";
export type PolicyDisseminationStatus = "complete" | "partial" | "blocked";
export type PolicyConflictResolution = "source_wins" | "target_wins" | "merge" | "defer";

export type FederatedPolicyBundle = {
  bundleId: string;
  sourceDomainId: string;
  policies: string[];
  version: string;
  consensusDecision: string;
  executable: boolean;
};

export type PolicyDisseminationResult = {
  disseminationId: string;
  targetDomains: string[];
  disseminatedPolicies: string[];
  status: PolicyDisseminationStatus;
};

export type PolicySyncResult = {
  syncId: string;
  syncedDomains: string[];
  pendingDomains: string[];
  syncRate: number;
};

export type PolicyFanoutResult = {
  fanoutId: string;
  fanoutTargets: string[];
  fanoutDepth: number;
  appliedCount: number;
};

export type PolicyBoundaryEnforcement = {
  enforcementId: string;
  boundaryViolations: string[];
  enforced: boolean;
  isolatedDomains: string[];
};

export type PolicyVersionPropagation = {
  propagationId: string;
  sourceVersion: string;
  targetVersion: string;
  propagatedDomains: string[];
};

export type PolicyConflictArbitration = {
  arbitrationId: string;
  conflicts: string[];
  resolution: PolicyConflictResolution;
  arbitratedPolicies: string[];
};

export type PolicyRollbackPropagation = {
  rollbackId: string;
  rollbackVersion: string;
  affectedDomains: string[];
  rollbackApplied: boolean;
};

export type PolicyFreezePropagation = {
  freezeId: string;
  frozenDomains: string[];
  freezeReason: string;
  partialAvailability: boolean;
};

export type PolicyPropagationLineageEntry = {
  entryId: string;
  event: "dissemination" | "sync" | "fanout" | "boundary" | "version" | "conflict" | "rollback" | "freeze";
  detail: string;
  timestamp: string;
};

export type PolicyPropagationLineageGraph = {
  graphId: string;
  entries: PolicyPropagationLineageEntry[];
};

export type PolicyPropagationAuditRecord = {
  bundleId: string;
  federationId: string;
  domainsAffected: string[];
  decision: string;
  syncRate: number;
  rollbackApplied: boolean;
  freezeApplied: boolean;
  timestamp: string;
};

export type PolicyPropagationHookPhase =
  | "beforePolicyDissemination"
  | "afterPolicyDissemination"
  | "beforePolicySync"
  | "afterPolicySync"
  | "beforePolicyRollback"
  | "afterPolicyRollback"
  | "beforePolicyFreeze"
  | "afterPolicyFreeze";

export type PolicyPropagationHookEvent = {
  phase: PolicyPropagationHookPhase;
  domainId: string;
  payload: string;
};

export type PolicyPropagationRuntimeInput = {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  policyPackMode: string;
  requestedPolicyVersion?: string;
};

export type PolicyPropagationRuntimeResult = {
  version: GovernanceFederationPolicyPropagationRuntimeVersion;
  registry: { propagationId: string; bundleCount: number; domainCount: number };
  bundle: FederatedPolicyBundle;
  dissemination: PolicyDisseminationResult;
  sync: PolicySyncResult;
  fanout: PolicyFanoutResult;
  boundary: PolicyBoundaryEnforcement;
  versionPropagation: PolicyVersionPropagation;
  conflict: PolicyConflictArbitration;
  rollback: PolicyRollbackPropagation;
  freeze: PolicyFreezePropagation;
  lineage: PolicyPropagationLineageGraph;
  audit: PolicyPropagationAuditRecord[];
  hooks: PolicyPropagationHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: PolicyPropagationStatus;
};
