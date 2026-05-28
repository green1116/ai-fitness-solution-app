import type {
  GovernanceIncidentRecoveryProfileJsonSourceSchema,
  GovernanceIncidentRecoveryProfileJsonSourceValidation,
} from "./incident-recovery-profile-config.json-source.types";

export function validateIncidentRecoveryProfileJsonSource(
  parsed: GovernanceIncidentRecoveryProfileJsonSourceSchema | null,
): GovernanceIncidentRecoveryProfileJsonSourceValidation {
  const errors: string[] = [];
  if (!parsed) {
    return { valid: false, errors: ["Parsed schema is null."] };
  }
  if (!parsed.version || parsed.version.trim().length === 0) {
    errors.push("Missing schema version.");
  }
  if (!parsed.source || parsed.source.name.trim().length === 0) {
    errors.push("Missing source metadata.name.");
  }
  if (!parsed.source || parsed.source.owner.trim().length === 0) {
    errors.push("Missing source metadata.owner.");
  }
  if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
    errors.push("Missing profiles.");
  } else {
    for (const profile of parsed.profiles) {
      if (!profile.profileName || profile.profileName.trim().length === 0) {
        errors.push(`Profile ${profile.profileId || "unknown"} missing profileName.`);
      }
      if (typeof profile.enabled !== "boolean") {
        errors.push(`Profile ${profile.profileId || "unknown"} missing enabled flag.`);
      }
      if (typeof profile.priority !== "number") {
        errors.push(`Profile ${profile.profileId || "unknown"} missing priority.`);
      }
      if (!Array.isArray(profile.rules)) {
        errors.push(`Profile ${profile.profileId || "unknown"} missing conditions/rules.`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
