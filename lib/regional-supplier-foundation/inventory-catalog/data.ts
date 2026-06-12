import type { InventoryEntry } from "../shared/types";

export const INVENTORY_CATALOG: InventoryEntry[] = [
  {
    id: "inv-tg-skillrun-sh",
    sku: "TG-SKILLRUN-001",
    stockStatus: "made-to-order",
    availableQuantity: 0,
    safetyStock: 2,
    replenishmentLeadTime: "30-45 days",
    warehouseLocation: "Shanghai Bonded Warehouse",
    lastUpdated: "2026-06-01",
    mode: "supplier-network",
  },
  {
    id: "inv-lf-t5-sh",
    sku: "LF-T5-001",
    stockStatus: "in-stock",
    availableQuantity: 12,
    safetyStock: 4,
    replenishmentLeadTime: "7-14 days",
    warehouseLocation: "Shanghai Pudong Warehouse",
    lastUpdated: "2026-06-05",
    mode: "supplier-network",
  },
  {
    id: "inv-lf-t5-bj",
    sku: "LF-T5-001",
    stockStatus: "in-stock",
    availableQuantity: 8,
    safetyStock: 3,
    replenishmentLeadTime: "7-14 days",
    warehouseLocation: "Beijing Daxing Warehouse",
    lastUpdated: "2026-06-05",
    mode: "supplier-network",
  },
  {
    id: "inv-mx-sdrive-gz",
    sku: "MX-SDRIVE-001",
    stockStatus: "in-stock",
    availableQuantity: 6,
    safetyStock: 2,
    replenishmentLeadTime: "10-14 days",
    warehouseLocation: "Guangzhou Nansha Warehouse",
    lastUpdated: "2026-06-04",
    mode: "supplier-network",
  },
  {
    id: "inv-sh-t8000-sh",
    sku: "SH-T8000-001",
    stockStatus: "in-stock",
    availableQuantity: 24,
    safetyStock: 8,
    replenishmentLeadTime: "3-7 days",
    warehouseLocation: "Shanghai Domestic Hub",
    lastUpdated: "2026-06-06",
    mode: "supplier-network",
  },
  {
    id: "inv-sh-t8000-cd",
    sku: "SH-T8000-001",
    stockStatus: "low-stock",
    availableQuantity: 3,
    safetyStock: 5,
    replenishmentLeadTime: "7-10 days",
    warehouseLocation: "Chengdu Regional Depot",
    lastUpdated: "2026-06-06",
    mode: "supplier-network",
  },
  {
    id: "inv-ip-it7000-gz",
    sku: "IP-IT7000-001",
    stockStatus: "in-stock",
    availableQuantity: 15,
    safetyStock: 5,
    replenishmentLeadTime: "5-10 days",
    warehouseLocation: "Guangzhou Domestic Hub",
    lastUpdated: "2026-06-03",
    mode: "supplier-network",
  },
  {
    id: "inv-jh-a5700-bj",
    sku: "JH-A5700-001",
    stockStatus: "in-stock",
    availableQuantity: 10,
    safetyStock: 3,
    replenishmentLeadTime: "7-14 days",
    warehouseLocation: "Beijing Daxing Warehouse",
    lastUpdated: "2026-06-02",
    mode: "supplier-network",
  },
];

export function getInventoryBySku(sku: string): InventoryEntry[] {
  return INVENTORY_CATALOG.filter((i) => i.sku === sku);
}

export function getInventoryByWarehouse(warehouseLocation: string): InventoryEntry[] {
  return INVENTORY_CATALOG.filter((i) => i.warehouseLocation === warehouseLocation);
}

export function getAllInventory(): InventoryEntry[] {
  return [...INVENTORY_CATALOG];
}
