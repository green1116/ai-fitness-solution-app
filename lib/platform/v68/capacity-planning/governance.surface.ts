/**
 * V68 P5 — Capacity planning artifact surface (read-only)
 */
export type CapacityPlanningArtifactSurface = {
  planningDoc: string;
  verifyPlanning: string;
  verifyPlatform: string;
};

export const V68_CAPACITY_PLANNING_ARTIFACT_SURFACE: CapacityPlanningArtifactSurface = {
  planningDoc: "docs/platform/V68-CAPACITY-PLANNING.md",
  verifyPlanning: "npm run verify:v68-p5-capacity-planning",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getCapacityPlanningArtifactPath(
  key: keyof CapacityPlanningArtifactSurface,
): string {
  return V68_CAPACITY_PLANNING_ARTIFACT_SURFACE[key];
}
