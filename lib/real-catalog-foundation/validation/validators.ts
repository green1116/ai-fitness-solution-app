import { getAllRealBrands } from "../brand-catalog";
import { getAllRealEquipment } from "../equipment-catalog";
import { getAllRealMaintenance } from "../maintenance-catalog";
import { getAllRealPricing } from "../pricing-catalog";
import { getAllRealReplacement } from "../replacement-catalog";

export interface CatalogValidationResult {
  valid: boolean;
  catalogIntegrityScore: number;
  purchasabilityScore: number;
  issues: string[];
  summary: string;
}

export function validateRealCatalogFoundation(): CatalogValidationResult {
  const brands = getAllRealBrands();
  const equipment = getAllRealEquipment();
  const pricing = getAllRealPricing();
  const maintenance = getAllRealMaintenance();
  const replacement = getAllRealReplacement();
  const issues: string[] = [];

  const equipmentSkus = new Set(equipment.map((e) => e.sku));
  const pricingSkus = new Set(pricing.map((p) => p.sku));
  const maintenanceSkus = new Set(maintenance.map((m) => m.sku));
  const replacementSkus = new Set(replacement.map((r) => r.sku));

  for (const sku of equipmentSkus) {
    if (!pricingSkus.has(sku)) issues.push(`Missing pricing for SKU: ${sku}`);
    if (!maintenanceSkus.has(sku)) issues.push(`Missing maintenance for SKU: ${sku}`);
    if (!replacementSkus.has(sku)) issues.push(`Missing replacement for SKU: ${sku}`);
  }

  for (const equip of equipment) {
    const brand = brands.find((b) => b.brandId === equip.brandId);
    if (!brand) issues.push(`Orphan equipment brand: ${equip.brandName} (${equip.sku})`);
    if (equip.mode !== "real-catalog") issues.push(`Non-real mode equipment: ${equip.sku}`);
  }

  for (const price of pricing) {
    if (price.projectPriceMin > price.projectPriceMax) {
      issues.push(`Invalid price range for ${price.sku}`);
    }
    if (price.dealerPrice > price.listPrice) {
      issues.push(`Dealer price exceeds list price for ${price.sku}`);
    }
  }

  const pricingCoverage = Math.round((pricingSkus.size / equipmentSkus.size) * 100);
  const maintenanceCoverage = Math.round((maintenanceSkus.size / equipmentSkus.size) * 100);
  const replacementCoverage = Math.round((replacementSkus.size / equipmentSkus.size) * 100);

  const brandEquipmentLink = equipment.filter((e) =>
    brands.some((b) => b.brandId === e.brandId),
  ).length;
  const brandLinkScore = Math.round((brandEquipmentLink / equipment.length) * 100);

  const catalogIntegrityScore = Math.min(
    100,
    Math.round(
      (pricingCoverage + maintenanceCoverage + replacementCoverage + brandLinkScore) / 4,
    ) - issues.length * 5,
  );

  const inStockCount = equipment.filter((e) => e.procurementAvailability === "in-stock").length;
  const purchasabilityScore = Math.min(
    100,
    Math.round(
      catalogIntegrityScore * 0.6 +
        (inStockCount / equipment.length) * 100 * 0.2 +
        (brands.length >= 6 ? 20 : 10),
    ),
  );

  return {
    valid: issues.length === 0 && catalogIntegrityScore >= 90 && purchasabilityScore >= 85,
    catalogIntegrityScore: Math.max(0, catalogIntegrityScore),
    purchasabilityScore,
    issues,
    summary: `catalog-validation integrity=${catalogIntegrityScore}% purchasability=${purchasabilityScore}% issues=${issues.length}`,
  };
}

export function validateRealBrandCatalog(): { valid: boolean; count: number } {
  const brands = getAllRealBrands();
  const valid = brands.length >= 6 && brands.every((b) => b.mode === "real-catalog" && b.chinaDistributor.length > 0);
  return { valid, count: brands.length };
}

export function validateRealEquipmentCatalog(): { valid: boolean; count: number } {
  const equipment = getAllRealEquipment();
  const valid = equipment.length >= 10 && equipment.every((e) => e.sku.length > 0 && e.datasheetRef.length > 0);
  return { valid, count: equipment.length };
}

export function validateRealPricingCatalog(): { valid: boolean; count: number; coverage: number } {
  const equipment = getAllRealEquipment();
  const pricing = getAllRealPricing();
  const coverage = Math.round((pricing.length / equipment.length) * 100);
  const valid = coverage === 100 && pricing.every((p) => p.projectPriceMin <= p.projectPriceMax);
  return { valid, count: pricing.length, coverage };
}

export function validateRealMaintenanceCatalog(): { valid: boolean; count: number; coverage: number } {
  const equipment = getAllRealEquipment();
  const maintenance = getAllRealMaintenance();
  const coverage = Math.round((maintenance.length / equipment.length) * 100);
  const valid = coverage === 100 && maintenance.every((m) => m.annualMaintenanceCost > 0);
  return { valid, count: maintenance.length, coverage };
}

export function validateRealReplacementCatalog(): { valid: boolean; count: number; coverage: number } {
  const equipment = getAllRealEquipment();
  const replacement = getAllRealReplacement();
  const coverage = Math.round((replacement.length / equipment.length) * 100);
  const valid = coverage === 100 && replacement.every((r) => r.expectedLifespanYears > 0);
  return { valid, count: replacement.length, coverage };
}
