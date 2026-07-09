/**
 * V67 P4 — SLO governance artifact surface (read-only)
 */
export type SloGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyMonitoring: string;
};

export const V67_SLO_GOVERNANCE_ARTIFACT_SURFACE: SloGovernanceArtifactSurface = {
  governanceDoc: "docs/monitoring/V67-SLO-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v67-p4-slo-governance",
  verifyMonitoring: "npm run verify:v67-monitoring",
};

export function getSloGovernanceArtifactPath(
  key: keyof SloGovernanceArtifactSurface,
): string {
  return V67_SLO_GOVERNANCE_ARTIFACT_SURFACE[key];
}
