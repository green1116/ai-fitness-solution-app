/**
 * V69 P6 — Quality governance artifact surface (read-only)
 */
export type QualityGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifySecurity: string;
};

export const V69_QUALITY_GOVERNANCE_ARTIFACT_SURFACE: QualityGovernanceArtifactSurface = {
  governanceDoc: "docs/technical-governance/V69-QUALITY-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v69-p6-quality-governance",
  verifySecurity: "npm run verify:v69-p5-security-governance",
};

export function getQualityGovernanceArtifactPath(
  key: keyof QualityGovernanceArtifactSurface,
): string {
  return V69_QUALITY_GOVERNANCE_ARTIFACT_SURFACE[key];
}
