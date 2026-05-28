import type { GovernanceIncidentRecoveryProfileJsonSourceSchema } from "./incident-recovery-profile-config.json-source.types";
import type { GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration } from "./incident-recovery-profile-config.json-schema-evolution.types";
import { INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION } from "./incident-recovery-profile-config.json-schema-evolution.versioning";

export function migrateIncidentRecoveryProfileJsonSchema(
  schema: GovernanceIncidentRecoveryProfileJsonSourceSchema,
): {
  evolved: GovernanceIncidentRecoveryProfileJsonSourceSchema;
  migrations: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration[];
} {
  if (schema.version !== "json-local-v1") {
    return {
      evolved: schema,
      migrations: [],
    };
  }

  const evolved: GovernanceIncidentRecoveryProfileJsonSourceSchema = {
    ...schema,
    version: INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION,
    profiles: schema.profiles.map((profile) => ({
      ...profile,
      // v1 -> v2 canonicalize missing fields with defaults
      rules: profile.rules ?? [],
      profileName: profile.profileName || profile.profileId,
    })),
  };
  return {
    evolved,
    migrations: [
      {
        migrationId: "migration-json-local-v1-to-v2",
        fromVersion: "json-local-v1",
        toVersion: INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION,
        applied: true,
        steps: [
          "canonicalized profileName",
          "ensured rules[] exists",
          "upgraded schema version to json-local-v2",
        ],
      },
    ],
  };
}
