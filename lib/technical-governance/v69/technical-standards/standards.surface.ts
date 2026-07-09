/**
 * V69 P4 — Technical standards artifact surface (read-only)
 */
export type TechnicalStandardsArtifactSurface = {
  standardsDoc: string;
  verifyStandards: string;
  verifyGovernance: string;
};

export const V69_TECHNICAL_STANDARDS_ARTIFACT_SURFACE: TechnicalStandardsArtifactSurface = {
  standardsDoc: "docs/technical-governance/V69-TECHNICAL-STANDARDS.md",
  verifyStandards: "npm run verify:v69-p4-technical-standards",
  verifyGovernance: "npm run verify:v69-p3-code-governance",
};

export function getTechnicalStandardsArtifactPath(
  key: keyof TechnicalStandardsArtifactSurface,
): string {
  return V69_TECHNICAL_STANDARDS_ARTIFACT_SURFACE[key];
}
