import type { GovernanceIncidentRecoveryProfileCanonicalContractConsumer } from "./incident-recovery-profile-canonical-contract.types";

export function loadIncidentRecoveryProfileCanonicalContractConsumers(): GovernanceIncidentRecoveryProfileCanonicalContractConsumer[] {
  return [
    {
      consumerId: "recovery-consumer",
      consumerVersion: "v2",
      requiredFields: ["canonicalProfileId", "canonicalProfiles", "canonicalVersion"],
      optionalFields: ["sourceType"],
      mode: "strict",
    },
    {
      consumerId: "audit-consumer",
      consumerVersion: "v2",
      requiredFields: ["canonicalProfileId", "sourceVersion", "sourceType"],
      optionalFields: ["deprecatedFields"],
      mode: "audit",
    },
    {
      consumerId: "rendering-consumer",
      consumerVersion: "v1",
      requiredFields: ["canonicalProfileName", "canonicalProfiles"],
      optionalFields: ["profileMetadata"],
      mode: "compat",
    },
    {
      consumerId: "registry-consumer",
      consumerVersion: "v1",
      requiredFields: ["canonicalVersion", "canonicalProfileId"],
      optionalFields: [],
      mode: "compat",
    },
    {
      consumerId: "reporting-consumer",
      consumerVersion: "v2",
      requiredFields: ["canonicalProfileName", "sourceVersion"],
      optionalFields: ["fallbackReason"],
      mode: "lenient",
    },
    {
      consumerId: "external-integration-consumer",
      consumerVersion: "v1",
      requiredFields: ["canonicalVersion", "canonicalProfileId", "canonicalProfileName"],
      optionalFields: ["sourceType"],
      mode: "compat",
    },
  ];
}
