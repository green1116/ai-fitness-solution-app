import type { RealPricingEntry } from "../shared/types";

export const REAL_PRICING_CATALOG: RealPricingEntry[] = [
  { pricingId: "price-skillrun", sku: "TG-SKILLRUN-001", modelName: "Skillrun", brandName: "Technogym", currency: "CNY", listPrice: 218000, dealerPrice: 195000, projectPriceMin: 185000, projectPriceMax: 205000, priceValidFrom: "2026-01-01", priceSource: "authorized-dealer", mode: "real-catalog" },
  { pricingId: "price-skillbike", sku: "TG-SKILLBIKE-002", modelName: "Technogym Skillbike", brandName: "Technogym", currency: "CNY", listPrice: 138000, dealerPrice: 125000, projectPriceMin: 118000, projectPriceMax: 132000, priceValidFrom: "2026-01-01", priceSource: "authorized-dealer", mode: "real-catalog" },
  { pricingId: "price-recovery-r1", sku: "TG-RECOVERY-R1", modelName: "Recovery Station R1", brandName: "Technogym", currency: "CNY", listPrice: 68000, dealerPrice: 58000, projectPriceMin: 52000, projectPriceMax: 62000, priceValidFrom: "2026-01-01", priceSource: "authorized-dealer", mode: "real-catalog" },
  { pricingId: "price-t5", sku: "LF-T5-001", modelName: "T5 Treadmill", brandName: "Life Fitness", currency: "CNY", listPrice: 118000, dealerPrice: 105000, projectPriceMin: 98000, projectPriceMax: 112000, priceValidFrom: "2026-01-01", priceSource: "manufacturer-list", mode: "real-catalog" },
  { pricingId: "price-synrgy360", sku: "LF-SYNRGY360-001", modelName: "SYNRGY360", brandName: "Life Fitness", currency: "CNY", listPrice: 248000, dealerPrice: 225000, projectPriceMin: 210000, projectPriceMax: 235000, priceValidFrom: "2026-01-01", priceSource: "manufacturer-list", mode: "real-catalog" },
  { pricingId: "price-a5700", sku: "JH-A5700-001", modelName: "Johnson A5700", brandName: "Johnson", currency: "CNY", listPrice: 72000, dealerPrice: 65000, projectPriceMin: 58000, projectPriceMax: 68000, priceValidFrom: "2026-01-01", priceSource: "authorized-dealer", mode: "real-catalog" },
  { pricingId: "price-sdrive", sku: "MX-SDRIVE-001", modelName: "Matrix S-Drive", brandName: "Matrix", currency: "CNY", listPrice: 92000, dealerPrice: 82000, projectPriceMin: 76000, projectPriceMax: 88000, priceValidFrom: "2026-01-01", priceSource: "authorized-dealer", mode: "real-catalog" },
  { pricingId: "price-t8000", sku: "SH-T8000-001", modelName: "SH-T8000", brandName: "Shuhua", currency: "CNY", listPrice: 48000, dealerPrice: 42000, projectPriceMin: 38000, projectPriceMax: 45000, priceValidFrom: "2026-01-01", priceSource: "industry-benchmark", mode: "real-catalog" },
  { pricingId: "price-it7000", sku: "IP-IT7000-001", modelName: "Impulse IT7000", brandName: "Impulse", currency: "CNY", listPrice: 38000, dealerPrice: 34000, projectPriceMin: 30000, projectPriceMax: 36000, priceValidFrom: "2026-01-01", priceSource: "industry-benchmark", mode: "real-catalog" },
  { pricingId: "price-aibike", sku: "IF-AIBIKE-001", modelName: "AI Smart Bike Pro", brandName: "IntelligentFit", currency: "CNY", listPrice: 42000, dealerPrice: 36000, projectPriceMin: 32000, projectPriceMax: 40000, priceValidFrom: "2026-01-01", priceSource: "industry-benchmark", mode: "real-catalog" },
];

export function getRealPricingBySku(sku: string): RealPricingEntry | undefined {
  return REAL_PRICING_CATALOG.find((p) => p.sku === sku);
}

export function getRealPricingByBrand(brandName: string): RealPricingEntry[] {
  return REAL_PRICING_CATALOG.filter((p) => p.brandName === brandName);
}

export function getAllRealPricing(): RealPricingEntry[] {
  return [...REAL_PRICING_CATALOG];
}
