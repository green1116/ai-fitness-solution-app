import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION,
  type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionInput,
  type GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult,
} from "./incident-recovery-profile-config.json-schema-evolution.types";
import { INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION } from "./incident-recovery-profile-config.json-schema-evolution.versioning";
import { buildIncidentRecoveryProfileJsonSchemaEvolutionAliases } from "./incident-recovery-profile-config.json-schema-evolution.aliases";
import { evaluateIncidentRecoveryProfileJsonSchemaCompatibility } from "./incident-recovery-profile-config.json-schema-evolution.compatibility";
import { migrateIncidentRecoveryProfileJsonSchema } from "./incident-recovery-profile-config.json-schema-evolution.migrations";
import { buildIncidentRecoveryProfileJsonSchemaEvolutionTrace } from "./incident-recovery-profile-config.json-schema-evolution.trace";
import { summarizeIncidentRecoveryProfileJsonSchemaEvolution } from "./incident-recovery-profile-config.json-schema-evolution.summary";

export function buildIncidentRecoveryProfileJsonSchemaEvolution(
  input: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionInput,
): GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult {
  const sourceVersion = input.schema?.version ?? "unknown";
  const compatibility = evaluateIncidentRecoveryProfileJsonSchemaCompatibility({
    version: sourceVersion,
    guardValid: input.guardValid,
  });
  const migrated = input.schema ? migrateIncidentRecoveryProfileJsonSchema(input.schema) : { evolved: null, migrations: [] };
  const evolvedSchema =
    compatibility === "fullyCompatible"
      ? input.schema
      : compatibility === "compatibleWithMigration"
        ? migrated.evolved
        : null;
  const fallbackUsed = compatibility === "compatibleWithFallback" || compatibility === "incompatible";
  const status: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult["status"] =
    compatibility === "fullyCompatible"
      ? "canonical"
      : compatibility === "compatibleWithMigration"
        ? "migrated"
        : compatibility === "compatibleWithFallback"
          ? "fallback"
          : "incompatible";
  const aliases = buildIncidentRecoveryProfileJsonSchemaEvolutionAliases();
  const trace = buildIncidentRecoveryProfileJsonSchemaEvolutionTrace({
    runtime: input,
    sourceVersion,
    targetVersion: evolvedSchema?.version ?? INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION,
    compatibility,
    migrations: migrated.migrations,
    fallbackUsed,
  });

  const core: Omit<GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION,
    snapshot: {
      sourceVersion,
      targetVersion: evolvedSchema?.version ?? INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION,
      migrated: migrated.migrations.length > 0,
      fallbackUsed,
    },
    compatibility,
    migrations: migrated.migrations,
    aliases,
    trace,
    status,
    evolvedSchema,
  };

  return {
    ...core,
    summary: summarizeIncidentRecoveryProfileJsonSchemaEvolution(core),
  };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION };
