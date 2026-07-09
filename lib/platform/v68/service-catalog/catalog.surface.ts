/**
 * V68 P1 — Service catalog artifact surface (read-only)
 */
export type ServiceCatalogArtifactSurface = {
  catalogDoc: string;
  verifyCatalog: string;
  verifyPlatform: string;
};

export const V68_SERVICE_CATALOG_ARTIFACT_SURFACE: ServiceCatalogArtifactSurface = {
  catalogDoc: "docs/platform/V68-SERVICE-CATALOG.md",
  verifyCatalog: "npm run verify:v68-p1-service-catalog",
  verifyPlatform: "npm run verify:v68-platform",
};

export function getServiceCatalogArtifactPath(
  key: keyof ServiceCatalogArtifactSurface,
): string {
  return V68_SERVICE_CATALOG_ARTIFACT_SURFACE[key];
}
