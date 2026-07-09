/**
 * V66 P1 — Deployment artifact surface (read-only)
 */
export type DeploymentArtifactSurface = {
  libEntry: string;
  baselineDoc: string;
  envExample: string;
  verifyDeployment: string;
  verifyBaseline: string;
  upstreamVerify: string;
};

export const V66_DEPLOYMENT_ARTIFACT_SURFACE: DeploymentArtifactSurface = {
  libEntry: "lib/deployment/v66",
  baselineDoc: "docs/deployment/V66-DEPLOYMENT-BASELINE.md",
  envExample: ".env.example",
  verifyDeployment: "npm run verify:v66-deployment",
  verifyBaseline: "npm run verify:v66-p1-deployment-baseline",
  upstreamVerify: "npm run verify:v65-production",
};

export function getDeploymentArtifactPath(key: keyof DeploymentArtifactSurface): string {
  return V66_DEPLOYMENT_ARTIFACT_SURFACE[key];
}
