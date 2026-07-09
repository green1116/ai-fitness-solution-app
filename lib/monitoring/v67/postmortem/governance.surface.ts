/**
 * V67 P7 — Postmortem foundation artifact surface (read-only)
 */
export type PostmortemFoundationArtifactSurface = {
  foundationDoc: string;
  verifyFoundation: string;
  verifyMonitoring: string;
};

export const V67_POSTMORTEM_FOUNDATION_ARTIFACT_SURFACE: PostmortemFoundationArtifactSurface = {
  foundationDoc: "docs/monitoring/V67-POSTMORTEM-FOUNDATION.md",
  verifyFoundation: "npm run verify:v67-p7-postmortem-foundation",
  verifyMonitoring: "npm run verify:v67-monitoring",
};

export function getPostmortemFoundationArtifactPath(
  key: keyof PostmortemFoundationArtifactSurface,
): string {
  return V67_POSTMORTEM_FOUNDATION_ARTIFACT_SURFACE[key];
}
