/**
 * Launch L2 — Delivery types + readiness / manifest
 */

import type {
  ACCEPTANCE_VERDICTS,
  DELIVERY_CHECKPOINT_KINDS,
  L2_MANAGER_STATUSES,
  L2_READINESS_VERDICTS,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
} from "../pilot/pilot.constants";

export type DeliveryCheckpointKind =
  (typeof DELIVERY_CHECKPOINT_KINDS)[number];
export type AcceptanceVerdict = (typeof ACCEPTANCE_VERDICTS)[number];
export type L2ReadinessVerdict = (typeof L2_READINESS_VERDICTS)[number];
export type L2ManagerStatus = (typeof L2_MANAGER_STATUSES)[number];
export type DeliveryMetadata = Record<string, unknown>;

export type DeliveryCheckpoint = {
  id: string;
  projectId: string;
  kind: DeliveryCheckpointKind;
  title: string;
  completed: boolean;
  detail: string;
  metadata: DeliveryMetadata;
  recordedAt: string;
};

export type RecordCheckpointInput = {
  id?: string;
  projectId: string;
  kind: DeliveryCheckpointKind;
  title?: string;
  completed?: boolean;
  metadata?: DeliveryMetadata;
};

export type DeliveryAcceptance = {
  id: string;
  projectId: string;
  verdict: AcceptanceVerdict;
  score: number;
  notes: string;
  detail: string;
  acceptedAt: string;
};

export type AcceptDeliveryInput = {
  id?: string;
  projectId: string;
  verdict: Exclude<AcceptanceVerdict, "PENDING">;
  score: number;
  notes?: string;
};

export type L2ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type L2ReadinessResult = {
  verdict: L2ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: L2ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type L2RegistryManifest = {
  foundationId: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID;
  version: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION;
  freezeVersion: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION;
  base: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE;
  pilotCount: number;
  intakeCount: number;
  projectCount: number;
  feedbackCount: number;
  scoreCount: number;
  checkpointCount: number;
  acceptanceCount: number;
};
