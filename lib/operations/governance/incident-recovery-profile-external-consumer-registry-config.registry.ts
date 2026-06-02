import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry,
} from "./incident-recovery-profile-external-consumer-registry-config.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry(): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry {
  return {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
    sources: ["inline", "localJson", "file", "env", "builtinFallback", "db", "remote"],
    mergeStrategies: ["override", "extend", "fallback", "priorityMerge"],
  };
}
