/**
 * Post-Launch P1 — Production Operations types
 */

import type {
  OPERATION_CHECKLIST_IDS,
  OPERATION_CHECKLIST_ITEM_STATUSES,
  OPERATIONAL_STATUS_LEVELS,
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_PRODUCTION_FOUNDATION_BASE,
  OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_ID,
  OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
  OPERATIONS_READINESS_VERDICTS,
  PRODUCTION_OPERATION_STATUSES,
} from "./production.constants";

export type ProductionOperationStatus =
  (typeof PRODUCTION_OPERATION_STATUSES)[number];
export type OperationalStatusLevel =
  (typeof OPERATIONAL_STATUS_LEVELS)[number];
export type OperationChecklistId = (typeof OPERATION_CHECKLIST_IDS)[number];
export type OperationChecklistItemStatus =
  (typeof OPERATION_CHECKLIST_ITEM_STATUSES)[number];
export type OperationsReadinessVerdict =
  (typeof OPERATIONS_READINESS_VERDICTS)[number];
export type OperationsManagerStatus =
  (typeof OPERATIONS_MANAGER_STATUSES)[number];

export type OperationsMetadata = Record<string, unknown>;

/** Production operation model. */
export type ProductionOperation = {
  id: string;
  name: string;
  productId: string;
  productionProfileId: string;
  orchestrationId?: string;
  supportSlaProfileId?: string;
  cloudRuntimeId?: string;
  status: ProductionOperationStatus;
  metadata: OperationsMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductionOperationInput = {
  id?: string;
  name: string;
  productId: string;
  productionProfileId: string;
  orchestrationId?: string;
  supportSlaProfileId?: string;
  cloudRuntimeId?: string;
  status?: ProductionOperationStatus;
  metadata?: OperationsMetadata;
};

/** Operational status tracking. */
export type OperationalStatusRecord = {
  id: string;
  productionOperationId: string;
  level: OperationalStatusLevel;
  detail: string;
  source: string;
  recordedAt: string;
};

export type RecordOperationalStatusInput = {
  id?: string;
  productionOperationId: string;
  level: OperationalStatusLevel;
  detail: string;
  source?: string;
};

/** Runtime health dashboard. */
export type RuntimeHealthDashboard = {
  productionOperationId: string;
  cloudLevel: string;
  cloudOk: boolean;
  observabilityLevel: string;
  observabilityOk: boolean;
  runtimeCount: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  headline: string;
  generatedAt: string;
};

/** Operation checklist. */
export type OperationChecklistItem = {
  checkId: OperationChecklistId;
  label: string;
  required: boolean;
  status: OperationChecklistItemStatus;
  detail: string;
  updatedAt?: string;
};

export type OperationChecklist = {
  id: string;
  productionOperationId: string;
  items: OperationChecklistItem[];
  complete: boolean;
  updatedAt: string;
};

export type CreateOperationChecklistInput = {
  id?: string;
  productionOperationId: string;
};

export type SetOperationChecklistItemInput = {
  checklistId: string;
  checkId: OperationChecklistId;
  status: OperationChecklistItemStatus;
  detail?: string;
};

/** Production metrics. */
export type ProductionMetrics = {
  productionOperationId: string;
  statusLevel: OperationalStatusLevel;
  checklistComplete: boolean;
  cloudHealthy: boolean;
  observabilityHealthy: boolean;
  slaComplianceRate: number | null;
  openIncidents: number;
  readinessScore: number;
  computedAt: string;
};

/** Readiness. */
export type OperationsReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OperationsReadinessResult = {
  productionOperationId: string;
  verdict: OperationsReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OperationsReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OperationsRegistryManifest = {
  operationsId: typeof OPERATIONS_PRODUCTION_FOUNDATION_ID;
  version: typeof OPERATIONS_PRODUCTION_FOUNDATION_VERSION;
  freezeVersion: typeof OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION;
  base: typeof OPERATIONS_PRODUCTION_FOUNDATION_BASE;
  operationCount: number;
  statusRecordCount: number;
  checklistCount: number;
};
