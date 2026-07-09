/**
 * V67 P2 — Incident lifecycle artifact surface (read-only)
 */
export type IncidentLifecycleArtifactSurface = {
  lifecycleDoc: string;
  verifyLifecycle: string;
  verifyMonitoring: string;
  foundationVerify: string;
};

export const V67_INCIDENT_LIFECYCLE_ARTIFACT_SURFACE: IncidentLifecycleArtifactSurface = {
  lifecycleDoc: "docs/monitoring/V67-INCIDENT-LIFECYCLE.md",
  verifyLifecycle: "npm run verify:v67-p2-incident-lifecycle",
  verifyMonitoring: "npm run verify:v67-monitoring",
  foundationVerify: "npm run verify:v67-p1-monitoring-foundation",
};

export function getIncidentLifecycleArtifactPath(
  key: keyof IncidentLifecycleArtifactSurface,
): string {
  return V67_INCIDENT_LIFECYCLE_ARTIFACT_SURFACE[key];
}
