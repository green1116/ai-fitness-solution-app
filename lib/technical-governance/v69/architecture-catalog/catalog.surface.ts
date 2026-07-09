/**
 * V69 P1 — Architecture catalog artifact surface (read-only)
 */
export type ArchitectureCatalogArtifactSurface = {
  catalogDoc: string;
  verifyCatalog: string;
};

export const V69_ARCHITECTURE_CATALOG_ARTIFACT_SURFACE: ArchitectureCatalogArtifactSurface = {
  catalogDoc: "docs/technical-governance/V69-ARCHITECTURE-CATALOG.md",
  verifyCatalog: "npm run verify:v69-p1-architecture-catalog",
};

export function getArchitectureCatalogArtifactPath(
  key: keyof ArchitectureCatalogArtifactSurface,
): string {
  return V69_ARCHITECTURE_CATALOG_ARTIFACT_SURFACE[key];
}
