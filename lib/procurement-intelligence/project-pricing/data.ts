import type { ProjectPricingEntry } from "../shared/types";

export const PROJECT_PRICING_CATALOG: ProjectPricingEntry[] = [
  {
    id: "pp-lf-t5-commercial-medium",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    projectType: "commercial-gym",
    projectSize: "medium",
    basePrice: 105000,
    discountRate: 0.08,
    finalPrice: 96600,
    currency: "CNY",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "pp-lf-t5-hotel-small",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    projectType: "hotel",
    projectSize: "small",
    basePrice: 105000,
    discountRate: 0.05,
    finalPrice: 99750,
    currency: "CNY",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "pp-tg-skillrun-enterprise",
    brand: "Technogym",
    sku: "TG-SKILLRUN-001",
    projectType: "enterprise",
    projectSize: "enterprise",
    basePrice: 195000,
    discountRate: 0.12,
    finalPrice: 171600,
    currency: "CNY",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "pp-sh-t8000-campus",
    brand: "Shuhua",
    sku: "SH-T8000-001",
    projectType: "campus",
    projectSize: "large",
    basePrice: 40000,
    discountRate: 0.1,
    finalPrice: 36000,
    currency: "CNY",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "pp-mx-sdrive-community",
    brand: "Matrix",
    sku: "MX-SDRIVE-001",
    projectType: "community",
    projectSize: "small",
    basePrice: 76000,
    discountRate: 0.06,
    finalPrice: 71440,
    currency: "CNY",
    status: "active",
    mode: "procurement-intelligence",
  },
];

export function getProjectPricingBySku(sku: string): ProjectPricingEntry[] {
  return PROJECT_PRICING_CATALOG.filter((e) => e.sku === sku);
}

export function getProjectPricingByType(projectType: string): ProjectPricingEntry[] {
  return PROJECT_PRICING_CATALOG.filter((e) => e.projectType === projectType);
}

export function getAllProjectPricing(): ProjectPricingEntry[] {
  return [...PROJECT_PRICING_CATALOG];
}
