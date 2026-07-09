/**
 * V66 P7 — Deployment ops artifact surface (read-only)
 */
export type OpsArtifactSurface = {
  opsDoc: string;
  verifyOps: string;
  verifyDeployment: string;
};

export const V66_OPS_ARTIFACT_SURFACE: OpsArtifactSurface = {
  opsDoc: "docs/deployment/V66-DEPLOYMENT-OPS.md",
  verifyOps: "npm run verify:v66-p7-deployment-ops",
  verifyDeployment: "npm run verify:v66-deployment",
};

export function getOpsArtifactPath(key: keyof OpsArtifactSurface): string {
  return V66_OPS_ARTIFACT_SURFACE[key];
}
