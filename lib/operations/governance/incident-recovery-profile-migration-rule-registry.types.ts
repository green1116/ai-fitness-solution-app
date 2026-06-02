import type { GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult } from "./incident-recovery-profile-config.json-schema-evolution.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION =
  "v4-a3-r9.1.4-incident-recovery-profile-migration-rule-registry-1" as const;
export type GovernanceIncidentRecoveryProfileMigrationRuleRegistryVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION;

export type GovernanceIncidentRecoveryProfileMigrationRuleCategory =
  | "schema"
  | "config"
  | "source"
  | "decision"
  | "fallback";

export type GovernanceIncidentRecoveryProfileMigrationRuleStatus =
  | "resolved"
  | "fallback"
  | "noMatch";

export type GovernanceIncidentRecoveryProfileMigrationRule = {
  ruleId: string;
  ruleName: string;
  category: GovernanceIncidentRecoveryProfileMigrationRuleCategory;
  enabled: boolean;
  priority: number;
  sourceVersion: string;
  targetVersion: string;
  conditions: string[];
  actions: string[];
  rationale: string;
  fallbackBehavior: "useBuiltin" | "reject" | "keepCurrent";
};

export type GovernanceIncidentRecoveryProfileMigrationRuleMatch = {
  ruleId: string;
  matched: boolean;
  reason: string;
  score: number;
};

export type GovernanceIncidentRecoveryProfileMigrationRuleTrace = {
  traceId: string;
  candidateRules: string[];
  matchedRules: string[];
  rejectedRules: string[];
  execution: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileMigrationRuleSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileMigrationRuleRegistryInput = {
  deploymentId: string;
  evolution: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult;
};

export type GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult = {
  version: GovernanceIncidentRecoveryProfileMigrationRuleRegistryVersion;
  snapshot: {
    sourceVersion: string;
    targetVersion: string;
    selectedRuleId: string;
  };
  rules: GovernanceIncidentRecoveryProfileMigrationRule[];
  matches: GovernanceIncidentRecoveryProfileMigrationRuleMatch[];
  trace: GovernanceIncidentRecoveryProfileMigrationRuleTrace;
  summary: GovernanceIncidentRecoveryProfileMigrationRuleSummary;
  status: GovernanceIncidentRecoveryProfileMigrationRuleStatus;
};
