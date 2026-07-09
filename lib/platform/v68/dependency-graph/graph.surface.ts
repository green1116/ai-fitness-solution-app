/**
 * V68 P2 — Dependency graph artifact surface (read-only)
 */
export type DependencyGraphArtifactSurface = {
  graphDoc: string;
  verifyGraph: string;
  verifyPlatform: string;
};

export const V68_DEPENDENCY_GRAPH_ARTIFACT_SURFACE: DependencyGraphArtifactSurface = {
  graphDoc: "docs/platform/V68-DEPENDENCY-GRAPH.md",
  verifyGraph: "npm run verify:v68-p2-dependency-graph",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getDependencyGraphArtifactPath(
  key: keyof DependencyGraphArtifactSurface,
): string {
  return V68_DEPENDENCY_GRAPH_ARTIFACT_SURFACE[key];
}
