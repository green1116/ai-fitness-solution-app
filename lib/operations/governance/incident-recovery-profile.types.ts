import type { GovernanceLifecycleRuntimeResult } from "./lifecycle.types";
import type { GovernancePersistenceRuntimeResult } from "./persistence.types";
import type {
  GovernanceRecoveryRuntimeResult,
  GovernanceRecoveryStrategy,
} from "./recovery.types";
import type { GovernanceStoreRuntimeResult } from "./store.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION =
  "v4-a3-r9-incident-recovery-profile-1" as const;
export type GovernanceIncidentRecoveryProfileVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION;

export type GovernanceIncidentRecoveryProfileCategory =
  | "standard"
  | "fast"
  | "safe"
  | "audit"
  | "degraded"
  | "emergency"
  | "manual"
  | "partial";

export type GovernanceIncidentRecoveryProfileStatus =
  | "selected"
  | "degraded"
  | "manualInterventionRequired";

export type GovernanceIncidentRecoveryProfileRule = {
  ruleId: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  predicate: "severeFailure" | "checkpointAvailable" | "storeUnavailable" | "auditRequired" | "manualRequired" | "partialOnly";
};

export type GovernanceIncidentRecoveryProfile = {
  profileId: string;
  profileName: string;
  category: GovernanceIncidentRecoveryProfileCategory;
  enabled: boolean;
  priority: number;
  strategy: GovernanceRecoveryStrategy;
  allowAutomation: boolean;
  preferRollback: boolean;
  allowDegraded: boolean;
  requireManualIntervention: boolean;
  allowPartialRecovery: boolean;
  rules: GovernanceIncidentRecoveryProfileRule[];
  rationale: string;
};

export type GovernanceIncidentRecoveryProfileMatch = {
  profileId: string;
  matched: boolean;
  score: number;
  reason: string;
};

export type GovernanceIncidentRecoveryProfileRegistry = {
  version: GovernanceIncidentRecoveryProfileVersion;
  profiles: GovernanceIncidentRecoveryProfile[];
};

export type GovernanceIncidentRecoveryProfileTrace = {
  traceId: string;
  candidateProfiles: string[];
  matchedProfiles: string[];
  chosenProfile: string;
  rejectedProfiles: string[];
  rationale: string[];
};

export type GovernanceIncidentRecoveryProfileSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileInput = {
  deploymentId: string;
  lifecycle: GovernanceLifecycleRuntimeResult;
  persistence: GovernancePersistenceRuntimeResult;
  store: GovernanceStoreRuntimeResult;
  recovery: GovernanceRecoveryRuntimeResult;
};

export type GovernanceIncidentRecoveryProfileDecision = {
  profileId: string;
  strategy: GovernanceRecoveryStrategy;
  requiresManualIntervention: boolean;
  degradedMode: boolean;
  partialRecovery: boolean;
};

export type GovernanceIncidentRecoveryProfileResult = {
  version: GovernanceIncidentRecoveryProfileVersion;
  status: GovernanceIncidentRecoveryProfileStatus;
  snapshot: GovernanceIncidentRecoveryProfile;
  matches: GovernanceIncidentRecoveryProfileMatch[];
  registry: GovernanceIncidentRecoveryProfileRegistry;
  trace: GovernanceIncidentRecoveryProfileTrace;
  summary: GovernanceIncidentRecoveryProfileSummary;
  decision: GovernanceIncidentRecoveryProfileDecision;
};
