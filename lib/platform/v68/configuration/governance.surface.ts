/**
 * V68 P3 — Configuration governance artifact surface (read-only)
 */
export type ConfigurationGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyPlatform: string;
};

export const V68_CONFIGURATION_GOVERNANCE_ARTIFACT_SURFACE: ConfigurationGovernanceArtifactSurface = {
  governanceDoc: "docs/platform/V68-CONFIGURATION-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v68-p3-configuration-governance",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getConfigurationGovernanceArtifactPath(
  key: keyof ConfigurationGovernanceArtifactSurface,
): string {
  return V68_CONFIGURATION_GOVERNANCE_ARTIFACT_SURFACE[key];
}
