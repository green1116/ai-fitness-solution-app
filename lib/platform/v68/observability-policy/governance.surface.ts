/**
 * V68 P7 — Observability policy artifact surface (read-only)
 */
export type ObservabilityPolicyArtifactSurface = {
  policyDoc: string;
  verifyPolicy: string;
  verifyPlatform: string;
};

export const V68_OBSERVABILITY_POLICY_ARTIFACT_SURFACE: ObservabilityPolicyArtifactSurface = {
  policyDoc: "docs/platform/V68-OBSERVABILITY-POLICY.md",
  verifyPolicy: "npm run verify:v68-p7-observability-policy",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getObservabilityPolicyArtifactPath(
  key: keyof ObservabilityPolicyArtifactSurface,
): string {
  return V68_OBSERVABILITY_POLICY_ARTIFACT_SURFACE[key];
}
