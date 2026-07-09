/**
 * V67 P8 — Monitoring sign-off artifact surface (read-only)
 */
export type MonitoringSignoffArtifactSurface = {
  signoffDoc: string;
  freezeDoc: string;
  verifySignoff: string;
  verifyMonitoring: string;
};

export const V67_MONITORING_SIGNOFF_ARTIFACT_SURFACE: MonitoringSignoffArtifactSurface = {
  signoffDoc: "docs/monitoring/V67-MONITORING-SIGNOFF.md",
  freezeDoc: "docs/monitoring/V67-MONITORING-FREEZE.md",
  verifySignoff: "npm run verify:v67-p8-monitoring-signoff",
  verifyMonitoring: "npm run verify:v67-monitoring",
};

export function getMonitoringSignoffArtifactPath(
  key: keyof MonitoringSignoffArtifactSurface,
): string {
  return V67_MONITORING_SIGNOFF_ARTIFACT_SURFACE[key];
}
