import type { GovernanceIncidentRecoveryProfileMigrationExecutionCanonical } from "./incident-recovery-profile-migration-execution.types";
import type { GovernanceIncidentRecoveryProfileCanonicalContract } from "./incident-recovery-profile-canonical-contract.types";

export function validateIncidentRecoveryProfileCanonicalPayload(input: {
  contract: GovernanceIncidentRecoveryProfileCanonicalContract;
  payload: GovernanceIncidentRecoveryProfileMigrationExecutionCanonical;
}): { missingRequiredFields: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];
  const payloadRecord: Record<string, unknown> = {
    canonicalVersion: input.payload.canonicalVersion,
    canonicalProfileId: input.payload.canonicalProfileId,
    canonicalProfileName: input.payload.canonicalProfileName,
    canonicalProfiles: input.payload.canonicalProfiles,
    sourceVersion: input.payload.sourceVersion,
    sourceType: input.payload.sourceType,
  };
  for (const field of input.contract.requiredFields) {
    const value = payloadRecord[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.length === 0) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missing.push(field);
    }
  }
  if (input.payload.canonicalProfiles.length === 0) warnings.push("canonicalProfiles empty");
  return { missingRequiredFields: missing, warnings };
}
