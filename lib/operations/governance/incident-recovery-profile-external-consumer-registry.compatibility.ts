import type { GovernanceIncidentRecoveryProfileCanonicalContractCompatibility } from "./incident-recovery-profile-canonical-contract.types";
import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility,
} from "./incident-recovery-profile-external-consumer-registry.types";

export function evaluateIncidentRecoveryProfileExternalConsumerCompatibility(input: {
  consumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  canonicalCompatibility: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility;
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility {
  const base = input.canonicalCompatibility;
  if (base.status === "incompatible") {
    return {
      consumerId: input.consumer.consumerId,
      status: "incompatible",
      missingRequiredFields: base.missingRequiredFields,
      warnings: base.warnings,
      fallbackReason: null,
    };
  }
  if (base.status === "fallbackCompatible" || input.consumer.fallbackPolicy !== "none") {
    return {
      consumerId: input.consumer.consumerId,
      status: "fallback",
      missingRequiredFields: base.missingRequiredFields,
      warnings: base.warnings,
      fallbackReason: "consumer registry fallback policy applied",
    };
  }
  if (base.status === "compatibleWithWarnings") {
    return {
      consumerId: input.consumer.consumerId,
      status: "compatibleWithWarnings",
      missingRequiredFields: base.missingRequiredFields,
      warnings: base.warnings,
      fallbackReason: null,
    };
  }
  return {
    consumerId: input.consumer.consumerId,
    status: "resolved",
    missingRequiredFields: base.missingRequiredFields,
    warnings: base.warnings,
    fallbackReason: null,
  };
}
