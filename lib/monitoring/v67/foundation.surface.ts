/**
 * V67 P1 — Monitoring foundation artifact surface (read-only)
 */
export type MonitoringFoundationArtifactSurface = {
  libEntry: string;
  foundationDoc: string;
  verifyFoundation: string;
  verifyMonitoring: string;
  upstreamVerify: string;
};

export const V67_MONITORING_ARTIFACT_SURFACE: MonitoringFoundationArtifactSurface = {
  libEntry: "lib/monitoring/v67",
  foundationDoc: "docs/monitoring/V67-MONITORING-FOUNDATION.md",
  verifyFoundation: "npm run verify:v67-p1-monitoring-foundation",
  verifyMonitoring: "npm run verify:v67-monitoring",
  upstreamVerify: "npm run verify:v66-deployment",
};

export function getMonitoringArtifactPath(
  key: keyof MonitoringFoundationArtifactSurface,
): string {
  return V67_MONITORING_ARTIFACT_SURFACE[key];
}
