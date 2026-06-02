import type { GovernanceIncidentRecoveryProfileJsonSourceSchema } from "./incident-recovery-profile-config.json-source.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION =
  "v4-a3-r9.1.3-incident-recovery-profile-json-schema-evolution-1" as const;
export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION;

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionStatus =
  | "canonical"
  | "migrated"
  | "fallback"
  | "incompatible";

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionCompatibility =
  | "fullyCompatible"
  | "compatibleWithMigration"
  | "compatibleWithFallback"
  | "incompatible";

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionAlias = {
  from: string;
  to: string;
  deprecated: boolean;
  removalVersion: string;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration = {
  migrationId: string;
  fromVersion: string;
  toVersion: string;
  applied: boolean;
  steps: string[];
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionRule = {
  ruleId: string;
  description: string;
  fromVersion: string;
  toVersion: string;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolution = {
  sourceVersion: string;
  targetVersion: string;
  migrated: boolean;
  fallbackUsed: boolean;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionTrace = {
  traceId: string;
  sourceVersion: string;
  targetVersion: string;
  steps: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionInput = {
  deploymentId: string;
  schema: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
  guardValid: boolean;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult = {
  version: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionVersion;
  snapshot: GovernanceIncidentRecoveryProfileJsonSchemaEvolution;
  compatibility: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionCompatibility;
  migrations: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration[];
  aliases: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionAlias[];
  trace: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionTrace;
  summary: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionSummary;
  status: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionStatus;
  evolvedSchema: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
};
