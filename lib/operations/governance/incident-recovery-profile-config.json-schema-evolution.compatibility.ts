import type { GovernanceIncidentRecoveryProfileJsonSchemaEvolutionCompatibility } from "./incident-recovery-profile-config.json-schema-evolution.types";
import { classifyJsonSchemaVersion } from "./incident-recovery-profile-config.json-schema-evolution.versioning";

export function evaluateIncidentRecoveryProfileJsonSchemaCompatibility(input: {
  version: string;
  guardValid: boolean;
}): GovernanceIncidentRecoveryProfileJsonSchemaEvolutionCompatibility {
  if (!input.guardValid) return "compatibleWithFallback";
  const classification = classifyJsonSchemaVersion(input.version);
  if (classification.canonical) return "fullyCompatible";
  if (classification.legacySupported) return "compatibleWithMigration";
  return "incompatible";
}
