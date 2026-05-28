import type {
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibility,
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus,
  GovernanceIncidentRecoveryProfileCanonicalContractConsumer,
} from "./incident-recovery-profile-canonical-contract.types";

export function evaluateIncidentRecoveryProfileCanonicalCompatibility(input: {
  consumer: GovernanceIncidentRecoveryProfileCanonicalContractConsumer;
  missingRequiredFields: string[];
  warnings: string[];
  payloadSourceType: "jsonLocal" | "builtin";
}): GovernanceIncidentRecoveryProfileCanonicalContractCompatibility {
  const status: GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus =
    input.missingRequiredFields.length > 0
      ? "incompatible"
      : input.payloadSourceType === "builtin" && input.consumer.mode === "compat"
        ? "fallbackCompatible"
        : input.warnings.length > 0 || input.consumer.mode === "lenient"
          ? "compatibleWithWarnings"
          : "compatible";
  return {
    consumerId: input.consumer.consumerId,
    consumerVersion: input.consumer.consumerVersion,
    status,
    missingRequiredFields: input.missingRequiredFields,
    warnings: input.warnings,
    fallbackReason:
      status === "fallbackCompatible" ? "consumer compat mode accepts builtin fallback payload" : null,
  };
}
