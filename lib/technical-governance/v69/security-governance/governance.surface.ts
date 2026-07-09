/**
 * V69 P5 — Security governance artifact surface (read-only)
 */
export type SecurityGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyStandards: string;
};

export const V69_SECURITY_GOVERNANCE_ARTIFACT_SURFACE: SecurityGovernanceArtifactSurface = {
  governanceDoc: "docs/technical-governance/V69-SECURITY-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v69-p5-security-governance",
  verifyStandards: "npm run verify:v69-p4-technical-standards",
};

export function getSecurityGovernanceArtifactPath(
  key: keyof SecurityGovernanceArtifactSurface,
): string {
  return V69_SECURITY_GOVERNANCE_ARTIFACT_SURFACE[key];
}
