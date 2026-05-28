import type { GovernanceIncidentRecoveryProfile } from "./incident-recovery-profile.types";
import type { GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult } from "./incident-recovery-profile-config.json-schema-evolution.types";
import type { GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult } from "./incident-recovery-profile-migration-rule-registry.types";
import type { GovernanceIncidentRecoveryProfileRenderingPolicyResult } from "./incident-recovery-profile-rendering-policy.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION =
  "v4-a3-r9.1.5-incident-recovery-profile-migration-execution-1" as const;
export type GovernanceIncidentRecoveryProfileMigrationExecutionVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION;

export type GovernanceIncidentRecoveryProfileMigrationExecutionMode =
  | "strict"
  | "compat"
  | "audit"
  | "dry-run";

export type GovernanceIncidentRecoveryProfileMigrationExecutionStatus =
  | "executed"
  | "partial"
  | "fallback"
  | "dryRun";

export type GovernanceIncidentRecoveryProfileMigrationExecutionStep = {
  stepId: string;
  action: "renameField" | "normalizeVersion" | "injectDefault" | "dropDeprecated" | "fallback";
  target: string;
  applied: boolean;
  reason: string;
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionPlan = {
  planId: string;
  mode: GovernanceIncidentRecoveryProfileMigrationExecutionMode;
  selectedRuleId: string;
  orderedSteps: GovernanceIncidentRecoveryProfileMigrationExecutionStep[];
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionCanonical = {
  canonicalVersion: string;
  canonicalProfileId: string;
  canonicalProfileName: string;
  canonicalProfiles: GovernanceIncidentRecoveryProfile[];
  sourceVersion: string;
  sourceType: "jsonLocal" | "builtin";
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionFallback = {
  used: boolean;
  reason: string;
  fallbackTarget: "evolution" | "guard" | "builtin";
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionTrace = {
  traceId: string;
  mode: GovernanceIncidentRecoveryProfileMigrationExecutionMode;
  selectedRuleId: string;
  appliedSteps: string[];
  warnings: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionInput = {
  deploymentId: string;
  mode?: GovernanceIncidentRecoveryProfileMigrationExecutionMode;
  evolution: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult;
  registry: GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult;
  renderingPolicy: GovernanceIncidentRecoveryProfileRenderingPolicyResult;
  builtinProfiles: GovernanceIncidentRecoveryProfile[];
};

export type GovernanceIncidentRecoveryProfileMigrationExecutionResult = {
  version: GovernanceIncidentRecoveryProfileMigrationExecutionVersion;
  mode: GovernanceIncidentRecoveryProfileMigrationExecutionMode;
  plan: GovernanceIncidentRecoveryProfileMigrationExecutionPlan;
  canonical: GovernanceIncidentRecoveryProfileMigrationExecutionCanonical;
  fallback: GovernanceIncidentRecoveryProfileMigrationExecutionFallback;
  trace: GovernanceIncidentRecoveryProfileMigrationExecutionTrace;
  summary: GovernanceIncidentRecoveryProfileMigrationExecutionSummary;
  status: GovernanceIncidentRecoveryProfileMigrationExecutionStatus;
};
