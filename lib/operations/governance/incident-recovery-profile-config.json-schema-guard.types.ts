import type { GovernanceIncidentRecoveryProfileJsonSourceSchema } from "./incident-recovery-profile-config.json-source.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION =
  "v4-a3-r9.1.2-incident-recovery-profile-json-schema-guard-1" as const;
export type GovernanceIncidentRecoveryProfileJsonSchemaGuardVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION;

export type GovernanceIncidentRecoveryProfileJsonSchemaGuardStatus =
  | "valid"
  | "fallback"
  | "invalid";

export type GovernanceIncidentRecoveryProfileJsonSchemaGuardInput = {
  deploymentId: string;
  loaded: boolean;
  schema: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaGuardTrace = {
  traceId: string;
  checks: string[];
  errors: string[];
};

export type GovernanceIncidentRecoveryProfileJsonSchemaGuardSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileJsonSchemaGuardResult = {
  version: GovernanceIncidentRecoveryProfileJsonSchemaGuardVersion;
  status: GovernanceIncidentRecoveryProfileJsonSchemaGuardStatus;
  valid: boolean;
  errors: string[];
  schemaVersion: string;
  trace: GovernanceIncidentRecoveryProfileJsonSchemaGuardTrace;
  summary: GovernanceIncidentRecoveryProfileJsonSchemaGuardSummary;
};
