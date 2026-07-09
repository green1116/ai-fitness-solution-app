/**
 * V68 P4 — Feature flag artifact surface (read-only)
 */
export type FeatureFlagGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyPlatform: string;
};

export const V68_FEATURE_FLAG_GOVERNANCE_ARTIFACT_SURFACE: FeatureFlagGovernanceArtifactSurface = {
  governanceDoc: "docs/platform/V68-FEATURE-FLAG-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v68-p4-feature-flag-governance",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getFeatureFlagGovernanceArtifactPath(
  key: keyof FeatureFlagGovernanceArtifactSurface,
): string {
  return V68_FEATURE_FLAG_GOVERNANCE_ARTIFACT_SURFACE[key];
}
