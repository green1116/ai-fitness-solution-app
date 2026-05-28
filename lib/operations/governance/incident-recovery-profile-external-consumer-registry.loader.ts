import { buildBuiltinIncidentRecoveryProfileExternalConsumers } from "./incident-recovery-profile-external-consumer-registry.consumer";
import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "./incident-recovery-profile-external-consumer-registry.types";

export function loadIncidentRecoveryProfileExternalConsumerRegistry(input?: {
  externalConsumers?: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[] {
  const builtin = buildBuiltinIncidentRecoveryProfileExternalConsumers();
  if (!input?.externalConsumers || input.externalConsumers.length === 0) return builtin;
  const validExternal = input.externalConsumers.filter((c) => c.enabled);
  return [...builtin, ...validExternal];
}
