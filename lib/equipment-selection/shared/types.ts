export const EQUIPMENT_SELECTION_VERSION = "v19.3-equipment-selection-1" as const;

export type SelectionStatus = "success" | "failed";

export type SelectionStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export const SELECTION_BIDDER_BRANDS = [
  "Technogym",
  "Life Fitness",
  "Matrix",
  "Shuhua",
] as const;

export type SelectionBidderBrand = (typeof SELECTION_BIDDER_BRANDS)[number];

export const SELECTION_ROUTE_TYPES = ["premium", "balanced", "value"] as const;
export type SelectionRouteType = (typeof SELECTION_ROUTE_TYPES)[number];

export const SELECTION_CATEGORIES = [
  "cardio",
  "strength",
  "functional",
  "group-training",
  "recovery",
] as const;

export type SelectionCategory = (typeof SELECTION_CATEGORIES)[number];

export interface SelectionStageResult {
  stageId: string;
  label: string;
  status: SelectionStageStatus;
  durationMs: number;
  message: string;
}

export interface SelectionRuntimeResult<TPayload> {
  version: typeof EQUIPMENT_SELECTION_VERSION;
  runtimeId: string;
  domain: string;
  status: SelectionStatus;
  stages: SelectionStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface EquipmentSelectionEvidence {
  evidenceId: string;
  version: typeof EQUIPMENT_SELECTION_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: SelectionStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface EquipmentSelectionReport {
  version: typeof EQUIPMENT_SELECTION_VERSION;
  reportId: string;
  deploymentId: string;
  tenderId: string;
  requirementCoverage: number;
  modelCoverage: number;
  packageCoverage: number;
  compatibilityScore: number;
  equipmentDifferentiationScore: number;
  packages: Array<{
    bidderBrand: string;
    packageLabel: string;
    modelCount: number;
    budgetMin: number;
    budgetMax: number;
  }>;
  summary: string;
  generatedAt: string;
}
