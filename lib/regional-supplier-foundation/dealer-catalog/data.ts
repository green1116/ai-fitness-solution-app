import type { DealerEntry } from "../shared/types";

export const DEALER_CATALOG: DealerEntry[] = [
  {
    id: "dealer-shanghai-premium",
    dealerName: "Shanghai Fitness Pro Trading Co.",
    city: "Shanghai",
    coverageArea: "Yangtze River Delta",
    warehouseCapability: true,
    serviceLevel: "premium",
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "dealer-beijing-standard",
    dealerName: "Beijing Sports Equipment Distribution",
    city: "Beijing",
    coverageArea: "North China",
    warehouseCapability: true,
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "dealer-guangzhou-standard",
    dealerName: "Guangzhou Wellness Supply Chain",
    city: "Guangzhou",
    coverageArea: "Pearl River Delta",
    warehouseCapability: true,
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "dealer-chengdu-basic",
    dealerName: "Chengdu Campus Fitness Dealer",
    city: "Chengdu",
    coverageArea: "Southwest China",
    warehouseCapability: false,
    serviceLevel: "basic",
    status: "active",
    mode: "supplier-network",
  },
];

export function getDealerById(id: string): DealerEntry | undefined {
  return DEALER_CATALOG.find((d) => d.id === id);
}

export function getDealersByCity(city: string): DealerEntry[] {
  return DEALER_CATALOG.filter((d) => d.city === city);
}

export function getAllDealers(): DealerEntry[] {
  return [...DEALER_CATALOG];
}
