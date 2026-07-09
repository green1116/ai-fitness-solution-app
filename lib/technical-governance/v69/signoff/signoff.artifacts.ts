/**
 * V69 P8 — Technical governance sign-off artifact surface (read-only)
 */
export type TechnicalSignoffArtifactSurface = {
  signoffDoc: string;
  freezeDoc: string;
  verifySignoff: string;
  verifyTechnicalGovernance: string;
};

export const V69_TECHNICAL_GOVERNANCE_SIGNOFF_ARTIFACT_SURFACE: TechnicalSignoffArtifactSurface =
  {
    signoffDoc: "docs/technical-governance/V69-TECHNICAL-GOVERNANCE-SIGNOFF.md",
    freezeDoc: "docs/technical-governance/V69-TECHNICAL-GOVERNANCE-FREEZE.md",
    verifySignoff: "npm run verify:v69-p8-technical-governance-signoff",
    verifyTechnicalGovernance: "npm run verify:v69-technical-governance",
  };

export function getTechnicalSignoffArtifactPath(
  key: keyof TechnicalSignoffArtifactSurface,
): string {
  return V69_TECHNICAL_GOVERNANCE_SIGNOFF_ARTIFACT_SURFACE[key];
}
