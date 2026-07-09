/**
 * V66 P3 — Observability artifact surface (read-only)
 */
export type ObservabilityArtifactSurface = {
  observabilityDoc: string;
  verifyObservability: string;
  verifyDeployment: string;
};

export const V66_OBSERVABILITY_ARTIFACT_SURFACE: ObservabilityArtifactSurface = {
  observabilityDoc: "docs/deployment/V66-DEPLOYMENT-OBSERVABILITY.md",
  verifyObservability: "npm run verify:v66-p3-deployment-observability",
  verifyDeployment: "npm run verify:v66-deployment",
};

export function getObservabilityArtifactPath(
  key: keyof ObservabilityArtifactSurface,
): string {
  return V66_OBSERVABILITY_ARTIFACT_SURFACE[key];
}
