import type { ProductProfile } from "../shared/types";

const PRODUCT_TYPES = [
  { suffix: "TM", name: "Treadmill Pro", category: "Treadmill", spec: "Commercial treadmill, 4.0HP motor, 23km/h max speed" },
  { suffix: "BK", name: "Studio Bike", category: "Bike", spec: "Indoor cycle, magnetic resistance, belt drive" },
  { suffix: "EL", name: "Cross Trainer", category: "Elliptical", spec: "Commercial elliptical, 20 incline levels" },
  { suffix: "ST", name: "Strength Rack", category: "Strength", spec: "Multi-station strength rack, 200kg max load" },
  { suffix: "FN", name: "Functional Trainer", category: "Functional", spec: "Dual-pulley functional trainer, 100kg stack" },
];

const BRAND_PREFIXES: Array<{ brandId: string; prefix: string }> = [
  { brandId: "brand-life-fitness", prefix: "LF" },
  { brandId: "brand-technogym", prefix: "TG" },
  { brandId: "brand-matrix", prefix: "MX" },
  { brandId: "brand-relax", prefix: "RX" },
  { brandId: "brand-shuhua", prefix: "SH" },
  { brandId: "brand-precor", prefix: "PC" },
  { brandId: "brand-impulse", prefix: "IM" },
  { brandId: "brand-dhz", prefix: "DH" },
  { brandId: "brand-bodystrength", prefix: "BS" },
  { brandId: "brand-sportsart", prefix: "SA" },
];

function buildProductsForBrand(brandId: string, prefix: string): ProductProfile[] {
  return PRODUCT_TYPES.map((type, index) => ({
    sku: `${prefix}-${type.suffix}-00${index + 1}`,
    brandId,
    name: type.name,
    category: type.category,
    specification: type.spec,
    documentRefs: [`datasheet-${prefix}-${type.suffix}`, `manual-${prefix}-${type.suffix}`],
    status: "active" as const,
    mode: "brand-portal" as const,
  }));
}

export const PRODUCT_PROFILES: ProductProfile[] = BRAND_PREFIXES.flatMap(({ brandId, prefix }) =>
  buildProductsForBrand(brandId, prefix),
);

export function getAllProductProfiles(): ProductProfile[] {
  return [...PRODUCT_PROFILES];
}

export function getProductProfileBySku(sku: string): ProductProfile | undefined {
  return PRODUCT_PROFILES.find((p) => p.sku === sku);
}

export function getProductProfilesByBrandId(brandId: string): ProductProfile[] {
  return PRODUCT_PROFILES.filter((p) => p.brandId === brandId);
}
