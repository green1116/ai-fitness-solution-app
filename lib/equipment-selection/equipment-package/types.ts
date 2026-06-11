import type { EQUIPMENT_SELECTION_VERSION, SelectionBidderBrand } from "../shared/types";

export const EQUIPMENT_PACKAGE_RUNTIME_VERSION = "v19.3-equipment-package-1" as const;

export interface PackageEquipmentItem {
  modelId: string;
  modelName: string;
  brandName: string;
  category: string;
  quantity: number;
  unitPriceEstimate: number;
}

export interface EquipmentPackage {
  packageId: string;
  packageLabel: string;
  routeType: "premium" | "balanced" | "value";
  bidderBrand: SelectionBidderBrand;
  equipmentList: PackageEquipmentItem[];
  modelMapping: Record<string, string>;
  categoryDistribution: Record<string, number>;
  totalBudgetEstimate: number;
}

export interface EquipmentPackageSnapshot {
  snapshotId: string;
  premiumPackage: EquipmentPackage;
  balancedPackage: EquipmentPackage;
  valuePackage: EquipmentPackage;
  selectedPackage: EquipmentPackage;
  packageReadiness: number;
}

export interface EquipmentPackageRuntimePayload {
  version: typeof EQUIPMENT_PACKAGE_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  snapshot: EquipmentPackageSnapshot;
  packageReadiness: number;
  summary: string;
}
