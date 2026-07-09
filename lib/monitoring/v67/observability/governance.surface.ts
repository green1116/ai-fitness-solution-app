/**
 * V67 P6 — Observability dashboard artifact surface (read-only)
 */
export type ObservabilityDashboardArtifactSurface = {
  governanceDoc: string;
  verifyGovernance: string;
  verifyMonitoring: string;
};

export const V67_OBSERVABILITY_DASHBOARD_ARTIFACT_SURFACE: ObservabilityDashboardArtifactSurface = {
  governanceDoc: "docs/monitoring/V67-OBSERVABILITY-DASHBOARD.md",
  verifyGovernance: "npm run verify:v67-p6-observability-dashboard",
  verifyMonitoring: "npm run verify:v67-monitoring",
};

export function getObservabilityDashboardArtifactPath(
  key: keyof ObservabilityDashboardArtifactSurface,
): string {
  return V67_OBSERVABILITY_DASHBOARD_ARTIFACT_SURFACE[key];
}
