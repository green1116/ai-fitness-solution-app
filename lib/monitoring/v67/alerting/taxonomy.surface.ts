/**
 * V67 P3 — Alert taxonomy artifact surface (read-only)
 */
export type AlertTaxonomyArtifactSurface = {
  taxonomyDoc: string;
  verifyTaxonomy: string;
  verifyMonitoring: string;
};

export const V67_ALERT_TAXONOMY_ARTIFACT_SURFACE: AlertTaxonomyArtifactSurface = {
  taxonomyDoc: "docs/monitoring/V67-ALERT-TAXONOMY.md",
  verifyTaxonomy: "npm run verify:v67-p3-alert-taxonomy",
  verifyMonitoring: "npm run verify:v67-monitoring",
};

export function getAlertTaxonomyArtifactPath(
  key: keyof AlertTaxonomyArtifactSurface,
): string {
  return V67_ALERT_TAXONOMY_ARTIFACT_SURFACE[key];
}
