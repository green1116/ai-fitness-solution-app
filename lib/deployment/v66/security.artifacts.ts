/**
 * V66 P5 — Deployment security artifact surface (read-only)
 */
export type SecurityArtifactSurface = {
  securityDoc: string;
  verifySecurity: string;
  verifyDeployment: string;
};

export const V66_SECURITY_ARTIFACT_SURFACE: SecurityArtifactSurface = {
  securityDoc: "docs/deployment/V66-DEPLOYMENT-SECURITY.md",
  verifySecurity: "npm run verify:v66-p5-deployment-security",
  verifyDeployment: "npm run verify:v66-deployment",
};

export function getSecurityArtifactPath(key: keyof SecurityArtifactSurface): string {
  return V66_SECURITY_ARTIFACT_SURFACE[key];
}
