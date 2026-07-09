/**
 * V68 P6 — Reliability policy artifact surface (read-only)
 */
export type ReliabilityPolicyArtifactSurface = {
  policyDoc: string;
  verifyPolicy: string;
  verifyPlatform: string;
};

export const V68_RELIABILITY_POLICY_ARTIFACT_SURFACE: ReliabilityPolicyArtifactSurface = {
  policyDoc: "docs/platform/V68-RELIABILITY-POLICY.md",
  verifyPolicy: "npm run verify:v68-p6-reliability-policy",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getReliabilityPolicyArtifactPath(
  key: keyof ReliabilityPolicyArtifactSurface,
): string {
  return V68_RELIABILITY_POLICY_ARTIFACT_SURFACE[key];
}
