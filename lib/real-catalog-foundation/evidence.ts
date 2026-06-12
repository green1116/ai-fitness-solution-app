import { getAllRealBrands } from "./brand-catalog";
import { getAllRealEquipment } from "./equipment-catalog";
import { getAllRealMaintenance } from "./maintenance-catalog";
import { getAllRealPricing } from "./pricing-catalog";
import { getAllRealReplacement } from "./replacement-catalog";
import type { RealCatalogFoundationEvidence } from "./shared/types";
import { REAL_CATALOG_FOUNDATION_VERSION } from "./shared/types";
import { validateRealCatalogFoundation } from "./validation/validators";

export const REAL_CATALOG_DOMAINS = [
  "real-brand-catalog",
  "real-equipment-catalog",
  "real-pricing-catalog",
  "real-maintenance-catalog",
  "real-replacement-catalog",
] as const;

export function buildRealCatalogFoundationEvidence(): RealCatalogFoundationEvidence {
  const brands = getAllRealBrands();
  const equipment = getAllRealEquipment();
  const pricing = getAllRealPricing();
  const maintenance = getAllRealMaintenance();
  const replacement = getAllRealReplacement();
  const validation = validateRealCatalogFoundation();

  if (!validation.valid) {
    throw new Error(
      `Real catalog foundation evidence incomplete: ${validation.issues.join("; ")}`,
    );
  }

  const pricingCoverage = Math.round((pricing.length / equipment.length) * 100);
  const maintenanceCoverage = Math.round((maintenance.length / equipment.length) * 100);
  const replacementCoverage = Math.round((replacement.length / equipment.length) * 100);

  return {
    evidenceId: `evidence-real-catalog-foundation-${Date.now()}`,
    version: REAL_CATALOG_FOUNDATION_VERSION,
    catalogs: [...REAL_CATALOG_DOMAINS],
    brandCount: brands.length,
    equipmentCount: equipment.length,
    pricingCoverage,
    maintenanceCoverage,
    replacementCoverage,
    catalogIntegrityScore: validation.catalogIntegrityScore,
    generatedAt: new Date().toISOString(),
    summary: `real-catalog-foundation-evidence catalogs=${REAL_CATALOG_DOMAINS.length} integrity=${validation.catalogIntegrityScore}%`,
  };
}
