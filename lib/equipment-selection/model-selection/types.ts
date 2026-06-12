import type { EQUIPMENT_SELECTION_VERSION, SelectionBidderBrand } from "../shared/types";

export const MODEL_SELECTION_RUNTIME_VERSION = "v19.3-model-selection-1" as const;

export interface ModelSelectionEntry {
  modelId: string;
  modelName: string;
  brandName: string;
  category: string;
  selectionRole: "preferred" | "alternative" | "upgrade";
  routeType: "premium" | "balanced" | "value";
  unitPriceEstimate: number;
}

export interface ModelSelectionSnapshot {
  snapshotId: string;
  bidderBrand: SelectionBidderBrand;
  routeType: "premium" | "balanced" | "value";
  preferredModel: ModelSelectionEntry;
  alternativeModel: ModelSelectionEntry;
  upgradeModel: ModelSelectionEntry;
  modelReadiness: number;
}

export interface ModelSelectionRuntimePayload {
  version: typeof MODEL_SELECTION_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  snapshot: ModelSelectionSnapshot;
  modelReadiness: number;
  summary: string;
}
