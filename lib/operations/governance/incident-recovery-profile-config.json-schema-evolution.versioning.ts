export const INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION = "json-local-v2";

export function classifyJsonSchemaVersion(version: string): {
  canonical: boolean;
  legacySupported: boolean;
  deprecated: boolean;
} {
  if (version === INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_CANONICAL_VERSION) {
    return { canonical: true, legacySupported: true, deprecated: false };
  }
  if (version === "json-local-v1") {
    return { canonical: false, legacySupported: true, deprecated: true };
  }
  return { canonical: false, legacySupported: false, deprecated: false };
}
