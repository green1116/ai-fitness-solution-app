import type { GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult } from "./incident-recovery-profile-migration-rule-registry.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION =
  "v4-a3-r9.1.4-incident-recovery-profile-rendering-policy-1" as const;
export type GovernanceIncidentRecoveryProfileRenderingPolicyVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION;

export type GovernanceIncidentRecoveryProfileRenderingPolicyMode =
  | "strict"
  | "lenient"
  | "audit"
  | "compat";

export type GovernanceIncidentRecoveryProfileRenderingPolicyStatus =
  | "applied"
  | "compatApplied";

export type GovernanceIncidentRecoveryProfileRenderingPolicyRule = {
  ruleId: string;
  mode: GovernanceIncidentRecoveryProfileRenderingPolicyMode;
  keepTrace: boolean;
  compressSummary: boolean;
  expandMigrations: boolean;
  keepFallbackReason: boolean;
  showDeprecatedFields: boolean;
};

export type GovernanceIncidentRecoveryProfileRenderingPolicyMatch = {
  ruleId: string;
  matched: boolean;
  reason: string;
};

export type GovernanceIncidentRecoveryProfileRenderingPolicyTrace = {
  traceId: string;
  selectedMode: GovernanceIncidentRecoveryProfileRenderingPolicyMode;
  actions: string[];
};

export type GovernanceIncidentRecoveryProfileRenderingPolicySummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileRenderingPolicyInput = {
  deploymentId: string;
  mode?: GovernanceIncidentRecoveryProfileRenderingPolicyMode;
  migration: GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult;
};

export type GovernanceIncidentRecoveryProfileRenderingPolicyResult = {
  version: GovernanceIncidentRecoveryProfileRenderingPolicyVersion;
  mode: GovernanceIncidentRecoveryProfileRenderingPolicyMode;
  snapshot: GovernanceIncidentRecoveryProfileRenderingPolicyRule;
  matches: GovernanceIncidentRecoveryProfileRenderingPolicyMatch[];
  trace: GovernanceIncidentRecoveryProfileRenderingPolicyTrace;
  summary: GovernanceIncidentRecoveryProfileRenderingPolicySummary;
  status: GovernanceIncidentRecoveryProfileRenderingPolicyStatus;
};
