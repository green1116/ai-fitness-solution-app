/**
 * V69 P3 — Code governance artifact surface (read-only)
 */
export type CodeGovernanceArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyDependency: string;
  verifyCatalog: string;
};

export const V69_CODE_GOVERNANCE_ARTIFACT_SURFACE: CodeGovernanceArtifactSurface = {
  governanceDoc: "docs/technical-governance/V69-CODE-GOVERNANCE.md",
  verifyGovernance: "npm run verify:v69-p3-code-governance",
  verifyDependency: "npm run verify:v69-p2-architecture-dependency",
  verifyCatalog: "npm run verify:v69-p1-architecture-catalog",
};

export function getCodeGovernanceArtifactPath(
  key: keyof CodeGovernanceArtifactSurface,
): string {
  return V69_CODE_GOVERNANCE_ARTIFACT_SURFACE[key];
}
