/**
 * Launch L4 — Delivery types + readiness / manifest
 */

import type {
  DELIVERY_ACCEPTANCE_VERDICTS,
  DELIVERY_STATUSES,
  L4_MANAGER_STATUSES,
  L4_READINESS_VERDICTS,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
} from "../scenario/scenario.constants";

export type DeliveryAcceptanceVerdict =
  (typeof DELIVERY_ACCEPTANCE_VERDICTS)[number];
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export type L4ReadinessVerdict = (typeof L4_READINESS_VERDICTS)[number];
export type L4ManagerStatus = (typeof L4_MANAGER_STATUSES)[number];
export type DeliveryMetadata = Record<string, unknown>;

export type DeliveryAcceptance = {
  id: string;
  scenarioId: string;
  verdict: DeliveryAcceptanceVerdict;
  score: number;
  notes: string;
  detail: string;
  acceptedAt: string;
};

export type AcceptDeliveryInput = {
  id?: string;
  scenarioId: string;
  verdict: Exclude<DeliveryAcceptanceVerdict, "PENDING">;
  score: number;
  notes?: string;
};

export type DeliveryStatusRecord = {
  id: string;
  scenarioId: string;
  status: DeliveryStatus;
  detail: string;
  metadata: DeliveryMetadata;
  updatedAt: string;
};

export type UpdateDeliveryStatusInput = {
  id?: string;
  scenarioId: string;
  status: DeliveryStatus;
  metadata?: DeliveryMetadata;
};

export type L4ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type L4ReadinessResult = {
  verdict: L4ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: L4ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type L4RegistryManifest = {
  foundationId: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID;
  version: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION;
  freezeVersion: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION;
  base: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE;
  scenarioCount: number;
  workflowCount: number;
  stepCount: number;
  checkCount: number;
  validationResultCount: number;
  artifactCount: number;
  reportCount: number;
  acceptanceCount: number;
  statusCount: number;
};
