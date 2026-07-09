/**
 * V66 P6 — Disaster recovery artifact surface (read-only)
 */
export type DrArtifactSurface = {
  drDoc: string;
  verifyDr: string;
  verifyDeployment: string;
};

export const V66_DR_ARTIFACT_SURFACE: DrArtifactSurface = {
  drDoc: "docs/deployment/V66-DISASTER-RECOVERY.md",
  verifyDr: "npm run verify:v66-p6-disaster-recovery",
  verifyDeployment: "npm run verify:v66-deployment",
};

export function getDrArtifactPath(key: keyof DrArtifactSurface): string {
  return V66_DR_ARTIFACT_SURFACE[key];
}
