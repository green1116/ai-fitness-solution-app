/**
 * Commercialization P5 — Quality types + shared readiness / manifest
 */

import type {
  ACCEPTANCE_VERDICTS,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
  DELIVERY_OPS_MANAGER_STATUSES,
  DELIVERY_OPS_READINESS_VERDICTS,
  QUALITY_CHECK_KINDS,
} from "../delivery/delivery.constants";

export type QualityCheckKind = (typeof QUALITY_CHECK_KINDS)[number];
export type AcceptanceVerdict = (typeof ACCEPTANCE_VERDICTS)[number];
export type DeliveryOpsReadinessVerdict =
  (typeof DELIVERY_OPS_READINESS_VERDICTS)[number];
export type DeliveryOpsManagerStatus =
  (typeof DELIVERY_OPS_MANAGER_STATUSES)[number];

export type QualityCheck = {
  id: string;
  deliveryId: string;
  kind: QualityCheckKind;
  name: string;
  passed: boolean;
  score: number;
  detail: string;
  checkedAt: string;
};

export type RunQualityCheckInput = {
  id?: string;
  deliveryId: string;
  kind: QualityCheckKind;
  name: string;
  score?: number;
  passed?: boolean;
};

export type AcceptanceRecord = {
  id: string;
  deliveryId: string;
  verdict: AcceptanceVerdict;
  acceptedBy: string;
  notes: string;
  qualityPassRate: number;
  detail: string;
  acceptedAt: string;
};

export type RecordAcceptanceInput = {
  id?: string;
  deliveryId: string;
  verdict: AcceptanceVerdict;
  acceptedBy?: string;
  notes?: string;
};

export type DeliveryOpsReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DeliveryOpsReadinessResult = {
  verdict: DeliveryOpsReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DeliveryOpsReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type DeliveryOpsRegistryManifest = {
  foundationId: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_ID;
  version: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE;
  projectCount: number;
  lifecycleCount: number;
  deliveryCount: number;
  workflowCount: number;
  executionCount: number;
  statusCount: number;
  artifactCount: number;
  trackingCount: number;
  qualityCount: number;
  acceptanceCount: number;
};
