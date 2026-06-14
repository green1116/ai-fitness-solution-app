import type { ChannelPricingEntry } from "../shared/types";

export const CHANNEL_PRICING_CATALOG: ChannelPricingEntry[] = [
  {
    id: "cp-lf-t5-manufacturer",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    channel: "manufacturer",
    listPrice: 118000,
    dealerPrice: 105000,
    projectPrice: 105000,
    bulkPrice: 98000,
    currency: "CNY",
    region: "East China",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "cp-lf-t5-dealer",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    channel: "authorized-dealer",
    listPrice: 118000,
    dealerPrice: 102000,
    projectPrice: 100000,
    bulkPrice: 95000,
    currency: "CNY",
    region: "East China",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "cp-tg-skillrun-manufacturer",
    brand: "Technogym",
    sku: "TG-SKILLRUN-001",
    channel: "manufacturer",
    listPrice: 218000,
    dealerPrice: 195000,
    projectPrice: 195000,
    bulkPrice: 185000,
    currency: "CNY",
    region: "East China",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "cp-sh-t8000-bulk",
    brand: "Shuhua",
    sku: "SH-T8000-001",
    channel: "bulk",
    listPrice: 48000,
    dealerPrice: 42000,
    projectPrice: 40000,
    bulkPrice: 36000,
    currency: "CNY",
    region: "Southwest China",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "cp-mx-sdrive-project",
    brand: "Matrix",
    sku: "MX-SDRIVE-001",
    channel: "project",
    listPrice: 92000,
    dealerPrice: 82000,
    projectPrice: 76000,
    bulkPrice: 74000,
    currency: "CNY",
    region: "South China",
    status: "active",
    mode: "procurement-intelligence",
  },
];

export function getChannelPricingBySku(sku: string): ChannelPricingEntry[] {
  return CHANNEL_PRICING_CATALOG.filter((e) => e.sku === sku);
}

export function getChannelPricingByBrand(brand: string): ChannelPricingEntry[] {
  return CHANNEL_PRICING_CATALOG.filter((e) => e.brand === brand);
}

export function getAllChannelPricing(): ChannelPricingEntry[] {
  return [...CHANNEL_PRICING_CATALOG];
}
