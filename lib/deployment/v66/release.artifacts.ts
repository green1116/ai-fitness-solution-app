/**
 * V66 P4 — Release orchestration artifact surface (read-only)
 */
export type ReleaseArtifactSurface = {
  orchestrationDoc: string;
  verifyOrchestration: string;
  verifyDeployment: string;
};

export const V66_RELEASE_ARTIFACT_SURFACE: ReleaseArtifactSurface = {
  orchestrationDoc: "docs/deployment/V66-RELEASE-ORCHESTRATION.md",
  verifyOrchestration: "npm run verify:v66-p4-release-orchestration",
  verifyDeployment: "npm run verify:v66-deployment",
};

export function getReleaseArtifactPath(key: keyof ReleaseArtifactSurface): string {
  return V66_RELEASE_ARTIFACT_SURFACE[key];
}
