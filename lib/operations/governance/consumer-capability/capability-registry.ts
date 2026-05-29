export const RUNTIME_REQUIRED_CAPABILITIES = [
  "canonical-payload-read",
  "schema-v2",
  "rendering-output",
  "audit-trace",
  "recovery-strategy-bind",
] as const;

export const CAPABILITY_FEATURE_DEPENDENCIES: Record<string, string[]> = {
  "rendering-output": ["canonical-payload-read"],
  "audit-trace": ["canonical-payload-read"],
  "recovery-strategy-bind": ["canonical-payload-read", "schema-v2"],
  "full-rendering": ["rendering-output", "schema-v2"],
  "partial-rendering": ["rendering-output"],
  "fallback-rendering": ["canonical-payload-read"],
};

export function buildCapabilityVersionMatrix(): import("./capability-types").CapabilityVersionMatrixEntry[] {
  return [
    {
      capability: "schema-v2",
      supportedVersions: ["v2", "json-local-v2"],
      deprecatedVersions: ["v1", "json-local-v1"],
      minimumSupportedVersion: "v2",
      migrationAvailable: true,
    },
    {
      capability: "negotiation",
      supportedVersions: ["r9.2-1", "r9.1-1"],
      deprecatedVersions: ["r9.0-legacy"],
      minimumSupportedVersion: "r9.1-1",
      migrationAvailable: true,
    },
    {
      capability: "rendering-output",
      supportedVersions: ["strict", "compat", "lenient", "audit"],
      deprecatedVersions: ["legacy-render"],
      minimumSupportedVersion: "compat",
      migrationAvailable: false,
    },
  ];
}
