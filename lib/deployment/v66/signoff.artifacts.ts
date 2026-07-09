/**
 * V66 P8 — Deployment sign-off artifact surface (read-only)
 */
export type SignoffArtifactSurface = {
  signoffDoc: string;
  freezeDoc: string;
  verifySignoff: string;
  verifyDeployment: string;
};

export const V66_SIGNOFF_ARTIFACT_SURFACE: SignoffArtifactSurface = {
  signoffDoc: "docs/deployment/V66-DEPLOYMENT-SIGNOFF.md",
  freezeDoc: "docs/deployment/V66-DEPLOYMENT-FREEZE.md",
  verifySignoff: "npm run verify:v66-p8-deployment-signoff",
  verifyDeployment: "npm run verify:v66-deployment",
};

export function getSignoffArtifactPath(key: keyof SignoffArtifactSurface): string {
  return V66_SIGNOFF_ARTIFACT_SURFACE[key];
}
