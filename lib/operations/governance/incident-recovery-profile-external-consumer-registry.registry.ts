import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistry,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
} from "./incident-recovery-profile-external-consumer-registry.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistrySnapshot(input: {
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistry {
  return {
    registryId: "incident-recovery-profile-external-consumer-registry",
    registryVersion: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
    consumers: input.consumers,
  };
}
