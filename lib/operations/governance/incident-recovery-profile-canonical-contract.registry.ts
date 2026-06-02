import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
  type GovernanceIncidentRecoveryProfileCanonicalContract,
} from "./incident-recovery-profile-canonical-contract.types";

export function loadIncidentRecoveryProfileCanonicalContractRegistry(input: {
  canonicalVersion: string;
}): GovernanceIncidentRecoveryProfileCanonicalContract {
  return {
    contractId: "contract-incident-recovery-profile-canonical",
    contractVersion: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
    canonicalVersion: input.canonicalVersion,
    requiredFields: [
      "canonicalVersion",
      "canonicalProfileId",
      "canonicalProfileName",
      "canonicalProfiles",
      "sourceVersion",
      "sourceType",
    ],
    optionalFields: ["profileMetadata", "fallbackReason", "deprecatedFields"],
  };
}
