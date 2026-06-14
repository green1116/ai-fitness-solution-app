import type { InventoryProfile } from "../shared/types";

const INVENTORY_CONFIG: Array<{
  inventoryId: string;
  sku: string;
  warehouse: string;
  quantity: number;
  safetyStock: number;
}> = [
  { inventoryId: "inv-life-fitness-sh", sku: "LF-TM-001", warehouse: "Shanghai Warehouse", quantity: 12, safetyStock: 4 },
  { inventoryId: "inv-life-fitness-bj", sku: "LF-TM-001", warehouse: "Beijing Warehouse", quantity: 8, safetyStock: 3 },
  { inventoryId: "inv-technogym-sh", sku: "TG-TM-001", warehouse: "Shanghai Bonded Warehouse", quantity: 0, safetyStock: 2 },
  { inventoryId: "inv-technogym-bj", sku: "TG-TM-001", warehouse: "Beijing Warehouse", quantity: 4, safetyStock: 2 },
  { inventoryId: "inv-matrix-gz", sku: "MX-TM-001", warehouse: "Guangzhou Nansha Warehouse", quantity: 6, safetyStock: 2 },
  { inventoryId: "inv-relax-sz", sku: "RX-TM-001", warehouse: "Shenzhen Warehouse", quantity: 15, safetyStock: 5 },
  { inventoryId: "inv-shuhua-cd", sku: "SH-TM-001", warehouse: "Chengdu Warehouse", quantity: 20, safetyStock: 6 },
  { inventoryId: "inv-precor-sh", sku: "PC-TM-001", warehouse: "Shanghai Warehouse", quantity: 5, safetyStock: 2 },
  { inventoryId: "inv-impulse-cd", sku: "IM-TM-001", warehouse: "Chengdu Warehouse", quantity: 18, safetyStock: 5 },
  { inventoryId: "inv-dhz-gz", sku: "DH-TM-001", warehouse: "Guangzhou Warehouse", quantity: 14, safetyStock: 4 },
  { inventoryId: "inv-bodystrength-sz", sku: "BS-TM-001", warehouse: "Shenzhen Warehouse", quantity: 22, safetyStock: 6 },
  { inventoryId: "inv-sportsart-bj", sku: "SA-TM-001", warehouse: "Beijing Warehouse", quantity: 7, safetyStock: 3 },
  { inventoryId: "inv-life-fitness-lf-t5", sku: "LF-T5-001", warehouse: "Shanghai Pudong Warehouse", quantity: 12, safetyStock: 4 },
  { inventoryId: "inv-technogym-skillrun", sku: "TG-SKILLRUN-001", warehouse: "Shanghai Bonded Warehouse", quantity: 0, safetyStock: 2 },
  { inventoryId: "inv-shuhua-t8000", sku: "SH-T8000-001", warehouse: "Chengdu Warehouse", quantity: 15, safetyStock: 5 },
  { inventoryId: "inv-matrix-sdrive", sku: "MX-SDRIVE-001", warehouse: "Guangzhou Nansha Warehouse", quantity: 6, safetyStock: 2 },
];

export const INVENTORY_PROFILES: InventoryProfile[] = INVENTORY_CONFIG.map((entry) => ({
  ...entry,
  status: "active" as const,
  mode: "supplier-portal" as const,
}));

export function getAllInventoryProfiles(): InventoryProfile[] {
  return [...INVENTORY_PROFILES];
}

export function getInventoryProfileById(inventoryId: string): InventoryProfile | undefined {
  return INVENTORY_PROFILES.find((i) => i.inventoryId === inventoryId);
}

export function getInventoryProfilesBySku(sku: string): InventoryProfile[] {
  return INVENTORY_PROFILES.filter((i) => i.sku === sku);
}
