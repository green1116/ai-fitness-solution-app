/**
 * V67 P5 — On-call governance artifact surface (read-only)
 */
export type OncallGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyMonitoring: string;
};

export const V67_ONCALL_GOVERNANCE_ARTIFACT_SURFACE: OncallGovernanceArtifactSurface = {
  governanceDoc: "docs/monitoring/V67-ONCALL-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v67-p5-oncall-governance",
  verifyMonitoring: "npm run verify:v67-monitoring",
};

export function getOncallGovernanceArtifactPath(
  key: keyof OncallGovernanceArtifactSurface,
): string {
  return V67_ONCALL_GOVERNANCE_ARTIFACT_SURFACE[key];
}
