import type { CatalogCategory, CatalogType, IndustrySector } from "./shared/types";

const CATEGORY_TITLES: Record<CatalogType, string> = {
  equipment: "Gym Equipment Category",
  flooring: "Sports Flooring Category",
  track: "Running Track Category",
  turf: "Artificial Turf Category",
  construction: "Construction Materials Category",
  service: "Operation & Service Category",
};

function buildCategory(
  catalogType: CatalogType,
  industrySector: IndustrySector,
  productCount: number,
): CatalogCategory {
  const sectorLabel = industrySector.replace(/-/g, " ");
  return {
    categoryId: `catalog-category-${catalogType}-${industrySector}`,
    catalogType,
    industrySector,
    title: CATEGORY_TITLES[catalogType],
    summary: `${CATEGORY_TITLES[catalogType]} for ${sectorLabel} sports engineering projects.`,
    productCount,
    categoryReady: productCount >= 1,
    mode: "product-catalog",
  };
}

export function buildEquipmentCategory(
  industrySector: IndustrySector = "gym-equipment",
): CatalogCategory {
  return buildCategory("equipment", industrySector, 4);
}

export function buildFlooringCategory(
  industrySector: IndustrySector = "sports-flooring",
): CatalogCategory {
  return buildCategory("flooring", industrySector, 3);
}

export function buildTrackCategory(
  industrySector: IndustrySector = "running-track",
): CatalogCategory {
  return buildCategory("track", industrySector, 3);
}

export function buildTurfCategory(
  industrySector: IndustrySector = "artificial-turf",
): CatalogCategory {
  return buildCategory("turf", industrySector, 3);
}

export function buildConstructionCategory(
  industrySector: IndustrySector = "sports-hall",
): CatalogCategory {
  return buildCategory("construction", industrySector, 3);
}

export function buildServiceCategory(
  industrySector: IndustrySector = "fitness-center",
): CatalogCategory {
  return buildCategory("service", industrySector, 2);
}

export function buildCategoryForType(
  catalogType: CatalogType,
  industrySector: IndustrySector,
): CatalogCategory {
  switch (catalogType) {
    case "equipment":
      return buildEquipmentCategory(industrySector);
    case "flooring":
      return buildFlooringCategory(industrySector);
    case "track":
      return buildTrackCategory(industrySector);
    case "turf":
      return buildTurfCategory(industrySector);
    case "construction":
      return buildConstructionCategory(industrySector);
    case "service":
      return buildServiceCategory(industrySector);
  }
}
