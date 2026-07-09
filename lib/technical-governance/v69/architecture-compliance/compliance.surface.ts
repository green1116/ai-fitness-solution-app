/**
 * V69 P7 — Architecture compliance artifact surface (read-only)
 */
export type ArchitectureComplianceArtifactSurface = {
  complianceDoc: string;
  verifyCompliance: string;
  verifyQuality: string;
};

export const V69_ARCHITECTURE_COMPLIANCE_ARTIFACT_SURFACE: ArchitectureComplianceArtifactSurface =
  {
    complianceDoc: "docs/technical-governance/V69-ARCHITECTURE-COMPLIANCE.md",
    verifyCompliance: "npm run verify:v69-p7-architecture-compliance",
    verifyQuality: "npm run verify:v69-p6-quality-governance",
  };

export function getArchitectureComplianceArtifactPath(
  key: keyof ArchitectureComplianceArtifactSurface,
): string {
  return V69_ARCHITECTURE_COMPLIANCE_ARTIFACT_SURFACE[key];
}
