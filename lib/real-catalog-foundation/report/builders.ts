import { getAllRealBrands } from "../brand-catalog";
import { getAllRealEquipment } from "../equipment-catalog";
import { getAllRealMaintenance } from "../maintenance-catalog";
import { getAllRealPricing } from "../pricing-catalog";
import { getAllRealReplacement } from "../replacement-catalog";
import type { RealCatalogFoundationReport } from "../shared/types";
import { REAL_CATALOG_FOUNDATION_VERSION } from "../shared/types";
import { validateRealCatalogFoundation } from "../validation/validators";

export function buildRealCatalogFoundationReport(): RealCatalogFoundationReport {
  const brands = getAllRealBrands();
  const equipment = getAllRealEquipment();
  const pricing = getAllRealPricing();
  const maintenance = getAllRealMaintenance();
  const replacement = getAllRealReplacement();
  const validation = validateRealCatalogFoundation();

  const brandSummaries = brands.map((brand) => ({
    brandName: brand.brandName,
    brandTier: brand.brandTier,
    equipmentCount: equipment.filter((e) => e.brandId === brand.brandId).length,
  }));

  return {
    version: REAL_CATALOG_FOUNDATION_VERSION,
    reportId: `real-catalog-foundation-report-${Date.now()}`,
    brandCount: brands.length,
    equipmentCount: equipment.length,
    pricingEntryCount: pricing.length,
    maintenanceEntryCount: maintenance.length,
    replacementEntryCount: replacement.length,
    catalogIntegrityScore: validation.catalogIntegrityScore,
    purchasabilityScore: validation.purchasabilityScore,
    brands: brandSummaries,
    summary: [
      "real-catalog-foundation-report",
      `brands=${brands.length}`,
      `equipment=${equipment.length}`,
      `integrity=${validation.catalogIntegrityScore}%`,
      `purchasability=${validation.purchasabilityScore}%`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
