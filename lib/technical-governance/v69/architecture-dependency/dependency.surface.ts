/**
 * V69 P2 — Architecture dependency artifact surface (read-only)
 */
export type ArchitectureDependencyArtifactSurface = {
  dependencyDoc: string;
  verifyDependency: string;
  verifyCatalog: string;
};

export const V69_ARCHITECTURE_DEPENDENCY_ARTIFACT_SURFACE: ArchitectureDependencyArtifactSurface =
  {
    dependencyDoc: "docs/technical-governance/V69-ARCHITECTURE-DEPENDENCY.md",
    verifyDependency: "npm run verify:v69-p2-architecture-dependency",
    verifyCatalog: "npm run verify:v69-p1-architecture-catalog",
  };

export function getArchitectureDependencyArtifactPath(
  key: keyof ArchitectureDependencyArtifactSurface,
): string {
  return V69_ARCHITECTURE_DEPENDENCY_ARTIFACT_SURFACE[key];
}
