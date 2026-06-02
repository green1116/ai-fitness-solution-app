import type { GovernanceIncidentRecoveryProfileJsonSchemaEvolutionAlias } from "./incident-recovery-profile-config.json-schema-evolution.types";

export function buildIncidentRecoveryProfileJsonSchemaEvolutionAliases(): GovernanceIncidentRecoveryProfileJsonSchemaEvolutionAlias[] {
  return [
    {
      from: "profile.profileLabel",
      to: "profile.profileName",
      deprecated: true,
      removalVersion: "json-local-v3",
    },
    {
      from: "profile.conditions",
      to: "profile.rules",
      deprecated: true,
      removalVersion: "json-local-v3",
    },
  ];
}
