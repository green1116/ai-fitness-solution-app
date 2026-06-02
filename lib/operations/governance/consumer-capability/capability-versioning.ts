import { buildCapabilityVersionMatrix } from "./capability-registry";
import type { CapabilityVersionMatrixEntry, ConsumerCapabilityProfile } from "./capability-types";

export function evaluateCapabilityVersionGovernance(input: {
  profile: ConsumerCapabilityProfile;
  canonicalVersion: string;
}): {
  matrix: CapabilityVersionMatrixEntry[];
  conflicts: string[];
  upgradeRecommendations: string[];
} {
  const matrix = buildCapabilityVersionMatrix();
  const conflicts: string[] = [];
  const upgradeRecommendations: string[] = [];

  for (const entry of matrix) {
    const consumerSupports = input.profile.supportedSchemas.some(
      (s) => entry.supportedVersions.includes(s) || s === input.canonicalVersion,
    );
    const usesDeprecated = input.profile.supportedSchemas.some((s) =>
      entry.deprecatedVersions.includes(s),
    );
    if (usesDeprecated) {
      conflicts.push(`${entry.capability}: deprecated schema in use`);
      if (entry.migrationAvailable) {
        upgradeRecommendations.push(`Migrate ${entry.capability} to ${entry.minimumSupportedVersion}`);
      }
    }
    if (!consumerSupports && entry.capability === "schema-v2") {
      conflicts.push(`${entry.capability}: schema version mismatch with canonical ${input.canonicalVersion}`);
    }
  }

  if (!input.profile.supportedFeatures.includes("schema-v2")) {
    upgradeRecommendations.push("Enable schema-v2 for full negotiated compatibility");
  }

  return { matrix, conflicts, upgradeRecommendations };
}
