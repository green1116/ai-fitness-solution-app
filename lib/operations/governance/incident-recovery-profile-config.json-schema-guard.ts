import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION,
  type GovernanceIncidentRecoveryProfileJsonSchemaGuardInput,
  type GovernanceIncidentRecoveryProfileJsonSchemaGuardResult,
} from "./incident-recovery-profile-config.json-schema-guard.types";

export function buildIncidentRecoveryProfileJsonSchemaGuard(
  input: GovernanceIncidentRecoveryProfileJsonSchemaGuardInput,
): GovernanceIncidentRecoveryProfileJsonSchemaGuardResult {
  const errors: string[] = [];
  const checks: string[] = [];
  if (!input.loaded) {
    checks.push("json not loaded -> fallback");
  }
  if (input.schema === null) {
    errors.push("schema missing");
  } else {
    checks.push("schema exists");
    if (input.schema.version.trim().length === 0) errors.push("schema version missing");
    if (!Array.isArray(input.schema.profiles) || input.schema.profiles.length === 0) {
      errors.push("profiles missing");
    }
  }
  const valid = errors.length === 0 && input.loaded && input.schema !== null;
  const status: GovernanceIncidentRecoveryProfileJsonSchemaGuardResult["status"] = valid
    ? "valid"
    : input.loaded
      ? "invalid"
      : "fallback";
  const traceId = `incident-profile-json-schema-guard-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION,
    status,
    valid,
    errors,
    schemaVersion: input.schema?.version ?? "unknown",
    trace: {
      traceId,
      checks,
      errors,
    },
    summary: {
      summaryId: `incident-profile-json-schema-guard-summary-${input.deploymentId}`,
      text: `status=${status} valid=${valid} schemaVersion=${input.schema?.version ?? "unknown"} errors=${errors.length}`,
      traceId,
    },
  };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION };
