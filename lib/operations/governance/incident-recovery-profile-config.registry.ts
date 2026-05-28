import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
  type GovernanceIncidentRecoveryProfileConfigRegistry,
  type GovernanceIncidentRecoveryProfileConfigSource,
} from "./incident-recovery-profile-config.types";

export function buildIncidentRecoveryProfileConfigRegistry(input: {
  selectedSource: GovernanceIncidentRecoveryProfileConfigSource;
}): GovernanceIncidentRecoveryProfileConfigRegistry {
  return {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
    sources: [
      input.selectedSource,
      {
        sourceId: "source-json-local-reserved",
        type: "jsonLocal",
        enabled: false,
        priority: 80,
        profileVersion: "reserved",
        mergeStrategy: "extend",
        inlineProfiles: [],
        description: "Reserved local JSON source.",
      },
      {
        sourceId: "source-env-reserved",
        type: "env",
        enabled: false,
        priority: 60,
        profileVersion: "reserved",
        mergeStrategy: "override",
        inlineProfiles: [],
        description: "Reserved ENV source.",
      },
    ],
    mergeStrategies: ["override", "extend", "fallback", "priorityMerge"],
  };
}
