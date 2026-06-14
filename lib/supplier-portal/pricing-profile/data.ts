import type { PricingProfile } from "../shared/types";

export const PRICING_PROFILES: PricingProfile[] = [
  {
    pricingId: "price-lf-t5-001",
    sku: "LF-T5-001",
    listPrice: 118000,
    dealerPrice: 105000,
    projectPrice: 105000,
    bulkPrice: 98000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-lf-tm-001",
    sku: "LF-TM-001",
    listPrice: 115000,
    dealerPrice: 103000,
    projectPrice: 100000,
    bulkPrice: 95000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-tg-skillrun-001",
    sku: "TG-SKILLRUN-001",
    listPrice: 218000,
    dealerPrice: 195000,
    projectPrice: 195000,
    bulkPrice: 185000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-tg-tm-001",
    sku: "TG-TM-001",
    listPrice: 210000,
    dealerPrice: 188000,
    projectPrice: 185000,
    bulkPrice: 178000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-sh-t8000-001",
    sku: "SH-T8000-001",
    listPrice: 48000,
    dealerPrice: 42000,
    projectPrice: 40000,
    bulkPrice: 36000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-mx-sdrive-001",
    sku: "MX-SDRIVE-001",
    listPrice: 92000,
    dealerPrice: 82000,
    projectPrice: 76000,
    bulkPrice: 74000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-mx-tm-001",
    sku: "MX-TM-001",
    listPrice: 88000,
    dealerPrice: 78000,
    projectPrice: 72000,
    bulkPrice: 70000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-rx-tm-001",
    sku: "RX-TM-001",
    listPrice: 62000,
    dealerPrice: 55000,
    projectPrice: 52000,
    bulkPrice: 48000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-pc-tm-001",
    sku: "PC-TM-001",
    listPrice: 125000,
    dealerPrice: 112000,
    projectPrice: 108000,
    bulkPrice: 102000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
  {
    pricingId: "price-im-tm-001",
    sku: "IM-TM-001",
    listPrice: 38000,
    dealerPrice: 33000,
    projectPrice: 31000,
    bulkPrice: 28000,
    currency: "CNY",
    status: "active",
    mode: "supplier-portal",
  },
];

export function getAllPricingProfiles(): PricingProfile[] {
  return [...PRICING_PROFILES];
}

export function getPricingProfileById(pricingId: string): PricingProfile | undefined {
  return PRICING_PROFILES.find((p) => p.pricingId === pricingId);
}

export function getPricingProfilesBySku(sku: string): PricingProfile[] {
  return PRICING_PROFILES.filter((p) => p.sku === sku);
}
