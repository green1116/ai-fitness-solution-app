import { getAllRealBrands, getRealBrandByName } from "../brand-catalog";
import { getAllRealEquipment, getRealEquipmentByBrand, getRealEquipmentBySku } from "../equipment-catalog";
import { getAllRealMaintenance, getRealMaintenanceBySku } from "../maintenance-catalog";
import { getAllRealPricing, getRealPricingBySku } from "../pricing-catalog";
import { getAllRealReplacement, getRealReplacementBySku } from "../replacement-catalog";
import type { RealEquipmentEntry } from "../shared/types";

export interface RealCatalogBundle {
  brand: ReturnType<typeof getRealBrandByName>;
  equipment: ReturnType<typeof getRealEquipmentBySku>;
  pricing: ReturnType<typeof getRealPricingBySku>;
  maintenance: ReturnType<typeof getRealMaintenanceBySku>;
  replacement: ReturnType<typeof getRealReplacementBySku>;
}

export function buildRealCatalogBundle(sku: string): RealCatalogBundle | null {
  const equipment = getRealEquipmentBySku(sku);
  if (!equipment) return null;
  return {
    brand: getRealBrandByName(equipment.brandName),
    equipment,
    pricing: getRealPricingBySku(sku),
    maintenance: getRealMaintenanceBySku(sku),
    replacement: getRealReplacementBySku(sku),
  };
}

export function buildRealCatalogBundleByBrand(brandName: string): RealCatalogBundle[] {
  return getRealEquipmentByBrand(brandName)
    .map((e: RealEquipmentEntry) => buildRealCatalogBundle(e.sku))
    .filter((b): b is RealCatalogBundle => b !== null);
}

export function getRealCatalogSummary() {
  return {
    brandCount: getAllRealBrands().length,
    equipmentCount: getAllRealEquipment().length,
    pricingCount: getAllRealPricing().length,
    maintenanceCount: getAllRealMaintenance().length,
    replacementCount: getAllRealReplacement().length,
  };
}
