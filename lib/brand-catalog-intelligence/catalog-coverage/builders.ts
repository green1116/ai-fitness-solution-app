import { buildBrandIntelligenceSnapshot } from "../brand-intelligence/builders";
import { buildEquipmentIntelligenceSnapshot } from "../equipment-intelligence/builders";
import type { CatalogCoverageSnapshot } from "./types";

const TARGET_BRANDS = 7;
const TARGET_CATEGORIES = 5;
const TARGET_EQUIPMENT = 10;

export function buildCatalogCoverageSnapshot(input?: { deploymentId?: string }): CatalogCoverageSnapshot {
  const deploymentId = input?.deploymentId ?? "catalog-coverage-default";
  const brandIntel = buildBrandIntelligenceSnapshot({ deploymentId });
  const equipIntel = buildEquipmentIntelligenceSnapshot({ deploymentId });

  const brandCount = brandIntel.profiles.length;
  const categoryCount = Object.values(equipIntel.categoryCoverage).filter((c) => c > 0).length;
  const equipmentCount = equipIntel.profiles.length;

  const brandCoverage = Math.round((brandCount / TARGET_BRANDS) * 100);
  const categoryCoverage = Math.round((categoryCount / TARGET_CATEGORIES) * 100);
  const equipmentCoverage = Math.round((equipmentCount / TARGET_EQUIPMENT) * 100);

  const catalogCompletenessScore = Math.round(
    (brandCoverage + categoryCoverage + equipmentCoverage) / 3,
  );

  return {
    snapshotId: `catalog-coverage-${deploymentId}`,
    brandCoverage,
    categoryCoverage,
    equipmentCoverage,
    catalogCompletenessScore,
    brandCount,
    categoryCount,
    equipmentCount,
  };
}
