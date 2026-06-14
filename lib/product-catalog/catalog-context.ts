import { buildCatalogRegistryRecords } from "./catalog-registry";
import type { CatalogContext, RegistryValidation } from "./shared/types";

export function buildCatalogContext(): CatalogContext {
  const catalogs = buildCatalogRegistryRecords();

  const typeBreakdown = catalogs.reduce(
    (acc, catalog) => {
      acc[catalog.catalogType] = (acc[catalog.catalogType] ?? 0) + 1;
      return acc;
    },
    {} as CatalogContext["typeBreakdown"],
  );

  const statusBreakdown = catalogs.reduce(
    (acc, catalog) => {
      acc[catalog.catalogStatus] = (acc[catalog.catalogStatus] ?? 0) + 1;
      return acc;
    },
    {} as CatalogContext["statusBreakdown"],
  );

  const sectorBreakdown = catalogs.reduce(
    (acc, catalog) => {
      acc[catalog.industrySector] = (acc[catalog.industrySector] ?? 0) + 1;
      return acc;
    },
    {} as CatalogContext["sectorBreakdown"],
  );

  const averageScore =
    catalogs.length === 0
      ? 0
      : Math.round(
          catalogs.reduce((sum, catalog) => sum + catalog.score.totalCatalogScore, 0) /
            catalogs.length,
        );

  return {
    contextId: "product-catalog-context-v36",
    catalogs,
    catalogCount: catalogs.length,
    typeBreakdown,
    statusBreakdown,
    sectorBreakdown,
    averageScore,
    contextReady: catalogs.length >= 12,
    mode: "product-catalog",
  };
}

export function validateCatalogContext(): RegistryValidation {
  const context = buildCatalogContext();
  const valid = context.contextReady && context.averageScore > 0 && context.catalogCount >= 12;

  return {
    valid,
    count: context.catalogCount,
    summary: `catalog-context count=${context.catalogCount} averageScore=${context.averageScore} valid=${valid}`,
  };
}
